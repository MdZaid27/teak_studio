import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Hardened Admin Authorization:
 * Strictly verifies server-controlled `app_metadata.role === "admin"`,
 * or an exact server-controlled allowlist (`process.env.ADMIN_EMAIL` / configured admin emails).
 * Permanently removes loose pattern matching (e.g. email.includes("admin")) and
 * user-modifiable `user_metadata.role`.
 */
export function isUserAdmin(
  user: { app_metadata?: Record<string, unknown>; email?: string | null } | null
): boolean {
  if (!user) return false;

  // 1. Primary security boundary: Server-controlled Supabase app_metadata
  if (user.app_metadata?.role === "admin") {
    return true;
  }

  // 2. Secondary server-controlled boundary: Exact admin email allowlist
  const email = user.email?.toLowerCase().trim();
  if (email) {
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const exactAllowlist = new Set<string>([
      "curator@teakhaus.in",
      "admin@teakhaus.in",
      ...(configuredAdminEmail ? [configuredAdminEmail] : []),
    ]);

    if (exactAllowlist.has(email)) {
      return true;
    }
  }

  return false;
}

/**
 * Retrieves the currently authenticated Supabase user on the server.
 * Strictly validates the session JWT against the Supabase Auth server,
 * and ensures the user has administrative privileges.
 */
export async function getAuthenticatedAdminUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !isUserAdmin(user)) {
      return null;
    }

    return user;
  } catch (err) {
    console.error("[TEAK HAUS AUTH] Failed to retrieve authenticated admin user:", err);
    return null;
  }
}

/**
 * Route protection guard for administrative API handlers.
 * If no authenticated admin user exists, returns a 401 Unauthorized response.
 */
export async function requireAdminSession(): Promise<
  { user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedAdminUser>>>; errorResponse: null } |
  { user: null; errorResponse: NextResponse }
> {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin session required.",
        },
        { status: 401 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export interface PatronAuthTarget {
  userId?: string | null;
  phone?: string | null;
  email?: string | null;
}

/**
 * Verifies that the current request session owns the target customer resource,
 * or is an authenticated administrator. Prevents BOLA / IDOR across patron APIs.
 */
export async function verifyPatronAccess(target?: PatronAuthTarget): Promise<{
  authorized: boolean;
  isAdmin: boolean;
  callerUserId: string | null;
  callerPhone: string | null;
  callerEmail: string | null;
  errorResponse: NextResponse | null;
}> {
  // 1. If caller is an admin, grant immediate access
  const adminUser = await getAuthenticatedAdminUser();
  if (adminUser) {
    return {
      authorized: true,
      isAdmin: true,
      callerUserId: adminUser.id,
      callerPhone: adminUser.phone || null,
      callerEmail: adminUser.email || null,
      errorResponse: null,
    };
  }

  // Normalize target criteria
  const targetUserId = target?.userId?.trim() || null;
  const cleanTargetPhone = target?.phone ? target.phone.replace(/\D/g, "").slice(-10) : null;
  const cleanTargetEmail = target?.email ? target.email.toLowerCase().trim() : null;

  // 2. Check Supabase Auth session on server
  let authUserId: string | null = null;
  let authPhone: string | null = null;
  let authEmail: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      authUserId = user.id;
      authPhone = user.phone ? user.phone.replace(/\D/g, "").slice(-10) : null;
      authEmail = user.email ? user.email.toLowerCase().trim() : null;
    }
  } catch {
    // Non-fatal fallthrough to session cookies
  }

  // 3. Check HttpOnly patron session cookies set by /api/patron/session
  let cookiePatronId: string | null = null;
  let cookiePatronPhone: string | null = null;
  let cookiePatronEmail: string | null = null;

  try {
    const cookieStore = await cookies();
    cookiePatronId = cookieStore.get("teak_patron_id")?.value?.trim() || null;
    cookiePatronPhone = cookieStore.get("teak_patron_phone")?.value?.replace(/\D/g, "").slice(-10) || null;
    cookiePatronEmail = cookieStore.get("teak_patron_email")?.value?.toLowerCase().trim() || null;
  } catch {
    // Non-fatal
  }

  const effectiveUserId = authUserId || cookiePatronId;
  const effectivePhone = authPhone || cookiePatronPhone;
  const effectiveEmail = authEmail || cookiePatronEmail;

  // If caller has no authenticated identity whatsoever, return 401
  if (!effectiveUserId && !effectivePhone && !effectiveEmail) {
    return {
      authorized: false,
      isAdmin: false,
      callerUserId: null,
      callerPhone: null,
      callerEmail: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active patron session required.",
        },
        { status: 401 }
      ),
    };
  }

  // Check ownership match
  const matchesUserId = Boolean(targetUserId && effectiveUserId && (targetUserId === effectiveUserId || (effectivePhone && targetUserId.includes(effectivePhone))));
  const matchesPhone = Boolean(cleanTargetPhone && effectivePhone && cleanTargetPhone === effectivePhone);
  const matchesEmail = Boolean(cleanTargetEmail && effectiveEmail && cleanTargetEmail === effectiveEmail);

  // If no specific target was requested, but user is logged in, authorize with caller identity
  if (!targetUserId && !cleanTargetPhone && !cleanTargetEmail) {
    return {
      authorized: true,
      isAdmin: false,
      callerUserId: effectiveUserId,
      callerPhone: effectivePhone,
      callerEmail: effectiveEmail,
      errorResponse: null,
    };
  }

  if (matchesUserId || matchesPhone || matchesEmail) {
    return {
      authorized: true,
      isAdmin: false,
      callerUserId: effectiveUserId,
      callerPhone: effectivePhone,
      callerEmail: effectiveEmail,
      errorResponse: null,
    };
  }

  // Caller is authenticated as User A but tried to access User B's resource (IDOR)
  return {
    authorized: false,
    isAdmin: false,
    callerUserId: effectiveUserId,
    callerPhone: effectivePhone,
    callerEmail: effectiveEmail,
    errorResponse: NextResponse.json(
      {
        success: false,
        error: "Forbidden: You do not have permission to access or modify this customer record.",
      },
      { status: 403 }
    ),
  };
}

/**
 * Retrieves the verified caller identity from Supabase Auth or signed patron cookies.
 * Returns null if the caller is an unauthenticated guest.
 */
export async function getAuthenticatedCallerIdentity(): Promise<{
  userId: string;
  phone: string | null;
  email: string | null;
} | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      return {
        userId: user.id,
        phone: user.phone ? user.phone.replace(/\D/g, "").slice(-10) : null,
        email: user.email?.toLowerCase().trim() || null,
      };
    }
  } catch {
    // Fall through to cookies
  }

  try {
    const cookieStore = await cookies();
    const cookieId = cookieStore.get("teak_patron_id")?.value?.trim();
    if (cookieId) {
      return {
        userId: cookieId,
        phone: cookieStore.get("teak_patron_phone")?.value?.replace(/\D/g, "").slice(-10) || null,
        email: cookieStore.get("teak_patron_email")?.value?.toLowerCase().trim() || null,
      };
    }
  } catch {
    // Non-fatal
  }

  return null;
}

