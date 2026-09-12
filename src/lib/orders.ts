import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { DbOrder, DbOrderItem, OrderStatus } from "@/types/database";

export interface OrderWithItems extends DbOrder {
  order_items: DbOrderItem[];
}

// In-memory cache of created orders for development simulation
declare global {
  var __kilnDevOrdersStore: Map<string, OrderWithItems> | undefined;
}

if (!global.__kilnDevOrdersStore) {
  global.__kilnDevOrdersStore = new Map<string, OrderWithItems>();
}

/**
 * Save an order to the in-memory development store (used in local dev when Supabase tables are pending migration).
 */
export function saveDevOrder(order: OrderWithItems): void {
  if (global.__kilnDevOrdersStore) {
    global.__kilnDevOrdersStore.set(order.order_number, order);
    global.__kilnDevOrdersStore.set(order.id, order);
  }
}

/**
 * Fetch an order by its order_number or UUID.
 */
export async function getOrderByNumberOrId(
  identifier: string
): Promise<OrderWithItems | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (!identifier || typeof identifier !== "string") {
    return null;
  }

  const cleanId = identifier.trim();

  // 1. Try querying Supabase if configured
  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      
      const query = supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `);

      const { data, error } = isUUID
        ? await query.eq("id", cleanId).maybeSingle()
        : await query.eq("order_number", cleanId).maybeSingle();

      if (error) {
        if (error.code === "PGRST205" && !isProduction) {
          console.warn(
            `[KILN STUDIO NOTICE] Table 'orders' not found in database. Checking development cache for '${cleanId}'.`
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

  // 2. Check development cache for orders placed during local session
  if (!isProduction && global.__kilnDevOrdersStore) {
    const cachedOrder = global.__kilnDevOrdersStore.get(cleanId);
    if (cachedOrder) {
      return cachedOrder;
    }
  }

  // If not found in database and not in dev cache, return null (triggers 404)
  return null;
}

/**
 * Retrieve all orders joined with order_items, sorted by created_at descending.
 */
export async function getAllOrders(): Promise<OrderWithItems[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  let orders: OrderWithItems[] = [];

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to fetch all orders:", error);
      } else if (data) {
        orders = data as OrderWithItems[];
      }
    }
  }

  // Merge in-memory development orders if in dev mode
  if (!isProduction && global.__kilnDevOrdersStore) {
    const existingIds = new Set(orders.map((o) => o.id));
    const devOrders = Array.from(global.__kilnDevOrdersStore.values());
    for (const devOrder of devOrders) {
      if (!existingIds.has(devOrder.id)) {
        orders.unshift(devOrder);
        existingIds.add(devOrder.id);
      }
    }
  }

  // Sort by created_at descending
  return orders.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Update order status by UUID or order_number.
 */
export async function updateOrderStatus(
  identifier: string,
  status: OrderStatus
): Promise<OrderWithItems | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (!identifier || typeof identifier !== "string") {
    return null;
  }

  const cleanId = identifier.trim();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const updatedAt = new Date().toISOString();

  // 1. Update in Supabase
  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const query = supabase
        .from("orders")
        .update({ status, updated_at: updatedAt });

      const { error } = isUUID
        ? await query.eq("id", cleanId)
        : await query.eq("order_number", cleanId);

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to update order status:", error);
        if (isProduction) {
          throw new Error(`Failed to update order status: ${error.message}`);
        }
      }
    }
  }

  // 2. Also update in development store
  if (global.__kilnDevOrdersStore) {
    const cachedOrder = global.__kilnDevOrdersStore.get(cleanId);
    if (cachedOrder) {
      cachedOrder.status = status;
      cachedOrder.updated_at = updatedAt;
      global.__kilnDevOrdersStore.set(cachedOrder.id, cachedOrder);
      global.__kilnDevOrdersStore.set(cachedOrder.order_number, cachedOrder);
    }
  }

  // Retrieve and return the updated order
  return getOrderByNumberOrId(cleanId);
}
