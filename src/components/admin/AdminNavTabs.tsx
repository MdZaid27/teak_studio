"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  name: string;
  href: string;
  matchPrefix?: string;
  badgeCount?: number;
}

const tabs: TabItem[] = [
  {
    name: "Customer Orders",
    href: "/admin/orders",
    matchPrefix: "/admin/orders",
  },
  {
    name: "Bespoke Inquiries",
    href: "/admin/commissions",
    matchPrefix: "/admin/commissions",
  },
  {
    name: "Swatch Requests",
    href: "/admin/swatches",
    matchPrefix: "/admin/swatches",
  },
  {
    name: "Newsletter Patrons",
    href: "/admin/newsletter",
    matchPrefix: "/admin/newsletter",
  },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  const isTabActive = (tab: TabItem) => {
    if (tab.href === "/admin/orders" && (pathname === "/admin" || pathname === "/admin/orders")) {
      return true;
    }
    if (tab.matchPrefix && pathname.startsWith(tab.matchPrefix)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
      {tabs.map((tab) => {
        const active = isTabActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3.5 py-2 rounded text-xs uppercase tracking-widest transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              active
                ? "bg-[#27160e] text-amber-200 font-semibold border border-amber-600/40 shadow-sm shadow-amber-950/50"
                : "text-amber-300/60 hover:text-amber-100 hover:bg-[#190e09] border border-transparent"
            }`}
          >
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
