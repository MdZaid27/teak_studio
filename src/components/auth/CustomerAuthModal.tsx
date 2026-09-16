"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface PatronDetection {
  name?: string;
  maskedEmail: string;
}

function CustomerAuthModalContent() {
  const {
    setIsAuthModalOpen,
    sendOtp,
    verifyOtp,
    pendingPhone,
    setPendingPhone,
  } = useCustomerAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState(pendingPhone || "");
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [patronFound, setPatronFound] = useState<PatronDetection | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const checkAbortRef = useRef<AbortController | null>(null);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const canResend = countdown === 0;

  // Smart check if the phone number belongs to an existing patron
  const checkPhoneAccount = useCallback(async (phoneDigits: string) => {
    if (checkAbortRef.current) {
      checkAbortRef.current.abort();
    }
    const controller = new AbortController();
    checkAbortRef.current = controller;

    setIsCheckingPhone(true);
    try {
      const res = await fetch(`/api/auth/otp/check-phone?phone=${encodeURIComponent(phoneDigits)}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      if (data.success && data.exists) {
        setPatronFound({
          name: data.name,
          maskedEmail: data.maskedEmail,
        });
        setShowEmailInput(false);
      } else {
        setPatronFound(null);
        setShowEmailInput(true);
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 100);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      // Default to showing email if check fails
      setShowEmailInput(true);
    } finally {
      setIsCheckingPhone(false);
    }
  }, []);

  // Handle phone number input with immediate 10-digit auto-detection
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(sanitized);
    setPendingPhone(sanitized);
    if (errorMessage) setErrorMessage(null);

    if (sanitized.length === 10 && /^[6-9]\d{9}$/.test(sanitized)) {
      checkPhoneAccount(sanitized);
    } else {
      if (checkAbortRef.current) checkAbortRef.current.abort();
      setPatronFound(null);
      setShowEmailInput(false);
      setIsCheckingPhone(false);
    }
  };

  // Initial check if opened with a prefilled 10-digit phone
  useEffect(() => {
    if (phone.length === 10 && /^[6-9]\d{9}$/.test(phone)) {
      checkPhoneAccount(phone);
    }
    return () => {
      if (checkAbortRef.current) checkAbortRef.current.abort();
    };
  }, []); // Run on initial mount

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    if (showEmailInput) {
      const cleanEmail = email.trim();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setErrorMessage("Please enter a valid email address to receive your access pass.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(cleanPhone, showEmailInput ? email.trim() : undefined);
      if (res.requiresEmail) {
        setShowEmailInput(true);
        setErrorMessage(res.error || "Welcome to TEAK HAUS. Please provide your email to receive your access pass.");
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 100);
        return;
      }

      if (res.success) {
        setMaskedEmail(res.maskedEmail || patronFound?.maskedEmail || null);
        setStep("otp");
        setCountdown(30);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(res.error || "Failed to send verification code. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while requesting OTP.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    if (errorMessage) setErrorMessage(null);

    // Auto-advance to next input
    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are typed
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      submitVerification(fullOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    if (pasted.length === 6) {
      submitVerification(pasted);
    } else {
      otpInputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const submitVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Brief delay to give visual feedback of the verifying state before transition
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const res = await verifyOtp(phone, code);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid or expired code. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify code.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (!canResend || isSubmitting) return;
    setOtp(["", "", "", "", "", ""]);
    handleSendCode();
  };

  const isFormValid =
    phone.length === 10 &&
    (!showEmailInput || (email.trim().length > 0 && email.includes("@")));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF9F6] border border-[#d3c3bd]/70 shadow-2xl rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#895029]/40 via-[#895029] to-[#895029]/40" />

        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 text-[#81746f] hover:text-[#0e0300] hover:bg-[#f0ede9] rounded-full transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#895029] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#895029]" />
            TEAK HAUS &mdash; Patron Atelier
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-medium leading-tight">
            {step === "phone" ? "Sign In" : "Verify Access Pass"}
          </h2>
          <p className="text-xs text-[#81746f] leading-relaxed pt-1">
            {step === "phone"
              ? "Enter your mobile number to receive your secure atelier access pass via email."
              : maskedEmail
              ? `Enter the 6-digit access pass sent to ${maskedEmail} for +91 ${phone}.`
              : `Enter the 6-digit access pass sent to your registered email for +91 ${phone}.`}
          </p>
        </div>

        {/* Feedback / Error Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Step 1: Phone & Smart Auto-Detected Email Form */}
        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300]">
                  Mobile Number
                </label>
                {isCheckingPhone && (
                  <span className="flex items-center gap-1 text-[10px] text-[#895029] font-medium">
                    <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
                    Checking account...
                  </span>
                )}
              </div>

              <div className="flex items-center border border-[#d3c3bd] rounded-xl bg-white overflow-hidden focus-within:border-[#895029] focus-within:ring-1 focus-within:ring-[#895029]/30 transition-all">
                <span className="px-3.5 py-3 bg-[#f0ede9] text-[#2c1a11] font-mono text-sm font-semibold border-r border-[#d3c3bd] select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  autoFocus={!showEmailInput}
                  disabled={isSubmitting}
                  className="flex-1 px-3.5 py-3 text-sm font-mono text-[#0e0300] placeholder-[#81746f] bg-transparent focus:outline-none tracking-wider"
                />
              </div>
            </div>

            {/* Smart Detection Case A: Recognized Patron */}
            {patronFound && !showEmailInput && (
              <div className="p-3.5 bg-[#f7f2eb] border border-[#e4d8c8] rounded-xl flex items-start gap-2.5 text-xs text-[#2c1a11] animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="material-symbols-outlined text-[18px] text-[#895029] shrink-0 mt-0.5">verified_user</span>
                <div className="flex-1 space-y-0.5">
                  <span className="font-semibold block text-[#0e0300]">
                    Welcome back{patronFound.name ? `, ${patronFound.name}` : ""}!
                  </span>
                  <p className="text-[#81746f] text-[11px] leading-relaxed">
                    Verification pass will be emailed to <strong className="text-[#0e0300] font-mono">{patronFound.maskedEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowEmailInput(true)}
                    className="text-[10px] text-[#895029] hover:text-[#0e0300] underline font-medium pt-1 block cursor-pointer"
                  >
                    Need to use a different email?
                  </button>
                </div>
              </div>
            )}

            {/* Smart Detection Case B: New Patron */}
            {showEmailInput && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-[#fdfcf9] border border-[#d3c3bd] rounded-xl flex items-start gap-2.5 text-xs text-[#2c1a11]">
                  <span className="material-symbols-outlined text-[18px] text-[#895029] shrink-0 mt-0.5">stars</span>
                  <div className="flex-1 space-y-0.5">
                    <span className="font-semibold block text-[#0e0300]">
                      {patronFound ? "Update Delivery Email" : "New Patron Atelier Access"}
                    </span>
                    <p className="text-[#81746f] text-[11px] leading-relaxed">
                      {patronFound
                        ? "Enter the email where you'd like your access code delivered."
                        : "Enter your email address below to receive your secure access pass."}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                    Email Address
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="patron@example.com"
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-3 text-sm text-[#0e0300] placeholder-[#81746f] border border-[#d3c3bd] rounded-xl bg-white focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid || isCheckingPhone}
              className="w-full mt-2 py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] disabled:bg-[#81746f] disabled:cursor-not-allowed transition-all rounded-xl font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Dispatching Pass...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Form */
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300]">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setErrorMessage(null);
                  }}
                  className="text-[11px] text-[#895029] hover:text-[#0e0300] font-medium hover:underline cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              {/* 6 Input Boxes */}
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[idx] || ""}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    disabled={isSubmitting}
                    className="w-11 sm:w-12 h-14 text-center text-xl font-bold font-mono border border-[#d3c3bd] rounded-xl bg-white focus:border-[#895029] focus:ring-2 focus:ring-[#895029]/20 focus:outline-none transition-all text-[#0e0300]"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => submitVerification()}
              disabled={isSubmitting || otp.join("").length !== 6}
              className="w-full py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] disabled:bg-[#81746f] disabled:cursor-not-allowed transition-all rounded-xl font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Verifying Pass...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Sign In</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="text-center pt-1 text-xs text-[#81746f]">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSubmitting}
                  className="text-[#895029] hover:text-[#0e0300] font-semibold hover:underline cursor-pointer"
                >
                  Resend Access Pass
                </button>
              ) : (
                <span>Resend pass in <strong className="font-mono text-[#0e0300]">{countdown}s</strong></span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerAuthModal() {
  const { isAuthModalOpen } = useCustomerAuth();
  if (!isAuthModalOpen) return null;
  return <CustomerAuthModalContent />;
}
