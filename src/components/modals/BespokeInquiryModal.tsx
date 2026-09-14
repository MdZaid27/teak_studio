"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import ModalShell from "@/components/ui/ModalShell";
import {
  sanitizePhone,
  validateIndianPhone,
  validateEmail,
  validateName,
} from "@/lib/validation";

export interface BespokeInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectType?: string;
  defaultTimber?: string;
}

const PROJECT_TYPES = [
  {
    id: "Residential Residence",
    label: "Residential Residence",
    desc: "Whole-home solid timber suites & master bedrooms",
  },
  {
    id: "Commercial / Hospitality",
    label: "Commercial / Hospitality",
    desc: "Boutique hotels, executive offices & private clubs",
  },
  {
    id: "Custom Dining Statement",
    label: "Custom Dining Statement",
    desc: "Monolithic 8-14 seater tables with brass inlays",
  },
  {
    id: "Architectural Joinery",
    label: "Architectural Joinery",
    desc: "Fluted room dividers, credenzas & wall paneling",
  },
];

const TIMBER_OPTIONS = [
  {
    id: "Hunsur Teak",
    label: "Hunsur Teak (Karnataka)",
    desc: "High natural oil content, golden-amber honey grain",
  },
  {
    id: "Malabar Rosewood",
    label: "Malabar Rosewood",
    desc: "Deep dark chocolate with violet-black streaks",
  },
  {
    id: "Assam Teak",
    label: "Assam Teak (North-East)",
    desc: "Fine, tight-grain ring structure for precision joinery",
  },
  {
    id: "Curator Consultation",
    label: "Curator Consultation",
    desc: "Guided timber matching based on your lighting and floor",
  },
];

const BUDGET_RANGES = [
  "₹1,50,000 - ₹3,00,000",
  "₹3,00,000 - ₹6,00,000",
  "₹6,00,000 - ₹12,00,000",
  "₹12,00,000+ (Comprehensive Suite)",
];

