"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/database";

interface ProductDetailClientProps {
  product: Product;
  companions: Product[];
}

export default function ProductDetailClient({ product, companions }: ProductDetailClientProps) {
  const { addItem, setIsCartOpen } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTimberIndex, setSelectedTimberIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "provenance" | "delivery" | "care">("specs");
  const [pincode, setPincode] = useState("560038");
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(
    "Pincode 560038 (Indiranagar) is eligible for priority 48-Hour White-Glove Assembly."
  );
  const [addedToast, setAddedToast] = useState(false);

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [{ src: product.image, alt: product.name, title: "Studio View" }];

  const timbers = product.timbers && product.timbers.length > 0
    ? product.timbers
    : [
        {
          id: "primary",
          name: product.timber,
          provenance: "Government Depot Lot, South India",
          swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
          price: product.price,
          desc: "Sustainably harvested and kiln-dried to South India's atmospheric equilibrium.",
        },
      ];

  const currentTimber = timbers[selectedTimberIndex] || timbers[0];
  const unitPrice = currentTimber.price || product.price;

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.startsWith("560")) {
      setPincodeMessage(`Pincode ${pincode} eligible for complimentary Bengaluru White-Glove installation & assembly.`);
    } else {
      setPincodeMessage(`Outside Bangalore municipal core: Insured wooden crate dispatch in 4–6 business days.`);
    }
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: `${product.id}-${currentTimber.id}`,
        productId: product.id,
        timberOption: currentTimber.name,
        name: `${product.name} (${currentTimber.name})`,
        timber: currentTimber.name,
        finish: "Hand-Rubbed Organic Beeswax & Tung Oil",
        price: unitPrice,
        image: gallery[0].src,
        dimensions: product.dimensions,
      },
      quantity
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="w-full bg-[#fcf9f4] pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 pt-8 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#81746f]">
          <Link href="/" className="hover:text-[#0e0300] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0e0300] transition-colors">Collections</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#0e0300] transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#0e0300] font-semibold">{product.name}</span>
        </nav>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full bg-[#f6f3ee] rounded-2xl overflow-hidden border border-[#d3c3bd]/50 shadow-sm group">
              <Image
                src={gallery[activeImageIndex]?.src || product.image}
                alt={gallery[activeImageIndex]?.alt || product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-[#fcf9f4]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider text-[#895029] border border-[#d3c3bd]/40">
                {gallery[activeImageIndex]?.title || "Atelier Studio"}
              </div>
            </div>

            {/* Gallery Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all bg-[#f6f3ee] ${
                      activeImageIndex === idx
                        ? "border-[#895029] shadow-sm ring-1 ring-[#895029]"
                        : "border-[#e5e2dd] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Sourcing Badges */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 bg-white rounded-xl border border-[#e5e2dd] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#895029] text-[20px]">verified</span>
                <div>
                  <h5 className="text-[11px] font-semibold text-[#0e0300] uppercase tracking-wider">100% Solid</h5>
                  <p className="text-[10px] text-[#81746f]">Zero veneer or MDF</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e5e2dd] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#895029] text-[20px]">precision_manufacturing</span>
                <div>
                  <h5 className="text-[11px] font-semibold text-[#0e0300] uppercase tracking-wider">Mortise &amp; Tenon</h5>
                  <p className="text-[10px] text-[#81746f]">Hand-pegged joinery</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e5e2dd] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#895029] text-[20px]">local_shipping</span>
                <div>
                  <h5 className="text-[11px] font-semibold text-[#0e0300] uppercase tracking-wider">Bengaluru Setup</h5>
                  <p className="text-[10px] text-[#81746f]">White-glove placement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Purchasing & Specifications (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Title & Price Header */}
            <div className="space-y-2 border-b border-[#d3c3bd]/50 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#895029]">
                  {product.category} &bull; {currentTimber.name}
                </span>
                <span className="text-[10px] bg-[#895029]/10 text-[#895029] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {product.leadTime || "Bangalore In-Stock"}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-[#0e0300] font-normal leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-[#4f4540] leading-relaxed">
                {product.tagline || product.description}
              </p>
              
              <div className="flex items-baseline gap-4 pt-2">
                <span className="font-display text-3xl font-semibold text-[#0e0300]">
                  ₹{(unitPrice * quantity).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#81746f]">
                  Inclusive of all Bangalore taxes &bull; Lifetime Joinery Guarantee
                </span>
              </div>
            </div>

            {/* Timber Selection */}
            {timbers.length > 1 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#0e0300] uppercase tracking-wider text-[11px]">
                    1. Select Provenance Timber:
                  </span>
                  <Link href="/wood-types" className="text-[#895029] hover:underline text-[11px]">
                    Compare Wood Terroirs &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {timbers.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTimberIndex(idx)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedTimberIndex === idx
                          ? "bg-white border-[#895029] shadow-xs ring-1 ring-[#895029]"
                          : "bg-white/60 border-[#e5e2dd] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#d3c3bd]">
                          <Image src={t.swatch} alt={t.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#0e0300]">{t.name}</div>
                          <div className="text-[10px] text-[#81746f]">{t.provenance}</div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#0e0300]">
                        ₹{t.price.toLocaleString("en-IN")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#d3c3bd] rounded-xl bg-white px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-xs text-[#0e0300] hover:text-[#895029]"
                    aria-label="Decrease quantity"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="px-3 text-xs font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-xs text-[#0e0300] hover:text-[#895029]"
                    aria-label="Increase quantity"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-[#0e0300] hover:bg-[#895029] text-white rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>Add to Atelier Bag — ₹{(unitPrice * quantity).toLocaleString("en-IN")}</span>
                </button>
              </div>

              {addedToast && (
                <div className="p-3 bg-[#895029] text-white rounded-xl text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Added {quantity} × {product.name} to your bag.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="underline text-[11px] font-semibold"
                  >
                    View Bag
                  </button>
                </div>
              )}
            </div>

            {/* Pincode Check */}
            <div className="p-4 bg-white rounded-2xl border border-[#e5e2dd] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                Bangalore White-Glove Delivery
              </span>
              <form onSubmit={checkPincode} className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="bg-[#fcf9f4] border border-[#d3c3bd] rounded-lg px-3 py-1.5 text-xs text-[#0e0300] flex-1 focus:outline-none focus:border-[#895029]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#2c1a11] hover:bg-[#895029] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Check
                </button>
              </form>
              {pincodeMessage && (
                <p className="text-[11px] text-[#4f4540] pt-1 leading-normal">
                  {pincodeMessage}
                </p>
              )}
            </div>

            {/* Atelier Consultation Callout */}
            <div className="p-4 bg-[#f0ede9] rounded-2xl border border-[#d3c3bd]/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#0e0300] uppercase tracking-wider">Inspect in Person</h4>
                <p className="text-[11px] text-[#4f4540]">
                  Available at Indiranagar 100ft Rd &amp; VR Whitefield Studios.
                </p>
              </div>
              <Link
                href="/bespoke#booking"
                className="px-3 py-1.5 bg-white border border-[#2c1a11]/30 hover:bg-[#2c1a11] hover:text-white text-[#2c1a11] text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all"
              >
                Book Visit
              </Link>
            </div>

          </div>
        </div>

        {/* Craftsmanship & Climatological Joinery Section */}
        <section className="mt-20 pt-16 border-t border-[#d3c3bd]/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f6f3ee] border border-[#d3c3bd]/40">
              <Image
                src="/images/stitch_screen_5176c23da1f34decb0b0abd6d0e8bcfb.png"
                alt="Macro close-up of hand-cut traditional mortise tenon wood joint"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-[#fcf9f4]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-[#2c1a11] border border-[#d3c3bd]">
                Hand-cut mortise and tenon wood joint with silky natural wax finish
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <span className="font-label-caps text-[11px] text-[#895029] uppercase tracking-widest font-semibold block">
                Permanence by Design
              </span>
              <h2 className="font-display text-3xl text-[#0e0300] font-normal leading-tight">
                Built for South India&apos;s Atmospheric Cycles.
              </h2>
              <p className="text-sm text-[#4f4540] leading-relaxed">
                Modern fast furniture relies on industrial screws and toxic MDF adhesives that fail under humidity fluctuations. At KILN STUDIO, our Karigars sculpt each piece using authentic interlocking timber joinery.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[#895029] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0e0300]">Naturally Seasoned for 180 Days</h4>
                    <p className="text-xs text-[#81746f]">Equilibrated to 8–10% moisture content to eliminate timber warping or cracks in air-conditioned Bangalore homes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[#895029] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0e0300]">Authentic Interlocking Joinery</h4>
                    <p className="text-xs text-[#81746f]">Blind mortise-and-tenons and hardwood dowels that expand and contract in harmony with natural weather.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specification & Provenance Tabs */}
        <section className="mt-16 pt-12 border-t border-[#d3c3bd]/50">
          <div className="flex border-b border-[#d3c3bd] gap-8 overflow-x-auto">
            {[
              { id: "specs", label: "Dimensions & Architecture" },
              { id: "provenance", label: "Timber Terroir" },
              { id: "delivery", label: "Bangalore White-Glove" },
              { id: "care", label: "Care & Maintenance" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "specs" | "provenance" | "delivery" | "care")}
                className={`pb-4 text-xs uppercase tracking-widest font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#895029] text-[#0e0300]"
                    : "border-transparent text-[#81746f] hover:text-[#0e0300]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-5 bg-white rounded-xl border border-[#e5e2dd] space-y-2">
                  <strong className="text-sm font-display text-[#0e0300] block">Dimensions</strong>
                  <p className="text-[#4f4540]">Dimensions: {product.dimensions}</p>
                  <p className="text-[#4f4540]">Scale: Custom architectural sizing available</p>
                  <p className="text-[#4f4540]">Proportions: Ergonomically tested for urban Bangalore homes</p>
                </div>
                <div className="p-5 bg-white rounded-xl border border-[#e5e2dd] space-y-2">
                  <strong className="text-sm font-display text-[#0e0300] block">Joinery &amp; Build</strong>
                  <p className="text-[#4f4540]">Joints: Mortise &amp; Tenon with internal dowel pins</p>
                  <p className="text-[#4f4540]">Fasteners: Zero metallic nails or cheap brackets</p>
                  <p className="text-[#4f4540]">Material: 100% Solid {product.timber}</p>
                </div>
                <div className="p-5 bg-white rounded-xl border border-[#e5e2dd] space-y-2">
                  <strong className="text-sm font-display text-[#0e0300] block">Finish &amp; Warranty</strong>
                  <p className="text-[#4f4540]">Finish: Hand-rubbed organic beeswax &amp; tung oil</p>
                  <p className="text-[#4f4540]">VOC Content: 0% Non-toxic food-safe finish</p>
                  <p className="text-[#4f4540]">Warranty: Structural Lifetime Guarantee</p>
                </div>
              </div>
            )}

            {activeTab === "provenance" && (
              <div className="p-6 bg-white rounded-xl border border-[#e5e2dd] space-y-3 text-xs text-[#4f4540]">
                <h3 className="text-sm font-display font-medium text-[#0e0300]">Ethical Harvest Traceability</h3>
                <p>
                  Every timber plank for the {product.name} is acquired through legal government forest auctions and certified private plantations in South India. Each piece comes with a traceable harvest lot certificate.
                </p>
                <p>
                  Our hardwoods are kiln-dried and seasoned for over 180 days to achieve an 8–10% equilibrium moisture content, calibrated specifically for South India’s monsoon and summer transitions.
                </p>
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="p-6 bg-white rounded-xl border border-[#e5e2dd] space-y-3 text-xs text-[#4f4540]">
                <h3 className="text-sm font-display font-medium text-[#0e0300]">Bengaluru Concierge Fulfillment</h3>
                <p>
                  All orders in Bengaluru are handled directly by our in-house atelier transport. Your furniture arrives padded and handled with utmost care. Our master carpenters will assemble, level, and apply a fresh coat of beeswax upon placement.
                </p>
              </div>
            )}

            {activeTab === "care" && (
              <div className="p-6 bg-white rounded-xl border border-[#e5e2dd] space-y-3 text-xs text-[#4f4540]">
                <h3 className="text-sm font-display font-medium text-[#0e0300]">Maintaining Solid Timber</h3>
                <p>
                  Dust periodically with a clean microfiber cloth. Every 12 to 18 months, apply a small amount of KILN STUDIO Organic Beeswax balm to nourish the timber grain and preserve natural oils.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Curated Companions Section */}
        {companions.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#d3c3bd]/50">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="font-label-caps text-xs text-[#895029] uppercase tracking-widest block mb-1">
                  Harmonious Pairings
                </span>
                <h3 className="font-display text-2xl text-[#0e0300]">
                  Curated Companions for {product.name}
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest font-semibold text-[#895029] hover:text-[#0e0300] flex items-center gap-1"
              >
                View Full Collection
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companions.map((comp) => (
                <Link
                  key={comp.id}
                  href={comp.link}
                  className="group bg-white rounded-xl p-4 border border-[#e5e2dd] hover:border-[#895029] hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#f6f3ee] mb-3">
                    <Image
                      src={comp.image}
                      alt={comp.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-[#895029] font-bold uppercase tracking-wider">{comp.timber}</span>
                  <h4 className="font-display text-base text-[#0e0300] group-hover:text-[#895029] transition-colors">
                    {comp.name}
                  </h4>
                  <p className="text-xs text-[#81746f] mt-1">₹{comp.price.toLocaleString("en-IN")} &bull; {comp.dimensions}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
