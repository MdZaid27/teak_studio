import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  DbPatronProfile,
  DbPatronAddress,
  DbPatronWishlist,
  CreatePatronAddressInput,
} from "@/types/database";
import { getAllOrders, OrderWithItems } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import * as fs from "fs";
import * as path from "path";
import { getPincodeDetailsSync } from "@/lib/pincode";

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

// File-based persistence paths for surviving server reloads & logouts
const ADDRESSES_FILE = path.resolve(process.cwd(), "src/data/patron_addresses.json");
const PROFILES_FILE = path.resolve(process.cwd(), "src/data/patron_profiles.json");

function loadAddressesFromDisk(): DbPatronAddress[] {
  try {
    if (fs.existsSync(ADDRESSES_FILE)) {
      const content = fs.readFileSync(ADDRESSES_FILE, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.warn("[KILN PATRON] Could not read addresses from disk:", e);
  }
  return [];
}

function saveAddressesToDisk(addresses: DbPatronAddress[]) {
  try {
    fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2), "utf-8");
  } catch (e) {
    console.warn("[KILN PATRON] Could not write addresses to disk:", e);
  }
}

function loadProfilesFromDisk(): DbPatronProfile[] {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const content = fs.readFileSync(PROFILES_FILE, "utf-8");
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.warn("[KILN PATRON] Could not read profiles from disk:", e);
  }
  return [];
}

function saveProfilesToDisk(profiles: DbPatronProfile[]) {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (e) {
    console.warn("[KILN PATRON] Could not write profiles to disk:", e);
  }
}

// -------------------------------------------------------------
// Patron Profile
// -------------------------------------------------------------

export async function getPatronProfile(userId: string, phone?: string): Promise<DbPatronProfile | null> {
  if (!userId && !phone) return null;

  const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
  const cleanUserPhone = userId && userId.startsWith("patron-") ? userId.replace(/\D/g, "").slice(-10) : "";
  const targetPhone = cleanPhone || cleanUserPhone;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from("patron_profiles").select("*");
        if (userId && targetPhone) {
          query = query.or(`id.eq.${userId},phone.ilike.%${targetPhone}`);
        } else if (userId) {
          query = query.eq("id", userId);
        } else if (targetPhone) {
          query = query.ilike("phone", `%${targetPhone}`);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return data as DbPatronProfile;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed fetching profile from DB:", e);
      }
    }
  }

  // Fallback to disk storage & memory
  const allProfiles = loadProfilesFromDisk();
  const found = allProfiles.find((p) => {
    if (userId && p.id === userId) return true;
    if (targetPhone && p.phone.replace(/\D/g, "").slice(-10) === targetPhone) return true;
    return false;
  });

  return found || global.__kilnDevPatronProfiles?.get(userId) || null;
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
          const allProfiles = loadProfilesFromDisk().filter((p) => p.id !== profile.id);
          allProfiles.push(data as DbPatronProfile);
          saveProfilesToDisk(allProfiles);
          global.__kilnDevPatronProfiles?.set(profile.id, data as DbPatronProfile);
          return data as DbPatronProfile;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed upserting profile in DB, caching locally:", e);
      }
    }
  }

  const allProfiles = loadProfilesFromDisk().filter((p) => p.id !== profile.id);
  allProfiles.push(updated);
  saveProfilesToDisk(allProfiles);

  global.__kilnDevPatronProfiles?.set(profile.id, updated);
  return updated;
}

// -------------------------------------------------------------
// Patron Addresses
// -------------------------------------------------------------

export async function getPatronAddresses(userId: string, phone?: string): Promise<DbPatronAddress[]> {
  if (!userId && !phone) return [];

  const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
  const cleanUserPhone = userId && userId.startsWith("patron-") ? userId.replace(/\D/g, "").slice(-10) : "";
  const targetPhone = cleanPhone || cleanUserPhone;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from("patron_addresses")
          .select("*")
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (userId && targetPhone) {
          query = query.or(`user_id.eq.${userId},phone.ilike.%${targetPhone}`);
        } else if (userId) {
          query = query.eq("user_id", userId);
        } else if (targetPhone) {
          query = query.ilike("phone", `%${targetPhone}`);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data as DbPatronAddress[];
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed fetching addresses from DB:", e);
      }
    }
  }

  // Load from persistent disk storage + memory
  const diskAddrs = loadAddressesFromDisk();
  const matched = diskAddrs.filter((a) => {
    const addrPhone = a.phone ? a.phone.replace(/\D/g, "").slice(-10) : "";
    if (userId && a.user_id === userId) return true;
    if (targetPhone && addrPhone && addrPhone === targetPhone) return true;
    return false;
  });

  return matched;
}

