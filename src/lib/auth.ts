import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Retrieves the currently authenticated Supabase user on the server.
 * Uses supabase.auth.getUser() to strictly validate the session JWT against the Supabase Auth server.
 */
export async function getAuthenticatedAdminUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
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
