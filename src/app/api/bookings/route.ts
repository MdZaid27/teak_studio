import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createStudioBooking, getAllStudioBookings } from "@/lib/bookings";
import { requireAdminSession } from "@/lib/auth";
import { sendStudioBookingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  patron_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, {
      message: "Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
    }),
  studio_location: z.string().min(3, "Studio location is required"),
  preferred_date: z.string().min(8, "Preferred date is required"),
  preferred_time_slot: z.string().min(2, "Preferred time slot is required"),
  notes: z.string().optional(),
});

/**
 * GET /api/bookings
 * Admin listing of all atelier walkthrough bookings.
 */
export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const bookings = await getAllStudioBookings();
    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] GET /api/bookings failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Patron booking creation for atelier walkthrough.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = bookingSchema.safeParse(rawBody);

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

    const input = parseResult.data;
    const result = await createStudioBooking(input);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to record studio booking" },
        { status: 500 }
      );
    }

    // Trigger confirmation email
    try {
      await sendStudioBookingEmail({
        bookingId: result.bookingId,
        patronName: input.patron_name,
        email: input.email,
        phone: input.phone,
        location: input.studio_location,
        date: input.preferred_date,
        timeSlot: input.preferred_time_slot,
        notes: input.notes,
      });
    } catch (emailErr) {
      console.warn("[TEAK HAUS EMAIL] Failed to send booking email notification:", emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        id: result.bookingId,
        bookingId: result.bookingId,
        message: `Your private atelier walkthrough at ${input.studio_location} has been registered. Our curator will contact you shortly.`,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS API ERROR] POST /api/bookings failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
