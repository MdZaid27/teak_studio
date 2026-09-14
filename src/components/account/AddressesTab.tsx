"use client";

import React from "react";
import { DbPatronAddress } from "@/types/database";

export interface AddressesTabProps {
  addresses: DbPatronAddress[];
  loadingAddresses: boolean;
  onAddNewAddress: () => void;
  onEditAddress: (address: DbPatronAddress) => void;
  onSetDefaultAddress: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
}

export default function AddressesTab({
  addresses,
  loadingAddresses,
  onAddNewAddress,
  onEditAddress,
  onSetDefaultAddress,
  onDeleteAddress,
}: AddressesTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
            Saved Delivery Residences
          </h3>
          <p className="text-xs text-[#766E65] pt-0.5">
            Addresses configured for white-glove room-of-choice placement and on-site assembly.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNewAddress}
          className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add New Address</span>
        </button>
      </div>

      {loadingAddresses ? (
        <div className="p-12 text-center text-xs text-[#766E65]">
          Loading saved residences...
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto text-[#895029]">
            <span className="material-symbols-outlined text-[28px]">home_pin</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-xl text-[#1A1A1A]">No Delivery Residences Saved</h4>
            <p className="text-xs text-[#766E65] max-w-sm mx-auto">
              Save your residence or studio address for streamlined white-glove checkout and logistics scheduling.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddNewAddress}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Delivery Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border rounded-2xl p-6 relative flex flex-col justify-between transition-all ${
                addr.is_default
                  ? "border-[#895029] ring-1 ring-[#895029]/20 shadow-sm"
                  : "border-[#EAE7E1] hover:border-[#d3c3bd]"
              }`}
            >
              <div className="space-y-3">
                {/* Address Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F5F4F0] text-[#1A1A1A] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#895029]">
                        {addr.save_as === "Home"
                          ? "home"
                          : addr.save_as === "Work"
                          ? "apartment"
                          : "roofing"}
                      </span>
                      {addr.save_as}
                    </span>
                    {addr.is_default && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#895029] text-white">
                        Default
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-[#766E65]">
                    PIN: {addr.pincode}
                  </span>
                </div>

                {/* Recipient details */}
                <div>
                  <h4 className="font-serif text-lg text-[#1A1A1A] font-medium">
                    {addr.first_name} {addr.last_name}
                  </h4>
                  <p className="text-xs text-[#766E65] pt-0.5">
                    {addr.floor_building}, {addr.area_street}
                  </p>
                  <p className="text-xs text-[#766E65]">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#4A453E] pt-1">
                  <span className="material-symbols-outlined text-[15px] text-[#766E65]">call</span>
                  <span>{addr.phone}</span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="border-t border-[#EAE7E1] pt-4 mt-5 flex items-center justify-between">
                <div>
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => onSetDefaultAddress(addr.id)}
                      className="text-xs font-medium text-[#895029] hover:text-[#1A1A1A] hover:underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onEditAddress(addr)}
                    className="text-xs text-[#766E65] hover:text-[#1A1A1A] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.id)}
                    className="text-xs text-red-700 hover:text-red-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
