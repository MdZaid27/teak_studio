import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSwatchRequest, getAllSwatchRequests } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const requests = await getAllSwatchRequests();
    return NextResponse.json(
      {
        success: true,
        requests,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] GET /api/swatch-orders failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

const swatchRequestSchema = z.object({
  name: z.string().min(2, "Full name is required (min 2 characters)"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, {
      message: "Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
    }),
  address: z.string().min(5, "Delivery address is required (min 5 characters)"),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Postal PIN code must be exactly 6 digits and cannot start with 0"),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "swatch-request", 5, 15 * 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.json();
    const parseResult = swatchRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await createSwatchRequest(parseResult.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to record swatch box request" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requestId: result.requestId,
        message: "Material sample box request confirmed. Hand-planed timber swatches will be prepared for dispatch.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] POST /api/swatch-orders failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
