import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import dns from "dns";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
