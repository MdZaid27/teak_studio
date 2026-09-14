"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import CustomSelect from "@/components/ui/CustomSelect";
import type { Product } from "@/types/database";

const categories = ["All Pieces", "Dining", "Living", "Seating", "Storage", "Bedroom"];

const sortOptions = [
  { value: "curated", label: "Curated & Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

interface ShopClientProps {
  initialProducts: Product[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Pieces");
  const [sortBy, setSortBy] = useState("curated");

  // Filter and sort products in-memory from server-provided initialProducts
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const prodCat = (product.category || "").toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        const matchCategory =
          selectedCategory === "All Pieces" ||
          prodCat === selCat ||
          prodCat.includes(selCat) ||
          selCat.includes(prodCat);

        return matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [initialProducts, selectedCategory, sortBy]);

  return (
    <div className="w-full bg-[#fcf9f4] pb-24">
      {/* Header Banner */}
      <div className="bg-[#f0ede9] border-b border-[#d3c3bd]/40 py-14 md:py-20">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 text-center space-y-3">
          <span className="font-label-caps text-xs text-[#895029] uppercase tracking-widest font-semibold block">
            The Living Catalog
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-[#0e0300] font-normal tracking-tight">
            Our Collection
          </h1>
          <p className="text-sm md:text-base text-[#4f4540] max-w-2xl mx-auto font-light leading-relaxed">
            Ethically sourced Indian heartwood furniture handcrafted by master karigars for discerning residences. Ready for white-glove home installation or custom dimensioning.
          </p>
        </div>
      </div>

      {/* Main Filter & Products Area */}
      <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 pt-10">
        
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

          {/* Sorting */}
          <div className="flex items-center gap-2 text-xs w-full lg:w-auto justify-end">
            <span className="text-[#81746f] hidden sm:inline font-medium">Sort:</span>
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              variant="light"
              align="right"
            />
          </div>
        </div>

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
                Commission Custom Dimensions &amp; Millwork with Our Atelier Guild.
              </h2>
              <p className="text-sm text-[#d3c3bd] max-w-2xl font-light leading-relaxed">
                Need a 10-seater dining table sized for your penthouse terrace, or a fluted credenza matched to your specific wall niche? Our master draughtsmen and karigars produce 1-of-1 architectural pieces.
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
                Book Studio Consultation
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
