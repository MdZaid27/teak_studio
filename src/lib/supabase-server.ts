import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resilientFetch } from "@/lib/supabase";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Reads and sets authentication cookies using Next.js 16 async cookies() API.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
          // This can be safely ignored if you have middleware refreshing user sessions.
        }
      },
    },
    global: {
      fetch: resilientFetch,
    },
  });
}
