import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    // Check if client expects JSON or redirect
    const acceptHeader = request.headers.get("accept") || "";
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({ success: true, message: "Signed out successfully" });
    }

    const redirectUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (err) {
    console.error("[AUTH SIGNOUT] Error during signout:", err);
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
