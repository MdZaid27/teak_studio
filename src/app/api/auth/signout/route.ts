import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    // Check if client expects JSON or redirect
    const acceptHeader = request.headers.get("accept") || "";
    const redirectUrl = new URL("/admin/login", request.url);
    const response = acceptHeader.includes("application/json")
      ? NextResponse.json({ success: true, message: "Signed out successfully" })
      : NextResponse.redirect(redirectUrl, { status: 303 });

    // Clear server admin session cookie
    response.cookies.set("teak_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[AUTH SIGNOUT] Error during signout:", err);
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
