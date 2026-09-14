"use client";

import { useState } from "react";
import { DbBespokeInquiry, BespokeInquiryStatus } from "@/types/database";

const INQUIRY_STATUS_CONFIG: Record<
  BespokeInquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: "New Inquiry",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
  },
  contacted: {
    label: "Patron Contacted",
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    border: "border-sky-700/50",
  },
  in_review: {
    label: "Architect Review",
    bg: "bg-purple-950/40",
    text: "text-purple-300",
    border: "border-purple-700/50",
  },
  closed: {
    label: "Inquiry Closed",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
  },
  archived: {
    label: "Archived",
    bg: "bg-zinc-900/60",
    text: "text-zinc-400",
    border: "border-zinc-700/50",
  },
};

const INQUIRY_STATUS_OPTIONS: BespokeInquiryStatus[] = [
  "new",
  "contacted",
  "in_review",
  "closed",
  "archived",
];

interface CommissionsManagerProps {
  initialInquiries: DbBespokeInquiry[];
}

export function CommissionsManager({ initialInquiries }: CommissionsManagerProps) {
  const [inquiries, setInquiries] = useState<DbBespokeInquiry[]>(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<DbBespokeInquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: BespokeInquiryStatus) => {
    const previousInquiries = [...inquiries];
    const target = inquiries.find((i) => i.id === inquiryId);
    if (!target) return;

    // Optimistic update
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus, updated_at: new Date().toISOString() } : i))
    );

    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      setUpdatingId(inquiryId);
      const res = await fetch(`/api/commissions/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update inquiry status");
      }

      if (data.inquiry) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === data.inquiry.id ? data.inquiry : i))
        );
        if (selectedInquiry?.id === data.inquiry.id) {
          setSelectedInquiry(data.inquiry);
        }
      }

      showToast(`Inquiry from ${target.name} marked as '${INQUIRY_STATUS_CONFIG[newStatus]?.label || newStatus}'`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      console.error("Failed to update inquiry status:", err);
      setInquiries(previousInquiries);
      showToast(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.phone.includes(searchQuery) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inquiry.wood_preference && inquiry.wood_preference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
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
              Bespoke Commissions
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono bg-amber-950/60 border border-amber-800/40 text-amber-300 rounded-full">
              {filteredInquiries.length} {filteredInquiries.length === 1 ? "Brief" : "Briefs"}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-400/60 font-light">
            Architectural consultation requests, timber selections, and custom spatial dimension briefs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, wood..."
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
            {INQUIRY_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {INQUIRY_STATUS_CONFIG[st]?.label || st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#120a06]/90 border border-amber-900/30 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#190e09] border-b border-amber-950/60 text-amber-300/70 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Client Name</th>
                <th className="px-4 py-3.5">Contact Phone</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Pincode</th>
                <th className="px-4 py-3.5">Wood Preference</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Lifecycle Status</th>
                <th className="px-4 py-3.5 text-right">Architect Brief</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/40 font-light text-amber-100/90">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-amber-500/50">
                    <p className="font-serif text-base text-amber-300/70 mb-1">No bespoke inquiries found</p>
                    <p className="text-xs">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const statusInfo = INQUIRY_STATUS_CONFIG[inquiry.status] || INQUIRY_STATUS_CONFIG.new;
                  const isUpdating = updatingId === inquiry.id;

                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-[#1a0f0a]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <td className="px-4 py-3.5 font-medium text-amber-50">
                        {inquiry.name}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-amber-300/80">
                        {inquiry.phone}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-amber-300/70 truncate max-w-[150px]">
                        {inquiry.email}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-amber-400/80">
                        {inquiry.pincode}
                      </td>

                      <td className="px-4 py-3.5 text-amber-200">
                        {inquiry.wood_preference || "Open Consultation"}
                      </td>

                      <td className="px-4 py-3.5 text-amber-400/60 font-mono text-[11px] whitespace-nowrap">
                        {inquiry.created_at
                          ? new Date(inquiry.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={inquiry.status}
                            onChange={(e) =>
                              handleStatusChange(inquiry.id, e.target.value as BespokeInquiryStatus)
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-mono border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} focus:outline-none cursor-pointer disabled:opacity-50`}
                          >
                            {INQUIRY_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} className="bg-[#180e09] text-amber-100">
                                {INQUIRY_STATUS_CONFIG[st]?.label || st}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="px-3 py-1 text-[11px] uppercase tracking-wider font-mono rounded bg-[#1c100a] hover:bg-[#2a170d] text-amber-300 hover:text-amber-100 border border-amber-900/40 transition-colors cursor-pointer"
                        >
                          View Brief
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes & Dimensions Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#130b07] border border-amber-900/40 rounded-lg shadow-2xl p-6 md:p-8 space-y-6 overflow-y-auto max-h-[90vh] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/60">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/70 block">
                  Architectural Brief
                </span>
                <h2 className="font-serif text-2xl text-amber-100">
                  {selectedInquiry.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded bg-[#1f120c] hover:bg-[#2c1a11] text-amber-400 flex items-center justify-center text-sm border border-amber-900/40 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#190e09] border border-amber-900/30 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Phone</span>
                <span className="font-mono text-amber-200">{selectedInquiry.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Email</span>
                <span className="font-mono text-amber-200 truncate block">{selectedInquiry.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Postal PIN</span>
                <span className="font-mono text-amber-300">{selectedInquiry.pincode}</span>
              </div>
            </div>

            {/* Timber Preference */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500/70 block mb-1">
                Requested Timber Species
              </span>
              <div className="px-3.5 py-2 rounded bg-[#180e09] border border-amber-900/30 text-xs font-serif text-amber-200">
                {selectedInquiry.wood_preference || "Open to atelier material recommendation"}
              </div>
            </div>

            {/* Spatial Notes & Dimensions */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500/70 block mb-1">
                Dimensions & Spatial Intent
              </span>
              <div className="p-4 rounded bg-[#180e09] border border-amber-900/40 text-xs text-amber-100/90 leading-relaxed font-mono whitespace-pre-wrap">
                {selectedInquiry.dimensions_notes}
              </div>
            </div>

            {/* Status Transition Control */}
            <div className="pt-4 border-t border-amber-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <span>Transition Status:</span>
                <select
                  value={selectedInquiry.status}
                  disabled={updatingId === selectedInquiry.id}
                  onChange={(e) =>
                    handleStatusChange(selectedInquiry.id, e.target.value as BespokeInquiryStatus)
                  }
                  className="px-3 py-1.5 rounded bg-[#20130d] border border-amber-700/40 text-amber-200 text-xs focus:outline-none cursor-pointer"
                >
                  {INQUIRY_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {INQUIRY_STATUS_CONFIG[st]?.label || st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded bg-[#1e120b] hover:bg-[#2b1910] text-amber-300 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
