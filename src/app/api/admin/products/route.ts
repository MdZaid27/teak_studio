import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { getAllProductsAdmin, createProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

const createProductSchema = z.object({
  title: z.string().min(2, "Product title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Base price must be a non-negative number"),
  compareAtPrice: z.number().nullable().optional(),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Craftsmanship story is required"),
  timbers: z
    .array(
      z.object({
        timberId: z.string(),
        priceDelta: z.number().optional(),
        price: z.number().optional(),
      })
    )
    .min(1, "At least one timber option must be enabled"),
  dimensions: z.string().min(1, "Dimensions are required"),
  weight: z.string().optional(),
  joinery: z.string().optional(),
  primaryImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  leadTime: z.string().optional(),
  stockStatus: z.enum(["in_stock", "made_to_order", "out_of_stock", "archived"]).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/products
 * Fetch all products in the catalog (including inactive / archived pieces).
 */
export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const products = await getAllProductsAdmin();
    return NextResponse.json(
      {
        success: true,
        products,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[TEAK HAUS ADMIN API] GET /api/admin/products error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Create a new heirloom furniture piece in the catalog.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const rawBody = await request.json();
    const parseResult = createProductSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product payload",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = parseResult.data;
    const newProduct = await createProduct({
      title: payload.title,
      slug: payload.slug,
      category: payload.category,
      basePrice: payload.basePrice,
      compareAtPrice: payload.compareAtPrice,
      shortDescription: payload.shortDescription,
      description: payload.description,
      timbers: payload.timbers,
      dimensions: payload.dimensions,
      weight: payload.weight,
      joinery: payload.joinery,
      primaryImage: payload.primaryImage || "",
      galleryImages: payload.galleryImages,
      leadTime: payload.leadTime,
      stockStatus: payload.stockStatus,
    });

    try {
      revalidatePath("/shop");
      revalidatePath("/admin/products");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        product: newProduct,
        message: `Piece '${newProduct.name}' created successfully in atelier catalog.`,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    console.error("[TEAK HAUS ADMIN API] POST /api/admin/products error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
