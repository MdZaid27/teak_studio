"use client";

import React, { useState, useEffect } from "react";
import ModalShell from "@/components/ui/ModalShell";
import AtelierCalendar from "@/components/ui/AtelierCalendar";
import {
  sanitizePhone,
  validateIndianPhone,
  validateEmail,
  validateName,
} from "@/lib/validation";

export interface StudioBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  source?: string;
}

const STUDIOS = [
  {
    id: "indiranagar",
    name: "Indiranagar Flagship Atelier",
    fullName: "Indiranagar Flagship Atelier",
    address: "100ft Road, Indiranagar, Bengaluru",
    description: "Full collections, live timber archive & bespoke design consultations",
  },
  {
    id: "whitefield",
    name: "Whitefield Experience Studio",
    fullName: "Whitefield Experience Studio",
    address: "ITPB Main Road, Whitefield, Bengaluru",
    description: "Curated heirloom dining sets, finish swatches & custom dimensions",
  },
];

const TIME_SLOTS = [
  "11:00 AM – 12:30 PM",
  "02:00 PM – 03:30 PM",
  "04:00 PM – 05:30 PM",
  "06:00 PM – 07:30 PM",
];

export function StudioBookingModal({
  isOpen,
  onClose,
  defaultLocation,
}: StudioBookingModalProps) {
  const [selectedStudio, setSelectedStudio] = useState(
    defaultLocation || "Indiranagar Flagship Atelier"
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [patronName, setPatronName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    bookingId: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (defaultLocation) {
      const match = STUDIOS.find(
        (s) =>
          s.fullName.toLowerCase() === defaultLocation.toLowerCase() ||
          s.name.toLowerCase() === defaultLocation.toLowerCase()
      );
      if (match) {
        setSelectedStudio(match.fullName);
      }
    }
  }, [defaultLocation]);

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

    if (!selectedDate) {
      setErrorMessage("Please select a preferred walkthrough date.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      patron_name: patronName.trim(),
      email: email.trim().toLowerCase(),
      phone: sanitizePhone(phone),
      studio_location: selectedStudio,
      preferred_date: selectedDate,
      preferred_time_slot: selectedTimeSlot,
      notes: notes.trim() || undefined,
    };

    try {
      let res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch("/api/studio-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to reserve studio appointment. Please try again.");
      }

      setSuccessData({
        bookingId: data.bookingId || data.id || "CONFIRMED",
        message:
          data.message ||
          `Your private atelier walkthrough at ${selectedStudio} has been confirmed. A curator will reach out shortly.`,
      });

      setNotes("");
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
    setNotes("");
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      category="Private Atelier Appointment"
      title="Book Studio Walkthrough"
      maxWidth="max-w-xl"
    >
      {successData ? (
        <div className="py-8 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-3xl">done_all</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4A373]">
              Walkthrough Reserved
            </span>
            <h3 className="font-serif text-2xl text-[#FAF9F6] font-medium">
              We look forward to hosting you
            </h3>
            <p className="text-sm text-[#A8A29E] max-w-md mx-auto leading-relaxed">
              {successData.message}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#121110] rounded-xl border border-[#2A2724] text-xs font-mono text-[#D4A373]">
            <span className="text-[#766E65]">Reference:</span>
            <span className="font-semibold">{successData.bookingId.slice(0, 16)}</span>
          </div>

          <div className="p-4 bg-[#121110] rounded-xl border border-[#2A2724] text-left text-xs text-[#A8A29E] space-y-2 max-w-md mx-auto">
            <p className="font-semibold text-[#FAF9F6] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#D4A373]">info</span>
              Appointment Details
            </p>
            <div className="space-y-1 text-[#766E65]">
              <p>
                <span className="text-[#FAF9F6]">Location:</span> {selectedStudio}
              </p>
              <p>
                <span className="text-[#FAF9F6]">Date:</span> {selectedDate} ({selectedTimeSlot})
              </p>
              <p>
                <span className="text-[#FAF9F6]">Guest:</span> {patronName} ({phone})
              </p>
            </div>
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
              WhatsApp Concierge
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

          {/* 1. Studio Location Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block">
              01. Select Atelier Location <span className="text-[#D4A373]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STUDIOS.map((studio) => {
                const isSelected = selectedStudio === studio.fullName;
                return (
                  <label
                    key={studio.id}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer block relative ${
                      isSelected
                        ? "bg-[#1E1C1A] border-[#D4A373] shadow-sm shadow-[#D4A373]/10"
                        : "bg-[#121110] border-[#2A2724] hover:border-[#3E3A34] hover:bg-[#181614]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-serif text-sm font-medium text-[#FAF9F6]">
                        {studio.name}
                      </span>
                      <input
                        id={`studio-${studio.id}`}
                        type="radio"
                        name="studio_location"
                        value={studio.fullName}
                        checked={isSelected}
                        onChange={() => setSelectedStudio(studio.fullName)}
                        className="w-4 h-4 accent-[#D4A373] mt-0.5"
                      />
                    </div>
                    <p className="text-[11px] text-[#766E65] leading-relaxed line-clamp-2">
                      {studio.description}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {/* Custom Calendar Date Picker */}
            <div className="flex flex-col">
              <label className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block mb-1.5">
                02. Preferred Date <span className="text-[#D4A373]">*</span>
              </label>

              <AtelierCalendar
                value={selectedDate}
                onChange={setSelectedDate}
              />

              <span className="text-[10px] text-[#766E65] block mt-1.5">
                Reservations available Mon – Sun
              </span>
            </div>

            {/* Time Slot Selector */}
            <div className="flex flex-col">
              <label className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block mb-1.5">
                03. Preferred Time Slot <span className="text-[#D4A373]">*</span>
              </label>
              <div className="flex-1 flex flex-col justify-between gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`w-full flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#D4A373]/15 border-[#D4A373] text-[#FAF9F6] shadow-xs"
                          : "bg-[#121110] border-[#2A2724] text-[#A8A29E] hover:border-[#3E3A34] hover:text-[#FAF9F6]"
                      }`}
                    >
                      <span>{slot}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? "bg-[#D4A373]" : "bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-[#766E65] block mt-1.5">
                Private 90-minute bespoke walkthrough
              </span>
            </div>
          </div>

          {/* 3. Guest Details */}
          <div className="space-y-4 pt-2 border-t border-[#2A2724]">
            <span className="text-[11px] font-mono tracking-wider text-[#A8A29E] uppercase block">
              04. Patron Information
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
                  placeholder="e.g. Anand Mahindra"
                  className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#A8A29E] block">
                  Mobile Number <span className="text-[#D4A373]">*</span>
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
                placeholder="anand@mahindra.com"
                className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A8A29E] block">
                Specific Pieces or Commission Brief Notes{" "}
                <span className="text-[#766E65]">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any particular dining tables, timber preferences, or dimensional requirements..."
                className="w-full px-3.5 py-2.5 bg-[#121110] border border-[#2A2724] rounded-xl text-xs text-[#FAF9F6] placeholder-[#4A453E] focus:outline-none focus:border-[#D4A373] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#D4A373] hover:bg-[#E2B789] text-[#121110] font-semibold text-xs tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 shadow-lg shadow-[#D4A373]/15"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#121110] border-t-transparent rounded-full animate-spin"></span>
                  <span>Reserving Atelier Walkthrough...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  <span>Confirm Studio Walkthrough</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

export default StudioBookingModal;
