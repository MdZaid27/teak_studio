import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateBespokeInquiryStatus } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";
import { BespokeInquiryStatus } from "@/types/database";

const updateInquirySchema = z.object({
  status: z.enum(["new", "contacted", "in_review", "archived"]),
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
        { success: false, error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const parseResult = updateInquirySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status value. Allowed: new, contacted, in_review, archived",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status } = parseResult.data;
    const updated = await updateBespokeInquiryStatus(id, status as BespokeInquiryStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        inquiry: updated,
        message: `Inquiry status updated to ${status}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[KILN STUDIO API ERROR] PATCH /api/commissions/[id] failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
