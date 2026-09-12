"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { OrderWithItems } from "@/lib/orders";
import { OrderStatus } from "@/types/database";

export type AdminStatusFilter = "all" | "confirmed" | "production" | "dispatched" | "delivered" | "cancelled";
export type AdminDateFilter = "all" | "today" | "7_days" | "this_month";

interface StatusBadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  hasPulse?: boolean;
}

const STATUS_CONFIG: Record<string, StatusBadgeStyle> = {
  pending: {
    label: "Confirmed",
    bg: "bg-[#24211E]",
    text: "text-[#C9BFB5]",
    border: "border-[#3E3A35]",
    dot: "bg-[#C9BFB5]",
    hasPulse: false,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-[#24211E]",
    text: "text-[#C9BFB5]",
    border: "border-[#3E3A35]",
    dot: "bg-[#C9BFB5]",
    hasPulse: false,
  },
  production: {
    label: "Production",
    bg: "bg-[#2D2115]",
    text: "text-[#FBBF24]",
    border: "border-[#B45309]/50",
    dot: "bg-[#FBBF24]",
    hasPulse: false,
  },
  dispatched: {
    label: "In White-Glove Transit",
    bg: "bg-[#2E1E12]",
    text: "text-[#FB923C]",
    border: "border-[#C2410C]/50",
    dot: "bg-[#FB923C]",
    hasPulse: true,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-[#142318]",
    text: "text-[#4ADE80]",
    border: "border-[#22C55E]/40",
    dot: "bg-[#4ADE80]",
    hasPulse: false,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#2B1414]",
    text: "text-[#F87171]",
    border: "border-[#EF4444]/40",
    dot: "bg-[#F87171]",
    hasPulse: false,
  },
};

const LIFECYCLE_STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "confirmed", label: "Confirmed", desc: "Grain verified & timber allocated" },
  { key: "production", label: "Production", desc: "Artisan mortise & tenon workshop joinery" },
  { key: "dispatched", label: "In White-Glove Transit", desc: "Climate-controlled white-glove transit" },
  { key: "delivered", label: "Delivered", desc: "Assembled & placed in residence" },
  { key: "cancelled", label: "Cancelled", desc: "Order voided and released" },
];

interface OrdersManagerProps {
  initialOrders: OrderWithItems[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [selectedStatusInDrawer, setSelectedStatusInDrawer] = useState<OrderStatus>("confirmed");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<AdminDateFilter>("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open drawer for an order and sync drawer selection
  const handleOpenDrawer = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setSelectedStatusInDrawer(order.status === "pending" ? "confirmed" : order.status);
  };

  // Execute status update through PATCH /api/admin/orders/[id]
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!targetOrder) return;

    const previousOrders = [...orders];
    const previousSelected = selectedOrder ? { ...selectedOrder } : null;

