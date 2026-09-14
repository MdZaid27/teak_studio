import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateBespokeInquiryStatus } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";
import { BespokeInquiryStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const updateInquirySchema = z.object({
  status: z.enum(["new", "contacted", "in_review", "closed", "archived", "pending", "confirmed", "completed"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;

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
          error: "Invalid status value",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    let statusValue: BespokeInquiryStatus = "new";
    const requested = parseResult.data.status;
    if (requested === "confirmed" || requested === "in_review") statusValue = "in_review";
    else if (requested === "completed" || requested === "closed") statusValue = "closed";
    else if (requested === "contacted") statusValue = "contacted";
    else if (requested === "archived") statusValue = "archived";
    else statusValue = "new";

    const updated = await updateBespokeInquiryStatus(id, statusValue);

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
        message: `Inquiry status updated to ${statusValue}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] PATCH /api/bespoke/[id] failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
