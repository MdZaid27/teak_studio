import { NextRequest, NextResponse } from "next/server";
import { getPatronWishlist, addToWishlist, removeFromWishlist } from "@/lib/patron";
import { verifyPatronAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const auth = await verifyPatronAccess({ userId });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const items = await getPatronWishlist(userId);
    return NextResponse.json({ success: true, wishlist: items }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch wishlist";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, productId, selectedTimberId } = body;

    if (!userId || !productId) {
      return NextResponse.json({ success: false, error: "userId and productId are required" }, { status: 400 });
    }

    const auth = await verifyPatronAccess({ userId });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const item = await addToWishlist(userId, productId, selectedTimberId);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add to wishlist";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || !productId) {
      return NextResponse.json({ success: false, error: "userId and productId are required" }, { status: 400 });
    }

    const auth = await verifyPatronAccess({ userId });
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await removeFromWishlist(userId, productId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove from wishlist";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
