"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TEAK HAUS UNHANDLED APPLICATION ERROR]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#121110] text-[#FAF9F6] flex flex-col justify-between selection:bg-[#c2410c] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#2A2724] bg-[#161514]/90 backdrop-blur-md px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/brand/teak-haus-dark.png"
              alt="TEAK HAUS"
              width={36}
              height={36}
              className="w-8 h-8 object-contain rounded-lg border border-[#2A2724]"
            />
            <span className="font-serif text-lg tracking-wide text-[#FAF9F6]">TEAK HAUS</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#c2410c] font-mono">
            Atelier Exception Safeguard
          </span>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-[#FAF9F6] mb-4">
            An Unanticipated Atelier Delay
          </h1>

          <p className="text-[#A89F91] text-sm md:text-base leading-relaxed mb-8 font-sans">
            Our digital workshop encountered an unexpected condition while rendering this page. Our craftsmen have been notified. You may safely retry the action or return to the main gallery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#FAF9F6] text-[#121110] text-xs uppercase tracking-[0.2em] font-medium rounded-lg hover:bg-[#E5DFD5] transition-colors cursor-pointer"
            >
              Retry Action
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1C1A18] border border-[#3E3A35] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium rounded-lg hover:border-[#D4A373] transition-colors"
            >
              Return to Gallery
            </Link>
          </div>

          {error.digest && (
            <p className="mt-8 text-[11px] font-mono text-[#81746f]">
              Incident Reference: {error.digest}
            </p>
          )}
        </div>
      </main>

      {/* Subtle Atelier Footer */}
      <footer className="border-t border-[#2A2724] px-6 py-4 text-center text-xs text-[#81746f]">
        TEAK HAUS Atelier · Heritage Teak, Rosewood & Bespoke Solid Wood Joinery
      </footer>
    </div>
  );
}
