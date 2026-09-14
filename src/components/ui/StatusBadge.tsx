"use client";

import React from "react";
import { OrderStatus } from "@/types/database";

export interface StatusBadgeProps {
  status: OrderStatus | string;
  showIcon?: boolean;
  pulseOnTransit?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; icon: string; pulse?: boolean }
> = {
  delivered: {
    label: "Delivered",
    bg: "bg-[#EAF3EC] text-[#2D6A4F] border-[#2D6A4F]/20",
    icon: "check_circle",
  },
  dispatched: {
    label: "In White-Glove Transit",
    bg: "bg-[#FDF4E7] text-[#B45309] border-[#B45309]/20",
    icon: "local_shipping",
    pulse: true,
  },
  production: {
    label: "In Production",
    bg: "bg-[#FEF3C7] text-[#92400E] border-[#92400E]/20",
    icon: "handyman",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-[#F5F4F0] text-[#766E65] border-[#EAE7E1]",
    icon: "verified",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#F5F4F0] text-[#766E65] border-[#EAE7E1]",
    icon: "schedule",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#FEE2E2] text-[#991B1B] border-[#991B1B]/20",
    icon: "cancel",
  },
};

export default function StatusBadge({
  status,
  showIcon = true,
  pulseOnTransit = true,
  className = "",
}: StatusBadgeProps) {
  const norm = (status || "pending").toLowerCase();
  const config = STATUS_CONFIG[norm] || STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${config.bg} ${className}`}
    >
      {pulseOnTransit && config.pulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
        </span>
      )}
      {showIcon && (
        <span className="material-symbols-outlined text-[13px] shrink-0">
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
}
