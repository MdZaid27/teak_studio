"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/database";

const categories = ["All Pieces", "Dining", "Living", "Storage", "Bedroom"];
const timberFilters = ["All Timbers", "Hunsur Teak", "Indian Rosewood", "Assam Teak"];

interface ShopClientProps {
  initialProducts: Product[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All Pieces");
  const [selectedTimber, setSelectedTimber] = useState("All Timbers");
  const [sortBy, setSortBy] = useState("curated");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter and sort products in-memory from server-provided initialProducts
  const filteredProducts = initialProducts
    .filter((product) => {
      const matchCategory =
        selectedCategory === "All Pieces" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchTimber =
        selectedTimber === "All Timbers" ||
        product.timber.toLowerCase().includes(selectedTimber.toLowerCase());

      return matchCategory && matchTimber;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });

  const handleQuickAdd = (product: Product) => {
    addItem({
      id: product.id,
      productId: product.id,
      timberOption: product.timber,
      name: product.name,
      timber: product.timber,
      finish: "Natural Hand-Rubbed Beeswax",
      price: product.price,
      image: product.image,
      dimensions: product.dimensions,
    });
    setToastMessage(`Added ${product.name} to your bag`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="w-full bg-[#fcf9f4] pb-24">
      {/* Header Banner */}
      <div className="bg-[#f0ede9] border-b border-[#d3c3bd]/40 py-14 md:py-20">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 text-center space-y-3">
          <span className="font-label-caps text-xs text-[#895029] uppercase tracking-widest font-semibold block">
            The Living Catalog
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-[#0e0300] font-normal tracking-tight">
            Our Collection
          </h1>
          <p className="text-sm md:text-base text-[#4f4540] max-w-2xl mx-auto font-light leading-relaxed">
            Ethically sourced Indian heartwood furniture handcrafted by master karigars for Bangalore residences. Ready for white-glove home installation or custom dimensioning.
          </p>
        </div>
      </div>

      {/* Main Filter & Products Area */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 pt-10">
        
        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-[#e5e2dd]">
          
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  selectedCategory === cat
                    ? "bg-[#0e0300] text-white shadow-xs"
                    : "bg-white text-[#4f4540] border border-[#d3c3bd] hover:border-[#0e0300]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Timber Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#81746f] hidden sm:inline">Timber:</span>
              <select
                value={selectedTimber}
                onChange={(e) => setSelectedTimber(e.target.value)}
                className="bg-white border border-[#d3c3bd] rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]"
              >
                {timberFilters.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#81746f] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#d3c3bd] rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]"
              >
                <option value="curated">Curated &amp; Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="my-4 p-3 bg-[#feb383]/20 border border-[#895029]/30 rounded-lg flex items-center justify-between text-xs text-[#0e0300] animate-in fade-in">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#895029] text-[18px]">check_circle</span>
              {toastMessage}
            </span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="font-bold underline text-[#895029] uppercase tracking-wider text-[11px]"
            >
              Open Bag
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="relative group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e5e2dd] hover:border-[#895029] hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Entire Card Clickable Link to Product Detail Page */}
              <Link
                href={product.link}
                className="absolute inset-0 z-0"
                aria-label={`View details for ${product.name}`}
              />

              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-[#f6f3ee] overflow-hidden pointer-events-none">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.isPopular && (
                  <span className="absolute top-3 left-3 bg-[#0e0300]/80 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-auto">
                    Atelier Highlight
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#895029] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#d3c3bd]/30 pointer-events-auto">
                  {product.timber}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 pointer-events-none">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#81746f]">
                    {product.category} Collection
                  </div>
                  <h3 className="font-display text-lg text-[#0e0300] font-normal leading-snug group-hover:text-[#895029] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#81746f] line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-[11px] text-[#4f4540] font-medium pt-1">
                    Dimensions: {product.dimensions}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f0ede9] flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-[#0e0300]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  
                  {/* Quick Add To Bag Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAdd(product);
                    }}
                    className="relative z-10 pointer-events-auto p-2.5 bg-[#0e0300] hover:bg-[#895029] text-white rounded-lg transition-all flex items-center justify-center shadow-xs active:scale-95"
                    title="Add to Atelier Bag"
                    aria-label={`Add ${product.name} to bag`}
                  >
                    <span className="material-symbols-outlined text-[19px]">add_shopping_cart</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Custom Dimensions Commission Callout Banner */}
        <div className="mt-20 bg-[#2c1a11] text-white rounded-3xl p-8 md:p-14 relative overflow-hidden border border-[#895029]/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <span className="font-label-caps text-[#feb383] text-xs uppercase tracking-widest block font-semibold">
                Custom Joinery &amp; Sizing
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-[#fcf9f4] font-normal leading-tight">
                Commission Custom Dimensions &amp; Millwork with Our Bengaluru Guild.
              </h2>
              <p className="text-sm text-[#d3c3bd] max-w-2xl font-light leading-relaxed">
                Need a 10-seater dining table sized for your Bellandur penthouse terrace, or a fluted credenza matched to your specific wall niche? Our master draughtsmen and karigars produce 1-of-1 architectural pieces.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/bespoke"
                className="w-full text-center py-3.5 px-6 bg-[#feb383] hover:bg-white text-[#0e0300] text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors shadow-md">
                Explore Bespoke Studio
              </Link>
              <Link
                href="/bespoke#booking"
                className="w-full text-center py-3.5 px-6 border border-[#feb383]/40 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors">
                Book Indiranagar Consultation
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
