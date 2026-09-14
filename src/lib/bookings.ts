import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { CreateStudioBookingInput, DbStudioBooking, StudioBookingStatus } from "@/types/database";
import crypto from "crypto";

// In-memory cache for development simulation
declare global {
  var __teakDevBookingsStore: Map<string, DbStudioBooking> | undefined;
}

if (!global.__teakDevBookingsStore) {
  global.__teakDevBookingsStore = new Map();
}

/**
 * Persist a studio walkthrough booking.
 */
export async function createStudioBooking(
  input: CreateStudioBookingInput
): Promise<{ success: boolean; bookingId: string; simulated?: boolean; error?: string }> {
  const isProduction = process.env.NODE_ENV === "production";
  const isConfigured = isSupabaseConfigured();

  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  const patronName = (input.patron_name || (input as unknown as { name?: string }).name || "").trim();
  const patronEmail = (input.email || (input as unknown as { patron_email?: string }).patron_email || "").trim().toLowerCase();
  const patronPhone = (input.phone || (input as unknown as { patron_phone?: string }).patron_phone || "").trim();
  const timeSlot = (input.preferred_time_slot || (input as unknown as { preferred_time?: string }).preferred_time || "").trim();
  const location = (input.studio_location || "Indiranagar Atelier, Bengaluru").trim();

  if (supabase && isConfigured) {
    const { data, error } = await supabase
      .from("studio_bookings")
      .insert({
        patron_name: patronName,
        email: patronEmail,
        phone: patronPhone,
        studio_location: location,
        preferred_date: input.preferred_date,
        preferred_time_slot: timeSlot,
        notes: input.notes?.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST205" && !isProduction) {
        console.warn(
          "[TEAK HAUS NOTICE] Table 'studio_bookings' not found in Supabase.\n" +
          "Execute migration 'supabase/migrations/20260913_bookings_and_commissions.sql' in Supabase SQL editor.\n" +
          "Simulating walkthrough booking in local development memory."
        );
      } else {
        console.error("[TEAK HAUS DB ERROR] Failed to save studio booking:", error);
        if (isProduction) {
          return { success: false, bookingId: "", error: error.message };
        }
      }
    } else if (data) {
      return { success: true, bookingId: data.id };
    }
  }

  // Development simulation
  const devId = crypto.randomUUID();
  const devRecord: DbStudioBooking = {
    id: devId,
    patron_name: patronName,
    email: patronEmail,
    phone: patronPhone,
    studio_location: location,
    preferred_date: input.preferred_date,
    preferred_time_slot: timeSlot,
    notes: input.notes?.trim() || null,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  global.__teakDevBookingsStore?.set(devId, devRecord);
  return { success: true, bookingId: devId, simulated: true };
}

/**
 * Retrieve all studio bookings for the curator console.
 */
export async function getAllStudioBookings(): Promise<DbStudioBooking[]> {
  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("studio_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as DbStudioBooking[];
    }
  }

  // Return development simulated records
  const memoryRecords = Array.from(global.__teakDevBookingsStore?.values() || []);
  return memoryRecords.sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

/**
 * Retrieve a single studio booking by its ID.
 */
export async function getStudioBookingById(id: string): Promise<DbStudioBooking | null> {
  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("studio_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return data as DbStudioBooking;
    }
  }

  return global.__teakDevBookingsStore?.get(id) || null;
}

/**
 * Update the status of an atelier walkthrough booking.
 */
export async function updateStudioBookingStatus(
  id: string,
  status: StudioBookingStatus
): Promise<{ success: boolean; booking?: DbStudioBooking | null; error?: string }> {
  const supabase = getSupabaseAdminClient() || getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    let { data, error } = await supabase
      .from("studio_bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error && error.code === "PGRST204") {
      const retry = await supabase
        .from("studio_bookings")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("[TEAK HAUS DB ERROR] Failed to update booking status:", error);
      return { success: false, error: error.message };
    }
    return { success: true, booking: data as DbStudioBooking };
  }

  const existing = global.__teakDevBookingsStore?.get(id);
  if (existing) {
    existing.status = status;
    existing.updated_at = new Date().toISOString();
    global.__teakDevBookingsStore?.set(id, existing);
    return { success: true, booking: existing };
  }

  return { success: false, error: "Booking not found" };
}
