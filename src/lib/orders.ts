import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { DbOrder, DbOrderItem } from "@/types/database";

export interface OrderWithItems extends DbOrder {
  order_items: DbOrderItem[];
}

/**
 * Fetch an order by its order_number or UUID.
 */
export async function getOrderByNumberOrId(
  identifier: string
): Promise<OrderWithItems | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      // Query order with items
      // Check if identifier is a valid UUID or an order_number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      const query = supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `);

      const { data, error } = isUUID
        ? await query.eq("id", identifier).maybeSingle()
        : await query.eq("order_number", identifier).maybeSingle();

      if (error) {
        if (error.code === "PGRST205" && !isProduction) {
          console.warn(
            `[KILN STUDIO NOTICE] Table 'orders' not found. Returning local fallback order for '${identifier}'.`
          );
        } else {
          console.error("[KILN STUDIO DB ERROR] Failed to fetch order:", error);
          if (isProduction) {
            throw new Error(`Failed to fetch order: ${error.message}`);
          }
        }
      } else if (data) {
        return data as OrderWithItems;
      }
    }
  }

  // Fallback for local development if order was simulated or table not yet migrated
  if (!isProduction && identifier) {
    return {
      id: "simulated-dev-id",
      order_number: identifier,
      customer_name: "Patron of Kiln",
      customer_phone: "+91 98450 12345",
      customer_email: "patron@kilnstudio.in",
      delivery_address: "100ft Road, Indiranagar, Bengaluru, Karnataka",
      pincode: "560038",
      subtotal: 57000,
      total: 57000,
      payment_method: "offline",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_items: [
        {
          id: "sim-item-1",
          order_id: "simulated-dev-id",
          product_id: "malabar-dining-chair",
          product_name: "Malabar Dining Chair",
          timber_option: "Indian Rosewood (Sheesham)",
          quantity: 2,
          unit_price: 28500,
          line_total: 57000,
          created_at: new Date().toISOString(),
        },
      ],
    };
  }

  return null;
}
