"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface AdminSignOutButtonProps {
  className?: string;
}

export function AdminSignOutButton({ className = "" }: AdminSignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      // Fallback redirect
      window.location.href = "/admin/login";
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      id="admin-signout-btn"
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-medium text-amber-200/80 hover:text-amber-100 bg-[#1e120b] hover:bg-[#2c1a11] border border-amber-900/40 hover:border-amber-700/60 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isSigningOut ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 text-amber-400"
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
          <span>Signing Out...</span>
        </>
      ) : (
        <>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sign Out</span>
        </>
      )}
    </button>
  );
}
