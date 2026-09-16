import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderByNumberOrId, updateOrderStatus } from "@/lib/orders";
import { requireAdminSession, verifyPatronAccess } from "@/lib/auth";
import { OrderStatus } from "@/types/database";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

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

    // Strict ownership verification: Only order owner or admin can retrieve order details
    const auth = await verifyPatronAccess({
      userId: order.user_id,
      phone: order.customer_phone,
      email: order.customer_email,
    });

    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    // Return safe customer order details with items
    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[TEAK HAUS API ERROR] GET /api/orders/[id]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
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

    if (updatedOrder.customer_email) {
      try {
        await sendOrderStatusUpdateEmail({
          orderNumber: updatedOrder.order_number,
          customerName: updatedOrder.customer_name,
          customerEmail: updatedOrder.customer_email,
          status: updatedOrder.status,
          items: updatedOrder.order_items?.map((item) => ({
            productTitle: item.product_title || item.product_name,
            timberTitle: item.timber_title || item.timber_option,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            lineTotal: item.line_total,
          })),
          total: updatedOrder.total,
          address: updatedOrder.delivery_address,
        });
      } catch (emailErr) {
        console.error("[TEAK HAUS EMAIL ERROR] Failed to dispatch order status email:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        order: updatedOrder,
        message: `Order status updated to ${status}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[TEAK HAUS API ERROR] PATCH /api/orders/[id]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
