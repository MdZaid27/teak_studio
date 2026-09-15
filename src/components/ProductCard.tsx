"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/database";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

// Shared in-memory wishlist cache and in-flight promise to avoid N+1 network requests
let wishlistCache: { userId: string; ids: Set<string>; timestamp: number } | null = null;
let pendingWishlistPromise: Promise<Set<string>> | null = null;

async function getWishlistIds(userId: string): Promise<Set<string>> {
  const now = Date.now();
  if (wishlistCache && wishlistCache.userId === userId && now - wishlistCache.timestamp < 30000) {
    return wishlistCache.ids;
  }

  if (!pendingWishlistPromise) {
    pendingWishlistPromise = fetch(`/api/patron/wishlist?userId=${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : { wishlist: [] }))
      .then((data) => {
        const ids = new Set<string>();
        if (data.success && Array.isArray(data.wishlist)) {
          data.wishlist.forEach((w: { product_id: string }) => ids.add(w.product_id));
        }
        wishlistCache = { userId, ids, timestamp: Date.now() };
        return ids;
      })
      .catch(() => new Set<string>())
      .finally(() => {
        pendingWishlistPromise = null;
      });
  }

  return pendingWishlistPromise;
}

export default function ProductCard({
  product,
  className = "",
  priority = false,
}: ProductCardProps) {
  const slug = product.slug || (product.link ? product.link.replace(/^\/(products|shop)\//, "") : product.id);
  const { customerUser, setIsAuthModalOpen } = useCustomerAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!customerUser?.id) {
      return;
    }

    getWishlistIds(customerUser.id).then((ids) => {
      if (isMounted) {
        setIsWishlisted(ids.has(product.id));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [customerUser?.id, product.id]);

  const effectiveWishlisted = Boolean(customerUser && isWishlisted);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!customerUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (isToggling) return;
    setIsToggling(true);

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (nextState) {
      wishlistCache?.ids.add(product.id);
    } else {
      wishlistCache?.ids.delete(product.id);
    }

    try {
      if (nextState) {
        await fetch("/api/patron/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: customerUser.id,
            productId: product.id,
          }),
        });
      } else {
        await fetch(
          `/api/patron/wishlist?userId=${encodeURIComponent(customerUser.id)}&productId=${encodeURIComponent(product.id)}`,
          { method: "DELETE" }
        );
      }
    } catch {
      setIsWishlisted(!nextState);
      if (nextState) {
        wishlistCache?.ids.delete(product.id);
      } else {
        wishlistCache?.ids.add(product.id);
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link
      href={`/shop/${slug}`}
      className={`group relative bg-[#ffffff] rounded-2xl overflow-hidden border border-[#d3c3bd]/40 hover:border-[#895029]/50 transition-all duration-300 hover:shadow-xl flex flex-col cursor-pointer ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-[#f6f3ee] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />



        {/* Luxury Heart Wishlist Trigger */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 z-10 cursor-pointer shadow-xs ${
            effectiveWishlisted
              ? "bg-white text-red-600 scale-105"
              : "bg-white/80 text-[#81746f] hover:text-red-500 hover:bg-white"
          }`}
          title={effectiveWishlisted ? "Remove from Wishlist" : "Save to Atelier Wishlist"}
          aria-label={effectiveWishlisted ? "Remove from Wishlist" : "Save to Atelier Wishlist"}
        >
          <span className={`material-symbols-outlined text-[17px] ${effectiveWishlisted ? "fill-current text-red-600" : ""}`}>
            favorite
          </span>
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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

        {/* Minimalist Price Row — Sans-Serif Tabular Nums Only */}
        <div className="pt-3 border-t border-[#f0ede9] flex items-center justify-between">
          <span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
