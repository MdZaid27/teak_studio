"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { DbPatronProfile } from "@/types/database";

export interface CustomerUser {
  id: string;
  phone: string;
  email?: string;
  name?: string;
}

interface CustomerAuthContextType {
  customerUser: CustomerUser | null;
  profile: DbPatronProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  pendingPhone: string;
  setPendingPhone: (phone: string) => void;
  sendOtp: (
    phone10Digits: string,
    email?: string
  ) => Promise<{
    success: boolean;
    error?: string;
    requiresEmail?: boolean;
    maskedEmail?: string;
    devOtp?: string;
    isDevFallback?: boolean;
  }>;
  verifyOtp: (phone10Digits: string, token: string) => Promise<{ success: boolean; error?: string; requiresProfile?: boolean }>;
  updateProfile: (data: { firstName: string; lastName: string; email: string; marketingOptIn?: boolean }) => Promise<{ success: boolean; error?: string }>;
  signOutCustomer: () => Promise<void>;
  setPendingAction: (action: (() => void) | null) => void;
  executePendingAction: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const PATRON_STORAGE_KEY = "kiln_patron_session";
const PATRON_PROFILE_STORAGE_KEY = "kiln_patron_profile";

function isUserAdmin(
  u: { app_metadata?: Record<string, unknown>; email?: string | null } | null
): boolean {
  if (!u) return false;
  if (u.app_metadata?.role === "admin") return true;
  const email = u.email?.toLowerCase().trim();
  if (email && (email === "curator@teakhaus.in" || email === "admin@teakhaus.in")) return true;
  return false;
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [profile, setProfile] = useState<DbPatronProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingAction, setPendingActionState] = useState<(() => void) | null>(null);

  const supabase = createSupabaseBrowserClient();

  // Helper to safely execute any queued post-auth action
  const executePendingAction = useCallback(() => {
    if (pendingAction) {
      const action = pendingAction;
      setPendingActionState(null);
      setTimeout(() => {
        action();
      }, 50);
    }
  }, [pendingAction]);

  // Load profile from local storage or server
  const loadProfile = useCallback(async (userId: string, userPhone?: string, userEmail?: string) => {
    try {
      const cleanPhone = userPhone ? userPhone.replace(/\D/g, "").slice(-10) : "";
      const cached =
        localStorage.getItem(`${PATRON_PROFILE_STORAGE_KEY}_${userId}`) ||
        (cleanPhone ? localStorage.getItem(`${PATRON_PROFILE_STORAGE_KEY}_${cleanPhone}`) : null);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.first_name) {
            if (!parsed.email && userEmail) parsed.email = userEmail;
            setProfile(parsed);
            return parsed as DbPatronProfile;
          }
        } catch {}
      }

