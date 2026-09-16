import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateSecureOtp, storeOtp, maskEmail, normalizePhone } from "@/lib/otp";
import { getPatronProfile } from "@/lib/patron";
import { sendCustomerOtpEmail } from "@/lib/email";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Please provide a valid email address").optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  // 1. Sliding window rate limiting: max 5 requests per 10 minutes per IP
  const rateLimitResponse = enforceRateLimit(req, "auth:otp:send", 5, 10 * 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await req.json();
    const parsed = sendOtpSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(parsed.data.phone);
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // 2. Resolve destination email
    let targetEmail = parsed.data.email ? parsed.data.email.trim().toLowerCase() : "";
    let patronName: string | undefined;

    // Look up existing patron profile if email was not supplied
    const existingProfile = await getPatronProfile("", cleanPhone);
    if (existingProfile) {
      if (existingProfile.first_name) {
        patronName = `${existingProfile.first_name} ${existingProfile.last_name || ""}`.trim();
      }
      if (!targetEmail && existingProfile.email) {
        targetEmail = existingProfile.email.trim().toLowerCase();
      }
    }

    // If no email on record and none provided, prompt client for email
    if (!targetEmail) {
      return NextResponse.json({
        success: false,
        requiresEmail: true,
        message: "Welcome to TEAK HAUS. Please enter your email address to receive your access pass.",
      });
    }

    // 3. Generate cryptographically secure OTP and store hash
    const otpCode = generateSecureOtp();
    storeOtp({
      phone: cleanPhone,
      email: targetEmail,
      code: otpCode,
    });

    // 4. Dispatch branded email via Resend
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    const emailResult = await sendCustomerOtpEmail({
      email: targetEmail,
      otpCode,
      phone: formattedPhone,
      customerName: patronName,
      expiryMinutes: 10,
    });

    if (!emailResult.success) {
      console.error("[TEAK HAUS AUTH] Failed to dispatch OTP email:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to deliver verification code. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      maskedEmail: maskEmail(targetEmail),
      requiresEmail: false,
    });
  } catch (err: unknown) {
    console.error("[TEAK HAUS AUTH] Error in send OTP handler:", err);
    const message = err instanceof Error ? err.message : "Internal authentication error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
