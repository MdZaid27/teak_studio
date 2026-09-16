"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { DbPatronWishlist } from "@/types/database";

export interface WishlistTabProps {
  wishlistItems: DbPatronWishlist[];
  loadingWishlist: boolean;
  onAddToCart: (item: DbPatronWishlist) => void;
  onRemoveWishlist: (productId: string) => void;
}

export default function WishlistTab({
  wishlistItems,
  loadingWishlist,
  onAddToCart,
  onRemoveWishlist,
}: WishlistTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
            Saved Pieces &amp; Held Reserves
          </h3>
          <p className="text-xs text-[#766E65] pt-0.5">
            Private curation of architectural timber designs held under your patron credentials.
          </p>
        </div>

        <Link
          href="/shop"
          className="px-4 py-2 border border-[#EAE7E1] hover:border-[#1A1A1A] rounded-xl text-xs font-medium text-[#1A1A1A] transition-all inline-flex items-center gap-1.5"
        >
          <span>Browse Full Catalogue</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>

      {loadingWishlist ? (
        <div className="p-12 text-center text-xs text-[#766E65]">
          Loading your curated wishlist...
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto text-[#895029]">
            <span className="material-symbols-outlined text-[28px]">favorite</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-xl text-[#1A1A1A]">Your Atelier Wishlist is Empty</h4>
            <p className="text-xs text-[#766E65] max-w-sm mx-auto">
              Save handcrafted dining tables, credenzas, and lounge chairs to monitor timber availability and place priority holds.
            </p>
          </div>
          <Link
            href="/shop"
            className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5"
          >
            <span>Explore Furniture Collections</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      ) : (
        /* 2-Column Bento / Editorial Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#EAE7E1] rounded-2xl overflow-hidden shadow-xs hover:border-[#d3c3bd] transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-video w-full bg-[#FAF9F6] overflow-hidden">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top corner reserve indicator badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 backdrop-blur-xs text-[#895029] border border-[#EAE7E1] shadow-xs">
                      Reserve Held: 8 Days Left
                    </span>
                  </div>

                  {/* Top corner Heart removal trigger */}
                  <button
                    type="button"
                    onClick={() => onRemoveWishlist(prod.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-xs text-red-600 hover:bg-white shadow-xs transition-transform active:scale-90 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <span className="material-symbols-outlined text-[18px] fill-current">
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase">
                        {prod.category}
                      </span>
                      <span className="font-sans tabular-nums text-base font-bold text-[#1A1A1A]">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <h4 className="font-serif text-base text-[#1A1A1A] font-medium leading-snug">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-[#766E65] line-clamp-2">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EAE7E1] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onRemoveWishlist(prod.id)}
                      className="text-xs text-[#766E65] hover:text-red-700 font-medium transition-colors cursor-pointer"
                    >
                      Remove Piece
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart(item)}
                      className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
