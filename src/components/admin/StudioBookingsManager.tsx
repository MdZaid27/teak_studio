"use client";

import { useState } from "react";
import { DbStudioBooking, StudioBookingStatus } from "@/types/database";

const STATUS_CONFIG: Record<
  StudioBookingStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pending Confirmation",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
  },
  confirmed: {
    label: "Confirmed Appointment",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
  },
  completed: {
    label: "Walkthrough Completed",
    bg: "bg-purple-950/40",
    text: "text-purple-300",
    border: "border-purple-700/50",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-zinc-900/60",
    text: "text-zinc-400",
    border: "border-zinc-700/50",
  },
};

const STATUS_OPTIONS: StudioBookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

interface StudioBookingsManagerProps {
  initialBookings: DbStudioBooking[];
}

export function StudioBookingsManager({ initialBookings }: StudioBookingsManagerProps) {
  const [bookings, setBookings] = useState<DbStudioBooking[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<DbStudioBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (bookingId: string, newStatus: StudioBookingStatus) => {
    const previous = [...bookings];
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus, updated_at: new Date().toISOString() } : b))
    );
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      setUpdatingId(bookingId);
      const res = await fetch(`/api/studio-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      showToast(`Walkthrough status changed to ${newStatus}`);
    } catch (err: unknown) {
      setBookings(previous);
      const msg = err instanceof Error ? err.message : "Failed to update booking";
      showToast(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.patron_name?.toLowerCase().includes(q);
      const matchEmail = b.email?.toLowerCase().includes(q);
      const matchPhone = b.phone?.includes(q);
      const matchLoc = b.studio_location?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchLoc;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-xs font-mono flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-950 border-emerald-500 text-emerald-200"
              : "bg-red-950 border-red-500 text-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] font-medium tracking-wide">
            Studio Walkthroughs &amp; Private Visits
          </h1>
          <p className="text-xs text-[#9B9287] mt-1 font-mono">
            Manage patron atelier consultations for Indiranagar &amp; VR Whitefield studios.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#1C1A18] border border-[#2A2724] text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[#9B9287]">Pending:</span>
            <span className="text-[#FAF9F6] font-bold">
              {bookings.filter((b) => b.status === "pending").length}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#1C1A18] border border-[#2A2724] text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[#9B9287]">Confirmed:</span>
            <span className="text-[#FAF9F6] font-bold">
              {bookings.filter((b) => b.status === "confirmed").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#161514] border border-[#2A2724] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#706860] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search patron, phone, studio location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-[#FAF9F6] focus:outline-none placeholder-[#5C554E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", ...STATUS_OPTIONS].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? "bg-[#D4A373] text-[#121110] font-semibold"
                  : "bg-[#1C1A18] text-[#9B9287] hover:text-[#FAF9F6] border border-[#2A2724]"
              }`}
            >
              {status === "all" ? "All Visits" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="rounded-xl border border-[#2A2724] bg-[#161514] overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-[#706860] font-mono text-xs space-y-2">
            <span className="material-symbols-outlined text-3xl text-[#3E3A35] block">
              calendar_today
            </span>
            <p>No studio walkthrough bookings found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#2A2724] bg-[#121110] text-[#706860] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Patron &amp; Contact</th>
                  <th className="py-3 px-4">Studio Location</th>
                  <th className="py-3 px-4">Preferred Date &amp; Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24211E]">
                {filteredBookings.map((booking) => {
                  const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  const isUpdating = updatingId === booking.id;

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#1C1A18]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-serif text-sm font-medium text-[#FAF9F6]">
                          {booking.patron_name}
                        </div>
                        <div className="text-[11px] text-[#9B9287] mt-0.5">
                          {booking.phone} • {booking.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#FAF9F6]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-[#D4A373]">
                            storefront
                          </span>
                          <span>{booking.studio_location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[#D4A373] font-bold">{booking.preferred_date}</div>
                        <div className="text-[11px] text-[#706860] mt-0.5">
                          {booking.preferred_time_slot}
                        </div>
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={booking.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleStatusChange(booking.id, e.target.value as StudioBookingStatus)
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono border focus:outline-none cursor-pointer bg-[#141312] ${statusInfo.border} ${statusInfo.text}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#1C1A18] text-[#FAF9F6]">
                              {STATUS_CONFIG[opt]?.label || opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="px-3 py-1 rounded bg-[#24211E] hover:bg-[#3E3A35] text-[#FAF9F6] text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Modal / Drawer */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-lg bg-[#161514] border border-[#2A2724] rounded-2xl shadow-2xl p-6 space-y-5 text-xs text-[#FAF9F6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2A2724] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A373]">
                  Walkthrough Details
                </span>
                <h3 className="font-serif text-xl text-[#FAF9F6] font-medium mt-0.5">
                  {selectedBooking.patron_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-[#9B9287] hover:text-white rounded-full bg-[#24211E]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#1C1A18] border border-[#2A2724] font-mono text-[11px]">
              <div>
                <span className="text-[#706860] block">Phone:</span>
                <a href={`tel:${selectedBooking.phone}`} className="text-[#D4A373] hover:underline">
                  {selectedBooking.phone}
                </a>
              </div>
              <div>
                <span className="text-[#706860] block">Email:</span>
                <a href={`mailto:${selectedBooking.email}`} className="text-[#FAF9F6] hover:underline">
                  {selectedBooking.email}
                </a>
              </div>
              <div>
                <span className="text-[#706860] block">Location:</span>
                <span className="text-[#FAF9F6]">{selectedBooking.studio_location}</span>
              </div>
              <div>
                <span className="text-[#706860] block">Schedule:</span>
                <span className="text-[#FAF9F6]">
                  {selectedBooking.preferred_date} • {selectedBooking.preferred_time_slot}
                </span>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="p-3.5 rounded-xl bg-[#1C1A18] border border-[#2A2724]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#706860] block mb-1">
                  Patron Notes / Interests
                </span>
                <p className="text-xs text-[#FAF9F6] leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#2A2724]">
              <div className="flex items-center gap-2">
                <span className="text-[#706860] font-mono">Status:</span>
                <select
                  value={selectedBooking.status}
                  onChange={(e) =>
                    handleStatusChange(selectedBooking.id, e.target.value as StudioBookingStatus)
                  }
                  className="px-3 py-1 rounded bg-[#1C1A18] border border-[#3E3A35] text-xs font-mono text-[#FAF9F6]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {STATUS_CONFIG[opt]?.label || opt}
                    </option>
                  ))}
                </select>
              </div>

              <a
                href={`https://wa.me/91${selectedBooking.phone.replace(/\D/g, "").slice(-10)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-[#25D366] text-[#121110] font-mono font-bold text-xs flex items-center gap-1.5"
              >
                <span>WhatsApp Patron</span>
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
