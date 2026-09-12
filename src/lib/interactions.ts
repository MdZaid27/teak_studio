import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  BespokeInquiryStatus,
  CreateBespokeInquiryInput,
  CreateSwatchRequestInput,
  DbBespokeInquiry,
  DbSwatchRequest,
  DbNewsletterSubscriber,
  SwatchRequestStatus,
} from "@/types/database";
import crypto from "crypto";

// In-memory cache for development simulation when Supabase tables are pending migration
declare global {
  var __kilnDevInteractionsStore:
    | {
        inquiries: Map<string, DbBespokeInquiry>;
        swatches: Map<string, DbSwatchRequest>;
        subscribers: Map<string, DbNewsletterSubscriber>;
      }
    | undefined;
}

if (!global.__kilnDevInteractionsStore) {
  global.__kilnDevInteractionsStore = {
    inquiries: new Map(),
    swatches: new Map(),
    subscribers: new Map(),
  };
}

/**
 * Persist a bespoke architectural commission inquiry.
 */
export async function createBespokeInquiry(
  input: CreateBespokeInquiryInput
): Promise<{ success: boolean; inquiryId: string; simulated?: boolean; error?: string }> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (isProduction && !isConfigured) {
    throw new Error("Supabase configuration missing in production.");
  }

  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  if (supabase && isConfigured) {
    const { data, error } = await supabase
      .from("bespoke_inquiries")
      .insert({
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        pincode: input.pincode.trim(),
        wood_preference: input.wood_preference ? input.wood_preference.trim() : null,
        dimensions_notes: input.dimensions_notes.trim(),
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          "[KILN STUDIO NOTICE] Table 'bespoke_inquiries' not found in Supabase.\n" +
          "👉 Execute 'supabase/interactions.sql' in your Supabase SQL Editor.\n" +
          "Simulating commission inquiry storage in local development."
        );
      } else {
        console.error("[KILN STUDIO DB ERROR] Failed to save bespoke inquiry:", error);
        if (isProduction) {
          return { success: false, inquiryId: "", error: error.message };
        }
      }
    } else if (data) {
      return { success: true, inquiryId: data.id };
    }
  }

  // Development simulation
  const devId = crypto.randomUUID();
  const devRecord: DbBespokeInquiry = {
    id: devId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    pincode: input.pincode.trim(),
    wood_preference: input.wood_preference || null,
    dimensions_notes: input.dimensions_notes.trim(),
    status: "new",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  global.__kilnDevInteractionsStore?.inquiries.set(devId, devRecord);
  return { success: true, inquiryId: devId, simulated: true };
}

/**
 * Persist an atelier timber swatch box request.
 */
export async function createSwatchRequest(
  input: CreateSwatchRequestInput
): Promise<{ success: boolean; requestId: string; simulated?: boolean; error?: string }> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  if (isProduction && !isConfigured) {
    throw new Error("Supabase configuration missing in production.");
  }

  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  if (supabase && isConfigured) {
    const { data, error } = await supabase
      .from("swatch_requests")
      .insert({
        name: input.name.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        pincode: input.pincode.trim(),
        status: "requested",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          "[KILN STUDIO NOTICE] Table 'swatch_requests' not found in Supabase.\n" +
          "👉 Execute 'supabase/interactions.sql' in your Supabase SQL Editor.\n" +
          "Simulating swatch box request storage in local development."
        );
      } else {
        console.error("[KILN STUDIO DB ERROR] Failed to save swatch request:", error);
        if (isProduction) {
          return { success: false, requestId: "", error: error.message };
        }
      }
    } else if (data) {
      return { success: true, requestId: data.id };
    }
  }

  // Development simulation
  const devId = crypto.randomUUID();
  const devRecord: DbSwatchRequest = {
    id: devId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    pincode: input.pincode.trim(),
    status: "requested",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  global.__kilnDevInteractionsStore?.swatches.set(devId, devRecord);
  return { success: true, requestId: devId, simulated: true };
}

/**
 * Subscribe an email to the Atelier Journal newsletter.
 * Gracefully handles duplicate subscribers without raising 500 errors.
 */
export async function subscribeNewsletter(
  email: string
): Promise<{ success: boolean; subscriberId?: string; alreadySubscribed: boolean; simulated?: boolean; error?: string }> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();
  const cleanEmail = email.trim().toLowerCase();

  if (isProduction && !isConfigured) {
    throw new Error("Supabase configuration missing in production.");
  }

  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  if (supabase && isConfigured) {
    // First check if email already subscribed
    const { data: existing, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (!checkError && existing) {
      return {
        success: true,
        subscriberId: existing.id,
        alreadySubscribed: true,
      };
    }

    // Insert new subscriber
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: cleanEmail,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      // Postgres error code 23505 = unique_violation
      if (error.code === "23505") {
        return {
          success: true,
          alreadySubscribed: true,
        };
      }

      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          "[KILN STUDIO NOTICE] Table 'newsletter_subscribers' not found in Supabase.\n" +
          "👉 Execute 'supabase/interactions.sql' in your Supabase SQL Editor.\n" +
          "Simulating newsletter subscription in local development."
        );
      } else {
        console.error("[KILN STUDIO DB ERROR] Failed to subscribe newsletter:", error);
        if (isProduction) {
          return { success: false, alreadySubscribed: false, error: error.message };
        }
      }
    } else if (data) {
      return { success: true, subscriberId: data.id, alreadySubscribed: false };
    }
  }

  // Development simulation
  const devSubscribers = global.__kilnDevInteractionsStore?.subscribers;
  if (devSubscribers?.has(cleanEmail)) {
    return {
      success: true,
      subscriberId: devSubscribers.get(cleanEmail)?.id,
      alreadySubscribed: true,
      simulated: true,
    };
  }

  const devId = crypto.randomUUID();
  const devRecord: DbNewsletterSubscriber = {
    id: devId,
    email: cleanEmail,
    is_active: true,
    subscribed_at: new Date().toISOString(),
  };

  devSubscribers?.set(cleanEmail, devRecord);
  return { success: true, subscriberId: devId, alreadySubscribed: false, simulated: true };
}

