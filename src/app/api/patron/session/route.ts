import { NextRequest, NextResponse } from "next/server";

const PATRON_ID_COOKIE = "teak_patron_id";
const PATRON_PHONE_COOKIE = "teak_patron_phone";
const PATRON_EMAIL_COOKIE = "teak_patron_email";
// 30-day expiry
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * POST /api/patron/session
 * Sets HttpOnly server-side cookies with patron ID, phone, and email so the order
 * receipt page can verify ownership accurately across both Supabase and synthetic sessions.
 */
export async function POST(request: NextRequest) {
  try {
    const { patronId, phone, email } = await request.json();

    const response = NextResponse.json({ success: true });
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    };

    if (patronId && typeof patronId === "string") {
      response.cookies.set(PATRON_ID_COOKIE, patronId, cookieOpts);
    }

    if (phone && typeof phone === "string") {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (cleanPhone) {
        response.cookies.set(PATRON_PHONE_COOKIE, cleanPhone, cookieOpts);
      }
    }

    if (email && typeof email === "string" && email.includes("@")) {
      response.cookies.set(PATRON_EMAIL_COOKIE, email.trim().toLowerCase(), cookieOpts);
    }

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/patron/session
 * Clears the patron session cookies on sign-out.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  const clearOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };

  response.cookies.set(PATRON_ID_COOKIE, "", clearOpts);
  response.cookies.set(PATRON_PHONE_COOKIE, "", clearOpts);
  response.cookies.set(PATRON_EMAIL_COOKIE, "", clearOpts);

  return response;
}
