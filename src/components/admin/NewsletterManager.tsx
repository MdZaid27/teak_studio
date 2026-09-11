"use client";

import { useState } from "react";
import { DbNewsletterSubscriber } from "@/types/database";

interface NewsletterManagerProps {
  initialSubscribers: DbNewsletterSubscriber[];
  initialTotalCount: number;
  initialActiveCount: number;
}

export function NewsletterManager({
  initialSubscribers,
  initialTotalCount,
  initialActiveCount,
}: NewsletterManagerProps) {
  const [subscribers] = useState<DbNewsletterSubscriber[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-950/40">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-amber-50">
            Newsletter Patrons & Atelier Journal
          </h1>
          <p className="mt-1 text-xs text-amber-400/60 font-light">
            Patrons receiving private kiln preview notifications, timber arrivals, and heirloom joinery chronicles.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by patron email..."
            className="px-3.5 py-2 pl-9 bg-[#160c07] border border-amber-900/40 rounded text-xs text-amber-100 placeholder:text-amber-800 focus:outline-none focus:border-amber-600 w-64 sm:w-72 transition-colors"
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
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Subscribers */}
        <div className="p-5 rounded-lg bg-[#140c07] border border-amber-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/70">
              Active Subscribers
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 font-serif text-3xl font-normal text-amber-100">
            {initialActiveCount.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-amber-400/60">
            Receiving seasonal kiln logs and invitations
          </p>
        </div>

        {/* Card 2: Total Records */}
        <div className="p-5 rounded-lg bg-[#140c07] border border-amber-900/30">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/70 block">
            Total Inscribed Patrons
          </span>
          <div className="mt-2 font-serif text-3xl font-normal text-amber-200">
            {initialTotalCount.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-amber-400/60">
            Historical guild readership records
          </p>
        </div>

        {/* Card 3: Subscription Retention Rate */}
        <div className="p-5 rounded-lg bg-[#140c07] border border-amber-900/30">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/70 block">
            Retention Rate
          </span>
          <div className="mt-2 font-serif text-3xl font-normal text-amber-200">
            {initialTotalCount > 0
              ? `${Math.round((initialActiveCount / initialTotalCount) * 100)}%`
              : "100%"}
          </div>
          <p className="mt-1 text-[11px] text-amber-400/60">
            Organic Bangalore patron retention
          </p>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-[#120a06]/90 border border-amber-900/30 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#190e09] border-b border-amber-950/60 text-amber-300/70 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Patron Email Address</th>
                <th className="px-4 py-3.5">Subscription Status</th>
                <th className="px-4 py-3.5">Inscription Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/40 font-light text-amber-100/90">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-amber-500/50">
                    <p className="font-serif text-base text-amber-300/70 mb-1">No subscribers found</p>
                    <p className="text-xs">Adjust your search term or invite new patrons via the studio footer.</p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id || sub.email} className="hover:bg-[#1a0f0a]/60 transition-colors">
                    {/* Email */}
                    <td className="px-4 py-3.5 font-mono font-medium text-amber-100">
                      {sub.email}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono border ${
                          sub.is_active
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-700/40"
                            : "bg-zinc-900/60 text-zinc-400 border-zinc-700/40"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sub.is_active ? "bg-emerald-400" : "bg-zinc-500"
                          }`}
                        />
                        <span>{sub.is_active ? "Active Patron" : "Unsubscribed"}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-amber-400/60 font-mono text-[11px] whitespace-nowrap">
                      {sub.subscribed_at
                        ? new Date(sub.subscribed_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(sub.email)}
                        className="px-3 py-1 text-[11px] font-mono rounded bg-[#1c100a] hover:bg-[#2a170d] text-amber-300 hover:text-amber-100 border border-amber-900/40 transition-colors cursor-pointer"
                      >
                        {copiedEmail === sub.email ? "✓ Copied" : "Copy Email"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