export function BespokeInquiryModal({
  isOpen,
  onClose,
  defaultProjectType = "Custom Dining Statement",
  defaultTimber = "Hunsur Teak",
}: BespokeInquiryModalProps) {
  const [patronName, setPatronName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState(defaultProjectType);
  const [timberPreference, setTimberPreference] = useState(defaultTimber);
  const [approxDimensions, setApproxDimensions] = useState("");
  const [budgetRange, setBudgetRange] = useState(BUDGET_RANGES[1]);
  const [briefNotes, setBriefNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    inquiryId: string;
    message: string;
  } | null>(null);

  // Sync props
  useEffect(() => {
    if (defaultProjectType) setProjectType(defaultProjectType);
  }, [defaultProjectType]);

  useEffect(() => {
    if (defaultTimber) setTimberPreference(defaultTimber);
  }, [defaultTimber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhone(e.target.value);
    setPhone(sanitized);
    if (errorMessage && !validateIndianPhone(sanitized)) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameErr = validateName(patronName, 2);
    if (nameErr) {
      setErrorMessage(nameErr);
      return;
    }

    const phoneErr = validateIndianPhone(phone);
    if (phoneErr) {
      setErrorMessage(phoneErr);
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }

    if (!briefNotes.trim() || briefNotes.trim().length < 5) {
      setErrorMessage(
        "Please provide brief notes or architectural requirements (at least 5 characters)."
      );
      return;
    }

    setIsSubmitting(true);

    const cleanPhone = sanitizePhone(phone);
    const payload = {
      patron_name: patronName.trim(),
      name: patronName.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      project_type: projectType,
      timber_preference: timberPreference,
      wood_preference: timberPreference,
      approx_dimensions: approxDimensions.trim() || undefined,
      budget_range: budgetRange,
      message: briefNotes.trim(),
      dimensions_notes: briefNotes.trim(),
    };

    try {
      let res = await fetch("/api/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch("/api/commissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to register your commission brief. Please try again.");
      }

      setSuccessData({
        inquiryId: data.inquiryId || data.id || "RECEIVED",
        message:
          data.message ||
          "Your bespoke commission inquiry has been received. Our furniture architects will contact you within 24 hours.",
      });

      setBriefNotes("");
      setApproxDimensions("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setPatronName("");
    setEmail("");
    setPhone("");
    setApproxDimensions("");
    setBriefNotes("");
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      category="Custom Joinery Commission"
      title="Commission Bespoke Furniture"
      maxWidth="max-w-2xl"
    >
      {successData ? (
        <div className="py-8 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-3xl">handyman</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4A373]">
              Brief Registered
            </span>
            <h3 className="font-serif text-2xl text-[#FAF9F6] font-medium">
              Commission Brief Received
            </h3>
            <p className="text-sm text-[#A8A29E] max-w-md mx-auto leading-relaxed">
              {successData.message}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#121110] rounded-xl border border-[#2A2724] text-xs font-mono text-[#D4A373]">
            <span className="text-[#766E65]">Inquiry Reference:</span>
            <span className="font-semibold">{successData.inquiryId.slice(0, 16)}</span>
          </div>

          <div className="p-4 bg-[#121110] rounded-xl border border-[#2A2724] text-left text-xs text-[#A8A29E] space-y-2 max-w-md mx-auto">
            <p className="font-semibold text-[#FAF9F6] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#D4A373]">architecture</span>
              Commission Consultation Path
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#766E65]">
              <li>Architectural CAD blueprint drafting & dimensional clearance analysis.</li>
              <li>Hand-delivered live timber grain swatches to your residence.</li>
              <li>Fixed 6-8 week kiln curing & mortise fabrication window.</li>
            </ul>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#D4A373] text-[#121110] text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#E2B789] transition-colors cursor-pointer"
            >
              Done
            </button>
            <a
              href="https://wa.me/918041238900"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1F1D1A] border border-[#2A2724] text-[#FAF9F6] text-xs font-medium rounded-xl hover:bg-[#2A2724] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
              WhatsApp Atelier Architect
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <span className="material-symbols-outlined text-sm shrink-0 mt-0.5 text-red-400">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Project Type Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block">
              01. Project Typology <span className="text-[#D4A373]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROJECT_TYPES.map((pt) => {
                const isSelected = projectType === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setProjectType(pt.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#1E1C1A] border-[#D4A373] text-[#FAF9F6]"
                        : "bg-[#121110] border-[#2A2724] text-[#A8A29E] hover:border-[#3E3A34] hover:text-[#FAF9F6]"
                    }`}
                  >
                    <span className="font-serif text-xs font-medium text-[#FAF9F6]">
                      {pt.label}
                    </span>
                    <span className="text-[10px] text-[#766E65] mt-1 leading-relaxed">
                      {pt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Timber Preference Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block">
              02. Primary Timber Preference <span className="text-[#D4A373]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TIMBER_OPTIONS.map((t) => {
                const isSelected = timberPreference === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTimberPreference(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#1E1C1A] border-[#D4A373] text-[#FAF9F6]"
                        : "bg-[#121110] border-[#2A2724] text-[#A8A29E] hover:border-[#3E3A34] hover:text-[#FAF9F6]"
                    }`}
                  >
                    <span className="font-serif text-xs font-medium text-[#FAF9F6]">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-[#766E65] mt-1 leading-relaxed">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Dimensions and Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#A8A29E] block">
                Approx. Space Dimensions <span className="text-[#766E65]">(Optional)</span>
              </label>
              <input
                type="text"
                value={approxDimensions}
                onChange={(e) => setApproxDimensions(e.target.value)}
                placeholder="e.g. 10ft x 4ft table / 2200 sqft room"
                className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A8A29E] block">
                Anticipated Budget Range <span className="text-[#D4A373]">*</span>
              </label>
              <CustomSelect
                value={budgetRange}
                onChange={setBudgetRange}
                options={BUDGET_RANGES}
                variant="dark"
                fullWidth
                buttonClassName="py-2.5"
              />
            </div>
          </div>

          {/* 4. Brief Notes */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#A8A29E] block">
              Architectural Brief &amp; Design Notes <span className="text-[#D4A373]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={briefNotes}
              onChange={(e) => setBriefNotes(e.target.value)}
              placeholder="Describe your design intent, floor finish pairing, seating capacity, or live-edge preferences..."
              className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors resize-none"
            />
          </div>

          {/* 5. Contact Information */}
          <div className="space-y-4 pt-2 border-t border-[#2A2724]">
            <span className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block">
              03. Patron Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#A8A29E] block">
                  Full Name <span className="text-[#D4A373]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patronName}
                  onChange={(e) => setPatronName(e.target.value)}
                  placeholder="e.g. Sonal Ambani"
                  className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#A8A29E] block">
                  Mobile / WhatsApp Number <span className="text-[#D4A373]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono text-[#766E65] select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    className="w-full pl-11 pr-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs font-mono text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A8A29E] block">
                Email Address <span className="text-[#D4A373]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sonal@designpractice.com"
                className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#D4A373] hover:bg-[#E2B789] text-[#121110] font-semibold text-xs tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 shadow-lg shadow-[#D4A373]/15"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#121110] border-t-transparent rounded-full animate-spin"></span>
                  <span>Registering Commission Brief...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">architecture</span>
                  <span>Submit Bespoke Commission Brief</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

export default BespokeInquiryModal;
