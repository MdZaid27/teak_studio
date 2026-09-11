import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateSwatchRequestStatus } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";
import { SwatchRequestStatus } from "@/types/database";

const updateSwatchSchema = z.object({
  status: z.enum(["requested", "dispatched", "delivered"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Swatch request ID is required" },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const parseResult = updateSwatchSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status value. Allowed: requested, dispatched, delivered",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status } = parseResult.data;
    const updated = await updateSwatchRequestStatus(id, status as SwatchRequestStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Swatch request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        request: updated,
        message: `Swatch request status updated to ${status}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[KILN STUDIO API ERROR] PATCH /api/swatch-orders/[id] failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