    // Immediate optimistic update
    const updatedOrderOptimistic: OrderWithItems = {
      ...targetOrder,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === targetOrder.id ? updatedOrderOptimistic : o))
    );
    if (selectedOrder && (selectedOrder.id === targetOrder.id || selectedOrder.order_number === targetOrder.order_number)) {
      setSelectedOrder(updatedOrderOptimistic);
    }

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${targetOrder.order_number || targetOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status");
      }

      const confirmedOrder: OrderWithItems = data.order || updatedOrderOptimistic;
      setOrders((prev) =>
        prev.map((o) => (o.id === confirmedOrder.id ? confirmedOrder : o))
      );
      if (selectedOrder) {
        setSelectedOrder(confirmedOrder);
      }

      showToast(
        `Order ${confirmedOrder.order_number} status updated to '${STATUS_CONFIG[newStatus]?.label || newStatus}'`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      console.error("Failed to update status:", err);
      // Revert optimistic updates
      setOrders(previousOrders);
      setSelectedOrder(previousSelected);
      showToast(msg, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Metrics Calculation (4-Column Grid)
  const metrics = useMemo(() => {
    let totalCount = orders.length;
    let totalValue = 0;
    let inProductionCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;

    for (const order of orders) {
      if (order.status !== "cancelled") {
        totalValue += order.total || 0;
      }
      if (order.status === "production") {
        inProductionCount++;
      } else if (order.status === "dispatched") {
        inTransitCount++;
      } else if (order.status === "delivered") {
        deliveredCount++;
      }
    }

    return {
      totalCount,
      totalValue,
      inProductionCount,
      inTransitCount,
      deliveredCount,
    };
  }, [orders]);

  // Multi-criteria Filtering (Search, Status Pills, Date Range)
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter((order) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = order.order_number?.toLowerCase().includes(q);
        const matchesName = order.customer_name?.toLowerCase().includes(q);
        const matchesPhone = order.customer_phone?.includes(q);
        const matchesEmail = order.customer_email?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "confirmed") {
          if (order.status !== "confirmed" && order.status !== "pending") return false;
        } else if (order.status !== statusFilter) {
          return false;
        }
      }

      // 3. Date filter
      if (dateFilter !== "all" && order.created_at) {
        const orderTime = new Date(order.created_at).getTime();
        if (dateFilter === "today" && orderTime < todayStart) {
          return false;
        }
        if (dateFilter === "7_days" && orderTime < sevenDaysAgo) {
          return false;
        }
        if (dateFilter === "this_month" && orderTime < thisMonthStart) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateFilter]);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-mono flex items-center gap-2.5 transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-[#142318]/95 border-[#22C55E]/50 text-[#4ADE80]"
              : "bg-[#2B1414]/95 border-[#EF4444]/50 text-[#F87171]"
          }`}
        >
          <span className="text-sm font-bold">
            {toastMessage.type === "success" ? "✓" : "⚠"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] font-medium tracking-wide">
              Commissioned Orders Console
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono bg-[#1C1A18] border border-[#3E3A35] text-[#D4A373] rounded-full">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#9B9287] font-light">
            Monitor client acquisitions, inspect joinery line items, and transition white-glove lifecycle stages.
          </p>
        </div>
      </div>

      {/* 1. Header & Metric Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Commissions */}
        <div className="bg-[#161514] border border-[#2A2724] rounded-xl p-5 shadow-sm hover:border-[#3E3A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#9B9287] font-mono uppercase tracking-wider">
            <span>Total Commissions</span>
            <span className="material-symbols-outlined text-[18px] text-[#D4A373]">inventory_2</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-serif font-medium text-[#FAF9F6]">
              {metrics.totalCount} <span className="text-xs font-sans text-[#9B9287]">Orders</span>
            </span>
            <span className="font-sans tabular-nums text-sm font-semibold text-[#D4A373]">
              ₹{metrics.totalValue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#706860]">
            Aggregate client commissions book
          </p>
        </div>

        {/* In Production */}
        <div className="bg-[#161514] border border-[#2A2724] rounded-xl p-5 shadow-sm hover:border-[#3E3A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#9B9287] font-mono uppercase tracking-wider">
            <span>In Production</span>
            <span className="material-symbols-outlined text-[18px] text-[#FBBF24]">carpenter</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-[#FBBF24]">
              {metrics.inProductionCount}
            </span>
            <span className="text-xs font-mono text-[#FBBF24]/70">Workshop Builds</span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#706860]">
            Artisan mortise &amp; tenon joinery
          </p>
        </div>

        {/* White-Glove In Transit */}
        <div className="bg-[#161514] border border-[#2A2724] rounded-xl p-5 shadow-sm hover:border-[#3E3A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#9B9287] font-mono uppercase tracking-wider">
            <span>White-Glove In Transit</span>
            <span className="material-symbols-outlined text-[18px] text-[#FB923C]">local_shipping</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-[#FB923C]">
              {metrics.inTransitCount}
            </span>
            <span className="text-xs font-mono text-[#FB923C]/70">Active Dispatches</span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#706860]">
            Climate-controlled road freight
          </p>
        </div>

        {/* Completed */}
        <div className="bg-[#161514] border border-[#2A2724] rounded-xl p-5 shadow-sm hover:border-[#3E3A35] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#9B9287] font-mono uppercase tracking-wider">
            <span>Completed</span>
            <span className="material-symbols-outlined text-[18px] text-[#4ADE80]">check_circle</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-medium text-[#4ADE80]">
              {metrics.deliveredCount}
            </span>
            <span className="text-xs font-mono text-[#4ADE80]/70">Delivered Heirlooms</span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#706860]">
            Fully assembled in residence
          </p>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-[#161514] border border-[#2A2724] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (#KS-...), Patron Name, Phone, or Email..."
              className="w-full px-4 py-2.5 pl-10 bg-[#1C1A18] border border-[#2A2724] rounded-lg text-xs text-[#FAF9F6] placeholder:text-[#706860] focus:outline-none focus:border-[#D4A373] transition-colors"
            />
            <span className="material-symbols-outlined text-[18px] text-[#706860] absolute left-3 top-2.5">
              search
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[#706860] hover:text-[#FAF9F6] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-[#9B9287] uppercase tracking-wider hidden sm:inline">
              Period:
            </span>
            <div className="inline-flex rounded-lg border border-[#2A2724] bg-[#1C1A18] p-0.5">
              {(
                [
                  { id: "all", label: "All Time" },
                  { id: "today", label: "Today" },
                  { id: "7_days", label: "Last 7 Days" },
                  { id: "this_month", label: "This Month" },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDateFilter(d.id)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                    dateFilter === d.id
                      ? "bg-[#2A2724] text-[#FAF9F6] font-semibold"
                      : "text-[#9B9287] hover:text-[#FAF9F6]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2724]">
          <span className="text-xs font-mono text-[#9B9287] uppercase tracking-wider mr-1">
            Status:
          </span>
          {(
            [
              { id: "all", label: "All" },
              { id: "confirmed", label: "Confirmed" },
              { id: "production", label: "Production" },
              { id: "dispatched", label: "In Transit" },
              { id: "delivered", label: "Delivered" },
              { id: "cancelled", label: "Cancelled" },
            ] as const
          ).map((s) => {
            const isActive = statusFilter === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#D4A373] text-[#121110] font-bold shadow-sm"
                    : "bg-[#1C1A18] text-[#9B9287] hover:text-[#FAF9F6] hover:bg-[#2A2724] border border-[#2A2724]"
                }`}
              >
                {s.id !== "all" && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-[#121110]" : STATUS_CONFIG[s.id]?.dot || "bg-[#9B9287]"
                    }`}
                  />
                )}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Orders Data Table */}
      <div className="bg-[#161514] border border-[#2A2724] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C1A18] border-b border-[#2A2724] text-[#9B9287] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Patron Name &amp; Contact</th>
                <th className="px-5 py-4">Commissioned Items</th>
                <th className="px-5 py-4">Total Value</th>
                <th className="px-5 py-4">Status Pill</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2724] font-light text-[#FAF9F6]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-[#706860]">
                    <p className="font-serif text-lg text-[#FAF9F6] mb-1">No commissions found</p>
                    <p className="text-xs">
                      Try modifying your search keywords or resetting the status and date filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
                  const firstItem = order.order_items?.[0];
                  const extraItemsCount = (order.order_items?.length || 0) - 1;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1C1A18]/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(order)}
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4 font-mono font-medium text-[#D4A373] whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-sans tabular-nums">
                          <span>{order.order_number}</span>
                          <Link
                            href={`/orders/${order.order_number}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Customer Receipt"
                            className="text-[#706860] hover:text-[#D4A373] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          </Link>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 font-sans tabular-nums text-xs text-[#9B9287] whitespace-nowrap">
                        {order.created_at ? (
                          <div>
                            <div>
                              {new Date(order.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-[10px] text-[#706860]">
                              {new Date(order.created_at).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Patron Name & Contact */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#FAF9F6] text-sm">
                          {order.customer_name}
                        </div>
                        <div className="font-mono text-[11px] text-[#9B9287] mt-0.5">
                          {order.customer_phone}
                        </div>
                        <div className="font-mono text-[10px] text-[#706860] truncate max-w-[180px]">
                          {order.customer_email}
                        </div>
                      </td>

                      {/* Commissioned Items (Thumbnail + Piece title + Timber variant + Qty) */}
                      <td className="px-5 py-4">
                        {firstItem ? (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#1C1A18] border border-[#2A2724] overflow-hidden shrink-0 relative flex items-center justify-center">
                              {firstItem.image_url ? (
                                <Image
                                  src={firstItem.image_url}
                                  alt={firstItem.product_name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[#706860] text-[20px]">
                                  chair
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-[#FAF9F6] truncate max-w-[180px]">
                                {firstItem.product_name || firstItem.product_title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {firstItem.timber_option && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C1A18] border border-[#2A2724] text-[#D4A373]">
                                    {firstItem.timber_option}
                                  </span>
                                )}
                                <span className="font-sans tabular-nums text-[11px] text-[#9B9287]">
                                  Qty: {firstItem.quantity}
                                </span>
                              </div>
                              {extraItemsCount > 0 && (
                                <span className="text-[10px] text-[#706860] font-mono mt-0.5 block">
                                  +{extraItemsCount} more {extraItemsCount === 1 ? "item" : "items"}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#706860] italic">No items detailed</span>
                        )}
                      </td>

                      {/* Total Value */}
                      <td className="px-5 py-4 font-sans tabular-nums font-semibold text-sm text-[#FAF9F6] whitespace-nowrap">
                        ₹{(order.total || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status Pill */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${
                              statusInfo.hasPulse ? "animate-ping" : ""
                            }`}
                          />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(order)}
                          className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg bg-[#1C1A18] hover:bg-[#2A2724] text-[#D4A373] hover:text-[#FAF9F6] border border-[#3E3A35] transition-colors cursor-pointer"
                        >
                          Manage Order
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

      {/* 4. Order Detail & Status Management Modal/Drawer */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-xl h-full bg-[#161514] border-l border-[#2A2724] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 md:p-8 border-b border-[#2A2724] bg-[#141312] sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xl font-medium text-[#FAF9F6]">
                    Order #{selectedOrder.order_number}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                      STATUS_CONFIG[selectedOrder.status]?.bg
                    } ${STATUS_CONFIG[selectedOrder.status]?.text} ${
                      STATUS_CONFIG[selectedOrder.status]?.border
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedOrder.status]?.dot}`}
                    />
                    <span>{STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-lg bg-[#1C1A18] hover:bg-[#2A2724] text-[#9B9287] hover:text-[#FAF9F6] flex items-center justify-center text-sm border border-[#2A2724] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-xs font-sans tabular-nums text-[#706860]">
                Commissioned on{" "}
                {selectedOrder.created_at
                  ? new Date(selectedOrder.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>

            {/* Drawer Body */}
            <div className="p-6 md:p-8 space-y-8 flex-1">
              {/* Status Lifecycle Control */}
              <div className="p-5 rounded-xl bg-[#1C1A18] border border-[#2A2724] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-widest text-[#D4A373]">
                    Status Lifecycle Control
                  </label>
                  <span className="text-[10px] font-mono text-[#706860]">
                    Real-time Supabase Handshake
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {LIFECYCLE_STAGES.map((stage) => {
                    const isSelected = selectedStatusInDrawer === stage.key;
                    const isCurrent = selectedOrder.status === stage.key || (stage.key === "confirmed" && selectedOrder.status === "pending");

                    return (
                      <button
                        key={stage.key}
                        type="button"
                        onClick={() => setSelectedStatusInDrawer(stage.key)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#2A2724] border-[#D4A373] text-[#FAF9F6] shadow-sm"
                            : "bg-[#161514] border-[#2A2724] text-[#9B9287] hover:text-[#FAF9F6] hover:border-[#3E3A35]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold">
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[#142318] text-[#4ADE80] border border-[#22C55E]/30">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#706860] mt-0.5">
                            {stage.desc}
                          </div>
                        </div>

                        <div className="w-5 h-5 rounded-full border border-[#3E3A35] flex items-center justify-center">
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A373]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Update Status Button */}
                <button
                  type="button"
                  disabled={isUpdating || selectedStatusInDrawer === selectedOrder.status}
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedStatusInDrawer)}
                  className="w-full mt-3 py-3 rounded-lg bg-[#D4A373] hover:bg-[#e0b284] text-[#121110] font-mono text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isUpdating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#121110] border-t-transparent rounded-full animate-spin" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">sync</span>
                      <span>Update Status</span>
                    </>
                  )}
                </button>
              </div>

              {/* Patron & Delivery Residence Address */}
              <div className="space-y-4">
                <h3 className="font-serif text-base text-[#FAF9F6] border-b border-[#2A2724] pb-2">
                  Patron &amp; Delivery Residence
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#706860] block">
                      Full Name
                    </span>
                    <span className="text-[#FAF9F6] font-medium mt-0.5 block">
                      {selectedOrder.customer_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#706860] block">
                      Mobile Contact
                    </span>
                    <span className="font-sans tabular-nums text-[#D4A373] mt-0.5 block">
                      {selectedOrder.customer_phone}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-mono text-[#706860] block">
                      Email Address
                    </span>
                    <span className="font-mono text-[#FAF9F6] mt-0.5 block">
                      {selectedOrder.customer_email}
                    </span>
                  </div>
                  <div className="sm:col-span-2 p-3.5 rounded-lg bg-[#1C1A18] border border-[#2A2724]">
                    <span className="text-[10px] uppercase font-mono text-[#D4A373] block">
                      Delivery Residence Address
                    </span>
                    <p className="text-[#FAF9F6] leading-relaxed mt-1">
                      {selectedOrder.delivery_address || selectedOrder.shipping_address}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-[#9B9287] flex items-center gap-2">
                      <span>PIN: {selectedOrder.pincode}</span>
                      <span>&bull;</span>
                      <span>{selectedOrder.city || "Urban Zone"}, {selectedOrder.state || "India"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Commission Breakdown */}
              <div className="space-y-4">
                <h3 className="font-serif text-base text-[#FAF9F6] border-b border-[#2A2724] pb-2">
                  Itemized Commission Breakdown
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[#1C1A18] border border-[#2A2724] flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#161514] border border-[#2A2724] overflow-hidden shrink-0 relative flex items-center justify-center">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[#706860] text-[24px]">
                                chair
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-serif font-medium text-sm text-[#FAF9F6]">
                              {item.product_name || item.product_title}
                            </div>
                            {item.timber_option && (
                              <div className="text-[11px] text-[#D4A373] font-mono mt-0.5">
                                Timber Finish: {item.timber_option}
                              </div>
                            )}
                            <div className="text-[10px] text-[#706860] font-sans tabular-nums mt-0.5">
                              Qty: {item.quantity} × ₹{(item.unit_price || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>

                        <div className="font-sans tabular-nums font-semibold text-sm text-[#FAF9F6] text-right">
                          ₹{(item.line_total || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#706860] italic">Line items pending database sync.</p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-xl bg-[#141312] border border-[#2A2724] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#9B9287]">
                    <span>Subtotal</span>
                    <span className="font-sans tabular-nums">
                      ₹{(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9B9287]">
                    <span>White-Glove Placement &amp; Setup</span>
                    <span className="text-[#4ADE80]">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#FAF9F6] pt-2 border-t border-[#2A2724]">
                    <span>Total Acquisition Value</span>
                    <span className="font-sans tabular-nums text-[#D4A373]">
                      ₹{(selectedOrder.total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-[#2A2724] bg-[#141312] flex items-center justify-between gap-3">
              <Link
                href={`/orders/${selectedOrder.order_number}`}
                target="_blank"
                className="px-4 py-2.5 rounded-lg bg-[#1C1A18] hover:bg-[#2A2724] border border-[#3E3A35] text-[#D4A373] hover:text-[#FAF9F6] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Live Patron Tracking Receipt</span>
                <span className="text-[10px]">↗</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-lg bg-[#2A2724] hover:bg-[#3E3A35] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
