import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { AdminSignOutButton } from "@/components/AdminSignOutButton";
import { AdminNavTabs } from "@/components/admin/AdminNavTabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TEAK HAUS — ATELIER CONSOLE",
  description: "Curator back-office console for TEAK HAUS.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedAdminUser();

  // If unauthenticated (e.g., /admin/login page), render pure children without dashboard chrome
  if (!user) {
    return <>{children}</>;
  }

  const userEmail = user.email || "curator@teakhaus.in";

  return (
    <div className="min-h-screen bg-[#121110] text-[#FAF9F6] flex flex-col justify-between selection:bg-[#c2410c] selection:text-white">
      {/* Primary Architectural Header */}
      <header className="border-b border-[#2A2724] bg-[#161514]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 group"
            >
              <Image
                src="/brand/teak-haus-dark.png"
                alt="TEAK HAUS"
                width={38}
                height={38}
                priority
                className="w-9 h-9 object-contain rounded-xl shadow-md border border-[#2A2724]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg tracking-wide text-[#FAF9F6] font-medium">
                    TEAK HAUS
                  </span>
                  <span className="text-[#81746f] text-sm hidden sm:inline">—</span>
                  <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#D4A373] hidden sm:inline">
                    ATELIER CONSOLE
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-mono bg-[#1C1A18] border border-[#3E3A35] text-[#D4A373] rounded sm:hidden">
                    Console
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#81746f]">
                  Flagship Atelier Operations
                </p>
              </div>
            </Link>
          </div>

          {/* User Session & Actions */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4 justify-between md:justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1816] border border-[#2A2724] text-xs font-mono text-[#D4A373]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-none text-[#FAF9F6]">
                {userEmail}
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="text-xs uppercase tracking-widest text-[#9B9287] hover:text-[#FAF9F6] transition-colors hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#1A1816]"
            >
              <span>Storefront</span>
              <span className="text-[10px]">↗</span>
            </Link>

            <AdminSignOutButton />
          </div>
        </div>

        {/* Secondary Navigation Tab Bar */}
        <div className="border-t border-[#2A2724] bg-[#141312] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-1">
            <AdminNavTabs />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Atelier Footer */}
      <footer className="border-t border-[#2A2724] bg-[#0E0D0C] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#81746f] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <span>© {new Date().getFullYear()} {siteConfig.name} · Solid Wood Guild & Heirloom Joinery</span>
        <span className="font-mono text-[11px] text-[#5C554E]">Restricted Curator Workspace · TLS 1.3</span>
      </footer>
    </div>
  );
}
