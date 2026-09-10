import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import type { ApiResponse, Product, ProductFilters } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Query Params:
 *  - category: Filter by category name (e.g. 'Dining', 'Living', 'Storage', 'Bedroom')
 *  - timber: Filter by timber name (e.g. 'Hunsur Teak', 'Indian Rosewood', 'Assam Teak')
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const rawCategory = searchParams.get("category");
    const rawTimber = searchParams.get("timber");

    // Server-side validation: ensure parameters do not exceed reasonable length
    if (rawCategory && rawCategory.length > 50) {
      return NextResponse.json(
        { success: false, error: "Invalid category filter parameter" },
        { status: 400 }
      );
    }

    if (rawTimber && rawTimber.length > 50) {
      return NextResponse.json(
        { success: false, error: "Invalid timber filter parameter" },
        { status: 400 }
      );
    }

    const categoryParam = rawCategory?.trim();
    const timberParam = rawTimber?.trim();

    const filters: ProductFilters = {
      category: categoryParam && categoryParam !== "All Pieces" ? categoryParam : undefined,
      timber: timberParam && timberParam !== "All Timbers" ? timberParam : undefined,
    };

    const products = await getProducts(filters);


    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error fetching product catalogue";
    console.error("[API Error] GET /api/products:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

