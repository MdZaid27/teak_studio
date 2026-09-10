"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

import { siteConfig } from "@/config/site";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "Collections", href: "/shop" },
    { name: "Timber Provenance", href: "/wood-types" },
    { name: "Bespoke Studio", href: "/bespoke" },
    { name: "Craft & Philosophy", href: "/about" },
  ];

  return (
    <>
      <header className="bg-[#fcf9f4]/95 sticky top-0 z-40 border-b border-[#2c1a11]/10 backdrop-blur-md transition-all">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1360px] mx-auto h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2c1a11] hover:text-[#895029] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
            <Link
              href="/"
              className="flex flex-col group"
            >
              <span className="font-display text-xl md:text-2xl font-medium tracking-[0.18em] text-[#2c1a11] group-hover:text-[#895029] transition-colors uppercase">
                {siteConfig.name}
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#895029] font-medium -mt-0.5">
                {siteConfig.tagline}
              </span>
            </Link>
          </div>


          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] font-medium text-[#2c1a11]/80">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-150 py-1 border-b-2 ${
                    isActive
                      ? "text-[#2c1a11] border-[#895029] font-semibold"
                      : "border-transparent hover:text-[#2c1a11] hover:border-[#2c1a11]/30"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-5 text-[#2c1a11]">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#2c1a11]/80 hover:text-[#2c1a11] hover:bg-[#f0ede9] rounded-full transition-all flex items-center justify-center"
              title="Search Atelier"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            <Link
              href="/bespoke#booking"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#2c1a11]/20 rounded-full text-[11px] font-semibold tracking-wider uppercase text-[#2c1a11] hover:bg-[#2c1a11] hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[15px] text-[#895029]">storefront</span>
              Studio Visit
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#2c1a11]/80 hover:text-[#2c1a11] hover:bg-[#f0ede9] rounded-full transition-all relative flex items-center justify-center"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#895029] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in fade-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2c1a11]/10 bg-[#fcf9f4] px-6 py-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4 text-sm uppercase tracking-widest font-medium">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-[#e5e2dd] ${
                  pathname === "/" ? "text-[#895029] font-bold" : "text-[#2c1a11]"
                }`}
              >
                Home Atelier
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 border-b border-[#e5e2dd] ${
                    pathname === link.href ? "text-[#895029] font-bold" : "text-[#2c1a11]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/bespoke#booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-[#2c1a11] text-[#fcf9f4] text-xs uppercase tracking-widest rounded-lg font-semibold"
                >
                  Book Bangalore Studio Visit
                </Link>
                <div className="text-[11px] text-[#4f4540] text-center pt-2">
                  Indiranagar 100ft Rd &amp; VR Whitefield Studios
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#fcf9f4] w-full max-w-xl rounded-xl shadow-2xl border border-[#d3c3bd] p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#d3c3bd]">
              <div className="flex items-center gap-3 flex-1">
                <span className="material-symbols-outlined text-[#895029] text-[24px]">search</span>
                <input
                  type="text"
                  placeholder="Search pieces, woods (e.g. Hunsur Teak, Dining Chair, Credenza)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[#1c1c19] placeholder-[#81746f] text-sm focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#81746f] hover:text-[#1c1c19]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mt-4">
              <span className="text-[11px] uppercase tracking-wider text-[#81746f] font-semibold block mb-2">
                Popular Inquiries:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href="/products/malabar-dining-chair"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-1.5 bg-[#f0ede9] hover:bg-[#feb383]/40 rounded-full text-[#2c1a11] transition-colors"
                >
                  Malabar Dining Chair
                </Link>
                <Link
                  href="/wood-types"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-1.5 bg-[#f0ede9] hover:bg-[#feb383]/40 rounded-full text-[#2c1a11] transition-colors"
                >
                  Hunsur Teak Timber
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-1.5 bg-[#f0ede9] hover:bg-[#feb383]/40 rounded-full text-[#2c1a11] transition-colors"
                >
                  Solid Wood Dining Tables
                </Link>
                <Link
                  href="/bespoke"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-1.5 bg-[#f0ede9] hover:bg-[#feb383]/40 rounded-full text-[#2c1a11] transition-colors"
                >
                  Custom Architectural Sizing
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
