"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Lazy-load the StudioBookingModal to keep the About page light
const StudioBookingModal = dynamic(
  () => import("@/components/modals/StudioBookingModal"),
  { ssr: false }
);

/**
 * Client-side CTA section for the About / Craft & Philosophy page.
 * Provides:
 *   1. "Schedule an Atelier Walkthrough" -> opens the StudioBookingModal
 *   2. "Download Provenance Whitepaper" -> navigates to /provenance
 */
export default function StudioCTASection() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <div className="pt-space-md flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Primary CTA: Schedule Walkthrough */}
        <button
          type="button"
          id="about-schedule-walkthrough-btn"
          onClick={() => setIsBookingOpen(true)}
          className="px-6 h-12 bg-primary text-surface font-title-md text-sm rounded-lg hover:bg-primary-container transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
        >
          <span>Schedule an Atelier Walkthrough</span>
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
        </button>

        {/* Secondary CTA: Download Whitepaper -> Provenance page */}
        <Link
          href="/provenance"
          id="about-provenance-whitepaper-btn"
          className="px-6 h-12 border border-primary text-primary font-title-md text-sm rounded-lg hover:bg-primary hover:text-surface transition-colors duration-150 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Download Provenance Whitepaper</span>
          <span className="material-symbols-outlined text-[18px]">download</span>
        </Link>
      </div>

      {/* Studio Booking Modal */}
      {isBookingOpen && (
        <StudioBookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </>
  );
}
