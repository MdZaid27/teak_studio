import { NextRequest, NextResponse } from "next/server";
import { normalizePhone, maskEmail } from "@/lib/otp";
import { getPatronProfile } from "@/lib/patron";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPhone = searchParams.get("phone") || "";
    const cleanPhone = normalizePhone(rawPhone);

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ success: true, exists: false }, { status: 200 });
    }

    const profile = await getPatronProfile("", cleanPhone);

    if (profile && profile.email && profile.email.includes("@")) {
      return NextResponse.json({
        success: true,
        exists: true,
        name: profile.first_name ? profile.first_name.trim() : undefined,
        maskedEmail: maskEmail(profile.email.trim()),
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
    });
  } catch (err) {
    console.error("[TEAK HAUS AUTH] Error checking patron phone:", err);
    return NextResponse.json({ success: false, exists: false }, { status: 500 });
  }
}
