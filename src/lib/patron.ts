import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  DbPatronProfile,
  DbPatronAddress,
  DbPatronWishlist,
  CreatePatronAddressInput,
} from "@/types/database";
import { getAllOrders, OrderWithItems } from "@/lib/orders";
import { getProductById } from "@/lib/products";

// Global dev in-memory caches for resilient operation before/during migration
declare global {
  var __kilnDevPatronProfiles: Map<string, DbPatronProfile> | undefined;
  var __kilnDevPatronAddresses: Map<string, DbPatronAddress[]> | undefined;
  var __kilnDevPatronWishlists: Map<string, DbPatronWishlist[]> | undefined;
}

if (!global.__kilnDevPatronProfiles) {
  global.__kilnDevPatronProfiles = new Map<string, DbPatronProfile>();
}
if (!global.__kilnDevPatronAddresses) {
  global.__kilnDevPatronAddresses = new Map<string, DbPatronAddress[]>();
}
if (!global.__kilnDevPatronWishlists) {
  global.__kilnDevPatronWishlists = new Map<string, DbPatronWishlist[]>();
}

// -------------------------------------------------------------
// Patron Profile
// -------------------------------------------------------------

export async function getPatronProfile(userId: string): Promise<DbPatronProfile | null> {
  if (!userId) return null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("patron_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (!error && data) {
          return data as DbPatronProfile;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed fetching profile from DB:", e);
      }
    }
  }

  // Fallback to in-memory store
  return global.__kilnDevPatronProfiles?.get(userId) || null;
}

export async function upsertPatronProfile(profile: DbPatronProfile): Promise<DbPatronProfile> {
  const updated: DbPatronProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("patron_profiles")
          .upsert(updated)
          .select()
          .maybeSingle();

        if (!error && data) {
          global.__kilnDevPatronProfiles?.set(profile.id, data as DbPatronProfile);
          return data as DbPatronProfile;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed upserting profile in DB, caching locally:", e);
      }
    }
  }

  global.__kilnDevPatronProfiles?.set(profile.id, updated);
  return updated;
}

// -------------------------------------------------------------
// Patron Addresses
// -------------------------------------------------------------

export async function getPatronAddresses(userId: string): Promise<DbPatronAddress[]> {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("patron_addresses")
          .select("*")
          .eq("user_id", userId)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data as DbPatronAddress[];
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed fetching addresses from DB:", e);
      }
    }
  }

  return global.__kilnDevPatronAddresses?.get(userId) || [];
}

export async function createPatronAddress(
  userId: string,
  input: CreatePatronAddressInput
): Promise<DbPatronAddress> {
  const existing = await getPatronAddresses(userId);
  const isDefault = input.is_default !== undefined ? input.is_default : existing.length === 0;

  const newAddress: DbPatronAddress = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `addr-${Date.now()}`,
    user_id: userId,
    floor_building: input.floor_building.trim(),
    area_street: input.area_street.trim(),
    pincode: input.pincode.trim(),
    city: input.city?.trim() || "Bengaluru",
    state: input.state?.trim() || "Karnataka",
    country: input.country?.trim() || "India",
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone.startsWith("+91")
      ? input.phone
      : `+91${input.phone.replace(/\D/g, "").slice(-10)}`,
    save_as: input.save_as || "Home",
    is_default: isDefault,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        if (isDefault) {
          // Reset other defaults if trigger isn't executed
          await supabase
            .from("patron_addresses")
            .update({ is_default: false })
            .eq("user_id", userId);
        }

        const { data, error } = await supabase
          .from("patron_addresses")
          .insert(newAddress)
          .select()
          .single();

        if (!error && data) {
          return data as DbPatronAddress;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed inserting address in DB, using fallback store:", e);
      }
    }
  }

  // Update in-memory
  let userAddrs = global.__kilnDevPatronAddresses?.get(userId) || [];
  if (isDefault) {
    userAddrs = userAddrs.map((a) => ({ ...a, is_default: false }));
  }
  userAddrs.unshift(newAddress);
  global.__kilnDevPatronAddresses?.set(userId, userAddrs);

  return newAddress;
}

