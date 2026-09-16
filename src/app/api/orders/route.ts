import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { getProductById } from "@/lib/products";
import { getAllOrders, saveDevOrder } from "@/lib/orders";
import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { requireAdminSession, getAuthenticatedCallerIdentity } from "@/lib/auth";
import { getPincodeDetailsSync } from "@/lib/pincode";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";

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
    console.error("[TEAK HAUS API ERROR] GET /api/orders:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { getPatronAddresses, createPatronAddress } from "@/lib/patron";

// Validation schema for incoming order creation requests
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  timberOption: z.string().optional(),
  timberTitle: z.string().optional(),
  productTitle: z.string().optional(),
  productName: z.string().optional(),
  unitPrice: z.number().optional(),
  imageUrl: z.string().optional(),
});

const createOrderSchema = z.object({
  user_id: z.string().optional(),
  userId: z.string().optional(),
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
  shipping_address: z.string().optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Postal PIN code must be exactly 6 digits and cannot start with 0"),
  city: z.string().optional(),
  state: z.string().optional(),
  payment_method: z.string().optional().default("Inspection Upon Delivery / Zero Upfront"),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
});

// Helper to generate unique order code like TH-79B4A (TEAK HAUS)
function generateOrderNumber(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // clean alphanumeric without confusing chars (0, O, 1, I)
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TH-${code}`;
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, "orders-create", 10, 15 * 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
      user_id,
      userId,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      shipping_address,
      pincode,
      city,
      state,
      payment_method,
      items,
    } = parseResult.data;

    // Zero-trust customer ownership verification:
    // If caller has an active Supabase Auth session or signed HttpOnly patron cookie,
    // bind the order to that verified identity. Never trust arbitrary client-sent user_id.
    const caller = await getAuthenticatedCallerIdentity();

    let targetUserId: string | null = null;
    if (caller?.userId) {
      targetUserId = caller.userId;
    } else if (user_id === "patron-guest" || userId === "patron-guest" || (!user_id && !userId)) {
      targetUserId = "patron-guest";
    } else {
      // Client passed an arbitrary user_id without a matching verified session;
      // treat as guest to prevent spoofed ownership binding
      targetUserId = "patron-guest";
    }

    const finalShippingAddress = shipping_address || delivery_address;
    const pinInfo = getPincodeDetailsSync(pincode);
    const finalCity = city || pinInfo?.city || "India";
    const finalState = state || pinInfo?.state || "India";
    const finalPaymentMethod = payment_method || "Inspection Upon Delivery / Zero Upfront";

    // Strict zero-trust server-side pricing calculation
    let calculatedSubtotal = 0;
    const resolvedItems: Array<{
      productId: string;
      productName: string;
      productTitle: string;
      timberOption: string | null;
      timberTitle: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      imageUrl: string;
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
      const chosenOption = item.timberTitle || item.timberOption;
      if (chosenOption && product.timbers && product.timbers.length > 0) {
        const cleanOption = chosenOption.trim().toLowerCase();
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
        productTitle: item.productTitle || product.name,
        timberOption: chosenOption || null,
        timberTitle: chosenOption || null,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        imageUrl: item.imageUrl || product.image || (product.gallery && product.gallery[0]?.src) || "",
      });
    }

    const calculatedTotal = calculatedSubtotal;
    const orderNumber = generateOrderNumber();

    const isProduction = process.env.NODE_ENV === "production";
    const isConfigured = isSupabaseConfigured();

    // Helper to auto-save address to patron_addresses if patron has not saved this address yet
    const maybeAutoSaveAddress = async () => {
      if (targetUserId && targetUserId !== "patron-guest") {
        try {
          const existingAddrs = await getPatronAddresses(targetUserId, customer_phone);
          const hasMatch = existingAddrs.some(
            (a) =>
              a.pincode === pincode.trim() &&
              (finalShippingAddress.toLowerCase().includes(a.floor_building.toLowerCase()) ||
                a.floor_building.toLowerCase().includes(finalShippingAddress.toLowerCase()))
          );
          if (!hasMatch) {
            const nameParts = customer_name.trim().split(" ");
            const firstName = nameParts[0] || "Patron";
            const lastName = nameParts.slice(1).join(" ") || "Member";
            await createPatronAddress(targetUserId, {
              first_name: firstName,
              last_name: lastName,
              phone: customer_phone,
              email: customer_email,
              floor_building: finalShippingAddress.split(",")[0]?.trim() || finalShippingAddress,
              area_street: finalShippingAddress.split(",").slice(1).join(", ").trim() || finalShippingAddress,
              pincode,
              city: finalCity,
              state: finalState,
              country: "India",
              save_as: "Home",
              is_default: existingAddrs.length === 0,
            });
          }
        } catch (patronErr) {
          console.warn("[TEAK HAUS] Address auto-save notice:", patronErr);
        }
      }
    };

    // Helper for dev store persistence fallback
    const saveDevStoreOrder = async (orderId: string) => {
      saveDevOrder({
        id: orderId,
        order_number: orderNumber,
        user_id: targetUserId,
        customer_name,
        customer_phone,
        customer_email,
        delivery_address: finalShippingAddress,
        shipping_address: finalShippingAddress,
        city: finalCity,
        state: finalState,
        pincode,
        subtotal: calculatedSubtotal,
        total: calculatedTotal,
        total_amount: calculatedTotal,
        payment_method: finalPaymentMethod,
        status: "confirmed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_items: resolvedItems.map((item, idx) => ({
          id: `item-${Date.now()}-${idx + 1}`,
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          product_title: item.productTitle,
          timber_option: item.timberOption,
          timber_title: item.timberTitle,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          line_total: item.lineTotal,
          image_url: item.imageUrl,
          created_at: new Date().toISOString(),
        })),
      });
      await maybeAutoSaveAddress();
    };

    if (isProduction && !isConfigured) {
      return NextResponse.json(
        { error: "Database configuration missing in production." },
        { status: 500 }
      );
    }

    // In production with hardened RLS, orders must be created via the service-role client
    if (isProduction && !getSupabaseAdminClient()) {
      console.error(
        "[TEAK HAUS SECURITY] Production order creation requires SUPABASE_SERVICE_ROLE_KEY to persist orders safely with RLS enabled."
      );
      return NextResponse.json(
        { error: "Order persistence service unavailable in production." },
        { status: 500 }
      );
    }

    // Use service-role client in production, or fallback for local development
    const supabase = getSupabaseAdminClient() || getSupabaseClient();

    if (supabase && isConfigured) {
      try {
        // Attempt 1: Insert with all extended columns
        let orderData: { id: string; order_number: string } | null = null;
        let insertErr: { message?: string; code?: string } | null = null;

        const richPayload: Record<string, unknown> = {
          order_number: orderNumber,
          user_id: targetUserId,
          customer_name,
          customer_phone,
          customer_email,
          delivery_address: finalShippingAddress,
          shipping_address: finalShippingAddress,
          city: finalCity,
          state: finalState,
          pincode,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          total_amount: calculatedTotal,
          payment_method: finalPaymentMethod,
          status: "confirmed",
        };

        const attempt1 = await supabase
          .from("orders")
          .insert(richPayload)
          .select("id, order_number")
          .single();

        if (!attempt1.error && attempt1.data) {
          orderData = attempt1.data;
        } else if (attempt1.error?.code === "PGRST204") {
          // Fallback Attempt 2: Table has standard baseline columns
          const baselinePayload = {
            order_number: orderNumber,
            customer_name,
            customer_phone,
            customer_email,
            delivery_address: finalShippingAddress,
            pincode,
            subtotal: calculatedSubtotal,
            total: calculatedTotal,
            payment_method: finalPaymentMethod,
            status: "confirmed",
          };
          const attempt2 = await supabase
            .from("orders")
            .insert(baselinePayload)
            .select("id, order_number")
            .single();

          if (!attempt2.error && attempt2.data) {
            orderData = attempt2.data;
          } else {
            insertErr = attempt2.error;
          }
        } else {
          insertErr = attempt1.error;
        }

        if (insertErr || !orderData) {
          if (!isProduction) {
            console.warn(
              "[TEAK HAUS NOTICE] Supabase orders table unavailable or pending migration.\n" +
              "Falling back to local development order store."
            );
            const devOrderId = `dev-sim-${Date.now()}`;
            await saveDevStoreOrder(devOrderId);

            // Trigger order confirmation email
            try {
              await sendOrderConfirmationEmail({
                orderNumber,
                customerName: customer_name,
                customerEmail: customer_email,
                items: resolvedItems,
                total: calculatedTotal,
                address: finalShippingAddress,
                paymentMethod: finalPaymentMethod,
              });
            } catch (emailErr) {
              console.warn("[TEAK HAUS EMAIL] Failed to send fallback order email:", emailErr);
            }

            return NextResponse.json(
              {
                success: true,
                orderNumber,
                orderId: devOrderId,
                subtotal: calculatedSubtotal,
                total: calculatedTotal,
                itemsCount: resolvedItems.length,
                status: "Confirmed",
              },
              { status: 201 }
            );
          }

          console.error("[TEAK HAUS DB ERROR] Failed to create order in database:", insertErr);
          return NextResponse.json(
            { error: `Database error creating order: ${insertErr?.message || "Unknown error"}` },
            { status: 500 }
          );
        }

        // Insert line items
        const richItemRows = resolvedItems.map((item) => ({
          order_id: orderData.id,
          product_id: item.productId,
          product_name: item.productName,
          product_title: item.productTitle,
          timber_option: item.timberOption,
          timber_title: item.timberTitle,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          line_total: item.lineTotal,
          image_url: item.imageUrl,
        }));

        const itemsAttempt = await supabase.from("order_items").insert(richItemRows);
        if (itemsAttempt.error && itemsAttempt.error.code === "PGRST204") {
          // Fallback to baseline order_items columns
          const baselineItems = resolvedItems.map((item) => ({
            order_id: orderData.id,
            product_id: item.productId,
            product_name: item.productName,
            timber_option: item.timberOption,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            line_total: item.lineTotal,
          }));
          const fallbackAttempt = await supabase.from("order_items").insert(baselineItems);
          if (fallbackAttempt.error) {
            console.error("[TEAK HAUS DB ERROR] Failed to insert order items (fallback):", fallbackAttempt.error);
            if (isProduction) {
              return NextResponse.json(
                { error: "Database error recording order items." },
                { status: 500 }
              );
            }
          }
        } else if (itemsAttempt.error) {
          console.error("[TEAK HAUS DB ERROR] Failed to insert order items:", itemsAttempt.error);
          if (isProduction) {
            return NextResponse.json(
              { error: "Database error recording order items." },
              { status: 500 }
            );
          }
        }

        // Auto-save address for patron if applicable
        await maybeAutoSaveAddress();

        // Only mirror in local store during non-production development
        if (!isProduction) {
          saveDevOrder({
            id: orderData.id,
            order_number: orderData.order_number,
            user_id: targetUserId,
            customer_name,
            customer_phone,
            customer_email,
            delivery_address: finalShippingAddress,
            shipping_address: finalShippingAddress,
            city: finalCity,
            state: finalState,
            pincode,
            subtotal: calculatedSubtotal,
            total: calculatedTotal,
            total_amount: calculatedTotal,
            payment_method: finalPaymentMethod,
            status: "confirmed",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            order_items: resolvedItems.map((item, idx) => ({
              id: `item-${idx + 1}`,
              order_id: orderData.id,
              product_id: item.productId,
              product_name: item.productName,
              product_title: item.productTitle,
              timber_option: item.timberOption,
              timber_title: item.timberTitle,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              line_total: item.lineTotal,
              image_url: item.imageUrl,
              created_at: new Date().toISOString(),
            })),
          });
        }

        // Trigger order confirmation email
        try {
          await sendOrderConfirmationEmail({
            orderNumber: orderData.order_number,
            customerName: customer_name,
            customerEmail: customer_email,
            items: resolvedItems,
            total: calculatedTotal,
            address: finalShippingAddress,
            paymentMethod: finalPaymentMethod,
          });
        } catch (emailErr) {
          console.warn("[TEAK HAUS EMAIL] Failed to send order confirmation email:", emailErr);
        }

        return NextResponse.json(
          {
            success: true,
            orderNumber: orderData.order_number,
            orderId: orderData.id,
            subtotal: calculatedSubtotal,
            total: calculatedTotal,
            status: "Confirmed",
          },
          { status: 201 }
        );
      } catch (dbErr: unknown) {
        if (!isProduction) {
          console.warn("[TEAK HAUS NOTICE] Network error contacting database. Caching order in memory:", dbErr);
          const devOrderId = `dev-sim-${Date.now()}`;
          await saveDevStoreOrder(devOrderId);

          try {
            await sendOrderConfirmationEmail({
              orderNumber,
              customerName: customer_name,
              customerEmail: customer_email,
              items: resolvedItems,
              total: calculatedTotal,
              address: finalShippingAddress,
              paymentMethod: finalPaymentMethod,
            });
          } catch (emailErr) {
            console.warn("[TEAK HAUS EMAIL] Failed to send dev order email:", emailErr);
          }

          return NextResponse.json(
            {
              success: true,
              orderNumber,
              orderId: devOrderId,
              subtotal: calculatedSubtotal,
              total: calculatedTotal,
              itemsCount: resolvedItems.length,
              status: "Confirmed",
            },
            { status: 201 }
          );
        }
        throw dbErr;
      }
    }

    // Local development fallback without credentials
    if (!isProduction) {
      const devOrderId = `dev-sim-${Date.now()}`;
      await saveDevStoreOrder(devOrderId);

      // Send order confirmation email even in no-Supabase dev mode
      try {
        await sendOrderConfirmationEmail({
          orderNumber,
          customerName: customer_name,
          customerEmail: customer_email,
          items: resolvedItems,
          total: calculatedTotal,
          address: finalShippingAddress,
          paymentMethod: finalPaymentMethod,
        });
      } catch (emailErr) {
        console.warn("[TEAK HAUS EMAIL] Failed to send dev order email:", emailErr);
      }

      return NextResponse.json(
        {
          success: true,
          orderNumber,
          orderId: devOrderId,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          itemsCount: resolvedItems.length,
          status: "Confirmed",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Database connection unavailable." },
      { status: 500 }
    );
  } catch (err: unknown) {
    console.error("[TEAK HAUS API ERROR] POST /api/orders error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
