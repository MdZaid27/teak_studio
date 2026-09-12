import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/orders";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const orders = await getAllOrders();
    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS ADMIN API ERROR] GET /api/admin/orders:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
