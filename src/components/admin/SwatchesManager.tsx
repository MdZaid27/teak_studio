"use client";

import { useState } from "react";
import { DbSwatchRequest, SwatchRequestStatus } from "@/types/database";

const SWATCH_STATUS_CONFIG: Record<
  SwatchRequestStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  requested: {
    label: "Box Requested",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
  },
  dispatched: {
    label: "White-Glove Dispatched",
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    border: "border-sky-700/50",
  },
  delivered: {
    label: "Delivered to Patron",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
  },
};

const SWATCH_STATUS_OPTIONS: SwatchRequestStatus[] = [
  "requested",
  "dispatched",
  "delivered",
];

interface SwatchesManagerProps {
  initialRequests: DbSwatchRequest[];
}

export function SwatchesManager({ initialRequests }: SwatchesManagerProps) {
  const [requests, setRequests] = useState<DbSwatchRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (requestId: string, newStatus: SwatchRequestStatus) => {
    const previous = [...requests];
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r))
    );

    try {
      setUpdatingId(requestId);
      const res = await fetch(`/api/swatch-orders/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update swatch request status");
      }

      if (data.request) {
        setRequests((prev) =>
          prev.map((r) => (r.id === data.request.id ? data.request : r))
        );
      }

      showToast(`Swatch box for ${target.name} updated to '${SWATCH_STATUS_CONFIG[newStatus]?.label || newStatus}'`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      console.error("Failed to update swatch request status:", err);
      setRequests(previous);
      showToast(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.phone.includes(searchQuery) ||
      req.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.pincode.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md text-xs font-mono flex items-center gap-2.5 transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-[#182618]/95 border-emerald-500/50 text-emerald-200"
              : "bg-[#2d1212]/95 border-rose-500/50 text-rose-200"
          }`}
        >
          <span className={toastMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}>
            {toastMessage.type === "success" ? "✓" : "⚠"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-950/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl text-amber-50">
              Swatch Box Requests
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono bg-amber-950/60 border border-amber-800/40 text-amber-300 rounded-full">
              {filteredRequests.length} {filteredRequests.length === 1 ? "Sample Box" : "Sample Boxes"}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-400/60 font-light">
            Dispatch 5-specimen curated solid wood sample boxes to patrons and architects nationwide.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipient, address, phone..."
              className="px-3.5 py-2 pl-9 bg-[#160c07] border border-amber-900/40 rounded text-xs text-amber-100 placeholder:text-amber-800 focus:outline-none focus:border-amber-600 w-60 sm:w-72 transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-amber-600 text-xs">⌕</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-amber-600 hover:text-amber-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#160c07] border border-amber-900/40 rounded text-xs text-amber-200 focus:outline-none focus:border-amber-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {SWATCH_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {SWATCH_STATUS_CONFIG[st]?.label || st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swatches Table */}
      <div className="bg-[#120a06]/90 border border-amber-900/30 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#190e09] border-b border-amber-950/60 text-amber-300/70 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Recipient Name</th>
                <th className="px-4 py-3.5">Contact Phone</th>
                <th className="px-4 py-3.5">Delivery Address</th>
                <th className="px-4 py-3.5">PIN Code</th>
                <th className="px-4 py-3.5">Request Date</th>
                <th className="px-4 py-3.5">Dispatch Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/40 font-light text-amber-100/90">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-amber-500/50">
                    <p className="font-serif text-base text-amber-300/70 mb-1">No swatch requests found</p>
                    <p className="text-xs">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const statusInfo = SWATCH_STATUS_CONFIG[req.status] || SWATCH_STATUS_CONFIG.requested;
                  const isUpdating = updatingId === req.id;

                  return (
                    <tr key={req.id} className="hover:bg-[#1a0f0a]/60 transition-colors">
                      {/* Recipient Name */}
                      <td className="px-4 py-3.5 font-medium text-amber-50 whitespace-nowrap">
                        {req.name}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-amber-300/80 whitespace-nowrap">
                        {req.phone}
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3.5 text-amber-200/90 max-w-sm">
                        <span className="line-clamp-2 leading-relaxed">{req.address}</span>
                      </td>

                      {/* Pincode */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-amber-400/80 whitespace-nowrap">
                        {req.pincode}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-amber-400/60 font-mono text-[11px] whitespace-nowrap">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Status Control */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={req.status}
                            onChange={(e) =>
                              handleStatusChange(req.id, e.target.value as SwatchRequestStatus)
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-mono border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} focus:outline-none cursor-pointer disabled:opacity-50`}
                          >
                            {SWATCH_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} className="bg-[#180e09] text-amber-100">
                                {SWATCH_STATUS_CONFIG[st]?.label || st}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
