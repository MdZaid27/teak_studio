import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import type { ApiResponse, Product } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/[id]
 * Fetch a single product by slug / unique identifier.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = await context.params;

    // Server-side validation
    if (!id || typeof id !== "string" || id.trim().length === 0 || id.length > 80) {
      return NextResponse.json(
        { success: false, error: "Invalid product identifier provided" },
        { status: 400 }
      );
    }

    const sanitizedId = encodeURIComponent(id.trim().toLowerCase());
    // decode back to safe match
    const decodedId = decodeURIComponent(sanitizedId);

    const product = await getProductById(decodedId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with identifier '${decodedId}' not found in catalogue`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error fetching product details";
    console.error("[API Error] GET /api/products/[id]:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

