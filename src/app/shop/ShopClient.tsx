"use client";

import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/database";

const categories = ["All Pieces", "Dining", "Living", "Storage", "Bedroom"];
const timberFilters = ["All Timbers", "Hunsur Teak", "Indian Rosewood", "Assam Teak"];

interface ShopClientProps {
  initialProducts: Product[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Pieces");
  const [selectedTimber, setSelectedTimber] = useState("All Timbers");
  const [sortBy, setSortBy] = useState("curated");

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

        {/* Product Grid */}
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
