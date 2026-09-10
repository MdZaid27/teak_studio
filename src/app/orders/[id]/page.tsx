import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumberOrId } from "@/lib/orders";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const order = await getOrderByNumberOrId(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="w-full bg-[#fcf9f4] min-h-screen pb-24">
      {/* Header Banner */}
      <div className="bg-[#f0ede9] border-b border-[#d3c3bd]/40 py-12 md:py-16">
        <div className="max-w-[800px] mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#895029] text-white mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[28px]">check_circle</span>
          </div>

          <div className="space-y-1">
            <span className="font-label-caps text-xs text-[#895029] uppercase tracking-widest font-semibold block">
              Commission Received
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-[#0e0300] font-normal tracking-tight">
              Order #{order.order_number}
            </h1>
          </div>

          <p className="text-sm md:text-base text-[#4f4540] max-w-lg mx-auto font-light leading-relaxed">
            Thank you, <span className="font-medium text-[#0e0300]">{order.customer_name}</span>. Your heirloom commission has been queued with our artisan woodworkers.
          </p>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="max-w-[800px] mx-auto px-6 pt-10 space-y-8">
        
        {/* Status Notice */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81746f] block">
              Atelier Status
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-sm font-semibold text-[#0e0300] capitalize">
                {order.status} — Guild Review
              </span>
            </div>
            <p className="text-xs text-[#81746f]">
              Our head karigar will verify timber moisture equilibrium prior to kiln preparation.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81746f] block">
              Payment Method
            </span>
            <span className="text-xs font-semibold text-[#0e0300] uppercase tracking-wide">
              {order.payment_method === "offline" ? "Pay on Delivery / Placement" : order.payment_method}
            </span>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="bg-white rounded-2xl border border-[#e5e2dd] overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#f0ede9]">
            <h2 className="font-display text-lg text-[#0e0300] font-normal">
              Acquisition Summary
            </h2>
          </div>

          <div className="divide-y divide-[#f0ede9]">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#0e0300]">
                      {item.product_name}
                    </h3>
                    {item.timber_option && (
                      <p className="text-xs text-[#895029] font-medium">
                        Timber: {item.timber_option}
                      </p>
                    )}
                    <p className="text-xs text-[#81746f]">
                      Qty: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-display text-base font-semibold text-[#0e0300]">
                      ₹{item.line_total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-[#81746f]">No items recorded.</div>
            )}
          </div>

          {/* Pricing Totals */}
          <div className="p-6 bg-[#fcf9f4] border-t border-[#f0ede9] space-y-2">
            <div className="flex justify-between text-xs text-[#4f4540]">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs text-[#4f4540]">
              <span>Bengaluru White-Glove Installation</span>
              <span className="text-[#895029] font-semibold">Complimentary</span>
            </div>
            <div className="pt-3 border-t border-[#d3c3bd]/50 flex justify-between items-baseline">
              <span className="font-display text-base text-[#0e0300] font-medium">Total Amount</span>
              <span className="font-display text-2xl font-semibold text-[#0e0300]">
                ₹{order.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery & Client Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81746f] block">
              Delivery Destination
            </span>
            <div className="space-y-1 text-xs text-[#4f4540]">
              <p className="font-semibold text-[#0e0300] text-sm">{order.customer_name}</p>
              <p className="leading-relaxed whitespace-pre-line">{order.delivery_address}</p>
              <p className="font-medium text-[#0e0300]">Pincode: {order.pincode}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e2dd] p-6 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81746f] block">
              Direct Contact
            </span>
            <div className="space-y-1 text-xs text-[#4f4540]">
              <p>Email: <span className="text-[#0e0300] font-medium">{order.customer_email}</span></p>
              <p>Phone: <span className="text-[#0e0300] font-medium">{order.customer_phone}</span></p>
              <p className="text-[11px] text-[#81746f] pt-2">
                Our atelier team will contact you within 24 hours to confirm installation scheduling.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0e0300] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-sm text-center"
          >
            Explore Catalog
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#d3c3bd] hover:border-[#0e0300] text-[#0e0300] rounded-xl text-xs uppercase tracking-widest font-semibold transition-all text-center"
          >
            Return Home
          </Link>
        </div>

      </div>
    </div>
  );
}
