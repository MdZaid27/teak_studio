import { NextRequest, NextResponse } from "next/server";
import { getPatronOrders } from "@/lib/patron";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || "";
    const email = searchParams.get("email") || "";

    const identifier = phone || email;
    if (!identifier) {
      return NextResponse.json({ success: false, error: "phone or email is required" }, { status: 400 });
    }

    const orders = await getPatronOrders(identifier);
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch patron orders";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
