"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  sanitizePhone,
  validateIndianPhone,
  sanitizePincode,
  validateIndianPincode,
  validateName,
} from "@/lib/validation";

interface SwatchRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWoodType?: string;
}

export function SwatchRequestModal({
  isOpen,
  onClose,
  defaultWoodType = "Complete Atelier Swatch Box",
}: SwatchRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    requestId: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhone(e.target.value);
    setPhone(sanitized);
    if (errorMessage && !validateIndianPhone(sanitized)) {
      setErrorMessage(null);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizePincode(e.target.value);
    setPincode(raw);
    if (errorMessage && !validateIndianPincode(raw)) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameErr = validateName(name, 2);
    if (nameErr) {
      setErrorMessage("Please enter your full name (minimum 2 characters).");
      return;
    }

    const phoneErr = validateIndianPhone(phone);
    if (phoneErr) {
      setErrorMessage(phoneErr);
      return;
    }

    const pinErr = validateIndianPincode(pincode);
    if (pinErr) {
      setErrorMessage(pinErr);
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage("Please provide a complete delivery address (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanPhone = sanitizePhone(phone);
      const response = await fetch("/api/swatch-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          address: `${address.trim()} (Timber: ${defaultWoodType})`,
          pincode: pincode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to process swatch box request. Please try again.");
      }

      setSuccessData({
        requestId: data.requestId || "CONFIRMED",
        message: data.message || "Material sample box request received.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setErrorMessage(null);
    setName("");
    setPhone("");
    setAddress("");
    setPincode("");
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleResetAndClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="swatch-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#fcf9f4] rounded-2xl shadow-2xl border border-[#311300]/15 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-[#2c1a11] text-[#fcf9f4] px-6 py-5 flex items-center justify-between border-b border-[#311300]">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#feb383] block">
              Atelier Material Experience
            </span>
            <h3 id="swatch-modal-title" className="font-display text-xl font-medium tracking-tight text-white mt-0.5">
              Request Timber Swatch Box
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {successData ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[#2c1a11] rounded-full flex items-center justify-center mx-auto text-[#feb383]">
                <span className="material-symbols-outlined text-3xl">inventory_2</span>
              </div>
              <div>
                <h4 className="font-display text-2xl text-[#2c1a11]">Sample Box Reserved</h4>
                <p className="text-xs text-[#52443c] mt-1">
                  Reference: <span className="font-mono font-semibold text-[#895029]">{successData.requestId.slice(0, 12)}</span>
                </p>
              </div>
              <div className="bg-[#f2ece4] p-4 rounded-xl text-left border border-[#e7d8ce] text-xs space-y-2 text-[#52443c]">
                <p className="font-medium text-[#2c1a11]">What happens next:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Hand-planed 120mm solid specimens of selected timbers.</li>
                  <li>Nilgiri raw beeswax &amp; cold-pressed linseed oil testing vials.</li>
                  <li>White-glove courier dispatched to your address in 24–48 hours.</li>
                </ul>
              </div>
              <p className="text-xs text-[#7d6e66] italic">
                The ₹1,800 deposit is fully credited toward your first furniture commission.
              </p>
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 bg-[#2c1a11] hover:bg-[#432c20] text-white font-medium text-xs tracking-wider uppercase rounded-lg transition-colors"
              >
                Close &amp; Return to Material Guide
              </button>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Specimen Badge */}
              <div className="p-3 bg-[#f2ece4] rounded-lg border border-[#e7d8ce] flex items-center justify-between text-xs">
                <span className="text-[#52443c]">Timber Focus:</span>
                <span className="font-semibold text-[#2c1a11]">{defaultWoodType}</span>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#52443c] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rao"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#d6c5b9] rounded-lg text-sm text-[#2c1a11] placeholder:text-[#a09085] focus:outline-none focus:border-[#895029] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#52443c] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#d6c5b9] rounded-lg text-sm font-mono text-[#2c1a11] placeholder:text-[#a09085] focus:outline-none focus:border-[#895029] transition-colors"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#52443c] mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Apartment, building, street, area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#d6c5b9] rounded-lg text-sm text-[#2c1a11] placeholder:text-[#a09085] focus:outline-none focus:border-[#895029] transition-colors"
                />
              </div>

              {/* Pincode */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-[#52443c]">
                    PIN Code (All-India Dispatch) *
                  </label>
                  <span className="text-[10px] text-[#8a7a70]">6 digits (non-zero start)</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d6c5b9] rounded-lg text-sm font-mono text-[#2c1a11] placeholder:text-[#a09085] focus:outline-none focus:border-[#895029] transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#2c1a11] hover:bg-[#895029] text-white font-medium text-xs tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"></span>
                      <span>Submitting Swatch Request...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">local_shipping</span>
                      <span>Dispatch Swatch Box — ₹1,800 Deposit</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-[#7d6e66] mt-2">
                  Sample deposit fully refunded against future furniture order.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Interactive Client Component Button to trigger the Swatch Modal.
 * Use this in Server Components so the host page retains fast server-side static rendering!
 */
export function SwatchRequestTrigger({
  woodType,
  label = "Request Swatch",
  className = "",
  variant = "primary",
}: {
  woodType: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "cta";
}) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultClasses =
    variant === "primary"
      ? "flex-1 bg-primary text-surface hover:bg-primary-container px-6 py-3.5 rounded font-title-md text-title-md transition-colors duration-150 flex items-center justify-center gap-2"
      : variant === "cta"
      ? "bg-surface text-primary hover:bg-surface-container-high px-8 py-4 rounded font-title-md text-title-md transition-colors duration-150 flex items-center justify-center gap-2 shadow-lg"
      : "px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-surface rounded font-title-md transition-colors duration-150";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || defaultClasses}
      >
        <span className="material-symbols-outlined text-lg">layers</span>
        <span>{label}</span>
      </button>

      <SwatchRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultWoodType={woodType}
      />
    </>
  );
}
