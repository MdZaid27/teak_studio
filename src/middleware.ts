import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Middleware / Proxy for KILN STUDIO.
 * 1. Synchronizes Supabase Auth session cookies with Next.js App Router request/response.
 * 2. Enforces access control for /admin and subroutes:
 *    - Unauthenticated requests to /admin/* (except /admin/login) redirect to /admin/login.
 *    - Authenticated users visiting /admin/login redirect directly to /admin.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  // Create an SSR client bound to the incoming request's cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  function isUserAdmin(
    u: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown>; email?: string | null } | null
  ) {
    if (!u) return false;
    if (u.app_metadata?.role === "admin" || u.user_metadata?.role === "admin") return true;
    const email = u.email?.toLowerCase();
    if (
      email &&
      (email.startsWith("admin@") ||
       email.includes("admin") ||
       email.endsWith("@teakhaus.in") ||
       email === "curator@teakhaus.in" ||
       email === "curator@kilnstudio.in" ||
       email.endsWith("@kilnstudio.in"))
    ) {
      return true;
    }
    return false;
  }

  const pathname = request.nextUrl.pathname;
  const isAdmin = isUserAdmin(user);

  // Unauthenticated user OR non-admin attempting to access admin views (other than login)
  if (!isAdmin && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Authenticated admin attempting to visit login page -> redirect to dashboard
  if (isAdmin && pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};

// Next.js 16 supports both `middleware` and `proxy` conventions
export { middleware as proxy };
