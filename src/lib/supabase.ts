import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dns from "node:dns";

// Server-side safeguard: Prevent local ISP transparent DNS hijacking of *.supabase.co
if (typeof window === "undefined" && dns && typeof dns.lookup === "function") {
  const originalLookup = dns.lookup.bind(dns);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dns.lookup = ((hostname: string, options: any, callback: any) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (typeof hostname === "string" && hostname.endsWith(".supabase.co")) {
      if (options && options.all) {
        return callback(null, [
          { address: "172.64.149.246", family: 4 },
          { address: "104.18.38.10", family: 4 },
        ]);
      }
      return callback(null, "172.64.149.246", 4);
    }
    return originalLookup(hostname, options, callback);
  }) as typeof dns.lookup;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Resilient fetch wrapper for Supabase clients:
 * 1. Automatically retries on transient network errors (ECONNRESET, ETIMEDOUT, 502/503/504).
 * 2. Strict timeout (default 5000ms per attempt) prevents 15-20s server hangs.
 * 3. Connection keep-alive headers reuse existing TLS sockets to reduce handshake pauses.
 */
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: { maxRetries?: number; timeoutMs?: number; initialDelayMs?: number } = {}
): Promise<Response> {
  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeoutMs ?? 5000;
  const initialDelay = options.initialDelayMs ?? 250;

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (init?.signal) {
      if (init.signal.aborted) {
        clearTimeout(timeout);
        controller.abort();
      } else {
        init.signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          controller.abort();
        });
      }
    }

    try {
      const mergedHeaders = new Headers(init?.headers);
      mergedHeaders.set("Connection", "keep-alive");

      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
        headers: mergedHeaders,
      });

      clearTimeout(timeout);

      // Retry transient server gateway errors
      if (response.status >= 502 && response.status <= 504 && attempt < maxRetries) {
        attempt++;
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timeout);
      attempt++;

      const isAbort = err instanceof Error && err.name === "AbortError";
      const isTransient =
        isAbort ||
        (err instanceof Error &&
          (err.message.includes("fetch failed") ||
            err.message.includes("ECONNRESET") ||
            err.message.includes("ETIMEDOUT") ||
            err.message.includes("network")));

      if (attempt <= maxRetries && isTransient) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }
}

/**
 * Check if Supabase configuration credentials are present.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    (Boolean(supabaseAnonKey) || Boolean(supabaseServiceKey)) &&
    !supabaseUrl.includes("your-project-id")
  );
};

let anonClientInstance: SupabaseClient | null = null;
let adminClientInstance: SupabaseClient | null = null;

/**
 * Standard Supabase client using public Anon Key.
 * Safe for server queries with RLS and public operations.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
    if (typeof window === "undefined" && supabaseServiceKey && supabaseUrl && !supabaseUrl.includes("your-project-id")) {
      return getSupabaseAdminClient();
    }
    return null;
  }

  if (!anonClientInstance) {
    anonClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: typeof window === "undefined" ? resilientFetch : undefined,
      },
    });
  }

  return anonClientInstance;
};

/**
 * Supabase Admin client using SUPABASE_SERVICE_ROLE_KEY.
 * STRICTLY SERVER-SIDE. Never accessible to browser code or client components.
 */
export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (typeof window !== "undefined") {
    throw new Error(
      "[TEAK HAUS SECURITY] Attempted to access SUPABASE_SERVICE_ROLE_KEY from browser context. Access blocked."
    );
  }

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes("your-project-id")) {
    return null;
  }

  if (!adminClientInstance) {
    adminClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: resilientFetch,
      },
    });
  }

  return adminClientInstance;
};

