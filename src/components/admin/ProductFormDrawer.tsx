"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types/database";
import { TIMBER_DEFINITIONS } from "@/lib/products";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (savedProduct: Product, isNew: boolean) => void;
}

const CATEGORY_OPTIONS = [
  { value: "dining", label: "Dining Tables & Dining" },
  { value: "living", label: "Living Room" },
  { value: "seating", label: "Seating & Chairs" },
  { value: "storage", label: "Storage & Credenzas" },
  { value: "bedroom", label: "Bedroom & Beds" },
  { value: "bespoke", label: "Bespoke Architectural" },
];

const AVAILABLE_TIMBERS = [
  {
    id: "hunsur-teak",
    name: "Hunsur Teak",
    origin: "Mysore / Karnataka",
    swatch: "/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png",
    defaultDelta: 0,
  },
  {
    id: "indian-rosewood",
    name: "Malabar Rosewood",
    origin: "Malabar / Western Ghats",
    swatch: "/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png",
    defaultDelta: 8000,
  },
  {
    id: "assam-teak",
    name: "Assam Teak",
    origin: "North-East Foothills",
    swatch: "/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png",
    defaultDelta: -2000,
  },
];



function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductFormDrawer({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductFormDrawerProps) {
  const isEditing = Boolean(product);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState("dining");
  const [basePrice, setBasePrice] = useState<number | "">(45000);
  const [compareAtPrice, setCompareAtPrice] = useState<number | "">("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Timber variants
  const [enabledTimbers, setEnabledTimbers] = useState<
    Record<string, { enabled: boolean; delta: number }>
  >({
    "hunsur-teak": { enabled: true, delta: 0 },
    "indian-rosewood": { enabled: true, delta: 8000 },
    "assam-teak": { enabled: false, delta: -2000 },
  });

  // Specifications
  const [dimensions, setDimensions] = useState("180cm L x 90cm W x 76cm H");
  const [weight, setWeight] = useState("48 kg solid heartwood");
  const [joinery, setJoinery] = useState("Hand-cut Mortise & Tenon with hardwood dowels");

  // Photography
  const [primaryImage, setPrimaryImage] = useState("/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Inventory & Lead Time
  const [leadTime, setLeadTime] = useState("Made to order • 3–4 weeks");
  const [stockStatus, setStockStatus] = useState<"in_stock" | "made_to_order" | "out_of_stock">("made_to_order");
  const [isActive, setIsActive] = useState(true);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setTitle(product.name || "");
      setSlug(product.slug || product.id || "");
      setSlugManuallyEdited(true);
      setCategory((product.category || "dining").toLowerCase());
      setBasePrice(product.price || 0);
      setCompareAtPrice(product.compareAtPrice ?? "");
      setShortDescription(product.tagline || "");
      setDescription(product.description || "");
      setDimensions(product.dimensions || "");
      setPrimaryImage(product.image || "");
      setLeadTime(product.leadTime || "Made to order • 3–4 weeks");
      setStockStatus(
        product.stockStatus === "in_stock" || product.stockStatus === "out_of_stock"
          ? product.stockStatus
          : "made_to_order"
      );
      setIsActive(product.isActive !== false);

      // Specs
      const weightSpec = product.specs?.find((s) => s.label.toLowerCase() === "weight");
      const joinerySpec = product.specs?.find((s) => s.label.toLowerCase() === "joinery");
      if (weightSpec) setWeight(weightSpec.value);
      if (joinerySpec) setJoinery(joinerySpec.value);

      // Gallery
      if (product.gallery && product.gallery.length > 0) {
        setGalleryImages(product.gallery.map((g) => g.src).filter((src) => src !== product.image));
      } else {
        setGalleryImages([]);
      }

      // Timbers
      const timberMap: Record<string, { enabled: boolean; delta: number }> = {
        "hunsur-teak": { enabled: false, delta: 0 },
        "indian-rosewood": { enabled: false, delta: 8000 },
        "assam-teak": { enabled: false, delta: -2000 },
      };

      const woodList = product.woodOptions || product.timbers || [];
      if (woodList.length > 0) {
        woodList.forEach((wood) => {
          let tid = wood.id;
          if (wood.name.toLowerCase().includes("rosewood") || wood.id.includes("rosewood")) tid = "indian-rosewood";
          else if (wood.name.toLowerCase().includes("assam") || wood.id.includes("assam")) tid = "assam-teak";
          else if (wood.name.toLowerCase().includes("teak") || wood.id.includes("teak")) tid = "hunsur-teak";

          if (timberMap[tid]) {
            timberMap[tid].enabled = true;
            timberMap[tid].delta = (wood.price || product.price) - product.price;
          }
        });
      } else {
        // Fallback default
        timberMap["hunsur-teak"].enabled = true;
      }
      setEnabledTimbers(timberMap);
    } else {
      // Reset to fresh piece defaults
      setTitle("");
      setSlug("");
      setSlugManuallyEdited(false);
      setCategory("dining");
      setBasePrice(48000);
      setCompareAtPrice("");
      setShortDescription("Architectural solid wood piece sculpted for modern Indian residences.");
      setDescription("Handcrafted from sustainably sourced, naturally air-seasoned Indian heartwood. Sculpted by senior karigars featuring master mortise and tenon joinery and silky organic beeswax nourishment.");
      setDimensions("180cm L x 90cm W x 76cm H");
      setWeight("42 kg solid heartwood");
      setJoinery("Traditional blind mortise & tenon pinned with solid rosewood dowels");
      setPrimaryImage("/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png");
      setGalleryImages([]);
      setLeadTime("Made to order • 3–4 weeks");
      setStockStatus("made_to_order");
      setIsActive(true);
      setEnabledTimbers({
        "hunsur-teak": { enabled: true, delta: 0 },
        "indian-rosewood": { enabled: true, delta: 8000 },
        "assam-teak": { enabled: false, delta: -2000 },
      });
    }
    setErrorMessage(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleToggleTimber = (timberId: string) => {
    setEnabledTimbers((prev) => ({
      ...prev,
      [timberId]: {
        ...prev[timberId],
        enabled: !prev[timberId]?.enabled,
      },
    }));
  };

  const handleTimberDeltaChange = (timberId: string, delta: number) => {
    setEnabledTimbers((prev) => ({
      ...prev,
      [timberId]: {
        ...prev[timberId],
        delta,
      },
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage("Please enter a product title.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Please enter or generate a slug.");
      return;
    }
    if (basePrice === "" || basePrice < 0) {
      setErrorMessage("Please enter a valid base price.");
      return;
    }

    const selectedTimbers = Object.entries(enabledTimbers)
      .filter(([_, val]) => val.enabled)
      .map(([tid, val]) => ({
        timberId: tid,
        priceDelta: val.delta,
        price: Number(basePrice) + val.delta,
      }));

    if (selectedTimbers.length === 0) {
      setErrorMessage("Please select at least one timber finish variant.");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: category,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      timbers: selectedTimbers,
      dimensions: dimensions.trim(),
      weight: weight.trim(),
      joinery: joinery.trim(),
      primaryImage: primaryImage.trim(),
      galleryImages: Array.from(new Set([primaryImage.trim(), ...galleryImages].filter(Boolean))),
      leadTime: leadTime.trim(),
      stockStatus: stockStatus,
      isActive: isActive,
    };

    setIsSubmitting(true);

    try {
      const url = isEditing && product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server rejected product update");
      }

      onSuccess(data.product, !isEditing);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#141312] border-l border-[#2A2724] shadow-2xl flex flex-col h-full text-[#FAF9F6] animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#2A2724] bg-[#161514] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#D4A373] text-[24px]">
                {isEditing ? "edit_note" : "add_circle"}
              </span>
              <div>
                <h2 className="font-serif text-lg font-medium text-[#FAF9F6]">
                  {isEditing ? `Edit Atelier Piece: ${product?.name}` : "Create New Heirloom Piece"}
                </h2>
                <p className="text-xs text-[#9B9287]">
                  {isEditing
                    ? "Update timber variants, dimensions, pricing, and live storefront visibility."
                    : "Add solid wood architectural furniture to the permanent living catalog."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#9B9287] hover:text-[#FAF9F6] hover:bg-[#24211E] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form Scroll Body */}
          <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: Core Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2724] pb-2">
                <h3 className="font-serif text-sm text-[#D4A373] uppercase tracking-wider font-semibold">
                  1. Core Specifications &amp; Category
                </h3>
                <span className="text-[10px] font-mono text-[#706860] uppercase tracking-wider">Required *</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                  Piece Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bellandur Penthouse Low Table"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-sm text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                />
              </div>

              {/* Slug & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287]">
                      Catalog Slug *
                    </label>
                    <span className="text-[10px] font-mono text-[#D4A373]">
                      /products/{slug || "..."}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="bellandur-low-table"
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(generateSlug(e.target.value));
                    }}
                    className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs font-mono text-[#D4A373] placeholder-[#5C554E] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                    Collection Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs text-[#FAF9F6] focus:outline-none transition-colors cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                    Base Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-[#9B9287] font-sans">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="45000"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg pl-8 pr-3.5 py-2.5 text-sm font-sans tabular-nums text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                    Compare at Price (₹) <span className="text-[10px] text-[#706860]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-[#9B9287] font-sans">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="52000"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg pl-8 pr-3.5 py-2.5 text-sm font-sans tabular-nums text-[#9B9287] placeholder-[#5C554E] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Short Description (Tagline) */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                  Short Tagline * <span className="text-[10px] text-[#706860]">(Catalog sub-header)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monolithic timber slab table anchored with solid trestle joinery."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                  Full Atelier Craftsmanship Story *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Artisan timber provenance, carving techniques, grain flow, and wood seasoning details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* SECTION 2: Timber & Finish Variants */}
            <div className="space-y-4">
              <div className="border-b border-[#2A2724] pb-2">
                <h3 className="font-serif text-sm text-[#D4A373] uppercase tracking-wider font-semibold">
                  2. Timber &amp; Finish Variants
                </h3>
                <p className="text-[11px] text-[#9B9287] mt-0.5">
                  Select available hardwood species and specify timber price adjustments.
                </p>
              </div>

              <div className="space-y-3">
                {AVAILABLE_TIMBERS.map((timber) => {
                  const state = enabledTimbers[timber.id] || { enabled: false, delta: timber.defaultDelta };
                  const effectivePrice = Number(basePrice || 0) + state.delta;

                  return (
                    <div
                      key={timber.id}
                      className={`p-4 rounded-xl border transition-all ${
                        state.enabled
                          ? "bg-[#1C1A18] border-[#D4A373]/40 shadow-sm"
                          : "bg-[#161514] border-[#2A2724] opacity-70"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={state.enabled}
                            onChange={() => handleToggleTimber(timber.id)}
                            className="w-4 h-4 rounded bg-[#141312] border-[#3E3A35] text-[#D4A373] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-[#3E3A35] shrink-0">
                            <Image
                              src={timber.swatch}
                              alt={timber.name}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-serif font-medium text-[#FAF9F6]">
                              {timber.name}
                            </div>
                            <div className="text-[10px] text-[#706860] font-mono">
                              Provenance: {timber.origin}
                            </div>
                          </div>
                        </label>

                        {state.enabled && (
                          <div className="flex items-center gap-3 pl-7 sm:pl-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#9B9287] font-mono">Delta:</span>
                              <div className="relative w-28">
                                <span className="absolute left-2 top-1.5 text-xs text-[#706860]">₹</span>
                                <input
                                  type="number"
                                  value={state.delta}
                                  onChange={(e) =>
                                    handleTimberDeltaChange(timber.id, Number(e.target.value) || 0)
                                  }
                                  className="w-full bg-[#141312] border border-[#3E3A35] focus:border-[#D4A373] rounded px-2 pl-5 py-1 text-xs font-sans tabular-nums text-[#FAF9F6] text-right"
                                />
                              </div>
                            </div>
                            <div className="text-xs font-sans tabular-nums font-semibold text-[#D4A373] whitespace-nowrap">
                              = ₹{effectivePrice.toLocaleString("en-IN")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Dimensions & Specifications */}
            <div className="space-y-4">
              <div className="border-b border-[#2A2724] pb-2">
                <h3 className="font-serif text-sm text-[#D4A373] uppercase tracking-wider font-semibold">
                  3. Joinery &amp; Physical Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                    Dimensions (L × W × H) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 180cm L x 90cm W x 76cm H"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs font-sans tabular-nums text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                    Estimated Net Weight
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 48 kg solid timber"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                  Joinery Methodology
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mortise & Tenon with rosewood pins"
                  value={joinery}
                  onChange={(e) => setJoinery(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* SECTION 4: Product Photography */}
            <div className="space-y-4">
              <div className="border-b border-[#2A2724] pb-2">
                <h3 className="font-serif text-sm text-[#D4A373] uppercase tracking-wider font-semibold">
                  4. Atelier Gallery Photography
                </h3>
                <p className="text-[11px] text-[#9B9287] mt-0.5">
                  Upload high-res workshop imagery directly to Supabase Storage CDN, choose curated showroom presets, and configure perspective angles.
                </p>
              </div>

              <ProductImageUpload
                primaryImage={primaryImage}
                galleryImages={galleryImages}
                onPrimaryImageChange={setPrimaryImage}
                onGalleryImagesChange={setGalleryImages}
              />
            </div>

            {/* SECTION 5: Inventory & Lead Time */}
            <div className="space-y-4">
              <div className="border-b border-[#2A2724] pb-2">
                <h3 className="font-serif text-sm text-[#D4A373] uppercase tracking-wider font-semibold">
                  5. Inventory &amp; Atelier Lead Time
                </h3>
              </div>

              {/* Lead Time */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-1.5">
                  Lead Time String
                </label>
                <input
                  type="text"
                  placeholder="e.g. Made to order • 3–4 weeks or In Stock — 48h Dispatch"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3.5 py-2.5 text-xs text-[#FAF9F6] placeholder-[#5C554E] focus:outline-none transition-colors"
                />
              </div>

              {/* Stock Status Radios */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#9B9287] mb-2">
                  Stock Fulfillment Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "in_stock", label: "In Stock", desc: "Immediate White-Glove dispatch" },
                    { id: "made_to_order", label: "Made to Order", desc: "3–4 week workshop build" },
                    { id: "out_of_stock", label: "Out of Stock", desc: "Temporarily unavailable" },
                  ].map((s) => (
                    <label
                      key={s.id}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        stockStatus === s.id
                          ? "bg-[#1C1A18] border-[#D4A373] text-[#FAF9F6]"
                          : "bg-[#161514] border-[#2A2724] text-[#9B9287] hover:border-[#3E3A35]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="stockStatus"
                          value={s.id}
                          checked={stockStatus === s.id}
                          onChange={() => setStockStatus(s.id as typeof stockStatus)}
                          className="text-[#D4A373] focus:ring-0"
                        />
                        <span className="text-xs font-mono font-medium">{s.label}</span>
                      </div>
                      <p className="text-[10px] text-[#706860] mt-1 pl-5">{s.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibility Switch */}
              <div className="p-4 rounded-xl bg-[#1C1A18] border border-[#2A2724] flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm font-medium text-[#FAF9F6]">
                    Storefront Visibility
                  </div>
                  <p className="text-xs text-[#9B9287] mt-0.5">
                    {isActive
                      ? "Publicly discoverable on /shop and available for patron acquisitions."
                      : "Hidden from public storefront. Accessible only by direct administrative preview."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isActive ? "bg-[#22C55E]" : "bg-[#2A2724]"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </form>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-[#2A2724] bg-[#161514] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-[#24211E] hover:bg-[#2E2B27] border border-[#3E3A35] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#D4A373] hover:bg-[#C29263] text-[#121110] text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#D4A373]/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#121110] border-t-transparent rounded-full animate-spin" />
                  <span>Saving Piece...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{isEditing ? "Save Changes" : "Save Piece"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
