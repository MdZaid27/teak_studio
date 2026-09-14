import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { getProductById, updateProduct, deleteProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  compareAtPrice: z.number().nullable().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  timbers: z
    .array(
      z.object({
        timberId: z.string(),
        priceDelta: z.number().optional(),
        price: z.number().optional(),
      })
    )
    .optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  joinery: z.string().optional(),
  primaryImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  leadTime: z.string().optional(),
  stockStatus: z.enum(["in_stock", "made_to_order", "out_of_stock", "archived"]).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/products/[id]
 * Fetch single product details.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product identifier is required" }, { status: 400 });
    }

    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update product attributes, timber variants, or toggle storefront visibility.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product identifier is required" }, { status: 400 });
    }

    const rawBody = await request.json();
    const parseResult = updateProductSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid update payload",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, parseResult.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    try {
      revalidatePath("/shop");
      revalidatePath("/shop/[id]", "page");
      revalidatePath("/products/[id]", "page");
      revalidatePath("/admin/products");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        product: updated,
        message: `Piece '${updated.name}' updated successfully.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    console.error("[TEAK HAUS ADMIN API] PATCH /api/admin/products/[id] error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Archive or delete a product piece from the catalog.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product identifier is required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const success = await deleteProduct(id, !permanent);
    if (!success) {
      return NextResponse.json({ success: false, error: "Product not found or delete failed" }, { status: 404 });
    }

    try {
      revalidatePath("/shop");
      revalidatePath("/shop/[id]", "page");
      revalidatePath("/products/[id]", "page");
      revalidatePath("/admin/products");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        message: permanent ? "Piece permanently removed from catalog." : "Piece archived from storefront.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    console.error("[TEAK HAUS ADMIN API] DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
