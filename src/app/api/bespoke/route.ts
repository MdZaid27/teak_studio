import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBespokeInquiry, getAllBespokeInquiries } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";
import { sendBespokeCommissionEmail, sendBespokeInquiryEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const bespokeInquirySchema = z.object({
  patron_name: z.string().optional(),
  name: z.string().optional(),
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
    .regex(/^[1-9][0-9]{5}$/, "Postal PIN code must be exactly 6 digits and cannot start with 0")
    .optional(),
  project_type: z.string().optional().default("Custom Dining Statement"),
  timber_preference: z.string().optional(),
  wood_preference: z.string().optional(),
  approx_dimensions: z.string().optional(),
  budget_range: z.string().optional(),
  reference_file_url: z.string().optional(),
  message: z.string().optional(),
  dimensions_notes: z.string().optional(),
}).refine(
  (data) => Boolean((data.patron_name && data.patron_name.trim().length >= 2) || (data.name && data.name.trim().length >= 2)),
  { message: "Full name is required (min 2 characters)", path: ["patron_name"] }
).refine(
  (data) => Boolean((data.message && data.message.trim().length >= 5) || (data.dimensions_notes && data.dimensions_notes.trim().length >= 5)),
  { message: "Please provide dimensions, context or message (min 5 characters)", path: ["message"] }
);

/**
 * GET /api/bespoke
 * Admin retrieval of all custom commission inquiries.
 */
export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const inquiries = await getAllBespokeInquiries();
    return NextResponse.json({ success: true, inquiries }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] GET /api/bespoke failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/bespoke
 * Patron submission of bespoke architectural commission brief.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = bespokeInquirySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const finalName = (data.patron_name || data.name || "").trim();
    const finalMessage = (data.message || data.dimensions_notes || "").trim();
    const finalTimber = data.timber_preference || data.wood_preference || "Hunsur Teak";

    const result = await createBespokeInquiry({
      patron_name: finalName,
      name: finalName,
      phone: data.phone,
      email: data.email,
      pincode: data.pincode || "560001",
      project_type: data.project_type,
      timber_preference: finalTimber,
      wood_preference: finalTimber,
      approx_dimensions: data.approx_dimensions,
      budget_range: data.budget_range,
      reference_file_url: data.reference_file_url,
      message: finalMessage,
      dimensions_notes: finalMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to record bespoke inquiry" },
        { status: 500 }
      );
    }

    // Trigger confirmation email
    try {
      if (typeof sendBespokeCommissionEmail === "function") {
        await sendBespokeCommissionEmail({
          inquiryId: result.inquiryId,
          patronName: finalName,
          email: data.email,
          projectType: data.project_type || "Custom Architectural Commission",
          timberPreference: finalTimber,
          approxDimensions: data.approx_dimensions,
          budgetRange: data.budget_range,
          message: finalMessage,
        });
      } else {
        await sendBespokeInquiryEmail({
          inquiryId: result.inquiryId,
          patronName: finalName,
          email: data.email,
          phone: data.phone,
          projectType: data.project_type || "Custom Commission",
          timberPreference: finalTimber,
          approxDimensions: data.approx_dimensions,
          budgetRange: data.budget_range,
          message: finalMessage,
        });
      }
    } catch (emailErr) {
      console.warn("[TEAK HAUS EMAIL] Failed to send bespoke confirmation email:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        id: result.inquiryId,
        inquiryId: result.inquiryId,
        message: "Your bespoke commission inquiry has been received. Our furniture architects will contact you within 24 hours.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] POST /api/bespoke failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
