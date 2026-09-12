"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid grant")
        ) {
          setErrorMessage("Invalid credentials. Please verify your atelier email and password.");
        } else {
          setErrorMessage(error.message || "Authentication failed. Please try again.");
        }
        return;
      }

      if (data?.session && data?.user) {
        // Verify user has admin privileges
        const user = data.user;
        const email = user.email?.toLowerCase();
        const isAdmin =
          user.app_metadata?.role === "admin" ||
          user.user_metadata?.role === "admin" ||
          (email &&
            (email.startsWith("admin@") ||
             email.includes("admin") ||
             email === "curator@kilnstudio.in" ||
             email.endsWith("@kilnstudio.in")));

        if (!isAdmin) {
          await supabase.auth.signOut();
          setErrorMessage("Access denied. Your account does not have curator administrative privileges.");
          return;
        }

        // Full page redirect ensures Supabase session cookies are synced for Next.js SSR middleware
        window.location.href = "/admin";
      } else {
        setErrorMessage("Unable to establish an authenticated session.");
      }
    } catch (err) {
      console.error("[ADMIN LOGIN] Unexpected error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0503] text-[#fbf7f0] flex flex-col justify-between selection:bg-[#c2410c] selection:text-white">
      {/* Top minimal atelier header */}
      <header className="px-6 py-6 border-b border-amber-950/40 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-100/70 hover:text-amber-300 transition-colors"
        >
          <span className="text-amber-500/60 group-hover:-translate-x-0.5 transition-transform">←</span>
          Return to Studio
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/60 font-mono">
          Security Boundary · Restricted Access
        </span>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#130b07]/90 border border-amber-900/30 rounded-lg p-8 md:p-10 shadow-2xl shadow-black/80 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle wood grain amber accent glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-800/10 rounded-full blur-3xl pointer-events-none" />

          {/* Atelier Brand Emblem */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#2a170d] to-[#160b06] border border-amber-700/30 text-amber-400 mb-4 shadow-inner">
              <span className="font-serif text-lg tracking-widest font-semibold">K</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-amber-100 tracking-wide font-normal">
              Atelier Curator Portal
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-400/60 font-light">
              KILN STUDIO Bangalore
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              id="admin-login-error"
              role="alert"
              className="mb-6 p-3.5 rounded bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <svg
                className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-widest text-amber-200/80 mb-2 font-medium"
              >
                Curator Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@kilnstudio.in"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#1d110b] border border-amber-900/40 rounded text-sm text-amber-50 placeholder:text-amber-800/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-600 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs uppercase tracking-widest text-amber-200/80 font-medium"
                >
                  Password
                </label>
              </div>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#1d110b] border border-amber-900/40 rounded text-sm text-amber-50 placeholder:text-amber-800/60 focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-600 transition-all disabled:opacity-60"
              />
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#c2410c] to-[#9a3412] hover:from-[#d97706] hover:to-[#c2410c] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded shadow-lg shadow-orange-950/40 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Atelier Console</span>
                  <span className="text-amber-200">→</span>
                </>
              )}
            </button>
          </form>

          {/* Secure indicator footnote */}
          <div className="mt-8 pt-6 border-t border-amber-950/60 text-center">
            <p className="text-[11px] text-amber-400/40 font-light flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-600/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Session verified via Supabase Auth & JWT cookie exchange</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-amber-950/40 text-center text-xs text-amber-500/40">
        © {new Date().getFullYear()} KILN STUDIO · Timber & Heirloom Joinery Atelier · Bangalore
      </footer>
    </div>
  );
}