      const phoneParam = userPhone ? `&phone=${encodeURIComponent(userPhone)}` : "";
      const res = await fetch(`/api/patron/profile?userId=${encodeURIComponent(userId)}${phoneParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          if (!data.profile.email && userEmail) data.profile.email = userEmail;
          setProfile(data.profile);
          localStorage.setItem(`${PATRON_PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(data.profile));
          if (cleanPhone) {
            localStorage.setItem(`${PATRON_PROFILE_STORAGE_KEY}_${cleanPhone}`, JSON.stringify(data.profile));
          }
          return data.profile as DbPatronProfile;
        }
      } else if (userPhone) {
        const defaultProfile: DbPatronProfile = {
          id: userId,
          email: userEmail || "",
          phone: userPhone,
          first_name: "",
          last_name: "",
          marketing_opt_in: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (e) {
      console.warn("[KILN PATRON] Failed fetching profile on load:", e);
    }
    return null;
  }, []);

  // Initial session hydration
  useEffect(() => {
    let isMounted = true;

    const syncSessionCookie = (patron: CustomerUser) => {
      fetch("/api/patron/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patronId: patron.id,
          phone: patron.phone,
          email: patron.email,
        }),
      }).catch(() => {});
    };

    async function initAuth() {
      try {
        // 1. Check local patron storage first
        const localSaved = localStorage.getItem(PATRON_STORAGE_KEY);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed && parsed.phone) {
              setCustomerUser(parsed);
              syncSessionCookie(parsed);
              const cleanPhone = parsed.phone.replace(/\D/g, "").slice(-10);
              const cachedProf =
                localStorage.getItem(`${PATRON_PROFILE_STORAGE_KEY}_${parsed.id}`) ||
                (cleanPhone ? localStorage.getItem(`${PATRON_PROFILE_STORAGE_KEY}_${cleanPhone}`) : null);
              if (cachedProf) {
                try {
                  const profParsed = JSON.parse(cachedProf);
                  if (profParsed) setProfile(profParsed);
                } catch {}
              }
              if (isMounted) setIsLoading(false);
              loadProfile(parsed.id, parsed.phone);
            }
          } catch {}
        }

        // 2. Check Supabase session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          if (currentSession?.user && !isUserAdmin(currentSession.user)) {
            const userPhone = currentSession.user.phone || "";
            if (userPhone) {
              const patron: CustomerUser = {
                id: currentSession.user.id,
                phone: userPhone,
                email: currentSession.user.email,
              };
              setCustomerUser(patron);
              syncSessionCookie(patron);
              localStorage.setItem(PATRON_STORAGE_KEY, JSON.stringify(patron));
              loadProfile(patron.id, patron.phone);
            }
          }
        }
      } catch (err) {
        console.error("[KILN STUDIO] Error initializing customer auth:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth state transitions
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
      if (!isMounted) return;
      setSession(newSession);

      if (newSession?.user) {
        if (isUserAdmin(newSession.user)) {
          return;
        }

        const userPhone = newSession.user.phone || "";
        if (userPhone) {
          const patron: CustomerUser = {
            id: newSession.user.id,
            phone: userPhone,
            email: newSession.user.email,
          };
          setCustomerUser(patron);
          syncSessionCookie(patron);
          localStorage.setItem(PATRON_STORAGE_KEY, JSON.stringify(patron));
          loadProfile(patron.id, patron.phone);
        }
      } else {
        const localSaved = localStorage.getItem(PATRON_STORAGE_KEY);
        if (!localSaved) {
          setCustomerUser(null);
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  /**
   * Request 6-digit access pass OTP sent to patron's registered or provided email.
   */
  const sendOtp = async (phone10Digits: string, email?: string) => {
    const cleanDigits = phone10Digits.replace(/\D/g, "").slice(-10);
    setPendingPhone(cleanDigits);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          email: email ? email.trim().toLowerCase() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || data.message || "Failed to send verification code.",
          requiresEmail: data.requiresEmail,
        };
      }

      return {
        success: true,
        maskedEmail: data.maskedEmail,
        requiresEmail: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to authentication service.";
      return { success: false, error: msg };
    }
  };

  /**
   * Handle post-verification flow (profile check vs completion)
   */
  const handlePostVerification = async (patron: CustomerUser, requiresProfileParam?: boolean) => {
    setCustomerUser(patron);
    localStorage.setItem(PATRON_STORAGE_KEY, JSON.stringify(patron));
    setIsAuthModalOpen(false);

    // Set a server-side HttpOnly cookie so order receipts and patron APIs can verify
    // ownership immediately
    try {
      await fetch("/api/patron/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patronId: patron.id,
          phone: patron.phone,
          email: patron.email,
        }),
      });
    } catch (err) {
      console.warn("[KILN PATRON] Failed syncing session cookie:", err);
    }

    // Check if profile is already complete
    const existingProfile = await loadProfile(patron.id, patron.phone, patron.email);
    if (requiresProfileParam || !existingProfile || !existingProfile.first_name || !existingProfile.last_name) {
      setIsProfileModalOpen(true);
      return { success: true, requiresProfile: true };
    }

    executePendingAction();
    return { success: true, requiresProfile: false };
  };

  /**
   * Verify 6-digit OTP code and establish patron session.
   */
  const verifyOtp = async (phone10Digits: string, token: string) => {
    const cleanDigits = phone10Digits.replace(/\D/g, "").slice(-10);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          token: token.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Invalid verification code. Please check and retry.",
        };
      }

      if (data.patron) {
        return await handlePostVerification(data.patron, data.requiresProfile);
      }

      return { success: false, error: "Authentication failed. Please retry." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      return { success: false, error: msg };
    }
  };

  /**
   * Update patron profile and persist across server and client.
   */
  const updateProfile = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    marketingOptIn?: boolean;
  }) => {
    if (!customerUser) {
      return { success: false, error: "No active patron session" };
    }

    const updatedProfile: DbPatronProfile = {
      id: customerUser.id,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: customerUser.phone,
      marketing_opt_in: data.marketingOptIn ?? false,
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/patron/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });

      const resData = await res.json();
      const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
      if (res.ok && resData.success && resData.profile) {
        setProfile(resData.profile);
        localStorage.setItem(`${PATRON_PROFILE_STORAGE_KEY}_${customerUser.id}`, JSON.stringify(resData.profile));
        if (cleanPhone) {
          localStorage.setItem(`${PATRON_PROFILE_STORAGE_KEY}_${cleanPhone}`, JSON.stringify(resData.profile));
        }
        return { success: true };
      }
    } catch (e) {
      console.warn("[KILN PATRON] Failed updating profile via API, saving to local store:", e);
    }

    setProfile(updatedProfile);
    localStorage.setItem(`${PATRON_PROFILE_STORAGE_KEY}_${customerUser.id}`, JSON.stringify(updatedProfile));
    const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
    if (cleanPhone) {
      localStorage.setItem(`${PATRON_PROFILE_STORAGE_KEY}_${cleanPhone}`, JSON.stringify(updatedProfile));
    }
    return { success: true };
  };

  /**
   * Sign out storefront patron.
   */
  const signOutCustomer = async () => {
    try {
      if (customerUser) {
        localStorage.removeItem(`${PATRON_PROFILE_STORAGE_KEY}_${customerUser.id}`);
        const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
        if (cleanPhone) {
          localStorage.removeItem(`${PATRON_PROFILE_STORAGE_KEY}_${cleanPhone}`);
        }
      }
      localStorage.removeItem(PATRON_STORAGE_KEY);
      setCustomerUser(null);
      setProfile(null);
      // Clear server-side patron session cookie
      fetch("/api/patron/session", { method: "DELETE" }).catch(() => {});
      if (session && !isUserAdmin(session.user)) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("[KILN STUDIO] Error signing out patron:", err);
    }
  };

  const setPendingAction = useCallback((action: (() => void) | null) => {
    setPendingActionState(() => action);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        profile,
        session,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        pendingPhone,
        setPendingPhone,
        sendOtp,
        verifyOtp,
        updateProfile,
        signOutCustomer,
        setPendingAction,
        executePendingAction,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
