import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dns from "dns";

// Server-side safeguard: Prevent local ISP transparent DNS hijacking of *.supabase.co
if (typeof window === "undefined" && dns && typeof dns.lookup === "function") {
  const originalLookup = dns.lookup.bind(dns);
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
    // If anon key is missing but service key exists on server, fallback gracefully on server
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
      "[KILN STUDIO SECURITY] Attempted to access SUPABASE_SERVICE_ROLE_KEY from browser context. Access blocked."
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
    });
  }

  return adminClientInstance;
};

