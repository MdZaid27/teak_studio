import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateStudioBookingStatus } from "@/lib/bookings";
import { requireAdminSession } from "@/lib/auth";
import { sendStudioBookingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const patchStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
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
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const parseResult = patchStatusSchema.safeParse(rawBody);

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

    const result = await updateStudioBookingStatus(id, parseResult.data.status);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update booking" },
        { status: 404 }
      );
    }

    // Dispatch status update email to patron asynchronously
    if (result.booking && result.booking.email) {
      sendStudioBookingEmail({
        bookingId: result.booking.id,
        patronName: result.booking.patron_name,
        email: result.booking.email,
        phone: result.booking.phone,
        location: result.booking.studio_location,
        date: result.booking.preferred_date,
        timeSlot: result.booking.preferred_time_slot,
        notes: result.booking.notes,
        status: parseResult.data.status,
      }).catch((emailErr) => {
        console.error("[TEAK HAUS EMAIL ERROR] Failed to dispatch studio booking update email:", emailErr);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Booking ${id} status updated to ${parseResult.data.status}`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] PATCH /api/bookings/[id] failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
