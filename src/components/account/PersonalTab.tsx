"use client";

import React, { useState } from "react";
import { CustomerUser } from "@/context/CustomerAuthContext";
import { DbPatronProfile } from "@/types/database";

export interface PersonalTabProps {
  profile: DbPatronProfile | null;
  customerUser: CustomerUser | null;
  onUpdateProfile: (updates: {
    firstName: string;
    lastName: string;
    email: string;
    marketingOptIn: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (msg: string) => void;
}

export default function PersonalTab({
  profile,
  customerUser,
  onUpdateProfile,
  onShowToast,
}: PersonalTabProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMarketing, setEditMarketing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditFirstName(profile?.first_name || "");
    setEditLastName(profile?.last_name || "");
    setEditEmail(profile?.email || customerUser?.email || "");
    setEditMarketing(profile?.marketing_opt_in || false);
    setProfileSuccessMsg(null);
    setIsEditingProfile(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const res = await onUpdateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        marketingOptIn: editMarketing,
      });

      if (res.success) {
        setIsEditingProfile(false);
        setProfileSuccessMsg("Profile details saved successfully.");
        onShowToast("Personal details updated.");
      }
    } catch {
      // Error handled upstream
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-[#EAE7E1] pb-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
            Patron Profile Information
          </h3>
          <p className="text-xs text-[#766E65] pt-0.5">
            Your registered details for white-glove communications and provenance certificates.
          </p>
        </div>
        {!isEditingProfile && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="px-4 py-2 border border-[#EAE7E1] hover:border-[#1A1A1A] rounded-xl text-xs font-medium text-[#1A1A1A] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {profileSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      {!isEditingProfile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
              Full Name
            </span>
            <p className="text-sm text-[#1A1A1A] font-medium">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "Not provided"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
              Email Address
            </span>
            <p className="text-sm text-[#1A1A1A] font-medium">
              {profile?.email || customerUser?.email || "Not provided"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
              Mobile Number
            </span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-[#1A1A1A] font-semibold">
                {customerUser?.phone}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Verified
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
              Private Releases Newsletter
            </span>
            <p className="text-xs text-[#766E65]">
              {profile?.marketing_opt_in
                ? "Subscribed to limited timber collection private previews."
                : "Unsubscribed from collection notifications."}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 pt-2 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                First Name <span className="text-[#895029]">*</span>
              </label>
              <input
                type="text"
                required
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#895029]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                Last Name <span className="text-[#895029]">*</span>
              </label>
              <input
                type="text"
                required
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#895029]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-sans text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
              Email Address <span className="text-[#895029]">*</span>
            </label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE7E1] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#895029]"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editMarketing}
              onChange={(e) => setEditMarketing(e.target.checked)}
              className="mt-0.5 rounded text-[#895029] focus:ring-[#895029] border-[#EAE7E1]"
            />
            <span className="text-xs text-[#766E65]">
              Receive private previews of limited-batch timber releases and architectural design notes.
            </span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              disabled={isSavingProfile}
              className="px-4 py-2.5 border border-[#EAE7E1] rounded-xl text-xs font-medium text-[#766E65] hover:text-[#1A1A1A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