export async function createPatronAddress(
  userId: string,
  input: CreatePatronAddressInput
): Promise<DbPatronAddress> {
  const existing = await getPatronAddresses(userId, input.phone);
  const isDefault = input.is_default !== undefined ? input.is_default : existing.length === 0;

  // Check if identical address already exists to avoid redundant cards
  const existingDuplicate = existing.find(
    (a) =>
      a.pincode === input.pincode.trim() &&
      a.floor_building.trim().toLowerCase() === input.floor_building.trim().toLowerCase() &&
      a.area_street.trim().toLowerCase() === input.area_street.trim().toLowerCase()
  );
  if (existingDuplicate) {
    if (isDefault && !existingDuplicate.is_default) {
      return (await updatePatronAddress(userId, existingDuplicate.id, { is_default: true })) || existingDuplicate;
    }
    return existingDuplicate;
  }

  const pinDetails = getPincodeDetailsSync(input.pincode.trim());
  const newAddress: DbPatronAddress = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `addr-${Date.now()}`,
    user_id: userId,
    floor_building: input.floor_building.trim(),
    area_street: input.area_street.trim(),
    pincode: input.pincode.trim(),
    city: input.city?.trim() || pinDetails?.city || "India",
    state: input.state?.trim() || pinDetails?.state || "India",
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
          const allDisk = loadAddressesFromDisk();
          allDisk.unshift(data as DbPatronAddress);
          saveAddressesToDisk(allDisk);
          return data as DbPatronAddress;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed inserting address in DB, using fallback store:", e);
      }
    }
  }

  // Update persistent disk storage
  let allDisk = loadAddressesFromDisk();
  if (isDefault) {
    allDisk = allDisk.map((a) => {
      const match =
        a.user_id === userId ||
        (input.phone && a.phone.replace(/\D/g, "").slice(-10) === input.phone.replace(/\D/g, "").slice(-10));
      return match ? { ...a, is_default: false } : a;
    });
  }
  allDisk.unshift(newAddress);
  saveAddressesToDisk(allDisk);

  // Also update in-memory
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
          .select()
          .single();

        if (!error && data) {
          const allDisk = loadAddressesFromDisk();
          const idx = allDisk.findIndex((a) => a.id === addressId);
          if (idx !== -1) {
            allDisk[idx] = data as DbPatronAddress;
            saveAddressesToDisk(allDisk);
          }
          return data as DbPatronAddress;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed updating address in DB:", e);
      }
    }
  }

  // Update persistent disk storage
  const allDisk = loadAddressesFromDisk();
  const idx = allDisk.findIndex((a) => a.id === addressId);
  if (idx === -1) return null;

  if (input.is_default) {
    allDisk.forEach((a) => {
      if (a.user_id === userId) a.is_default = false;
    });
  }

  allDisk[idx] = {
    ...allDisk[idx],
    ...normalizedInput,
    updated_at: new Date().toISOString(),
  };
  saveAddressesToDisk(allDisk);

  return allDisk[idx];
}

export async function deletePatronAddress(userId: string, addressId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from("patron_addresses")
          .delete()
          .eq("id", addressId);

        if (!error) {
          const allDisk = loadAddressesFromDisk().filter((a) => a.id !== addressId);
          saveAddressesToDisk(allDisk);
          return true;
        }
      } catch (e) {
        console.warn("[KILN PATRON] Failed deleting address in DB:", e);
      }
    }
  }

  const allDisk = loadAddressesFromDisk().filter((a) => a.id !== addressId);
  saveAddressesToDisk(allDisk);
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

export async function getPatronOrders(
  customerPhoneOrEmail?: string,
  userId?: string
): Promise<OrderWithItems[]> {
  if (!customerPhoneOrEmail && !userId) return [];

  const cleanPhone = customerPhoneOrEmail ? customerPhoneOrEmail.replace(/\D/g, "").slice(-10) : "";
  const allOrders = await getAllOrders();

  return allOrders.filter((order) => {
    // 1. Direct match on patron user_id
    if (userId && order.user_id && order.user_id === userId) {
      return true;
    }

    if (!customerPhoneOrEmail) return false;

    // 2. Match on customer phone or email
    const orderPhoneClean = (order.customer_phone || "").replace(/\D/g, "").slice(-10);
    const orderEmailClean = (order.customer_email || "").toLowerCase().trim();
    const targetClean = customerPhoneOrEmail.toLowerCase().trim();

    return (
      (cleanPhone && orderPhoneClean === cleanPhone) ||
      (targetClean && orderEmailClean === targetClean) ||
      (cleanPhone && order.customer_phone.includes(cleanPhone))
    );
  });
}
