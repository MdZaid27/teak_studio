"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderWithItems } from "@/lib/orders";
import { OrderStatus } from "@/types/database";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: "Commission Queued",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Grain Verified",
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    border: "border-sky-700/50",
    dot: "bg-sky-400",
  },
  production: {
    label: "Atelier Joinery",
    bg: "bg-purple-950/40",
    text: "text-purple-300",
    border: "border-purple-700/50",
    dot: "bg-purple-400",
  },
  dispatched: {
    label: "White-Glove Dispatch",
    bg: "bg-indigo-950/40",
    text: "text-indigo-300",
    border: "border-indigo-700/50",
    dot: "bg-indigo-400",
  },
  delivered: {
    label: "Installed in Home",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    border: "border-rose-700/50",
    dot: "bg-rose-400",
  },
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "production",
  "dispatched",
  "delivered",
  "cancelled",
];

interface OrdersManagerProps {
  initialOrders: OrderWithItems[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const previousOrders = [...orders];
    const targetOrder = orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!targetOrder) return;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.order_number === orderId
          ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
          : o
      )
    );

    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Update with server returned record
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        );
        if (selectedOrder?.id === data.order.id) {
          setSelectedOrder(data.order);
        }
      }

      showToast(`Order ${targetOrder.order_number} status updated to '${STATUS_CONFIG[newStatus]?.label || newStatus}'`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      console.error("Failed to update status:", err);
      // Revert optimistic update
      setOrders(previousOrders);
      showToast(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
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

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-950/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl text-amber-50">
              Customer Orders
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono bg-amber-950/60 border border-amber-800/40 text-amber-300 rounded-full">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Acquisition" : "Acquisitions"}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-400/60 font-light">
            Manage solid wood furniture commissions, status transitions, and client delivery addresses.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, name, phone..."
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
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status]?.label || status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#120a06]/90 border border-amber-900/30 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#190e09] border-b border-amber-950/60 text-amber-300/70 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Order Ref</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Acquisition Total</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5">Lifecycle Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/40 font-light text-amber-100/90">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-amber-500/50">
                    <p className="font-serif text-base text-amber-300/70 mb-1">No orders found</p>
                    <p className="text-xs">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1a0f0a]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order Number */}
                      <td className="px-4 py-3.5 font-mono font-medium text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <span>{order.order_number}</span>
                          <Link
                            href={`/orders/${order.order_number}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Customer Receipt"
                            className="text-amber-600 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]"
                          >
                            ↗
                          </Link>
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-3.5 font-medium text-amber-50">
                        {order.customer_name}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-amber-300/70">
                        <div>{order.customer_phone}</div>
                        <div className="text-amber-500/50 text-[10px] truncate max-w-[140px]">
                          {order.customer_email}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 font-mono font-medium text-amber-200">
                        ₹{order.total.toLocaleString("en-IN")}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-amber-400/60 font-mono text-[11px] whitespace-nowrap">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Status Control */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} focus:outline-none cursor-pointer disabled:opacity-50`}
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} className="bg-[#180e09] text-amber-100">
                                {STATUS_CONFIG[st]?.label || st}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 text-[11px] uppercase tracking-wider font-mono rounded bg-[#1c100a] hover:bg-[#2a170d] text-amber-300 hover:text-amber-100 border border-amber-900/40 transition-colors cursor-pointer"
                        >
                          Inspect
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

      {/* Slide-over Order Inspector Drawer */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-xl h-full bg-[#120a06] border-l border-amber-900/40 shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-amber-950/60">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-amber-300">
                    {selectedOrder.order_number}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono border ${
                      STATUS_CONFIG[selectedOrder.status]?.bg
                    } ${STATUS_CONFIG[selectedOrder.status]?.text} ${
                      STATUS_CONFIG[selectedOrder.status]?.border
                    }`}
                  >
                    {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded bg-[#1f120c] hover:bg-[#2c1a11] text-amber-400 flex items-center justify-center text-sm border border-amber-900/40 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Update Quick Control */}
              <div className="mt-6 p-4 rounded-lg bg-[#180e09] border border-amber-900/40">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-amber-400/80 mb-2">
                  Update Lifecycle Stage:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ORDER_STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingId === selectedOrder.id}
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                        selectedOrder.status === st
                          ? "bg-amber-600 text-white border-amber-500 font-bold shadow"
                          : "bg-[#130b07] text-amber-300/70 border-amber-900/30 hover:border-amber-700/60 hover:text-amber-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client & Delivery Info */}
              <div className="mt-6 space-y-4">
                <h3 className="font-serif text-lg text-amber-100 border-b border-amber-950/40 pb-1.5">
                  Client & White-Glove Delivery
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Patron</span>
                    <span className="text-amber-100 font-medium">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Phone</span>
                    <span className="font-mono text-amber-200">{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Email</span>
                    <span className="font-mono text-amber-200">{selectedOrder.customer_email}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Placement Address</span>
                    <span className="text-amber-100 leading-relaxed block mt-0.5">
                      {selectedOrder.delivery_address}
                    </span>
                    <span className="font-mono text-amber-400/80 text-[11px] mt-1 block">
                      PIN Code: {selectedOrder.pincode} · Bengaluru White-Glove
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Payment</span>
                    <span className="text-amber-300 font-mono capitalize">
                      {selectedOrder.payment_method === "offline" ? "Pay on Delivery / RTGS" : selectedOrder.payment_method}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-500/60 block">Placed On</span>
                    <span className="font-mono text-amber-300/80">
                      {selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleString("en-IN")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Line Items */}
              <div className="mt-8">
                <h3 className="font-serif text-lg text-amber-100 border-b border-amber-950/40 pb-1.5 mb-3">
                  Handcrafted Line Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded bg-[#160c07] border border-amber-900/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-amber-100">{item.product_name}</div>
                          {item.timber_option && (
                            <div className="text-[11px] text-amber-400/70 font-mono">
                              Timber: {item.timber_option}
                            </div>
                          )}
                          <div className="text-[10px] text-amber-600/70 font-mono mt-0.5">
                            Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="font-mono font-medium text-amber-200">
                          ₹{item.line_total.toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-amber-500/50 italic">Line items pending database join.</p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="mt-4 pt-3 border-t border-amber-950/60 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-amber-400/70">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-amber-400/70">
                    <span>White-Glove Placement</span>
                    <span className="text-emerald-400">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-amber-200 pt-2 border-t border-amber-950/80">
                    <span>Total Acquisition</span>
                    <span>₹{selectedOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-amber-950/60 flex items-center justify-between gap-3">
              <Link
                href={`/orders/${selectedOrder.order_number}`}
                target="_blank"
                className="px-4 py-2.5 rounded bg-[#2a170d] hover:bg-[#3d2113] border border-amber-700/40 text-amber-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Customer Tracking Receipt</span>
                <span>↗</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded bg-[#180e09] hover:bg-[#24150e] text-amber-400 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
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
