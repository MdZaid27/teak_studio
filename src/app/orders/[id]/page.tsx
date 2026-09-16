import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getOrderByNumberOrId } from "@/lib/orders";
import { getProductById } from "@/lib/products";
import { getPatronAddresses } from "@/lib/patron";
import PrintReceiptButton from "@/components/PrintReceiptButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

// 4-step progress tracker definitions matching KILN STUDIO atelier lifecycle
const TRACKING_STEPS = [
  {
    step: 1,
    key: "confirmed",
    title: "Order Confirmed",
    subtitle: "Atelier logging & timber allocation",
    icon: "verified",
  },
  {
    step: 2,
    key: "production",
    title: "Timber Selection & Production",
    subtitle: "Mortise & tenon artisan kiln craft",
    icon: "carpenter",
  },
  {
    step: 3,
    key: "dispatched",
    title: "In White-Glove Transit",
    subtitle: "Climate-controlled protective transport",
    icon: "local_shipping",
  },
  {
    step: 4,
    key: "delivered",
    title: "Delivered & Assembled",
    subtitle: "On-site room placement & inspection",
    icon: "check_circle",
  },
];


export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;

  if (!id) {
    return renderNotFound("Unknown");
  }

  // ── Auth guard ──────────────────────────────────────────────────────────────
  // Resolve the current session-authenticated user from cookies (server-side).
  // We do this BEFORE fetching the order so we can gate access immediately.
  let currentUserId: string | null = null;
  let currentUserEmail: string | null = null;
  let currentUserPhone: string | null = null;
  let cookiePatronId: string | null = null;
  let cookiePatronPhone: string | null = null;
  let cookiePatronEmail: string | null = null;

  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase-server");
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      currentUserEmail = user.email ?? null;
      currentUserPhone = user.phone ? user.phone.replace(/\D/g, "").slice(-10) : null;
    }
  } catch {
    // If the server client fails to init (e.g. missing env), fall through
  }

  // Also read the patron session cookies set by /api/patron/session on login
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookiePatronId = cookieStore.get("teak_patron_id")?.value ?? null;
    cookiePatronPhone = cookieStore.get("teak_patron_phone")?.value ?? null;
    cookiePatronEmail = cookieStore.get("teak_patron_email")?.value ?? null;
  } catch {
    // Non-critical; fall through
  }

  const order = await getOrderByNumberOrId(id);

  if (!order) {
    return renderNotFound(id);
  }

  // ── Ownership check ─────────────────────────────────────────────────────────
  // A commission belongs to the viewing patron if ANY of these match:
  //   1. User ID match (Supabase UUID or patron session ID)
  //   2. Phone number match (10-digit clean phone between order and patron session)
  //   3. Email match (case-insensitive email between order and patron session)
  const effectiveUserId = currentUserId || cookiePatronId;
  const effectiveEmail = (currentUserEmail || cookiePatronEmail)?.toLowerCase().trim();
  const effectivePhone = currentUserPhone || cookiePatronPhone;

  const orderPhone = (order.customer_phone || "").replace(/\D/g, "").slice(-10);
  const orderEmail = (order.customer_email || "").toLowerCase().trim();

  const isUserAuthenticated = !!(effectiveUserId || effectiveEmail || effectivePhone);

  const ownsOrder =
    (effectiveUserId && order.user_id && (order.user_id === effectiveUserId || (effectivePhone && order.user_id.includes(effectivePhone)))) ||
    (effectivePhone && orderPhone && orderPhone === effectivePhone) ||
    (effectiveEmail && orderEmail && orderEmail === effectiveEmail);

  if (!ownsOrder) {
    // Not logged in at all → they should sign in first
    if (!isUserAuthenticated) {
      return renderUnauthorized(id, "unauthenticated");
    }
    // Logged in but wrong account → hard block (IDOR prevention)
    return renderUnauthorized(id, "forbidden");
  }
  // ── End auth guard ──────────────────────────────────────────────────────────


  // Determine normalized order code
  const displayOrderCode = order.order_number.startsWith("KS-")
    ? order.order_number
    : `KS-${order.order_number}`;

  // Hydrate items with high-res product photos if needed
  const hydratedItems = await Promise.all(
    (order.order_items || []).map(async (item) => {
      let image = item.image_url || "";
      if (!image) {
        const prod = await getProductById(item.product_id);
        if (prod) {
          image = prod.image || (prod.gallery && prod.gallery[0]?.src) || "";
        }
      }
      return {
        ...item,
        displayImage: image || "/images/placeholder.jpg",
        displayTitle: item.product_title || item.product_name,
        displayTimber: item.timber_title || item.timber_option || "Selected Atelier Timber",
      };
    })
  );

  // Determine Patron Address Tag (Home / Work / Others)
  let addressTag: "Home" | "Work" | "Others" = "Home";
  if (order.user_id && order.user_id !== "patron-guest") {
    try {
      const patronAddrs = await getPatronAddresses(order.user_id, order.customer_phone);
      const matched = patronAddrs.find(
        (a) =>
          (order.pincode && a.pincode === order.pincode) ||
          (order.delivery_address &&
            (order.delivery_address.toLowerCase().includes(a.floor_building.toLowerCase()) ||
              a.floor_building.toLowerCase().includes(order.delivery_address.split(",")[0].toLowerCase())))
      );
      if (matched) {
        addressTag = matched.save_as;
      }
    } catch {
      // Graceful fallback
    }
  }

  // Format order placement date
  const orderDate = order.created_at ? new Date(order.created_at) : new Date();
  const formattedDate = orderDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate estimated delivery window (21 to 28 days from order date)
  const estStartDate = new Date(orderDate.getTime() + 21 * 24 * 60 * 60 * 1000);
  const estEndDate = new Date(orderDate.getTime() + 28 * 24 * 60 * 60 * 1000);
  const formattedEstWindow = `${estStartDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} – ${estEndDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  // Stepper active index mapping
  const statusNorm = order.status?.toLowerCase() || "confirmed";
  let activeStepIndex = 0;
  if (statusNorm === "delivered") {
    activeStepIndex = 3;
  } else if (statusNorm === "dispatched") {
    activeStepIndex = 2;
  } else if (statusNorm === "production") {
    activeStepIndex = 1;
  } else if (statusNorm === "confirmed" || statusNorm === "pending") {
    activeStepIndex = 0;
  } else if (statusNorm === "cancelled") {
    activeStepIndex = -1;
  }

  const cleanPhone = (order.customer_phone || "").replace(/\D/g, "").slice(-10);

  // Financial calculations
  const totalAmount = order.total || order.subtotal || 0;
  const gstInclusiveAmount = Math.round((totalAmount * 18) / 118);

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen pb-24 print:bg-white print:pb-0 font-sans text-[#1A1A1A] print-receipt-container">
      
      {/* -------------------------------------------------------------
          A. Top Header & Navigation
         ------------------------------------------------------------- */}
      <div className="border-b border-[#EAE7E1] bg-white/70 backdrop-blur-xs py-8 md:py-12 print:py-4 print:border-b-2 print:bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6 space-y-4">
          
          {/* Print-Only Official Brand Header */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-[#1A1A1A] pb-4 mb-4">
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#1A1A1A] uppercase block">
                {siteConfig.name}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#895029] font-semibold block">
                {siteConfig.tagline} • Official Atelier Tax Invoice
              </span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="font-mono text-xs font-bold text-[#1A1A1A] block">
                Invoice #{displayOrderCode}
              </span>
              <span className="text-[10px] text-[#766E65] block">
                Date: {formattedDate}
              </span>
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-[#766E65] print:hidden no-print"
          >
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Atelier
            </Link>
            <span className="text-[#d3c3bd]">/</span>
            <Link href="/account?tab=orders" className="hover:text-[#1A1A1A] transition-colors">
              Patron Orders
            </Link>
            <span className="text-[#d3c3bd]">/</span>
            <span className="font-mono text-[#1A1A1A] font-semibold">
              #{displayOrderCode}
            </span>
          </nav>

          {/* Header Title, Kicker & Top Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sans text-xs font-semibold tracking-wider text-[#895029] uppercase">
                  {siteConfig.name} Atelier Commission #{displayOrderCode}
                </span>

                {/* Status Badge */}
                <StatusBadge status={order.status} className="px-3 py-1 text-xs font-semibold" />
              </div>

              <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] font-medium tracking-tight">
                Commission Receipt &amp; Tracking
              </h1>

              <p className="text-xs sm:text-sm text-[#766E65]">
                Placed on <span className="font-sans tabular-nums font-semibold text-[#1A1A1A]">{formattedDate}</span>
                <span className="mx-2">•</span>
                Payment: <strong className="text-[#1A1A1A] font-medium">Inspection Upon Delivery (Zero Upfront)</strong>
              </p>
            </div>

            {/* Top Action: Download Tax Invoice */}
            <div className="flex items-center gap-3 shrink-0 print:hidden no-print">
              <PrintReceiptButton />
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-8 md:pt-10 space-y-8">

        {/* -------------------------------------------------------------
            B. Architectural Stepper / Status Timeline
           ------------------------------------------------------------- */}
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 md:p-8 shadow-xs space-y-6 print-invoice-card avoid-break timeline-stepper overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E1] pb-4">
            <div>
              <span className="font-sans text-xs font-semibold tracking-wider text-[#766E65] uppercase block">
                01. Atelier Craftsmanship Progression
              </span>
              <p className="font-serif text-xl text-[#1A1A1A] font-medium mt-0.5">
                Commission Status Timeline
              </p>
            </div>
            <div className="text-xs text-[#895029] font-medium flex items-center gap-1.5 bg-[#FAF9F6] border border-[#EAE7E1] px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>100% Solid Heartwood Joinery</span>
            </div>
          </div>

          {statusNorm === "cancelled" ? (
            <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#991B1B]/20 text-[#991B1B] text-xs flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
              <div>
                <p className="font-semibold text-sm">Commission Cancelled</p>
                <p className="text-[#991B1B]/80 mt-0.5">
                  This atelier commission has been marked cancelled. Please connect with our atelier concierge for support.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Desktop Stepper */}
              <div className="hidden md:grid grid-cols-4 gap-4 relative pt-2">
                {/* Background connector line */}
                <div className="absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-[#EAE7E1] -z-0" />
                {/* Active progress connector line */}
                <div
                  className="absolute top-7 left-[12.5%] h-0.5 bg-[#895029] -z-0 transition-all duration-500"
                  style={{
                    width: `${(Math.max(0, activeStepIndex) / (TRACKING_STEPS.length - 1)) * 75}%`,
                  }}
                />

                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  const isUpcoming = idx > activeStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center text-center space-y-2 relative z-10"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isDone
                            ? "bg-[#1A1A1A] text-white ring-4 ring-white shadow-xs"
                            : isCurrent
                            ? "bg-[#895029] text-white ring-4 ring-[#895029]/20 shadow-md scale-105"
                            : "bg-[#FAF9F6] text-[#766E65] border border-[#EAE7E1] ring-4 ring-white"
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                        )}
                      </div>
                      <div className="space-y-0.5 px-2">
                        <span className="font-sans text-[10px] font-bold tracking-wider text-[#766E65] uppercase block">
                          Phase 0{step.step}
                        </span>
                        <p
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? "text-[#895029]"
                              : isDone
                              ? "text-[#1A1A1A]"
                              : "text-[#766E65]"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-[#766E65] leading-tight max-w-[180px] mx-auto">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Stepper (Vertical) */}
              <div className="md:hidden space-y-3">
                {TRACKING_STEPS.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-[#FAF9F6] border-[#895029]/30 shadow-xs"
                          : "bg-white border-[#EAE7E1]/70"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                          isDone
                            ? "bg-[#1A1A1A] text-white"
                            : isCurrent
                            ? "bg-[#895029] text-white"
                            : "bg-[#F5F4F0] text-[#766E65]"
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-semibold ${isCurrent ? "text-[#895029]" : "text-[#1A1A1A]"}`}>
                          {step.title}
                        </p>
                        <p className="text-[11px] text-[#766E65]">{step.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Window or Actual Timestamp Indicator */}
              <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#EAE7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#895029] text-[20px] shrink-0">
                    schedule
                  </span>
                  <div>
                    <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-[#766E65] block">
                      Fulfillment Schedule
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {statusNorm === "delivered"
                        ? `Assembled on-site on ${formattedDate}`
                        : `Estimated White-Glove Placement Window: `}
                      {statusNorm !== "delivered" && (
                        <strong className="font-sans tabular-nums text-[#895029]">
                          {formattedEstWindow}
                        </strong>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#766E65] sm:text-right font-medium">
                  Direct Atelier White-Glove Dispatch
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            C. Commissioned Furniture Items Card
           ------------------------------------------------------------- */}
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 md:p-8 shadow-xs space-y-6 print-invoice-card avoid-break">
          <div className="flex items-center justify-between border-b border-[#EAE7E1] pb-4">
            <div>
              <span className="font-sans text-xs font-semibold tracking-wider text-[#766E65] uppercase block">
                02. Commissioned Heirlooms
              </span>
              <p className="font-serif text-xl text-[#1A1A1A] font-medium mt-0.5">
                Solid Wood Pieces in Production
              </p>
            </div>
            <span className="text-xs text-[#766E65]">
              {hydratedItems.length} {hydratedItems.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>

          <div className="divide-y divide-[#EAE7E1]">
            {hydratedItems.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 avoid-break"
              >
                <div className="flex items-center gap-4">
                  {/* Square Aspect Ratio Product Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F4F0] rounded-xl overflow-hidden shrink-0 border border-[#EAE7E1]">
                    {item.displayImage ? (
                      <Image
                        src={item.displayImage}
                        alt={item.displayTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#766E65]">
                        <span className="material-symbols-outlined text-[24px]">chair</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Timber Options */}
                  <div className="space-y-1">
                    <h3 className="font-serif text-base sm:text-lg font-medium text-[#1A1A1A] leading-tight">
                      {item.displayTitle}
                    </h3>
                    <p className="text-xs text-[#895029] font-medium">
                      {item.displayTimber}
                    </p>
                    <p className="font-sans text-xs text-[#766E65] tabular-nums">
                      Quantity: <strong className="text-[#1A1A1A]">{item.quantity}</strong> × ₹
                      {item.unit_price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0">
                  <span className="font-sans text-[10px] uppercase font-semibold text-[#766E65] block">
                    Line Total
                  </span>
                  <span className="font-sans tabular-nums font-semibold text-base sm:text-lg text-[#1A1A1A]">
                    ₹{item.line_total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------------------
            D. Delivery Destination & Concierge Details (2-Column Grid)
           ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start avoid-break">
          
          {/* Left Column: White-Glove Delivery Destination */}
          <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 md:p-8 shadow-xs space-y-4 print-invoice-card avoid-break">
            <div className="flex items-center justify-between border-b border-[#EAE7E1] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895029] text-[20px]">
                  location_on
                </span>
                <span className="font-sans text-xs font-semibold tracking-wider text-[#766E65] uppercase">
                  White-Glove Delivery Destination
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F5F4F0] text-[#766E65] border border-[#EAE7E1]">
                {addressTag}
              </span>
            </div>

            <div className="space-y-1">
              <p className="font-serif text-lg font-medium text-[#1A1A1A]">
                {order.customer_name}
              </p>
              <p className="text-sm text-[#4A453E] leading-relaxed whitespace-pre-line">
                {order.shipping_address || order.delivery_address}
              </p>
              <p className="text-xs font-mono text-[#766E65]">
                {order.city ? `${order.city}, ` : ""}{order.state ? `${order.state} — ` : ""}
                <span className="font-bold text-[#1A1A1A]">{order.pincode}</span>, India
              </p>
            </div>

            {/* Contact Details */}
            <div className="pt-3 border-t border-[#EAE7E1] space-y-1.5 text-xs text-[#766E65]">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#895029]">call</span>
                <span>
                  Delivery Phone:{" "}
                  <span className="font-mono text-[#1A1A1A] font-medium">+91 {cleanPhone}</span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#895029]">mail</span>
                <span>
                  Notification Email:{" "}
                  <span className="text-[#1A1A1A] font-medium">{order.customer_email}</span>
                </span>
              </p>
            </div>

            {/* White-Glove Dispatch Note */}
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#EAE7E1] flex items-start gap-2.5 text-xs text-[#766E65]">
              <span className="material-symbols-outlined text-[#895029] text-[18px] shrink-0 mt-0.5">
                verified
              </span>
              <p className="leading-relaxed">
                White-glove unboxing, leveling, and on-site joinery inspection included.
              </p>
            </div>
          </div>

          {/* Right Column: Financial Summary */}
          <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 md:p-8 shadow-xs flex flex-col justify-between space-y-6 print-invoice-card avoid-break">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EAE7E1] pb-3">
                <span className="material-symbols-outlined text-[#895029] text-[20px]">
                  receipt
                </span>
                <span className="font-sans text-xs font-semibold tracking-wider text-[#766E65] uppercase">
                  Financial Summary
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[#766E65]">
                <div className="flex justify-between items-center">
                  <span>Items Subtotal</span>
                  <span className="font-sans tabular-nums font-semibold text-[#1A1A1A]">
                    ₹{order.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>White-Glove Delivery &amp; Assembly</span>
                  <span className="text-[#895029] font-medium uppercase text-xs tracking-wider">
                    Complimentary
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>GST / Taxes (18% inclusive)</span>
                  <span className="font-sans tabular-nums font-medium text-[#1A1A1A]">
                    ₹{gstInclusiveAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Structural Lifetime Karigar Guarantee</span>
                  <span className="text-[#2D6A4F] font-medium uppercase text-[11px] tracking-wider">
                    Included
                  </span>
                </div>
              </div>
            </div>

            {/* Total Commission Value */}
            <div className="pt-4 border-t border-[#EAE7E1] space-y-1">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-sans text-xs font-semibold tracking-wider text-[#766E65] uppercase block">
                    Total Commission Value
                  </span>
                  <span className="text-[10px] text-[#766E65]">
                    Zero advance required · Inspect upon delivery
                  </span>
                </div>
                <span className="font-sans font-semibold text-2xl sm:text-3xl tabular-nums text-[#1A1A1A]">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* -------------------------------------------------------------
            E. Footer Return Actions
           ------------------------------------------------------------- */}
        <div className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EAE7E1] print:hidden no-print">
          <Link
            href="/account?tab=orders"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-[#EAE7E1] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Order History</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`mailto:${siteConfig.email}?subject=TEAK%20HAUS%20Atelier%20Commission%20%23${displayOrderCode}%20Inquiry`}
              className="w-full sm:w-auto px-6 py-3 bg-[#1A1A1A] hover:bg-[#895029] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">headset_mic</span>
              <span>Contact Atelier Concierge</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

function renderNotFound(reference: string) {
  return (
    <div className="w-full bg-[#FAF9F6] min-h-[80vh] flex items-center justify-center py-20 px-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE7E1] p-8 md:p-12 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#F5F4F0] text-[#766E65] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <div className="space-y-2">
          <span className="font-sans text-xs text-[#ba1a1a] uppercase tracking-widest font-semibold block">
            Reference Unavailable
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-medium">
            Order Not Found
          </h1>
          <p className="text-xs md:text-sm text-[#766E65] leading-relaxed">
            We could not find an atelier commission matching reference:
          </p>
          <p className="font-mono text-xs bg-[#FAF9F6] text-[#1A1A1A] py-1.5 px-3 rounded-lg border border-[#EAE7E1] inline-block max-w-full break-all">
            {reference}
          </p>
        </div>
        <p className="text-xs text-[#766E65] leading-relaxed">
          Please verify your commission code from your patron account or notification message.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account?tab=orders"
            className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-xs text-center"
          >
            My Commissions
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 bg-white border border-[#EAE7E1] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-xs uppercase tracking-widest font-semibold transition-all text-center"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}

function renderUnauthorized(reference: string, reason: "unauthenticated" | "forbidden") {
  const isUnauthenticated = reason === "unauthenticated";

  return (
    <div className="w-full bg-[#FAF9F6] min-h-[80vh] flex items-center justify-center py-20 px-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE7E1] p-8 md:p-12 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#92400E] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">
            {isUnauthenticated ? "lock" : "gpp_bad"}
          </span>
        </div>
        <div className="space-y-2">
          <span className="font-sans text-xs text-[#ba1a1a] uppercase tracking-widest font-semibold block">
            {isUnauthenticated ? "Authentication Required" : "Access Denied"}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-medium">
            {isUnauthenticated
              ? "Please Sign In to View This Order"
              : "This Commission Belongs to Another Patron"}
          </h1>
          <p className="text-xs md:text-sm text-[#766E65] leading-relaxed">
            {isUnauthenticated
              ? "Commission receipts are private. Sign in to the account associated with this order to view tracking and receipt details."
              : "You do not have permission to view this commission. Please ensure you are signed in with the correct patron account."}
          </p>
          {!isUnauthenticated && (
            <p className="font-mono text-xs bg-[#FAF9F6] text-[#1A1A1A] py-1.5 px-3 rounded-lg border border-[#EAE7E1] inline-block max-w-full break-all">
              Reference: {reference}
            </p>
          )}
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {isUnauthenticated ? (
            <Link
              href={`/account?redirect=/orders/${encodeURIComponent(reference)}`}
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-xs text-center"
            >
              Sign In to Continue
            </Link>
          ) : (
            <Link
              href="/account?tab=orders"
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-xs text-center"
            >
              My Commissions
            </Link>
          )}
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-[#EAE7E1] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-xs uppercase tracking-widest font-semibold transition-all text-center"
          >
            Return to Atelier
          </Link>
        </div>
      </div>
    </div>
  );
}

