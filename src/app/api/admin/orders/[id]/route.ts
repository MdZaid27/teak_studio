import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderByNumberOrId, updateOrderStatus } from "@/lib/orders";
import { requireAdminSession } from "@/lib/auth";
import { OrderStatus } from "@/types/database";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
});

function normalizeStatus(input: string): OrderStatus | null {
  const norm = input.trim().toLowerCase();
  switch (norm) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "production":
    case "in production":
      return "production";
    case "dispatched":
    case "in_transit":
    case "in transit":
    case "in white-glove transit":
    case "white-glove in transit":
      return "dispatched";
    case "delivered":
      return "delivered";
    case "cancelled":
    case "canceled":
      return "cancelled";
    default:
      return null;
  }
}

export async function GET(
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

    const order = await getOrderByNumberOrId(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[TEAK HAUS ADMIN API ERROR] GET /api/admin/orders/[id]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    const parseResult = updateStatusSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const normalized = normalizeStatus(parseResult.data.status);
    if (!normalized) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status value '${parseResult.data.status}'. Allowed: Confirmed, Production, In White-Glove Transit, Delivered, Cancelled.`,
        },
        { status: 400 }
      );
    }

    const updatedOrder = await updateOrderStatus(id, normalized);
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Dispatch lifecycle update email asynchronously
    if (updatedOrder.customer_email) {
      sendOrderStatusUpdateEmail({
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
      }).catch((emailErr) => {
        console.error("[TEAK HAUS EMAIL ERROR] Failed to dispatch order status email:", emailErr);
      });
    }

    return NextResponse.json(
      {
        success: true,
        order: updatedOrder,
        message: `Order status updated to ${normalized}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[TEAK HAUS ADMIN API ERROR] PATCH /api/admin/orders/[id]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
