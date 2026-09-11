import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllNewsletterSubscribers, subscribeNewsletter } from "@/lib/interactions";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const data = await getAllNewsletterSubscribers();
    return NextResponse.json(
      {
        success: true,
        ...data,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[KILN STUDIO API ERROR] GET /api/newsletter failed:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

const newsletterSchema = z.object({
  email: z.string().trim().email("Valid email address is required"),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = newsletterSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const result = await subscribeNewsletter(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to subscribe to newsletter" },
        { status: 500 }
      );
    }

    if (result.alreadySubscribed) {
      return NextResponse.json(
        {
          success: true,
          message: "You are already subscribed to the Atelier Journal.",
          subscriberId: result.subscriberId,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        subscriberId: result.subscriberId,
        message: "Welcome to the KILN STUDIO Patron List.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[KILN STUDIO API ERROR] POST /api/newsletter failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
