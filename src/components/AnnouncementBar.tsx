"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnnouncementBar() {
  const pathname = usePathname();

  // Hide storefront announcement bar on all curator/admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <div className="bg-[#2c1a11] text-[#fcf9f4] border-b border-[#d3c3bd]/20 px-4 py-2 text-center text-xs tracking-wide">
      <div className="max-w-[1640px] mx-auto px-4 md:px-10 lg:px-12 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#feb383] animate-pulse"></span>
          <span>
            Bangalore Experience Studios: <strong className="font-semibold text-white">100ft Rd Indiranagar</strong> &amp; <strong className="font-semibold text-white">Sky Level VR Whitefield</strong> — Mon to Sun 11am–8pm
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#9c8073]">
          <span className="hidden lg:inline text-white/90">Bengaluru Same-Week Assembly Guarantee</span>
          <Link
            href="/bespoke#booking"
            className="text-[#ffdbc7] hover:text-white flex items-center gap-1 font-semibold tracking-wider uppercase text-[11px] transition-colors"
          >
            Private Walkthrough Booking
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
