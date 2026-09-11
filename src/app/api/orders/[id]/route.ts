import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderByNumberOrId, updateOrderStatus } from "@/lib/orders";
import { requireAdminSession } from "@/lib/auth";
import { OrderStatus } from "@/types/database";

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "production",
    "dispatched",
    "delivered",
    "cancelled",
  ]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Order identifier is required" },
        { status: 400 }
      );
    }

    const order = await getOrderByNumberOrId(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Return safe customer order details with items
    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[KILN STUDIO API ERROR] GET /api/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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
        { success: false, error: "Order identifier is required" },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const parseResult = updateOrderStatusSchema.safeParse(rawBody);

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

    const { status } = parseResult.data;
    const updatedOrder = await updateOrderStatus(id, status as OrderStatus);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: updatedOrder,
        message: `Order status updated to ${status}.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[KILN STUDIO API ERROR] PATCH /api/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
