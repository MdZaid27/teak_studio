import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { getProductById } from "@/lib/products";
import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

// Validation schema for incoming order creation requests
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  timberOption: z.string().optional(),
});

const createOrderSchema = z.object({
  customer_name: z.string().min(2, "Full name is required (min 2 characters)"),
  customer_phone: z.string().min(10, "Valid phone number is required (min 10 digits)"),
  customer_email: z.string().email("Valid email address is required"),
  delivery_address: z.string().min(5, "Delivery address is required"),
  pincode: z.string().min(4, "Valid pincode is required"),
  payment_method: z.string().optional().default("offline"),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
});

// Helper to generate unique order number like KILN-ORD-7A9B
function generateOrderNumber(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // clean alphanumeric without confusing chars (0, O, 1, I)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${siteConfig.orderPrefix}-${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = createOrderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      pincode,
      payment_method,
      items,
    } = parseResult.data;

    // Strict zero-trust server-side pricing calculation
    let calculatedSubtotal = 0;
    const resolvedItems: Array<{
      productId: string;
      productName: string;
      timberOption: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product '${item.productId}' does not exist in atelier catalogue.` },
          { status: 404 }
        );
      }

      let unitPrice = product.price;

      // Timber Variant Pricing Calculation:
      // If timberOption is provided, look up price matching that timber in product.timbers (from product_timber_options)
      if (item.timberOption && product.timbers && product.timbers.length > 0) {
        const cleanOption = item.timberOption.trim().toLowerCase();
        const matchedTimber = product.timbers.find(
          (t) =>
            t.name.toLowerCase() === cleanOption ||
            t.id.toLowerCase() === cleanOption ||
            t.name.toLowerCase().includes(cleanOption) ||
            cleanOption.includes(t.name.toLowerCase())
        );

        if (matchedTimber && typeof matchedTimber.price === "number") {
          unitPrice = matchedTimber.price;
        }
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        timberOption: item.timberOption || null,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    const calculatedTotal = calculatedSubtotal;
    const orderNumber = generateOrderNumber();

    const isProduction = process.env.NODE_ENV === "production";
    const isConfigured = isSupabaseConfigured();

    if (isProduction && !isConfigured) {
      return NextResponse.json(
        { error: "Database configuration missing in production." },
        { status: 500 }
      );
    }

    // Attempt to persist using Supabase Admin client (or standard client with RLS)
    const supabase = getSupabaseAdminClient() || getSupabaseClient();

    if (supabase && isConfigured) {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name,
          customer_phone,
          customer_email,
          delivery_address,
          pincode,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          payment_method,
          status: "pending",
        })
        .select("id, order_number")
        .single();

      if (orderError) {
        // If orders table is not yet created in Supabase SQL editor:
        if (orderError.code === "PGRST205" && !isProduction) {
          console.warn(
            "[KILN STUDIO NOTICE] Table 'orders' does not exist yet in Supabase.\n" +
            "👉 Please execute 'supabase/orders.sql' in your Supabase SQL Editor to enable persistent order storage.\n" +
            "Simulating order creation in local development."
          );

          return NextResponse.json(
            {
              success: true,
              orderNumber,
              orderId: `dev-sim-${Date.now()}`,
              subtotal: calculatedSubtotal,
              total: calculatedTotal,
              itemsCount: resolvedItems.length,
              devNotice: "Simulated order. Execute supabase/orders.sql in Supabase SQL Editor for persistence.",
            },
            { status: 201 }
          );
        }

        console.error("[KILN STUDIO DB ERROR] Failed to create order in database:", orderError);
        return NextResponse.json(
          { error: `Database error creating order: ${orderError.message}` },
          { status: 500 }
        );
      }

      // Insert line items
      const orderItemsRows = resolvedItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        timber_option: item.timberOption,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsRows);

      if (itemsError) {
        console.error("[KILN STUDIO DB ERROR] Failed to insert order items:", itemsError);
        // Note: order is created, line items failed.
        return NextResponse.json(
          { error: `Failed to record order items: ${itemsError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          orderNumber: orderData.order_number,
          orderId: orderData.id,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
        },
        { status: 201 }
      );
    }

    // Local development fallback without credentials
    if (!isProduction) {
      console.warn(
        "[KILN STUDIO DEV] Database credentials not configured. Simulating order placement."
      );
      return NextResponse.json(
        {
          success: true,
          orderNumber,
          orderId: `dev-sim-${Date.now()}`,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          itemsCount: resolvedItems.length,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Database connection unavailable." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("[KILN STUDIO API ERROR] POST /api/orders error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
