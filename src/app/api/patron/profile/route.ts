import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPatronProfile, upsertPatronProfile } from "@/lib/patron";

const profileSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  first_name: z.string().min(1, "First name is required").trim(),
  last_name: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Valid email is required").trim(),
  phone: z.string().min(10, "Valid phone number is required").trim(),
  marketing_opt_in: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const profile = await getPatronProfile(userId);
    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get patron profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = profileSchema.parse(body);

    const saved = await upsertPatronProfile({
      id: validated.id,
      first_name: validated.first_name,
      last_name: validated.last_name,
      email: validated.email,
      phone: validated.phone,
      marketing_opt_in: validated.marketing_opt_in ?? false,
    });

    return NextResponse.json({ success: true, profile: saved }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
