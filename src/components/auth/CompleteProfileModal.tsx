"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function CompleteProfileModal() {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    customerUser,
    profile,
    updateProfile,
    executePendingAction,
  } = useCustomerAuth();

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [email, setEmail] = useState(profile?.email || customerUser?.email || "");
  const [marketingOptIn, setMarketingOptIn] = useState(profile?.marketing_opt_in ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isProfileModalOpen) return null;

  const displayPhone = customerUser?.phone
    ? customerUser.phone.startsWith("+91")
      ? customerUser.phone
      : `+91 ${customerUser.phone}`
    : "+91 98765 43210";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Please enter both your first name and last name.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please provide a valid email address for bespoke order updates.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        marketingOptIn,
      });

      if (res.success) {
        setIsProfileModalOpen(false);
        executePendingAction();
      } else {
        setErrorMessage(res.error || "Failed to update profile. Please retry.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF9F6] border border-[#EAE7E1] shadow-2xl rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#895029]/40 via-[#895029] to-[#895029]/40" />

        {/* Dismiss Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 text-[#766E65] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] rounded-full transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Atelier Header (Stitch Screen 6ccd4d4b7df6463b95c5ed8d22908e4e) */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#895029] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#895029]" />
            Kiln Studio — Atelier Registration
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-medium leading-tight">
            Complete Your Profile
          </h2>
          <p className="text-xs text-[#766E65] leading-relaxed">
            Enter your details to finalize your patron membership and expedite white-glove commissions.
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2-Column First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                First Name <span className="text-[#895029]">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ananya"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                Last Name <span className="text-[#895029]">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Rao"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
              Email Address <span className="text-[#895029]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya.rao@example.com"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
            />
          </div>

          {/* Read-only Mobile Number */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase">
                Verified Mobile Number
              </label>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Verified Patron
              </span>
            </div>
            <div className="flex items-center px-3.5 py-2.5 bg-[#F5F4F0] border border-[#EAE7E1] rounded-xl text-sm font-mono text-[#4A453E] select-none">
              <span className="material-symbols-outlined text-[16px] text-[#766E65] mr-2">lock</span>
              <span>{displayPhone}</span>
            </div>
          </div>

          {/* Marketing & Atelier Previews Checkbox */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 rounded text-[#895029] focus:ring-[#895029] border-[#EAE7E1]"
            />
            <span className="text-xs text-[#766E65] leading-relaxed">
              Receive private previews of limited-batch timber releases and architectural design notes.
            </span>
          </label>

          {/* Submit CTA */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] disabled:bg-[#766E65] transition-all rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration &amp; Continue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
