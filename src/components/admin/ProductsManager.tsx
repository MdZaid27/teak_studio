"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/database";
import { ProductFormDrawer } from "@/components/admin/ProductFormDrawer";

interface ProductsManagerProps {
  initialProducts: Product[];
}

type CategoryFilter =
  | "All"
  | "Seating"
  | "Dining Tables"
  | "Storage & Credenzas"
  | "Beds"
  | "Bespoke";

type StockFilter = "All" | "In Stock" | "Made to Order" | "Archived";

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedStock, setSelectedStock] = useState<StockFilter>("All");

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Status updating indicator
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open drawer in create mode
  const handleAddNewPiece = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  // Open drawer in edit mode
  const handleEditPiece = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  // Handle drawer save callback
  const handleDrawerSuccess = (savedProduct: Product, isNew: boolean) => {
    if (isNew) {
      setProducts((prev) => [savedProduct, ...prev]);
      showToast(`Added '${savedProduct.name}' to catalog.`);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
      showToast(`Updated '${savedProduct.name}' successfully.`);
    }
  };

  // Toggle Visibility directly from table row
  const handleToggleVisibility = async (product: Product) => {
    const newActiveState = !(product.isActive !== false);
    setUpdatingVisibilityId(product.id);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, isActive: newActiveState } : p
      )
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActiveState }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update visibility");
      }

      showToast(
        `'${product.name}' is now ${newActiveState ? "visible on storefront" : "hidden from storefront"}.`
      );
    } catch (err: unknown) {
      // Revert on error
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !newActiveState } : p
        )
      );
      showToast(err instanceof Error ? err.message : "Visibility update failed", "error");
    } finally {
      setUpdatingVisibilityId(null);
    }
  };

  // Archive / Delete piece
  const handleDeleteOrArchive = async (product: Product) => {
    const isArchived = product.stockStatus === "archived";
    const confirmPrompt = isArchived
      ? `Permanently delete '${product.name}' from the database? This cannot be undone.`
      : `Archive '${product.name}'? It will be hidden from the storefront and marked as archived.`;

    if (!window.confirm(confirmPrompt)) return;

    setDeletingId(product.id);

    try {
      const url = isArchived
        ? `/api/admin/products/${product.id}?permanent=true`
        : `/api/admin/products/${product.id}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Delete request failed");
      }

      if (isArchived) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast(`'${product.name}' permanently deleted.`);
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stockStatus: "archived", isActive: false }
              : p
          )
        );
        showToast(`'${product.name}' archived from storefront.`);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive !== false && p.stockStatus !== "archived").length;
    const inStock = products.filter((p) => p.stockStatus === "in_stock").length;
    const madeToOrder = products.filter((p) => p.stockStatus === "made_to_order" || !p.stockStatus).length;
    return { total, active, inStock, madeToOrder };
  }, [products]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Text Search: Title, Category, or Timber Variant
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const titleMatch = product.name.toLowerCase().includes(q);
        const categoryMatch = product.category.toLowerCase().includes(q);
        const timberMatch =
          product.timber.toLowerCase().includes(q) ||
          (product.woodOptions || product.timbers || []).some((w) =>
            w.name.toLowerCase().includes(q)
          );
        const skuMatch = product.slug?.toLowerCase().includes(q) || product.id.toLowerCase().includes(q);

        if (!titleMatch && !categoryMatch && !timberMatch && !skuMatch) {
          return false;
        }
      }

      // 2. Category Filter Pills
      if (selectedCategory !== "All") {
        const cat = product.category.toLowerCase();
        const name = product.name.toLowerCase();

        if (selectedCategory === "Seating") {
          const isSeating = cat.includes("seating") || cat.includes("chair") || name.includes("chair") || name.includes("bench");
          if (!isSeating) return false;
        } else if (selectedCategory === "Dining Tables") {
          const isDining = cat.includes("dining") || name.includes("dining table");
          if (!isDining) return false;
        } else if (selectedCategory === "Storage & Credenzas") {
          const isStorage = cat.includes("storage") || cat.includes("credenza") || name.includes("credenza") || name.includes("cabinet");
          if (!isStorage) return false;
        } else if (selectedCategory === "Beds") {
          const isBed = cat.includes("bed") || name.includes("bed");
          if (!isBed) return false;
        } else if (selectedCategory === "Bespoke") {
          const isBespoke = cat.includes("bespoke") || name.includes("bespoke");
          if (!isBespoke) return false;
        }
      }

      // 3. Stock Status Filter
      if (selectedStock !== "All") {
        if (selectedStock === "In Stock") {
          const isInStock = product.stockStatus === "in_stock" || (product.leadTime?.toLowerCase().includes("in stock") && product.stockStatus !== "archived");
          if (!isInStock) return false;
        } else if (selectedStock === "Made to Order") {
          const isMto = (product.stockStatus === "made_to_order" || !product.stockStatus) && product.stockStatus !== "archived";
          if (!isMto) return false;
        } else if (selectedStock === "Archived") {
          const isArchived = product.stockStatus === "archived" || product.isActive === false;
          if (!isArchived) return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStock]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-mono flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === "success"
              ? "bg-[#1E2922] border-[#22C55E]/40 text-[#4ADE80]"
              : "bg-red-950/90 border-red-500/50 text-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP BAR ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#2A2724]">
        <div>
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-[#FAF9F6] font-medium tracking-tight">
              Atelier Furniture Catalog
            </h1>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono bg-[#1C1A18] border border-[#3E3A35] text-[#D4A373] rounded-full">
                {stats.total} Pieces
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono bg-[#142318] border border-[#22C55E]/30 text-[#4ADE80] rounded-full hidden sm:inline">
                {stats.active} Active on Storefront
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[#9B9287] font-light max-w-2xl">
            Manage heirloom solid hardwood collections, timber finishes, dimensions, and live storefront visibility.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <Link
            href="/shop"
            target="_blank"
            className="px-3.5 py-2 rounded-lg bg-[#1C1A18] hover:bg-[#2A2724] border border-[#3E3A35] text-xs font-mono text-[#D4A373] hover:text-[#FAF9F6] transition-colors flex items-center gap-1.5"
          >
            <span>Public Storefront</span>
            <span className="text-[11px]">↗</span>
          </Link>

          <button
            type="button"
            onClick={handleAddNewPiece}
            className="px-4 py-2 rounded-lg bg-[#D4A373] hover:bg-[#C29263] text-[#121110] text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#D4A373]/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add New Piece</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-xl bg-[#161514] border border-[#2A2724] space-y-4">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#706860] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Title, Category, or Timber Variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg pl-9 pr-9 py-2 text-xs text-[#FAF9F6] placeholder-[#706860] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[#706860] hover:text-[#FAF9F6]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Stock Status Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-mono text-[#9B9287]">Stock Status:</span>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value as StockFilter)}
              className="bg-[#1C1A18] border border-[#2A2724] focus:border-[#D4A373] rounded-lg px-3 py-2 text-xs font-mono text-[#FAF9F6] focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses ({products.length})</option>
              <option value="In Stock">In Stock ({stats.inStock})</option>
              <option value="Made to Order">Made to Order ({stats.madeToOrder})</option>
              <option value="Archived">Archived Pieces</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#24211E]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#706860] shrink-0 mr-1">
            Category:
          </span>
          {(
            [
              "All",
              "Seating",
              "Dining Tables",
              "Storage & Credenzas",
              "Beds",
              "Bespoke",
            ] as CategoryFilter[]
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#2A2724] text-[#D4A373] border border-[#48423B] shadow-sm"
                  : "bg-[#1C1A18] text-[#9B9287] hover:text-[#FAF9F6] hover:bg-[#24211E] border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS DATA TABLE */}
      <div className="bg-[#161514] border border-[#2A2724] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C1A18] border-b border-[#2A2724] text-[#9B9287] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Piece Details</th>
                <th className="px-5 py-3.5">Timber Options</th>
                <th className="px-5 py-3.5">Base Price</th>
                <th className="px-5 py-3.5">Lead Time / Stock</th>
                <th className="px-5 py-3.5 text-center">Visibility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2724] font-light text-[#FAF9F6]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="material-symbols-outlined text-[36px] text-[#5C554E]">
                        filter_list_off
                      </span>
                      <div className="font-serif text-base text-[#FAF9F6]">
                        No Atelier Pieces Found
                      </div>
                      <p className="text-xs text-[#9B9287] max-w-sm">
                        No products match your current search query or active filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("All");
                          setSelectedStock("All");
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1C1A18] hover:bg-[#2A2724] border border-[#3E3A35] text-xs font-mono text-[#D4A373] transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isVisible = product.isActive !== false;
                  const isArchived = product.stockStatus === "archived";
                  const woodList = product.woodOptions || product.timbers || [];
                  const isUpdatingThis = updatingVisibilityId === product.id;
                  const isDeletingThis = deletingId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#1C1A18]/60 transition-colors ${
                        !isVisible || isArchived ? "opacity-75 bg-[#141312]/40" : ""
                      }`}
                    >
                      {/* Column 1: Piece Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-lg bg-[#1C1A18] border border-[#2A2724] overflow-hidden shrink-0 relative flex items-center justify-center">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[#706860] text-[22px]">
                                chair
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 max-w-xs">
                            <div className="font-serif font-medium text-sm text-[#FAF9F6] flex items-center gap-2">
                              <span>{product.name}</span>
                              {product.isPopular && (
                                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#D4A373]/20 border border-[#D4A373]/40 text-[#D4A373] rounded">
                                  Curated
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-[#C9BFB5] capitalize">
                                {product.category}
                              </span>
                              <span className="text-[#5C554E]">·</span>
                              <span className="font-mono text-[10px] text-[#706860] truncate">
                                #{product.slug || product.id}
                              </span>
                            </div>
                            {product.dimensions && (
                              <div className="text-[10px] text-[#81746f] font-sans tabular-nums truncate">
                                {product.dimensions}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Timber Options */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                          {woodList.length > 0 ? (
                            woodList.map((wood) => {
                              const isRosewood = wood.name.toLowerCase().includes("rosewood") || wood.id.includes("rosewood");
                              const isAssam = wood.name.toLowerCase().includes("assam") || wood.id.includes("assam");
                              const badgeColor = isRosewood
                                ? "bg-[#2B1414] text-[#F87171] border-[#EF4444]/30"
                                : isAssam
                                ? "bg-[#1E2922] text-[#4ADE80] border-[#22C55E]/30"
                                : "bg-[#261E14] text-[#FBBF24] border-[#F59E0B]/30";

                              return (
                                <span
                                  key={wood.id}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeColor}`}
                                >
                                  {wood.name.replace("Indian ", "").replace(" (Sheesham)", "")}
                                </span>
                              );
                            })
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#261E14] text-[#D4A373] border border-[#D4A373]/30">
                              {product.timber || "Hunsur Teak"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Base Price */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="font-sans tabular-nums font-semibold text-sm text-[#FAF9F6]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </div>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="text-[10px] font-sans tabular-nums text-[#706860] line-through">
                              ₹{product.compareAtPrice.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Lead Time / Stock */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {isArchived ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#24211E] text-[#9B9287] border border-[#3E3A35]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#706860]" />
                              <span>Archived</span>
                            </span>
                          ) : product.stockStatus === "in_stock" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#1E2922] text-[#4ADE80] border border-[#22C55E]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                              <span>In Stock</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#2E2115] text-[#FBBF24] border border-[#D97706]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                              <span>Made to Order</span>
                            </span>
                          )}
                          <div className="text-[10px] text-[#81746f] truncate max-w-[150px]">
                            {product.leadTime || "3–4 Weeks Build"}
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Visibility Toggle */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={isUpdatingThis}
                            onClick={() => handleToggleVisibility(product)}
                            title={isVisible ? "Active on storefront (click to hide)" : "Hidden from storefront (click to show)"}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer disabled:opacity-50 ${
                              isVisible ? "bg-[#22C55E]" : "bg-[#2A2724]"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                isVisible ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="text-[9px] font-mono text-[#706860]">
                            {isVisible ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditPiece(product)}
                            className="px-2.5 py-1.5 rounded bg-[#1C1A18] hover:bg-[#2A2724] border border-[#3E3A35] text-[11px] font-mono text-[#FAF9F6] hover:text-[#D4A373] transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            disabled={isDeletingThis}
                            onClick={() => handleDeleteOrArchive(product)}
                            className="px-2 py-1.5 rounded bg-[#1C1A18] hover:bg-red-950/50 border border-[#3E3A35] hover:border-red-500/40 text-[11px] font-mono text-[#9B9287] hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                            title={isArchived ? "Permanently Delete" : "Archive Piece"}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isArchived ? "delete_forever" : "archive"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Add/Edit */}
      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
