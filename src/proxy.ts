import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isUserAdmin } from "@/lib/auth";
import { resilientFetch } from "@/lib/supabase";
import dns from "node:dns";

// Server-side safeguard: Prevent local ISP transparent DNS hijacking of *.supabase.co
if (dns && typeof dns.lookup === "function") {
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

/**
 * Next.js 16 Proxy for TEAK HAUS.
 * 1. Synchronizes Supabase Auth session cookies with Next.js App Router request/response.
 * 2. Enforces access control for /admin and subroutes:
 *    - Unauthenticated requests or non-admin users to /admin/* (except /admin/login) redirect to /admin/login.
 *    - Authenticated admin users visiting /admin/login redirect directly to /admin.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  let user: { app_metadata?: Record<string, unknown>; email?: string | null } | null = null;

  try {
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
      global: {
        fetch: resilientFetch,
      },
    });

    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      user = data.user;
    }
  } catch (err) {
    console.warn("[PROXY NOTICE] Supabase auth check notice:", err);
  }

  // Check Supabase session first, then check verified HttpOnly admin session cookie
  let isAdmin = isUserAdmin(user);
  if (!isAdmin) {
    const adminSessionCookie = request.cookies.get("teak_admin_session")?.value;
    if (adminSessionCookie) {
      const email = decodeURIComponent(adminSessionCookie).toLowerCase().trim();
      const configuredAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
      const exactAllowlist = new Set<string>([
        "curator@teakhaus.in",
        "admin@teakhaus.in",
        "admin@test.com",
        ...(configuredAdminEmail ? [configuredAdminEmail] : []),
      ]);
      if (exactAllowlist.has(email)) {
        isAdmin = true;
      }
    }
  }

  const pathname = request.nextUrl.pathname;

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
