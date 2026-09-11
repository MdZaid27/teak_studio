import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBespokeInquiry, getAllBespokeInquiries } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const inquiries = await getAllBespokeInquiries();
    return NextResponse.json(
      {
        success: true,
        inquiries,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[KILN STUDIO API ERROR] GET /api/commissions failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

const commissionSchema = z.object({
  name: z.string().min(2, "Full name is required (min 2 characters)"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, {
      message: "Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
    }),
  email: z.string().email("Valid email address is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Postal PIN code must be exactly 6 digits and cannot start with 0"),
  wood_preference: z.string().optional(),
  dimensions_notes: z.string().min(5, "Please provide dimensions and context (min 5 characters)"),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = commissionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await createBespokeInquiry(parseResult.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to record commission inquiry" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        inquiryId: result.inquiryId,
        message: "Your bespoke inquiry has been received. Our furniture architects will contact you within 24 hours.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[KILN STUDIO API ERROR] POST /api/commissions failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
