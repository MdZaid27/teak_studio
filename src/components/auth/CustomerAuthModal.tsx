"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

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
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(sanitized);
    setPendingPhone(sanitized);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setDevNotice(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(cleanPhone);
      if (res.success) {
        setStep("otp");
        setCountdown(30);
        if (res.devOtp || res.isDevFallback) {
          setDevNotice(`Test Environment: Use verification code ${res.devOtp || "123456"}`);
        }
        // Focus first OTP field
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
    await new Promise((resolve) => setTimeout(resolve, 400));

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
          className="absolute top-5 right-5 p-1.5 text-[#81746f] hover:text-[#0e0300] hover:bg-[#f0ede9] rounded-full transition-colors"
          aria-label="Close authentication modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="space-y-1 mb-6">
          <h2 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-medium leading-tight">
            {step === "phone" ? "Sign In" : "Verify Mobile Number"}
          </h2>
          <p className="text-xs text-[#81746f] leading-relaxed pt-1">
            {step === "phone"
              ? "Enter your mobile number to receive a one-time verification code."
              : `Enter the 6-digit code sent to +91 ${phone}`}
          </p>
        </div>

        {/* Feedback / Error Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {devNotice && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">info</span>
            <div className="flex-1 space-y-0.5">
              <span className="font-semibold block text-amber-800">Atelier Simulation Active</span>
              <p className="leading-relaxed text-amber-900">{devNotice}</p>
            </div>
          </div>
        )}

        {/* Step 1: Phone Input Form */}
        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                Mobile Number
              </label>
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
                  autoFocus
                  disabled={isSubmitting}
                  className="flex-1 px-3.5 py-3 text-sm font-mono text-[#0e0300] placeholder-[#81746f] bg-transparent focus:outline-none tracking-wider"
                />
              </div>
              <p className="text-[10px] text-[#81746f]">
                We will send a 6-digit OTP.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phone.length !== 10}
              className="w-full py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] disabled:bg-[#81746f] disabled:cursor-not-allowed transition-all rounded-xl font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Requesting Code...</span>
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
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
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
                  Resend Verification Code
                </button>
              ) : (
                <span>Resend code in <strong className="font-mono text-[#0e0300]">{countdown}s</strong></span>
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
