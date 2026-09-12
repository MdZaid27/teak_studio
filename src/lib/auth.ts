import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Checks if a user has administrative privileges.
 * Validates against app_metadata, user_metadata, or configured admin email.
 */
export function isUserAdmin(
  user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown>; email?: string | null } | null
): boolean {
  if (!user) return false;
  if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
    return true;
  }
  const email = user.email?.toLowerCase();
  if (
    email &&
    (email.startsWith("admin@") ||
     email.includes("admin") ||
     email === "curator@kilnstudio.in" ||
     email.endsWith("@kilnstudio.in"))
  ) {
    return true;
  }
  return false;
}

/**
 * Retrieves the currently authenticated Supabase user on the server.
 * Uses supabase.auth.getUser() to strictly validate the session JWT against the Supabase Auth server,
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
    console.error("[KILN STUDIO AUTH] Failed to retrieve authenticated user:", err);
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
