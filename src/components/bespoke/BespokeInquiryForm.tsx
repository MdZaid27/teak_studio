"use client";

import React, { useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import {
  sanitizePhone,
  validateIndianPhone,
  sanitizePincode,
  validateIndianPincode,
  validateEmail,
  validateName,
} from "@/lib/validation";

const PROJECT_TYPES = [
  { value: "Custom Dining", label: "Custom Dining & Tables" },
  { value: "Residential", label: "Full Residential Suite" },
  { value: "Commercial", label: "Commercial / Hospitality" },
  { value: "Architectural", label: "Architectural Credenza / Storage" },
  { value: "Bespoke Platform Bed", label: "Bespoke Bedroom Suite" },
];

const BUDGET_OPTIONS = [
  { value: "₹1.5L - ₹3L", label: "₹1.5L – ₹3L (Single Piece Focus)" },
  { value: "₹3L - ₹6L", label: "₹3L – ₹6L (Dining Set & Credenza)" },
  { value: "₹6L - ₹12L", label: "₹6L – ₹12L (Multi-Room Commission)" },
  { value: "₹12L+ / Estate Portfolio", label: "₹12L+ / Estate Commission" },
];

export default function BespokeInquiryForm() {
  const [typology, setTypology] = useState("dining");
  const [projectType, setProjectType] = useState("Custom Dining");
  const [budgetRange, setBudgetRange] = useState("₹1.5L - ₹3L");
  const [referenceFileUrl, setReferenceFileUrl] = useState("");
  const [woodPreference, setWoodPreference] = useState("Hunsur Teak");
  const [dimensionsNotes, setDimensionsNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ inquiryId: string; message: string } | null>(
    null
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhone(e.target.value);
    setPhone(sanitized);
    if (errorMessage && !validateIndianPhone(sanitized)) {
      setErrorMessage(null);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePincode(e.target.value);
    setPincode(clean);
    if (errorMessage && !validateIndianPincode(clean)) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameErr = validateName(name, 2);
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

    const pinErr = validateIndianPincode(pincode);
    if (pinErr) {
      setErrorMessage(pinErr);
      return;
    }

    if (!dimensionsNotes.trim() || dimensionsNotes.trim().length < 5) {
      setErrorMessage(
        "Please share approximate dimensions and space context (at least 5 characters)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanPhone = sanitizePhone(phone);
      const typologyNames: Record<string, string> = {
        dining: "Architectural Dining Table",
        storage: "Credenza / Storage",
        seating: "Seating / Chairs",
        bed: "Platform Bed",
        full: "Full Residence Commission",
      };

      const notesPayload = `[Typology: ${
        typologyNames[typology] || typology
      }]\n${dimensionsNotes.trim()}`;

      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patron_name: name.trim(),
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim().toLowerCase(),
          pincode: pincode.trim(),
          project_type: projectType,
          budget_range: budgetRange,
          reference_file_url: referenceFileUrl.trim() || undefined,
          timber_preference: woodPreference,
          wood_preference: woodPreference,
          dimensions_notes: notesPayload,
          message: notesPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to register your commission. Please try again.");
      }

      setSuccessData({
        inquiryId: data.inquiryId || "RECEIVED",
        message: data.message || "Your bespoke inquiry has been received.",
      });

      // Clear fields
      setDimensionsNotes("");
      setReferenceFileUrl("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="py-8 px-6 bg-surface-container-low rounded-xl border border-secondary/30 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">task_alt</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl md:text-3xl text-primary font-medium">
            Commission Brief Received
          </h3>
          <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
            {successData.message}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface rounded-full border border-outline-variant/50 text-xs font-mono text-primary">
            <span>Inquiry Reference:</span>
            <span className="font-semibold text-secondary">
              {successData.inquiryId.slice(0, 13)}
            </span>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-surface p-4 rounded-lg border border-outline-variant/30 text-left text-xs text-on-surface-variant space-y-2">
          <p className="font-semibold text-primary">Next Steps with TEAK HAUS:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Our atelier furniture architect will review your spatial context.</li>
            <li>We will reach out via WhatsApp or phone within 24 hours.</li>
            <li>Complimentary CAD blueprint drafting and wood timber matching.</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSuccessData(null)}
            className="px-8 py-3 bg-primary text-surface rounded-lg font-title-md text-title-md hover:bg-tertiary-container transition-all cursor-pointer"
          >
            Submit Another Commission Brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-space-xl" id="bespokeForm" onSubmit={handleSubmit}>
      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
          <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Category Selection */}
      <div>
        <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-xs tracking-wider">
          1. Select Furniture Typology
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-xs">
          {[
            { id: "dining", label: "Dining Table" },
            { id: "storage", label: "Credenza / Storage" },
            { id: "seating", label: "Seating / Chairs" },
            { id: "bed", label: "Platform Bed" },
            { id: "full", label: "Full Residence" },
          ].map((cat) => (
            <label key={cat.id} className="cursor-pointer">
              <input
                className="peer sr-only"
                name="furniture_category"
                type="radio"
                value={cat.id}
                checked={typology === cat.id}
                onChange={() => setTypology(cat.id)}
              />
              <div className="h-12 flex items-center justify-center text-center px-3 border border-outline-variant/40 rounded bg-surface peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary font-body-sm text-body-sm transition-all duration-150">
                {cat.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2: Preferred Timber */}
      <div>
        <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-xs tracking-wider">
          2. Preferred Timber Species
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
          {[
            { id: "Hunsur Teak", title: "Hunsur Teak", desc: "Golden Amber, Dense Grain" },
            {
              id: "Indian Rosewood",
              title: "Indian Rosewood",
              desc: "Deep Espresso, High Lustre",
            },
            { id: "Assam Teak", title: "Assam Teak", desc: "Light Honey, Linear Figure" },
            {
              id: "Recommend Based on Space",
              title: "Recommend Based on Space",
              desc: "Studio Consultation",
            },
          ].map((wood) => (
            <label key={wood.id} className="cursor-pointer">
              <input
                className="peer sr-only"
                name="wood_preference"
                type="radio"
                value={wood.id}
                checked={woodPreference === wood.id}
                onChange={() => setWoodPreference(wood.id)}
              />
              <div className="p-3 border border-outline-variant/40 rounded bg-surface peer-checked:border-primary peer-checked:bg-surface-container transition-all h-full">
                <div className="font-title-md text-title-md text-primary">{wood.title}</div>
                <div className="text-outline text-label-sm font-label-sm">{wood.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 3: Dimensions and Brief Notes */}
      <div>
        <label
          className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider"
          htmlFor="dimensions"
        >
          3. Approximate Dimensions &amp; Spatial Context *
        </label>
        <textarea
          className="w-full bg-surface border border-outline-variant/50 rounded-lg p-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0 placeholder:text-outline/60 transition-colors"
          id="dimensions"
          placeholder="E.g., 8-seater dining table, approx 240cm x 100cm, for Indiranagar apartment with direct western sunlight and beige travertine floors."
          required
          rows={3}
          value={dimensionsNotes}
          onChange={(e) => setDimensionsNotes(e.target.value)}
        />
      </div>

      {/* Step 4: Contact & PIN Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div>
          <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">
            Full Name *
          </label>
          <input
            className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0"
            placeholder="e.g. Vikramaditya Rao"
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">
            Phone / WhatsApp *
          </label>
          <input
            className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md font-mono text-primary focus:border-primary focus:ring-0"
            placeholder="9876543210"
            maxLength={10}
            required
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
          />
        </div>
        <div>
          <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">
            Email Address *
          </label>
          <input
            className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0"
            placeholder="vikram@designstudio.in"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-space-2xs">
            <label className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
              Postal PIN Code *
            </label>
            <span className="text-[10px] text-outline">6 digits (no 0 start)</span>
          </div>
          <input
            className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md font-mono text-primary focus:border-primary focus:ring-0"
            placeholder="e.g. 560038"
            maxLength={6}
            required
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
          />
        </div>
      </div>

      {/* Project Type & Budget Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div>
          <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">
            Project Typology Scope
          </label>
          <CustomSelect
            value={projectType}
            onChange={setProjectType}
            options={PROJECT_TYPES}
            fullWidth
            buttonClassName="h-12 text-sm !rounded-lg"
            align="left"
          />
        </div>

        <div>
          <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">
            Anticipated Budget Framework
          </label>
          <CustomSelect
            value={budgetRange}
            onChange={setBudgetRange}
            options={BUDGET_OPTIONS}
            fullWidth
            buttonClassName="h-12 text-sm !rounded-lg"
            align="left"
          />
        </div>
      </div>

      {/* File URL or CAD Reference */}
      <div>
        <label className="block font-label-caps text-label-caps uppercase text-outline mb-space-2xs tracking-wider">
          Reference Sketch or Moodboard URL (Optional)
        </label>
        <input
          type="url"
          placeholder="https://... or cloud drive link to blueprints, sketches, or photos"
          value={referenceFileUrl}
          onChange={(e) => setReferenceFileUrl(e.target.value)}
          className="h-12 w-full bg-surface border border-outline-variant/50 rounded-lg px-space-md font-body-md text-body-md text-primary focus:border-primary focus:ring-0 font-mono text-xs"
        />
      </div>

      {/* Submission Actions */}
      <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-outline-variant/30">
        <button
          className="w-full sm:w-auto h-12 px-8 bg-primary text-surface rounded-lg font-title-md text-title-md hover:bg-tertiary-container transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin shrink-0"></span>
              <span>Transmitting Brief to Atelier...</span>
            </>
          ) : (
            <span>Start Your Custom Order</span>
          )}
        </button>
        <a
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 border border-primary text-primary rounded-full font-title-md text-title-md hover:bg-primary hover:text-surface transition-all active:scale-95"
          href="https://wa.me/918041238900"
          rel="noopener"
          target="_blank"
        >
          <span className="material-symbols-outlined text-lg">chat</span>
          <span>Talk to Us on WhatsApp (+91 80 4123 8900)</span>
        </a>
      </div>
    </form>
  );
}
