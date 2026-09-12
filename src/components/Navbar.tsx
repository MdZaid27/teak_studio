"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

import { siteConfig } from "@/config/site";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { customerUser, profile, setIsAuthModalOpen, signOutCustomer } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hide storefront navbar on all curator/admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Collections", href: "/shop" },
    { name: "Timber Provenance", href: "/wood-types" },
    { name: "Bespoke Studio", href: "/bespoke" },
    { name: "Craft & Philosophy", href: "/about" },
  ];

  return (
    <>
      <header className="bg-[#fcf9f4]/95 sticky top-0 z-40 border-b border-[#2c1a11]/10 backdrop-blur-md transition-all">
        <div className="flex justify-between items-center w-full px-6 md:px-10 lg:px-12 xl:px-16 max-w-[1640px] mx-auto h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0 mr-6 xl:mr-12">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-[#2c1a11] hover:text-[#895029] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
            <Link className="flex items-center gap-3 group shrink-0" href="/">
              <Image
                alt="TEAK HAUS"
                className="w-8 h-8 md:w-9 md:h-9 object-contain"
                height={36}
                priority
                src="/brand/teak-haus-light.png"
                width={36}
              />
              <div className="flex flex-col">
                <span className="font-serif text-lg md:text-xl font-medium tracking-wider text-[#1A1A1A] leading-none">
                  TEAK HAUS
                </span>
                <span className="font-sans text-[9px] tracking-[0.2em] text-[#766E65] uppercase mt-0.5">
                  SOLID HARDWOOD &amp; HEIRLOOM JOINERY
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center justify-center gap-6 2xl:gap-9 text-xs uppercase tracking-[0.16em] font-medium text-[#2c1a11]/80 flex-1 min-w-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-150 py-1 whitespace-nowrap border-b-2 ${
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
          <div className="flex items-center justify-end gap-3 md:gap-4 xl:gap-5 text-[#2c1a11] shrink-0 ml-6 xl:ml-12">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#2c1a11]/80 hover:text-[#2c1a11] hover:bg-[#f0ede9] rounded-full transition-all flex items-center justify-center cursor-pointer"
              title="Search Atelier"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            <Link
              href="/bespoke#booking"
              className="hidden 2xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#2c1a11]/20 rounded-full text-[11px] font-semibold tracking-wider uppercase text-[#2c1a11] hover:bg-[#2c1a11] hover:text-white transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px] text-[#895029]">storefront</span>
              Studio Visit
            </Link>

            {customerUser ? (
              <div className="relative group">
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#f0ede9] text-[#2c1a11] hover:bg-[#e5e2dd] transition-all text-xs font-mono cursor-pointer"
                  title={`Signed in as ${customerUser.phone}`}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#895029]">person</span>
                  <span className="hidden sm:inline font-semibold">
                    {profile?.first_name || customerUser.phone.replace("+91", "")}
                  </span>
                </Link>
                <div className="hidden group-hover:block absolute right-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-[#FAF9F6] border border-[#d3c3bd] rounded-xl shadow-xl p-3 min-w-[220px] text-xs space-y-2">
                    <div className="pb-2 border-b border-[#e5e2dd]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#895029] block">
                          Verified Patron
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-emerald-700">verified</span>
                      </div>
                      <span className="font-serif font-medium text-sm text-[#0e0300] block mt-0.5">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : customerUser.phone}
                      </span>
                      <span className="font-mono text-[11px] text-[#766E65] block">
                        {customerUser.phone}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/account"
                        className="w-full text-left py-1.5 px-2 text-[#2c1a11] hover:bg-[#f0ede9] rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#895029]">account_circle</span>
                        <span>Personal Profile</span>
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        className="w-full text-left py-1.5 px-2 text-[#2c1a11] hover:bg-[#f0ede9] rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#895029]">local_shipping</span>
                        <span>Commissioned Orders</span>
                      </Link>
                      <Link
                        href="/account?tab=wishlist"
                        className="w-full text-left py-1.5 px-2 text-[#2c1a11] hover:bg-[#f0ede9] rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#895029]">favorite</span>
                        <span>Saved Pieces &amp; Wishlist</span>
                      </Link>
                      <Link
                        href="/account?tab=addresses"
                        className="w-full text-left py-1.5 px-2 text-[#2c1a11] hover:bg-[#f0ede9] rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#895029]">home_pin</span>
                        <span>Delivery Residences</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-[#e5e2dd]">
                      <button
                        type="button"
                        onClick={() => signOutCustomer()}
                        className="w-full text-left py-1 px-2 text-red-700 hover:text-red-900 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2 text-[#2c1a11]/80 hover:text-[#2c1a11] hover:bg-[#f0ede9] rounded-full transition-all flex items-center justify-center cursor-pointer"
                title="Patron Sign In"
                aria-label="Patron Sign In"
              >
                <span className="material-symbols-outlined text-[22px]">person</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#2c1a11]/80 hover:text-[#2c1a11] hover:bg-[#f0ede9] rounded-full transition-all relative flex items-center justify-center cursor-pointer"
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
          <div className="xl:hidden border-t border-[#2c1a11]/10 bg-[#fcf9f4] px-6 py-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
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
              <div className="pt-2 pb-2 border-t border-[#e5e2dd]">
                {customerUser ? (
                  <div className="space-y-3 py-1">
                    <div className="flex items-center justify-between py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#895029] text-[18px]">person</span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#895029] block">
                            Verified Patron
                          </span>
                          <span className="font-serif font-medium text-[#0e0300]">
                            {profile?.first_name || customerUser.phone}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          signOutCustomer();
                          setMobileMenuOpen(false);
                        }}
                        className="text-xs text-red-700 font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-3 bg-[#f0ede9] rounded-xl text-xs font-semibold text-[#2c1a11] text-center"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-3 bg-[#f0ede9] rounded-xl text-xs font-semibold text-[#2c1a11] text-center"
                      >
                        My Orders
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left py-2 text-xs uppercase tracking-widest text-[#2c1a11] font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#895029]">login</span>
                    Patron Sign In
                  </button>
                )}
              </div>
              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/bespoke#booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-[#2c1a11] text-[#fcf9f4] text-xs uppercase tracking-widest rounded-lg font-semibold"
                >
                  Book Experience Studio Visit
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
