import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyStoredOtp, normalizePhone } from "@/lib/otp";
import { getPatronProfile } from "@/lib/patron";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  token: z.string().min(6, "Verification code is required"),
});

const PATRON_ID_COOKIE = "teak_patron_id";
const PATRON_PHONE_COOKIE = "teak_patron_phone";
const PATRON_EMAIL_COOKIE = "teak_patron_email";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  // 1. Sliding window rate limiting: max 10 verification attempts per 10 minutes per IP
  const rateLimitResponse = enforceRateLimit(req, "auth:otp:verify", 10, 10 * 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await req.json();
    const parsed = verifyOtpSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(parsed.data.phone);
    const token = parsed.data.token.trim();

    // 2. Verify OTP against stored record with brute-force protection
    const verification = verifyStoredOtp(cleanPhone, token);
    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || "Invalid verification code." },
        { status: 400 }
      );
    }

    // 3. Resolve patron profile identity
    const verifiedEmail = verification.email || "";
    const existingProfile = await getPatronProfile("", cleanPhone);
    const patronId = existingProfile?.id || `patron-${cleanPhone}`;
    const formattedPhone = `+91${cleanPhone}`;

    const patronUser = {
      id: patronId,
      phone: formattedPhone,
      email: existingProfile?.email || verifiedEmail || undefined,
      name:
        existingProfile && existingProfile.first_name
          ? `${existingProfile.first_name} ${existingProfile.last_name || ""}`.trim()
          : undefined,
    };

    const requiresProfile =
      !existingProfile || !existingProfile.first_name || !existingProfile.last_name;

    // 4. Set HttpOnly session cookies for authenticated session
    const response = NextResponse.json({
      success: true,
      patron: patronUser,
      requiresProfile,
    });

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    };

    response.cookies.set(PATRON_ID_COOKIE, patronId, cookieOpts);
    response.cookies.set(PATRON_PHONE_COOKIE, cleanPhone, cookieOpts);
    if (patronUser.email) {
      response.cookies.set(PATRON_EMAIL_COOKIE, patronUser.email, cookieOpts);
    }

    return response;
  } catch (err: unknown) {
    console.error("[TEAK HAUS AUTH] Error in verify OTP handler:", err);
    const message = err instanceof Error ? err.message : "Failed to verify authentication code";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
