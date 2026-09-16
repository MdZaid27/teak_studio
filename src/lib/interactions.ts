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
  var __teakDevInteractionsStore:
    | {
        inquiries: Map<string, DbBespokeInquiry>;
        swatches: Map<string, DbSwatchRequest>;
        subscribers: Map<string, DbNewsletterSubscriber>;
      }
    | undefined;
  var __kilnDevInteractionsStore:
    | {
        inquiries: Map<string, DbBespokeInquiry>;
        swatches: Map<string, DbSwatchRequest>;
        subscribers: Map<string, DbNewsletterSubscriber>;
      }
    | undefined;
}

if (!global.__teakDevInteractionsStore) {
  global.__teakDevInteractionsStore = global.__kilnDevInteractionsStore || {
    inquiries: new Map(),
    swatches: new Map(),
    subscribers: new Map(),
  };
  global.__kilnDevInteractionsStore = global.__teakDevInteractionsStore;
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

  const patronName = (input.patron_name || input.name || "").trim();
  const phone = (input.phone || (input as unknown as { patron_phone?: string }).patron_phone || "").trim();
  const email = (input.email || (input as unknown as { patron_email?: string }).patron_email || "").trim().toLowerCase();
  const timberPref = (input.timber_preference || input.wood_preference || "").trim() || null;
  const messageText = (input.message || input.dimensions_notes || "").trim();
  const pincode = (input.pincode || "560001").trim();
  const projectType = (input.project_type || "Custom Dining").trim();

  if (supabase && isConfigured) {
    // Attempt rich insert with new schema columns
    const richPayload: Record<string, unknown> = {
      patron_name: patronName,
      name: patronName,
      phone,
      email,
      pincode,
      project_type: projectType,
      timber_preference: timberPref,
      wood_preference: timberPref,
      approx_dimensions: input.approx_dimensions?.trim() || null,
      budget_range: input.budget_range?.trim() || null,
      reference_file_url: input.reference_file_url?.trim() || null,
      message: messageText,
      dimensions_notes: messageText,
      status: "new",
    };

    let { data, error } = await supabase
      .from("bespoke_inquiries")
      .insert(richPayload)
      .select("id")
      .single();

    // If new columns are not yet in Supabase schema cache (PGRST204), fallback to baseline columns
    if (error && error.code === "PGRST204") {
      const baselinePayload = {
        name: patronName,
        phone,
        email,
        pincode,
        wood_preference: timberPref,
        dimensions_notes: `[Project: ${projectType}] ${messageText}`,
        status: "new",
      };
      const retry = await supabase.from("bespoke_inquiries").insert(baselinePayload).select("id").single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          "[TEAK HAUS NOTICE] Table 'bespoke_inquiries' not found in Supabase.\n" +
          "Execute 'supabase/migrations/20260913_bookings_and_commissions.sql' in Supabase SQL editor.\n" +
          "Simulating commission inquiry storage in local development."
        );
      } else {
        console.error("[TEAK HAUS DB ERROR] Failed to save bespoke inquiry:", error);
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
    patron_name: patronName,
    name: patronName,
    phone,
    email,
    pincode,
    project_type: projectType,
    timber_preference: timberPref,
    wood_preference: timberPref,
    approx_dimensions: input.approx_dimensions?.trim() || null,
    budget_range: input.budget_range?.trim() || null,
    reference_file_url: input.reference_file_url?.trim() || null,
    message: messageText,
    dimensions_notes: messageText,
    status: "new",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  global.__teakDevInteractionsStore?.inquiries.set(devId, devRecord);
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
          "[TEAK HAUS NOTICE] Table 'swatch_requests' not found in Supabase.\n" +
          "👉 Execute 'supabase/interactions.sql' in your Supabase SQL Editor.\n" +
          "Simulating swatch box request storage in local development."
        );
      } else {
        console.error("[TEAK HAUS DB ERROR] Failed to save swatch request:", error);
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

  global.__teakDevInteractionsStore?.swatches.set(devId, devRecord);
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
          "[TEAK HAUS NOTICE] Table 'newsletter_subscribers' not found in Supabase.\n" +
          "👉 Execute 'supabase/interactions.sql' in your Supabase SQL Editor.\n" +
          "Simulating newsletter subscription in local development."
        );
      } else {
        console.error("[TEAK HAUS DB ERROR] Failed to subscribe newsletter:", error);
        if (isProduction) {
          return { success: false, alreadySubscribed: false, error: error.message };
        }
      }
    } else if (data) {
      return { success: true, subscriberId: data.id, alreadySubscribed: false };
    }
  }

  // Development simulation
  const devSubscribers = global.__teakDevInteractionsStore?.subscribers;
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
        console.error("[TEAK HAUS DB ERROR] Failed to fetch bespoke inquiries:", error);
      } else if (data) {
        inquiries = data as DbBespokeInquiry[];
      }
    }
  }

  // Merge development simulation records
  if (!isProduction && global.__teakDevInteractionsStore?.inquiries) {
    const existingIds = new Set(inquiries.map((i) => i.id));
    const devInquiries = Array.from(global.__teakDevInteractionsStore.inquiries.values());
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
      let { data, error } = await supabase
        .from("bespoke_inquiries")
        .update({ status, updated_at: updatedAt })
        .eq("id", cleanId)
        .select("*")
        .maybeSingle();

      if (error && error.code === "PGRST204") {
        const retry = await supabase
          .from("bespoke_inquiries")
          .update({ status })
          .eq("id", cleanId)
          .select("*")
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error("[TEAK HAUS DB ERROR] Failed to update bespoke inquiry status:", error);
        if (isProduction) {
          throw new Error(`Failed to update bespoke inquiry: ${error.message}`);
        }
      } else if (data) {
        return data as DbBespokeInquiry;
      }
    }
  }

  // Development store update
  if (global.__teakDevInteractionsStore?.inquiries) {
    const cached = global.__teakDevInteractionsStore.inquiries.get(cleanId);
    if (cached) {
      cached.status = status;
      cached.updated_at = updatedAt;
      global.__teakDevInteractionsStore.inquiries.set(cleanId, cached);
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
        console.error("[TEAK HAUS DB ERROR] Failed to fetch swatch requests:", error);
      } else if (data) {
        swatches = data as DbSwatchRequest[];
      }
    }
  }

  // Merge development simulation records
  if (!isProduction && global.__teakDevInteractionsStore?.swatches) {
    const existingIds = new Set(swatches.map((s) => s.id));
    const devSwatches = Array.from(global.__teakDevInteractionsStore.swatches.values());
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
        console.error("[TEAK HAUS DB ERROR] Failed to update swatch request status:", error);
        if (isProduction) {
          throw new Error(`Failed to update swatch request: ${error.message}`);
        }
      } else if (data) {
        return data as DbSwatchRequest;
      }
    }
  }

  // Development store update
  if (global.__teakDevInteractionsStore?.swatches) {
    const cached = global.__teakDevInteractionsStore.swatches.get(cleanId);
    if (cached) {
      cached.status = status;
      cached.updated_at = updatedAt;
      global.__teakDevInteractionsStore.swatches.set(cleanId, cached);
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
        console.error("[TEAK HAUS DB ERROR] Failed to fetch newsletter subscribers:", error);
      } else if (data) {
        subscribers = data as DbNewsletterSubscriber[];
      }
    }
  }

  // Merge dev simulation records
  if (!isProduction && global.__teakDevInteractionsStore?.subscribers) {
    const existingEmails = new Set(subscribers.map((s) => s.email.toLowerCase()));
    const devSubs = Array.from(global.__teakDevInteractionsStore.subscribers.values());
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
