"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    alreadySubscribed?: boolean;
  } | null>(null);

  // Hide storefront footer on all curator/admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setFeedback({ type: "error", message: "Please provide a valid email address." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to process subscription. Please try again.");
      }

      setFeedback({
        type: "success",
        message: data.message || `Welcome to the ${siteConfig.name} Patron List.`,
        alreadySubscribed: Boolean(data.alreadySubscribed || data.message?.toLowerCase().includes("already")),
      });
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscription failed. Please try again.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#0e0300] text-[#fcf9f4] border-t border-[#311300]">
      {/* Upper Brand & Newsletter Banner */}
      <div className="atelier-journal-section border-b border-white/10 py-12 md:py-16">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="font-label-caps text-[#feb383] text-[11px] tracking-widest uppercase block">
              The Atelier Journal
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-normal tracking-tight text-[#fcf9f4]">
              Invitations to Timber Unveilings &amp; Private Previews.
            </h3>
            <p className="text-sm text-[#d3c3bd] max-w-xl font-light">
              Receive quarterly monographs on rare salvage timber logs, architectural home tours, and bespoke joinery essays.
            </p>
          </div>
          <div className="lg:col-span-5">
            {feedback?.type === "success" ? (
              <div className="bg-[#2c1a11] border border-[#feb383]/40 p-4 rounded-xl text-center animate-fade-in">
                <span className="material-symbols-outlined text-[#feb383] text-2xl mb-1">mark_email_read</span>
                <p className="text-sm font-semibold text-white">
                  {feedback.alreadySubscribed ? "Patron Record Found" : `Welcome to the ${siteConfig.name} Guild.`}
                </p>
                <p className="text-xs text-[#d3c3bd] mt-1">{feedback.message}</p>
              </div>
            ) : (
              <div>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#feb383] flex-1 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#895029] hover:bg-[#feb383] hover:text-[#0e0300] text-white font-semibold text-xs tracking-widest uppercase rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                        <span>Joining...</span>
                      </>
                    ) : (
                      <span>Join Patron List</span>
                    )}
                  </button>
                </form>
                {feedback?.type === "error" && (
                  <p className="text-xs text-[#ffb4a8] mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{feedback.message}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links & Flagship Studios */}
      <div className="py-16 md:py-20 border-b border-white/10">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <Image
                src="/brand/teak-haus-dark.png"
                alt="TEAK HAUS"
                width={48}
                height={48}
                className="w-11 h-11 md:w-12 md:h-12 object-contain rounded-lg shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <span className="font-display text-2xl font-medium tracking-[0.2em] uppercase text-white block leading-none">
                  {siteConfig.name}
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#feb383] font-medium mt-1">
                  {siteConfig.tagline}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#d3c3bd] leading-relaxed max-w-sm font-light">
              Crafting solid Indian hardwood furniture engineered for longevity. Every log is sustainably harvested, naturally seasoned, and joined using authentic mortise-and-tenon woodworking.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#feb383]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>100% Solid Timber &bull; Zero Composite Plywood or Veneer</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-label-caps text-xs tracking-widest text-[#feb383] uppercase mb-4 font-semibold">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#d3c3bd]">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Pieces</Link></li>
              <li><Link href="/products/malabar-dining-chair" className="hover:text-white transition-colors">Malabar Dining Chair</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Solid Teak Dining Tables</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Fluted Credenzas &amp; Sideboards</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Low Platform Beds</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Hand-Woven Rattan Seating</Link></li>
            </ul>
          </div>

          {/* Sourcing & Atelier */}
          <div>
            <h4 className="font-label-caps text-xs tracking-widest text-[#feb383] uppercase mb-4 font-semibold">
              Provenance &amp; Craft
            </h4>
            <ul className="space-y-2.5 text-xs text-[#d3c3bd]">
              <li><Link href="/wood-types" className="hover:text-white transition-colors">Hunsur Teak (Karnataka)</Link></li>
              <li><Link href="/wood-types" className="hover:text-white transition-colors">Indian Rosewood (Malabar)</Link></li>
              <li><Link href="/wood-types" className="hover:text-white transition-colors">Assam Teak (North-East)</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Mortise &amp; Tenon Joinery</Link></li>
              <li><Link href="/bespoke" className="hover:text-white transition-colors">Custom Architectural Commissions</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Guild of Karigars</Link></li>
            </ul>
          </div>

          {/* Flagship Studios */}
          <div>
            <h4 className="font-label-caps text-xs tracking-widest text-[#feb383] uppercase mb-4 font-semibold">
              Flagship Studios
            </h4>
            <div className="space-y-4 text-xs text-[#d3c3bd]">
              <div>
                <strong className="text-white block font-medium">Indiranagar Atelier:</strong>
                <span className="text-[11px] leading-relaxed block text-white/70">
                  100ft Road, Defence Colony, Indiranagar, Bengaluru 560038
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#feb383] block">Mon – Sun: 11am – 8pm</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("open-studio-booking", { detail: { location: "Indiranagar Atelier" } })
                        );
                      }
                    }}
                    className="text-[11px] text-[#ffdbc7] hover:text-white underline uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Book Visit &rarr;
                  </button>
                </div>
              </div>
              <div>
                <strong className="text-white block font-medium">VR Whitefield Studio:</strong>
                <span className="text-[11px] leading-relaxed block text-white/70">
                  Sky Level, VR Bengaluru, Whitefield Main Road, Bengaluru 560048
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#feb383] block">Mon – Sun: 11am – 8pm</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("open-studio-booking", { detail: { location: "VR Whitefield Studio" } })
                        );
                      }
                    }}
                    className="text-[11px] text-[#ffdbc7] hover:text-white underline uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Book Visit &rarr;
                  </button>
                </div>
              </div>
              <div>
                <strong className="text-white block font-medium">Joinery Workshop:</strong>
                <span className="text-[11px] leading-relaxed block text-white/70">
                  Timber Yard Layout, Off Mysore Road, Bengaluru
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-white/50 block">By Private Appointment</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("open-studio-booking", { detail: { location: "Indiranagar Atelier" } })
                        );
                      }
                    }}
                    className="text-[11px] text-[#feb383] hover:text-white underline uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Schedule &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-8 bg-[#090200]">
        <div className="max-w-[1640px] mx-auto px-6 md:px-10 lg:px-12 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#81746f]">
          <div>
            &copy; {new Date().getFullYear()} {siteConfig.name} LLP. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#feb383]">Heirloom Joinery Guarantee</span>
            <span>Ethical Forest Concession Lic. KA-FOR-2024-88</span>
            <Link href="/bespoke" className="hover:text-white">Trade Concierge</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