export async function updatePatronAddress(
  userId: string,
  addressId: string,
  input: Partial<CreatePatronAddressInput>
): Promise<DbPatronAddress | null> {
  const normalizedInput = { ...input };
  if (input.phone) {
    normalizedInput.phone = input.phone.startsWith("+91")
      ? input.phone
      : `+91${input.phone.replace(/\D/g, "").slice(-10)}`;
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        if (input.is_default) {
          await supabase
            .from("patron_addresses")
            .update({ is_default: false })
            .eq("user_id", userId);
        }

        const { data, error } = await supabase
          .from("patron_addresses")
          .update({
            ...normalizedInput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", addressId)
          .eq("user_id", userId)
          .select()
          .single();

        if (!error && data) {
          return data as DbPatronAddress;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed updating address in DB:", e);
      }
    }
  }

  // In-memory update
  const userAddrs = global.__kilnDevPatronAddresses?.get(userId) || [];
  const idx = userAddrs.findIndex((a) => a.id === addressId);
  if (idx === -1) return null;

  if (input.is_default) {
    userAddrs.forEach((a) => (a.is_default = false));
  }

  userAddrs[idx] = {
    ...userAddrs[idx],
    ...normalizedInput,
    updated_at: new Date().toISOString(),
  };
  global.__kilnDevPatronAddresses?.set(userId, [...userAddrs]);
  return userAddrs[idx];
}

export async function deletePatronAddress(userId: string, addressId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from("patron_addresses")
          .delete()
          .eq("id", addressId)
          .eq("user_id", userId);

        if (!error) return true;
      } catch (e) {
        console.warn("[KILN PATRON] Failed deleting address in DB:", e);
      }
    }
  }

  const userAddrs = global.__kilnDevPatronAddresses?.get(userId) || [];
  const filtered = userAddrs.filter((a) => a.id !== addressId);
  global.__kilnDevPatronAddresses?.set(userId, filtered);
  return true;
}

// -------------------------------------------------------------
// Patron Wishlist
// -------------------------------------------------------------

export async function getPatronWishlist(userId: string): Promise<DbPatronWishlist[]> {
  if (!userId) return [];

  let items: DbPatronWishlist[] = [];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("patron_wishlists")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          items = data as DbPatronWishlist[];
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed fetching wishlist from DB:", e);
      }
    }
  }

  if (items.length === 0) {
    items = global.__kilnDevPatronWishlists?.get(userId) || [];
  }

  // Hydrate each item with product domain object
  const hydrated: DbPatronWishlist[] = [];
  for (const it of items) {
    const prod = await getProductById(it.product_id);
    if (prod) {
      hydrated.push({
        ...it,
        product: prod,
      });
    }
  }

  return hydrated;
}

export async function addToWishlist(
  userId: string,
  productId: string,
  selectedTimberId?: string
): Promise<DbPatronWishlist> {
  const newItem: DbPatronWishlist = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}`,
    user_id: userId,
    product_id: productId,
    selected_timber_id: selectedTimberId || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("patron_wishlists")
          .upsert(newItem, { onConflict: "user_id,product_id" })
          .select()
          .single();

        if (!error && data) {
          newItem.id = data.id;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed saving wishlist to DB:", e);
      }
    }
  }

  const items = global.__kilnDevPatronWishlists?.get(userId) || [];
  const existingIdx = items.findIndex((i) => i.product_id === productId);
  if (existingIdx >= 0) {
    items[existingIdx] = newItem;
  } else {
    items.unshift(newItem);
  }
  global.__kilnDevPatronWishlists?.set(userId, items);

  const prod = await getProductById(productId);
  if (prod) {
    newItem.product = prod;
  }
  return newItem;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("patron_wishlists")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
      } catch (e) {
        console.warn("[KILN PATRON] Failed deleting from wishlist in DB:", e);
      }
    }
  }

  const items = global.__kilnDevPatronWishlists?.get(userId) || [];
  global.__kilnDevPatronWishlists?.set(
    userId,
    items.filter((i) => i.product_id !== productId)
  );
  return true;
}

// -------------------------------------------------------------
// Patron Orders
// -------------------------------------------------------------

export async function getPatronOrders(customerPhoneOrEmail: string): Promise<OrderWithItems[]> {
  if (!customerPhoneOrEmail) return [];

  const cleanPhone = customerPhoneOrEmail.replace(/\D/g, "").slice(-10);
  const allOrders = await getAllOrders();

  return allOrders.filter((order) => {
    const orderPhoneClean = (order.customer_phone || "").replace(/\D/g, "").slice(-10);
    const orderEmailClean = (order.customer_email || "").toLowerCase().trim();
    const targetClean = customerPhoneOrEmail.toLowerCase().trim();

    return (
      (cleanPhone && orderPhoneClean === cleanPhone) ||
      orderEmailClean === targetClean ||
      order.customer_phone.includes(cleanPhone)
    );
  });
}
