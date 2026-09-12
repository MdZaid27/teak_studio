import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Creates a singleton Supabase client for Client Components.
 * Uses public environment variables and automatically syncs session cookies with the browser.
 */
export function createSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
