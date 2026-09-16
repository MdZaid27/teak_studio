import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";

const ADMIN_SESSION_COOKIE = "teak_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  // Rate limiting: 10 attempts per 10 minutes per IP
  const rateLimitResponse = enforceRateLimit(request, "admin:login", 10, 10 * 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both an email address and password." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const errLower = (error?.message || "").toLowerCase();
      if (errLower.includes("invalid login credentials") || errLower.includes("invalid grant")) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials. Please verify your atelier email and password." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: error?.message || "Authentication failed. Please try again." },
        { status: 401 }
      );
    }

    // Verify admin permissions
    const user = data.user;
    const isAdmin = isUserAdmin(user);

    if (!isAdmin) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: "Access denied. Your account does not have curator administrative privileges." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Atelier access granted.",
      redirect: "/admin",
    });

    // Set secure server-side session cookie
    response.cookies.set(ADMIN_SESSION_COOKIE, encodeURIComponent(email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[ADMIN LOGIN API ERROR]:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred during authentication." },
      { status: 500 }
    );
  }
}
