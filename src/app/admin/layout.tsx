import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { AdminSignOutButton } from "@/components/AdminSignOutButton";
import { AdminNavTabs } from "@/components/admin/AdminNavTabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `${siteConfig.name} — Curator Administration Workspace`,
  description: "Operational back-office console for KILN STUDIO.",
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

  const userEmail = user.email || "curator@kilnstudio.in";

  return (
    <div className="min-h-screen bg-[#0a0503] text-[#fbf7f0] flex flex-col justify-between selection:bg-[#c2410c] selection:text-white">
      {/* Primary Architectural Header */}
      <header className="border-b border-amber-950/60 bg-[#120a06]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded bg-gradient-to-b from-[#2a170d] to-[#160b06] border border-amber-700/40 flex items-center justify-center text-amber-400 font-serif font-bold text-base shadow-inner group-hover:border-amber-500/60 transition-colors">
                K
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg tracking-wide text-amber-100 font-medium">
                    {siteConfig.name}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-mono bg-amber-900/40 border border-amber-700/30 text-amber-300 rounded">
                    Curator Console
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60">
                  Bangalore Atelier Operations
                </p>
              </div>
            </Link>
          </div>

          {/* User Session & Actions */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4 justify-between md:justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#190e09] border border-amber-900/30 text-xs font-mono text-amber-300/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-none text-amber-200">
                {userEmail}
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="text-xs uppercase tracking-widest text-amber-400/70 hover:text-amber-200 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <span>Storefront</span>
              <span className="text-[10px]">↗</span>
            </Link>

            <AdminSignOutButton />
          </div>
        </div>

        {/* Secondary Navigation Tab Bar */}
        <div className="border-t border-amber-950/40 bg-[#0f0704]/90 px-4 sm:px-6 lg:px-8">
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
      <footer className="border-t border-amber-950/50 bg-[#0c0604] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <span>© {new Date().getFullYear()} {siteConfig.name} · Solid Wood Guild & Heirloom Joinery · Bangalore</span>
        <span className="font-mono text-[11px] text-amber-600/50">Restricted Curator Workspace · TLS 1.3</span>
      </footer>
    </div>
  );
}
