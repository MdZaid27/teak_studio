import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components.
 * Uses public environment variables and automatically syncs session cookies with the browser.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
