import Link from "next/link";
import { getOrderByNumberOrId } from "@/lib/orders";
import PrintReceiptButton from "@/components/PrintReceiptButton";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Commission Queued",
    description: "Atelier logging & queue placement",
    icon: "receipt_long",
  },
  {
    key: "confirmed",
    label: "Grain Verified",
    description: "Moisture equilibrium checked",
    icon: "verified",
  },
  {
    key: "production",
    label: "Atelier Joinery",
    description: "Mortise & tenon kiln craft",
    icon: "carpenter",
  },
  {
    key: "dispatched",
    label: "White-Glove Dispatch",
    description: "Insured protective crate transport",
    icon: "local_shipping",
  },
  {
    key: "delivered",
    label: "Assembled & Placed",
    description: "White-glove room assembly complete",
    icon: "home",
  },
];

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;

  if (!id) {
    return renderNotFound("Unknown");
  }

  const order = await getOrderByNumberOrId(id);

  if (!order) {
    return renderNotFound(id);
  }

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Commissioned";

  const currentStepIndex =
    order.status === "cancelled"
      ? -1
      : STATUS_STEPS.findIndex((s) => s.key === order.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="w-full bg-[#fcf9f4] min-h-screen pb-24 print:bg-white print:pb-0">
      
      {/* Top Banner / Breadcrumbs */}
      <div className="bg-[#f0ede9] border-b border-[#d3c3bd]/40 py-10 md:py-14 print:py-4 print:border-b-2 print:bg-transparent">
        <div className="max-w-[960px] mx-auto px-6 space-y-4">
          
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#81746f] print:hidden">
            <Link href="/" className="hover:text-[#0e0300] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#0e0300] transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-[#0e0300] font-semibold">#{order.order_number}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="font-label-caps text-xs text-[#895029] uppercase tracking-widest font-semibold block">
                Atelier Commission Receipt
              </span>
              <h1 className="font-display text-3xl md:text-4xl text-[#0e0300] font-normal tracking-tight">
                Order #{order.order_number}
              </h1>
              <p className="text-xs md:text-sm text-[#81746f]">
                Commissioned on <span className="font-medium text-[#0e0300]">{formattedDate}</span> by{" "}
                <span className="font-medium text-[#0e0300]">{order.customer_name}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Payment Method Badge */}
              <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#d3c3bd] text-[11px] font-semibold tracking-wide text-[#2c1a11] shadow-2xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#895029]">payments</span>
                <span>{order.payment_method === "offline" ? "Pay on Delivery & Placement" : order.payment_method}</span>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs flex items-center gap-1.5 ${
                  order.status === "delivered"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : order.status === "cancelled"
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-[#895029]/10 text-[#895029] border-[#895029]/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span className="capitalize">{order.status}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 pt-10 space-y-10">

        {/* 1. Status Progress Indicator */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ede9] pb-4">
            <div>
              <h2 className="font-display text-lg text-[#0e0300] font-normal">
                Atelier Craftsmanship Progression
              </h2>
              <p className="text-xs text-[#81746f]">
                Real-time phase tracked by our Bangalore guild workshop.
              </p>
            </div>
            <div className="text-xs text-[#895029] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>100% Solid Heartwood</span>
            </div>
          </div>

          {order.status === "cancelled" ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
              <div>
                <p className="font-semibold text-sm">Commission Cancelled</p>
                <p className="text-rose-700">This order has been cancelled and will not enter kiln preparation.</p>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              {/* Desktop Stepper */}
              <div className="hidden md:grid grid-cols-5 gap-2 relative">
                {/* Connecting background line */}
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#e5e2dd] -z-0" />
                {/* Active progress fill line */}
                <div
                  className="absolute top-5 left-8 h-0.5 bg-[#895029] -z-0 transition-all duration-500"
                  style={{
                    width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx < activeIndex;
                  const isCurrent = idx === activeIndex;
                  const isUpcoming = idx > activeIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isDone
                            ? "bg-[#0e0300] text-white ring-4 ring-white shadow-xs"
                            : isCurrent
                            ? "bg-[#895029] text-white ring-4 ring-[#895029]/20 shadow-md scale-110"
                            : "bg-[#f6f3ee] text-[#81746f] border border-[#d3c3bd] ring-4 ring-white"
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                        )}
                      </div>
                      <div className="space-y-0.5 px-1">
                        <p
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? "text-[#895029]"
                              : isDone
                              ? "text-[#0e0300]"
                              : "text-[#81746f]"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-[#81746f] leading-tight">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Stepper (Stacked) */}
              <div className="md:hidden space-y-4">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx < activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div
                      key={step.key}
                      className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? "bg-[#895029]/5 border border-[#895029]/20"
                          : "opacity-80"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                          isDone
                            ? "bg-[#0e0300] text-white"
                            : isCurrent
                            ? "bg-[#895029] text-white shadow-xs"
                            : "bg-[#f0ede9] text-[#81746f]"
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-semibold ${isCurrent ? "text-[#895029]" : "text-[#0e0300]"}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-[#81746f]">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Status Explanatory Note */}
          <div className="p-4 bg-[#faf8f5] rounded-xl border border-[#e5e2dd] flex items-start gap-3 text-xs text-[#4f4540]">
            <span className="material-symbols-outlined text-[#895029] text-[20px] shrink-0 mt-0.5">info</span>
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-semibold text-[#0e0300] block">
                {order.status === "pending" && "Atelier Review & Timber Selection"}
                {order.status === "confirmed" && "Moisture Balancing in Bangalore Atmosphere"}
                {order.status === "production" && "Hand Mortise & Tenon Joinery in Progress"}
                {order.status === "dispatched" && "Protective Solid Wooden Crate in Transit"}
                {order.status === "delivered" && "White-Glove Placement Completed"}
                {order.status === "cancelled" && "Commission Cancelled"}
              </span>
              <p className="text-[11px] text-[#81746f]">
                {order.status === "pending" &&
                  "Our master karigar is reviewing the grain specification. You will be contacted within 24 hours to schedule white-glove placement."}
                {order.status === "confirmed" &&
                  "The timber lot has been inspected and allocated for your order."}
                {order.status === "production" &&
                  "Artisan woodworkers are sculpting the components with hand-rubbed organic beeswax & tung oil finish."}
                {order.status === "dispatched" &&
                  "Our Bangalore delivery crew has loaded the pieces into our climate-controlled white-glove transport vehicle."}
                {order.status === "delivered" &&
                  "Thank you for acquiring handcrafted heirloom furniture from KILN STUDIO."}
                {order.status === "cancelled" &&
                  "This commission has been cancelled. Contact our atelier concierge if you believe this is an error."}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Itemized Summary Table */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#f0ede9] bg-white">
            <h2 className="font-display text-lg text-[#0e0300] font-normal">
              Acquisition Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f0ede9] bg-[#faf8f5] text-[10px] uppercase font-bold tracking-wider text-[#81746f]">
                  <th className="py-3.5 px-6">Handcrafted Piece</th>
                  <th className="py-3.5 px-6">Selected Timber</th>
                  <th className="py-3.5 px-6 text-center">Quantity</th>
                  <th className="py-3.5 px-6 text-right">Unit Price</th>
                  <th className="py-3.5 px-6 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ede9] text-xs text-[#0e0300] bg-white">
                {order.order_items && order.order_items.length > 0 ? (
                  order.order_items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-4 px-6 font-medium">
                        {item.product_name}
                      </td>
                      <td className="py-4 px-6 text-[#895029] font-medium">
                        {item.timber_option || "Atelier Standard"}
                      </td>
                      <td className="py-4 px-6 text-center text-[#4f4540]">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 text-right text-[#4f4540]">
                        ₹{item.unit_price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-right font-display font-semibold text-sm">
                        ₹{item.line_total.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-[#81746f]">
                      No items recorded in this commission.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="p-6 bg-white border-t border-[#f0ede9] space-y-3">
            <div className="flex justify-between text-xs text-[#4f4540]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#0e0300]">₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs text-[#4f4540]">
              <span>Bengaluru White-Glove Installation &amp; Assembly</span>
              <span className="text-[#895029] font-semibold uppercase tracking-wider text-[11px]">Complimentary</span>
            </div>
            <div className="flex justify-between text-xs text-[#4f4540]">
              <span>Structural Lifetime Karigar Warranty</span>
              <span className="text-[#895029] font-semibold text-[11px]">Included</span>
            </div>
            <div className="pt-4 border-t border-[#e5e2dd] flex justify-between items-baseline">
              <div>
                <span className="font-display text-base text-[#0e0300] font-medium block">Total Amount</span>
                <span className="text-[10px] text-[#81746f]">Zero advance required · Inspect in person before final payment</span>
              </div>
              <span className="font-display text-2xl md:text-3xl font-semibold text-[#0e0300]">
                ₹{order.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Shipping & Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#0e0300]">
              <span className="material-symbols-outlined text-[#895029] text-[20px]">location_on</span>
              <h3 className="text-xs font-bold uppercase tracking-wider">Delivery Destination</h3>
            </div>
            <div className="space-y-1 text-xs text-[#4f4540] pl-7">
              <p className="font-semibold text-[#0e0300] text-sm">{order.customer_name}</p>
              <p className="leading-relaxed whitespace-pre-line">{order.delivery_address}</p>
              <p className="font-medium text-[#0e0300]">Pincode: {order.pincode}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#0e0300]">
              <span className="material-symbols-outlined text-[#895029] text-[20px]">contacts</span>
              <h3 className="text-xs font-bold uppercase tracking-wider">Client Contact</h3>
            </div>
            <div className="space-y-1 text-xs text-[#4f4540] pl-7">
              <p>Email: <span className="text-[#0e0300] font-medium">{order.customer_email}</span></p>
              <p>Phone: <span className="text-[#0e0300] font-medium">{order.customer_phone}</span></p>
              <p className="text-[11px] text-[#81746f] pt-2 leading-normal">
                Our atelier concierge will coordinate with you at this contact prior to vehicle dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0e0300] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-sm text-center flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">chair</span>
            <span>Continue Shopping</span>
          </Link>

          <PrintReceiptButton />
        </div>

      </div>
    </div>
  );
}

function renderNotFound(reference: string) {
  return (
    <div className="w-full bg-[#fcf9f4] min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#e5e2dd] p-8 md:p-12 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#f0ede9] text-[#81746f] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <div className="space-y-2">
          <span className="font-label-caps text-xs text-[#ba1a1a] uppercase tracking-widest font-semibold block">
            Reference Unavailable
          </span>
          <h1 className="font-display text-2xl md:text-3xl text-[#0e0300] font-normal">
            Order Not Found
          </h1>
          <p className="text-xs md:text-sm text-[#81746f] leading-relaxed">
            We could not find an atelier commission matching reference:
          </p>
          <p className="font-mono text-xs bg-[#f6f3ee] text-[#0e0300] py-1.5 px-3 rounded-lg border border-[#e5e2dd] inline-block max-w-full break-all">
            {reference}
          </p>
        </div>
        <p className="text-xs text-[#81746f] leading-relaxed">
          Please verify your order number from your confirmation message, or explore our handcrafted Bangalore catalog.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="px-6 py-3 bg-[#0e0300] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-xs text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-[#d3c3bd] hover:border-[#0e0300] text-[#0e0300] rounded-xl text-xs uppercase tracking-widest font-semibold transition-all text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
