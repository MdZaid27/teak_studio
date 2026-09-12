"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabItem {
  name: string;
  href: string;
  matchPrefix?: string;
  icon?: string;
}

const tabs: TabItem[] = [
  {
    name: "Orders",
    href: "/admin/orders",
    matchPrefix: "/admin/orders",
    icon: "inventory_2",
  },
  {
    name: "Catalog / Inventory",
    href: "/admin/products",
    matchPrefix: "/admin/products",
    icon: "category",
  },
  {
    name: "Bespoke Inquiries",
    href: "/admin/commissions",
    matchPrefix: "/admin/commissions",
    icon: "handyman",
  },
  {
    name: "Swatch Requests",
    href: "/admin/swatches",
    matchPrefix: "/admin/swatches",
    icon: "palette",
  },
  {
    name: "Newsletter Patrons",
    href: "/admin/newsletter",
    matchPrefix: "/admin/newsletter",
    icon: "mark_email_read",
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
    <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
      {tabs.map((tab) => {
        const active = isTabActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              active
                ? "bg-[#24211E] text-[#FAF9F6] font-medium border border-[#48423B] shadow-sm shadow-black/40"
                : "text-[#9B9287] hover:text-[#FAF9F6] hover:bg-[#1A1816] border border-transparent"
            }`}
          >
            {tab.icon && (
              <span className={`material-symbols-outlined text-[16px] ${active ? "text-[#D4A373]" : "text-[#706860]"}`}>
                {tab.icon}
              </span>
            )}
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