/**
 * Retrieve all bespoke architectural inquiries.
 */
export async function getAllBespokeInquiries(): Promise<DbBespokeInquiry[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  let inquiries: DbBespokeInquiry[] = [];

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("bespoke_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to fetch bespoke inquiries:", error);
      } else if (data) {
        inquiries = data as DbBespokeInquiry[];
      }
    }
  }

  // Merge development simulation records
  if (!isProduction && global.__kilnDevInteractionsStore?.inquiries) {
    const existingIds = new Set(inquiries.map((i) => i.id));
    const devInquiries = Array.from(global.__kilnDevInteractionsStore.inquiries.values());
    for (const devInquiry of devInquiries) {
      if (!existingIds.has(devInquiry.id)) {
        inquiries.unshift(devInquiry);
        existingIds.add(devInquiry.id);
      }
    }
  }

  return inquiries.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Update bespoke inquiry status.
 */
export async function updateBespokeInquiryStatus(
  id: string,
  status: BespokeInquiryStatus
): Promise<DbBespokeInquiry | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();
  const cleanId = id.trim();
  const updatedAt = new Date().toISOString();

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("bespoke_inquiries")
        .update({ status, updated_at: updatedAt })
        .eq("id", cleanId)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to update bespoke inquiry status:", error);
        if (isProduction) {
          throw new Error(`Failed to update bespoke inquiry: ${error.message}`);
        }
      } else if (data) {
        return data as DbBespokeInquiry;
      }
    }
  }

  // Development store update
  if (global.__kilnDevInteractionsStore?.inquiries) {
    const cached = global.__kilnDevInteractionsStore.inquiries.get(cleanId);
    if (cached) {
      cached.status = status;
      cached.updated_at = updatedAt;
      global.__kilnDevInteractionsStore.inquiries.set(cleanId, cached);
      return cached;
    }
  }

  return null;
}

/**
 * Retrieve all swatch box requests.
 */
export async function getAllSwatchRequests(): Promise<DbSwatchRequest[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  let swatches: DbSwatchRequest[] = [];

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("swatch_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to fetch swatch requests:", error);
      } else if (data) {
        swatches = data as DbSwatchRequest[];
      }
    }
  }

  // Merge development simulation records
  if (!isProduction && global.__kilnDevInteractionsStore?.swatches) {
    const existingIds = new Set(swatches.map((s) => s.id));
    const devSwatches = Array.from(global.__kilnDevInteractionsStore.swatches.values());
    for (const devSwatch of devSwatches) {
      if (!existingIds.has(devSwatch.id)) {
        swatches.unshift(devSwatch);
        existingIds.add(devSwatch.id);
      }
    }
  }

  return swatches.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Update swatch request status.
 */
export async function updateSwatchRequestStatus(
  id: string,
  status: SwatchRequestStatus
): Promise<DbSwatchRequest | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();
  const cleanId = id.trim();
  const updatedAt = new Date().toISOString();

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("swatch_requests")
        .update({ status, updated_at: updatedAt })
        .eq("id", cleanId)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to update swatch request status:", error);
        if (isProduction) {
          throw new Error(`Failed to update swatch request: ${error.message}`);
        }
      } else if (data) {
        return data as DbSwatchRequest;
      }
    }
  }

  // Development store update
  if (global.__kilnDevInteractionsStore?.swatches) {
    const cached = global.__kilnDevInteractionsStore.swatches.get(cleanId);
    if (cached) {
      cached.status = status;
      cached.updated_at = updatedAt;
      global.__kilnDevInteractionsStore.swatches.set(cleanId, cached);
      return cached;
    }
  }

  return null;
}

/**
 * Retrieve all newsletter subscribers along with summary counts.
 */
export async function getAllNewsletterSubscribers(): Promise<{
  subscribers: DbNewsletterSubscriber[];
  totalCount: number;
  activeCount: number;
}> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  let subscribers: DbNewsletterSubscriber[] = [];

  if (isConfigured) {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) {
        console.error("[KILN STUDIO DB ERROR] Failed to fetch newsletter subscribers:", error);
      } else if (data) {
        subscribers = data as DbNewsletterSubscriber[];
      }
    }
  }

  // Merge dev simulation records
  if (!isProduction && global.__kilnDevInteractionsStore?.subscribers) {
    const existingEmails = new Set(subscribers.map((s) => s.email.toLowerCase()));
    const devSubs = Array.from(global.__kilnDevInteractionsStore.subscribers.values());
    for (const devSub of devSubs) {
      if (!existingEmails.has(devSub.email.toLowerCase())) {
        subscribers.unshift(devSub);
        existingEmails.add(devSub.email.toLowerCase());
      }
    }
  }

  subscribers.sort((a, b) => {
    const dateA = a.subscribed_at ? new Date(a.subscribed_at).getTime() : 0;
    const dateB = b.subscribed_at ? new Date(b.subscribed_at).getTime() : 0;
    return dateB - dateA;
  });

  const totalCount = subscribers.length;
  const activeCount = subscribers.filter((s) => s.is_active).length;

  return { subscribers, totalCount, activeCount };
}
