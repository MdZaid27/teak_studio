import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { getProductById } from "@/lib/products";
import { getAllOrders, saveDevOrder } from "@/lib/orders";
import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/auth";

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
    console.error("[KILN STUDIO API ERROR] GET /api/orders:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Validation schema for incoming order creation requests
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  timberOption: z.string().optional(),
});

const createOrderSchema = z.object({
  customer_name: z.string().min(2, "Full name is required (min 2 characters)"),
  customer_phone: z
    .string()
    .transform((val) => val.replace(/\D/g, "").slice(-10))
    .pipe(
      z.string().regex(/^[6-9]\d{9}$/, {
        message: "Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      })
    ),
  customer_email: z.string().email("Valid email address is required"),
  delivery_address: z.string().min(5, "Delivery address is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Postal PIN code must be exactly 6 digits and cannot start with 0"),
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

          const devOrderId = `dev-sim-${Date.now()}`;
          saveDevOrder({
            id: devOrderId,
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            order_items: resolvedItems.map((item, idx) => ({
              id: `item-${idx + 1}`,
              order_id: devOrderId,
              product_id: item.productId,
              product_name: item.productName,
              timber_option: item.timberOption,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              line_total: item.lineTotal,
              created_at: new Date().toISOString(),
            })),
          });

          return NextResponse.json(
            {
              success: true,
              orderNumber,
              orderId: devOrderId,
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
  } catch (err: unknown) {
    console.error("[KILN STUDIO API ERROR] POST /api/orders error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
