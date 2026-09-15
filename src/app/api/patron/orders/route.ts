import { NextRequest, NextResponse } from "next/server";
import { getPatronOrders } from "@/lib/patron";
import { verifyPatronAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || "";
    const email = searchParams.get("email") || "";
    const userId = searchParams.get("userId") || "";

    const identifier = phone || email;
    if (!identifier && !userId) {
      return NextResponse.json({ success: false, error: "phone, email, or userId is required" }, { status: 400 });
    }

    // Strict authorization guard: Ensure caller owns the requested phone, email, or userId
    const auth = await verifyPatronAccess({
      userId: userId || undefined,
      phone: phone || undefined,
      email: email || undefined,
    });

    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const orders = await getPatronOrders(identifier, userId);
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch patron orders";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
