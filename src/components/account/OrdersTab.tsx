"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { OrderWithItems } from "@/lib/orders";
import { OrderStatusFilter, OrderTimeframeFilter } from "@/types/database";
import StatusBadge from "@/components/ui/StatusBadge";

export interface OrdersTabProps {
  orders: OrderWithItems[];
  loadingOrders: boolean;
  statusFilter: OrderStatusFilter;
  setStatusFilter: (filter: OrderStatusFilter) => void;
  timeframeFilter: OrderTimeframeFilter;
  setTimeframeFilter: (filter: OrderTimeframeFilter) => void;
  referenceTime?: number;
}

const STATUS_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "delivered", label: "Delivered" },
  { value: "dispatched", label: "In White-Glove Transit" },
  { value: "production", label: "In Production" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const TIMEFRAME_OPTIONS: { value: OrderTimeframeFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "30_days", label: "Last 30 Days" },
  { value: "3_months", label: "Last 3 Months" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
];

export default function OrdersTab({
  orders,
  loadingOrders,
  statusFilter,
  setStatusFilter,
  timeframeFilter,
  setTimeframeFilter,
  referenceTime = Date.now(),
}: OrdersTabProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [timeframeMenuOpen, setTimeframeMenuOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const timeframeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusMenuOpen(false);
      }
      if (
        timeframeDropdownRef.current &&
        !timeframeDropdownRef.current.contains(event.target as Node)
      ) {
        setTimeframeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Status Filter
      if (statusFilter !== "all" && ord.status !== statusFilter) {
        return false;
      }

      // 2. Timeframe Filter
      if (timeframeFilter !== "all" && ord.created_at) {
        const orderDate = new Date(ord.created_at).getTime();
        const now = referenceTime;

        if (timeframeFilter === "30_days") {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (orderDate < thirtyDaysAgo) return false;
        } else if (timeframeFilter === "3_months") {
          const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
          if (orderDate < threeMonthsAgo) return false;
        } else if (timeframeFilter === "2026") {
          const year = new Date(ord.created_at).getFullYear();
          if (year !== 2026) return false;
        } else if (timeframeFilter === "2025") {
          const year = new Date(ord.created_at).getFullYear();
          if (year !== 2025) return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, timeframeFilter, referenceTime]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
            Commissioned Atelier Orders
          </h3>
          <p className="text-xs text-[#766E65] pt-0.5">
            Track real-time workshop fabrication, white-glove transit, and delivery receipts.
          </p>
        </div>

        {/* Dual Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-1.5"
            ref={statusDropdownRef}
          >
            <span className="text-[10px] font-semibold tracking-wider text-[#766E65] uppercase">
              ORDER STATUS
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setStatusMenuOpen(!statusMenuOpen);
                  setTimeframeMenuOpen(false);
                }}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#EAE7E1] rounded-xl text-xs font-medium text-[#1A1A1A] cursor-pointer hover:border-[#1A1A1A] min-w-[150px]"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#766E65]">
                    filter_list
                  </span>
                  <span>
                    {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "All Status"}
                  </span>
                </span>
                <span
                  className={`material-symbols-outlined text-[16px] text-[#766E65] transition-transform duration-200 ${
                    statusMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {statusMenuOpen && (
                <div className="absolute right-0 sm:left-0 mt-1 bg-white border border-[#EAE7E1] shadow-lg rounded-xl py-1 z-20 min-w-[175px]">
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setStatusMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-[#1A1A1A] hover:bg-[#FAF9F6] cursor-pointer transition-colors text-left ${
                          isActive ? "font-semibold bg-[#FAF9F6] text-[#895029]" : ""
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && (
                          <span className="material-symbols-outlined text-[14px] text-[#895029]">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Timeframe Filter */}
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-1.5"
            ref={timeframeDropdownRef}
          >
            <span className="text-[10px] font-semibold tracking-wider text-[#766E65] uppercase">
              ORDER TIME
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTimeframeMenuOpen(!timeframeMenuOpen);
                  setStatusMenuOpen(false);
                }}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#EAE7E1] rounded-xl text-xs font-medium text-[#1A1A1A] cursor-pointer hover:border-[#1A1A1A] min-w-[135px]"
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#766E65]">
                    calendar_today
                  </span>
                  <span>
                    {TIMEFRAME_OPTIONS.find((o) => o.value === timeframeFilter)?.label ||
                      "All Time"}
                  </span>
                </span>
                <span
                  className={`material-symbols-outlined text-[16px] text-[#766E65] transition-transform duration-200 ${
                    timeframeMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {timeframeMenuOpen && (
                <div className="absolute right-0 sm:left-0 mt-1 bg-white border border-[#EAE7E1] shadow-lg rounded-xl py-1 z-20 min-w-[160px]">
                  {TIMEFRAME_OPTIONS.map((opt) => {
                    const isActive = timeframeFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setTimeframeFilter(opt.value);
                          setTimeframeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-[#1A1A1A] hover:bg-[#FAF9F6] cursor-pointer transition-colors text-left ${
                          isActive ? "font-semibold bg-[#FAF9F6] text-[#895029]" : ""
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && (
                          <span className="material-symbols-outlined text-[14px] text-[#895029]">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loadingOrders ? (
        <div className="p-12 text-center text-xs text-[#766E65]">
          Loading commissioned orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto text-[#895029]">
            <span className="material-symbols-outlined text-[28px]">local_shipping</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-xl text-[#1A1A1A]">No Orders Found</h4>
            <p className="text-xs text-[#766E65] max-w-sm mx-auto">
              {orders.length === 0
                ? "You haven't commissioned any bespoke solid wood furniture yet."
                : "No orders match the selected status and timeframe filters."}
            </p>
          </div>
          <Link
            href="/shop"
            className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5"
          >
            <span>Explore Atelier Pieces</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border border-[#EAE7E1] rounded-2xl overflow-hidden shadow-xs hover:border-[#d3c3bd] transition-all"
            >
              {/* Order Reference Top Banner */}
              <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#EAE7E1] flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#1A1A1A]">
                      #{ord.order_number}
                    </span>
                    <StatusBadge status={ord.status} />
                  </div>
                  <p className="text-[11px] text-[#766E65]">
                    Commissioned on{" "}
                    {ord.created_at
                      ? new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-sans text-[10px] uppercase font-semibold text-[#766E65] block">
                      Total Consideration
                    </span>
                    <span className="font-sans tabular-nums text-base sm:text-lg font-bold text-[#1A1A1A]">
                      ₹{ord.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Link
                    href={`/orders/${ord.order_number || ord.id}`}
                    className="px-4 py-2 bg-white border border-[#EAE7E1] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-2xs hover:bg-[#FAF9F6]"
                  >
                    <span>View Tracking Receipt</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* White-Glove Dispatch Destination Sub-bar */}
              <div className="px-5 sm:px-6 py-2.5 bg-white border-b border-[#EAE7E1]/60 flex items-center gap-2 text-xs text-[#766E65]">
                <span className="material-symbols-outlined text-[16px] text-[#895029]">
                  location_on
                </span>
                <span className="truncate">
                  White-Glove Placement:{" "}
                  <strong className="text-[#1A1A1A] font-medium">
                    {ord.delivery_address} ({ord.pincode})
                  </strong>
                </span>
              </div>

              {/* Order Item Rows */}
              <div className="p-5 sm:p-6 divide-y divide-[#EAE7E1]/70">
                {ord.order_items && ord.order_items.length > 0 ? (
                  ord.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center text-[#895029] overflow-hidden shrink-0">
                          <span className="material-symbols-outlined text-[24px]">chair</span>
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="font-serif text-base text-[#1A1A1A] font-medium">
                            {item.product_name}
                          </h5>
                          <p className="text-xs text-[#766E65]">
                            Timber: {item.timber_option || "Solid Teak & Natural Oil Finish"}
                          </p>
                          <p className="text-[11px] text-[#766E65]">
                            Qty:{" "}
                            <span className="font-mono text-[#1A1A1A] font-semibold">
                              {item.quantity}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-sans tabular-nums text-sm font-semibold text-[#1A1A1A]">
                          ₹{item.line_total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-xs text-[#766E65]">
                    Standard Bespoke Commission
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
