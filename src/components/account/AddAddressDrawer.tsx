"use client";

import React, { useState } from "react";
import { DbPatronAddress, CreatePatronAddressInput, AddressTag, DbPatronProfile } from "@/types/database";
import { getPincodeDetailsSync, lookupPincode } from "@/lib/pincode";
import { useCustomerAuth, CustomerUser } from "@/context/CustomerAuthContext";

interface AddAddressDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (address: DbPatronAddress) => void;
  addressToEdit?: DbPatronAddress | null;
}

interface AddressDrawerFormProps {
  addressToEdit?: DbPatronAddress | null;
  customerUser: CustomerUser | null;
  profile: DbPatronProfile | null;
  onClose: () => void;
  onAddressSaved: (address: DbPatronAddress) => void;
}

function AddressDrawerForm({
  addressToEdit,
  customerUser,
  profile,
  onClose,
  onAddressSaved,
}: AddressDrawerFormProps) {
  const initialPhone = (addressToEdit?.phone || profile?.phone || customerUser?.phone || "")
    .replace(/\D/g, "")
    .slice(-10);

  const [floorBuilding, setFloorBuilding] = useState(addressToEdit?.floor_building || "");
  const [areaStreet, setAreaStreet] = useState(addressToEdit?.area_street || "");
  const [pincode, setPincode] = useState(addressToEdit?.pincode || "560038");
  const [city, setCity] = useState(addressToEdit?.city || "Bengaluru");
  const [state, setState] = useState(addressToEdit?.state || "Karnataka");
  const [firstName, setFirstName] = useState(addressToEdit?.first_name || profile?.first_name || "");
  const [lastName, setLastName] = useState(addressToEdit?.last_name || profile?.last_name || "");
  const [email, setEmail] = useState(addressToEdit?.email || profile?.email || customerUser?.email || "");
  const [phone, setPhone] = useState(initialPhone);
  const [saveAs, setSaveAs] = useState<AddressTag>(addressToEdit?.save_as || "Home");
  const [isDefault, setIsDefault] = useState(addressToEdit?.is_default || false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pincodeLocalityNotice, setPincodeLocalityNotice] = useState<string | null>(
    addressToEdit ? null : "Indiranagar 100ft Road, Defence Colony"
  );

  // Real-time Pincode Auto-population
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(rawVal);

    if (rawVal.length === 6) {
      const syncMatch = getPincodeDetailsSync(rawVal);
      if (syncMatch) {
        setCity(syncMatch.city);
        setState(syncMatch.state);
        setPincodeLocalityNotice(syncMatch.locality);
        return;
      }

      const asyncMatch = await lookupPincode(rawVal);
      if (asyncMatch) {
        setCity(asyncMatch.city);
        setState(asyncMatch.state);
        setPincodeLocalityNotice(asyncMatch.locality);
      } else {
        setPincodeLocalityNotice(null);
      }
    } else {
      setPincodeLocalityNotice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!floorBuilding.trim()) {
      setErrorMessage("Please enter building, apartment, or flat details.");
      return;
    }
    if (!areaStreet.trim()) {
      setErrorMessage("Please enter area and street address.");
      return;
    }
    if (pincode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit postal pincode.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Please specify recipient first and last name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    const userId = customerUser?.id || "patron-guest";

    const payload: CreatePatronAddressInput & { userId: string } = {
      userId,
      floor_building: floorBuilding.trim(),
      area_street: areaStreet.trim(),
      pincode: pincode.trim(),
      city: city.trim() || "Bengaluru",
      state: state.trim() || "Karnataka",
      country: "India",
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || undefined,
      phone: cleanPhone,
      save_as: saveAs,
      is_default: isDefault,
    };

    setIsSubmitting(true);
    try {
      if (addressToEdit) {
        const res = await fetch("/api/patron/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressId: addressToEdit.id,
            ...payload,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.address) {
          onAddressSaved(data.address);
          onClose();
        } else {
          setErrorMessage(data.error || "Failed to update address.");
        }
      } else {
        const res = await fetch("/api/patron/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success && data.address) {
          onAddressSaved(data.address);
          onClose();
        } else {
          setErrorMessage(data.error || "Failed to save delivery address.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error while saving address.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-7">
          {/* Section 01: Delivery Information */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#EAE7E1] pb-2">
              <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase">
                01. Delivery Information
              </span>
              <span className="text-[10px] text-[#895029] font-medium">
                Bengaluru White-Glove Zone
              </span>
            </div>

            {/* Floor / Building */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                Floor &amp; House No / Building Name <span className="text-[#895029]">*</span>
              </label>
              <input
                type="text"
                required
                value={floorBuilding}
                onChange={(e) => setFloorBuilding(e.target.value)}
                placeholder="e.g. Penthouse 4B, The Oberoi Sky Heights"
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
              />
            </div>

            {/* Area / Street */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                Area / Street Name <span className="text-[#895029]">*</span>
              </label>
              <input
                type="text"
                required
                value={areaStreet}
                onChange={(e) => setAreaStreet(e.target.value)}
                placeholder="e.g. 100ft Road, HAL 2nd Stage, Indiranagar"
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
              />
            </div>

            {/* 3-Column Grid: Pincode, City, State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pincode */}
              <div className="space-y-1">
                <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                  Postal Pincode <span className="text-[#895029]">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="560038"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm font-mono text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
                />
              </div>

              {/* City (Auto-populated) */}
              <div className="space-y-1">
                <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                  City
                </label>
                <div className="px-3.5 py-2.5 bg-[#F5F4F0] border border-[#EAE7E1] rounded-xl text-sm text-[#4A453E] font-medium flex items-center justify-between select-none">
                  <span>{city}</span>
                  <span className="material-symbols-outlined text-[15px] text-[#766E65]">lock</span>
                </div>
              </div>

              {/* State (Auto-populated) */}
              <div className="space-y-1">
                <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                  State
                </label>
                <div className="px-3.5 py-2.5 bg-[#F5F4F0] border border-[#EAE7E1] rounded-xl text-sm text-[#4A453E] font-medium flex items-center justify-between select-none">
                  <span>{state}</span>
                  <span className="material-symbols-outlined text-[15px] text-[#766E65]">lock</span>
                </div>
              </div>
            </div>

            {/* Locality Live Pill */}
            {pincodeLocalityNotice && (
              <div className="p-2.5 bg-[#F5F4F0] border border-[#EAE7E1] rounded-xl flex items-center gap-2 text-xs text-[#4A453E] animate-in fade-in">
                <span className="material-symbols-outlined text-[#895029] text-[16px]">location_on</span>
                <span className="truncate">
                  Auto-detected locality: <strong className="text-[#1A1A1A]">{pincodeLocalityNotice}</strong>
                </span>
              </div>
            )}

            {/* Country Locked Indicator */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F5F4F0] border border-[#EAE7E1] rounded-xl text-xs text-[#4A453E] select-none">
              <span className="flex items-center gap-2 font-medium">
                <span>🇮🇳</span> India (Domestic Freight Zone A — Tier 1 Express)
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#766E65]">lock</span>
            </div>
          </div>

          {/* Section 02: Contact Information */}
          <div className="space-y-3.5">
            <div className="border-b border-[#EAE7E1] pb-2">
              <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                02. Recipient Contact Details
              </span>
            </div>

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
                  placeholder="Recipient First Name"
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
                  placeholder="Recipient Last Name"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
                />
              </div>
            </div>

            {/* Email (Locked / Prefilled) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase">
                  Dispatch Email Notification
                </label>
                <span className="text-[10px] text-[#766E65]">Prefilled from patron profile</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] placeholder-[#A0988F] focus:outline-none focus:border-[#895029] focus:ring-1 focus:ring-[#895029]/30 transition-all"
              />
            </div>

            {/* Mobile Number with +91 pill */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                Delivery Contact Phone <span className="text-[#895029]">*</span>
              </label>
              <div className="flex items-center border border-[#EAE7E1] rounded-xl bg-white overflow-hidden focus-within:border-[#895029] focus-within:ring-1 focus-within:ring-[#895029]/30 transition-all">
                <span className="px-3 py-2.5 bg-[#F5F4F0] text-[#1A1A1A] font-mono text-sm font-medium border-r border-[#EAE7E1] select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono text-[#1A1A1A] placeholder-[#A0988F] bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 03: Save As & Default Setting */}
          <div className="space-y-4">
            <div className="border-b border-[#EAE7E1] pb-2">
              <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                03. Residence Tag &amp; Preferences
              </span>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-3">
              {(["Home", "Work", "Others"] as AddressTag[]).map((tag) => {
                const isSelected = saveAs === tag;
                const icon =
                  tag === "Home" ? "home" : tag === "Work" ? "apartment" : "roofing";
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSaveAs(tag)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs"
                        : "bg-white text-[#4A453E] border-[#EAE7E1] hover:bg-[#F5F4F0]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Set as Default Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-[#895029] focus:ring-[#895029] border-[#EAE7E1]"
              />
              <span className="text-xs text-[#1A1A1A] font-medium">
                Set as default delivery address for white-glove commissions
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-5 sm:p-6 border-t border-[#EAE7E1] bg-white flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[#766E65] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] disabled:bg-[#766E65] rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              <span>Saving Residence...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{addressToEdit ? "Update Address" : "Save Address"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function AddAddressDrawer({
  isOpen,
  onClose,
  onAddressSaved,
  addressToEdit,
}: AddAddressDrawerProps) {
  const { customerUser, profile } = useCustomerAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      <div
        className="w-full max-w-xl bg-[#FAF9F6] h-full shadow-2xl flex flex-col border-l border-[#EAE7E1] animate-in slide-in-from-right duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header (Stitch Screen dadd4df1d9af4d06b4bbb391e511ae69) */}
        <div className="p-6 sm:p-7 border-b border-[#EAE7E1] bg-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase block">
                Kiln Studio — Patron Residences
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-medium leading-none">
                {addressToEdit ? "Edit Delivery Address" : "Add Delivery Address"}
              </h2>
              <p className="text-xs text-[#766E65] pt-0.5">
                White-Glove Assembly &amp; Logistics Service
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#766E65] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] rounded-full transition-colors cursor-pointer"
              aria-label="Close address drawer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Address Form keyed to address identity for instant reset */}
        <AddressDrawerForm
          key={addressToEdit?.id || "new-address"}
          addressToEdit={addressToEdit}
          customerUser={customerUser}
          profile={profile}
          onClose={onClose}
          onAddressSaved={onAddressSaved}
        />
      </div>
    </div>
  );
}
