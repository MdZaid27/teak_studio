"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { DbPatronAddress } from "@/types/database";
import AddAddressDrawer from "@/components/account/AddAddressDrawer";
import { getPincodeDetailsSync } from "@/lib/pincode";

const initialFormData = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  delivery_address: "",
  pincode: "",
};

function CartDrawerContent() {
  const {
    setIsCartOpen,
    items,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  const {
    customerUser,
    setIsAuthModalOpen,
    setPendingAction,
  } = useCustomerAuth();

  const router = useRouter();

  // Multi-step drawer state: 'cart' = Bag Review, 'shipping' = Shipping & Placement Form
  const [step, setStep] = useState<"cart" | "shipping">("cart");

  // Form state initialized cleanly on mount with patron details
  const cleanInitialPhone = customerUser?.phone ? customerUser.phone.replace("+91", "").replace(/\D/g, "") : "";
  const [formData, setFormData] = useState({
    ...initialFormData,
    customer_phone: cleanInitialPhone,
    customer_email: customerUser?.email || "",
    customer_name: customerUser?.name || "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Saved addresses state for authenticated patron
  const [addresses, setAddresses] = useState<DbPatronAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  const populateFromAddress = useCallback((addr: DbPatronAddress) => {
    const fullName = [addr.first_name, addr.last_name].filter(Boolean).join(" ");
    const cleanPhone = addr.phone.replace(/\D/g, "").slice(-10);
    const streetAddress = [addr.floor_building, addr.area_street].filter(Boolean).join(", ");
    setFormData((prev) => ({
      ...prev,
      customer_name: fullName || prev.customer_name,
      customer_phone: cleanPhone || prev.customer_phone,
      customer_email: addr.email || customerUser?.email || prev.customer_email,
      delivery_address: streetAddress || prev.delivery_address,
      pincode: addr.pincode || prev.pincode,
    }));
    setFormErrors({});
  }, [customerUser?.email]);

  const handleSelectAddress = (addr: DbPatronAddress) => {
    setSelectedAddressId(addr.id);
    populateFromAddress(addr);
  };

  // Fetch saved addresses whenever customerUser is available and user enters shipping step
  useEffect(() => {
    if (step === "shipping" && customerUser?.id) {
      let isMounted = true;
      const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
      const storageKey = `teak_patron_addresses_${cleanPhone || customerUser.id}`;

      // 1. Instantly hydrate from local storage so address appears with 0 delay
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAddresses(parsed);
            const defaultAddr = parsed.find((a: DbPatronAddress) => a.is_default) || parsed[0];
            setSelectedAddressId(defaultAddr.id);
            populateFromAddress(defaultAddr);
          }
        }
      } catch {}

      setLoadingAddresses(true);
      const url = `/api/patron/addresses?userId=${encodeURIComponent(customerUser.id)}${
        customerUser.phone ? `&phone=${encodeURIComponent(customerUser.phone)}` : ""
      }`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data.success && Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
            try {
              localStorage.setItem(storageKey, JSON.stringify(data.addresses));
            } catch {}

            if (data.addresses.length > 0) {
              const defaultAddr =
                data.addresses.find((a: DbPatronAddress) => a.is_default) ||
                data.addresses[0];
              setSelectedAddressId(defaultAddr.id);
              populateFromAddress(defaultAddr);
            }
          }
        })
        .catch((err) => console.warn("[TEAK HAUS] Failed fetching patron addresses:", err))
        .finally(() => {
          if (isMounted) setLoadingAddresses(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [step, customerUser?.id, customerUser?.phone, populateFromAddress]);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsCartOpen(false);
  };

  const handleProceedToPlacement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If unauthenticated: open customer auth modal and queue step transition
    if (!customerUser) {
      setPendingAction(() => () => {
        setStep("shipping");
      });
      setIsAuthModalOpen(true);
      return;
    }

    // If authenticated: ensure phone is pre-filled and advance directly
    if (customerUser.phone) {
      const cleanPhone = customerUser.phone.replace("+91", "").replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        customer_phone: prev.customer_phone || cleanPhone,
        customer_email: prev.customer_email || customerUser.email || "",
      }));
    }
    setStep("shipping");
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errs.customer_name = "Full patron name is required";
    }
    const cleanPhone = formData.customer_phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.customer_phone = "Invalid phone number. Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customer_email.trim() || !emailRegex.test(formData.customer_email.trim())) {
      errs.customer_email = "Valid email address is required for dispatch receipt";
    }
    if (!formData.delivery_address.trim() || formData.delivery_address.trim().length < 6) {
      errs.delivery_address = "Complete address with street/building is required";
    }
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!formData.pincode.trim() || !pincodeRegex.test(formData.pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit postal PIN code (cannot start with 0)";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, customer_phone: sanitized }));
    if (formErrors.customer_phone && sanitized.length === 10 && /^[6-9]\d{9}$/.test(sanitized)) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated.customer_phone;
        return updated;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Guard: Order can ONLY be submitted when explicitly in the shipping step and not currently submitting
    if (step !== "shipping" || isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      const pincodeInfo = getPincodeDetailsSync(formData.pincode.trim());
      const finalCity = selectedAddr?.city || pincodeInfo?.city || "India";
      const finalState = selectedAddr?.state || pincodeInfo?.state || "India";

      const orderPayload = {
        user_id: customerUser?.id || "patron-guest",
        userId: customerUser?.id || "patron-guest",
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        delivery_address: formData.delivery_address.trim(),
        shipping_address: formData.delivery_address.trim(),
        pincode: formData.pincode.trim(),
        city: finalCity,
        state: finalState,
        payment_method: "Inspection Upon Delivery / Zero Upfront",
        items: items.map((item) => ({
          productId: item.productId || item.id.split("-")[0],
          productTitle: item.name,
          productName: item.name,
          quantity: item.quantity,
          timberOption: item.timberOption || item.timber,
          timberTitle: item.timberOption || item.timber,
          unitPrice: item.price,
          imageUrl: item.image,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place atelier order. Please check details.");
      }

      // Successful order creation:
      // 1. Auto-save delivery address to patron local store so it is remembered upon future logins
      if (customerUser) {
        try {
          const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
          const storageKey = `teak_patron_addresses_${cleanPhone || customerUser.id}`;
          const current = localStorage.getItem(storageKey);
          const list: DbPatronAddress[] = current ? JSON.parse(current) : [];
          const exists = list.some(
            (a) =>
              a.pincode === formData.pincode.trim() &&
              (a.floor_building.toLowerCase().includes(formData.delivery_address.toLowerCase()) ||
                formData.delivery_address.toLowerCase().includes(a.floor_building.toLowerCase()))
          );
          if (!exists) {
            const nameParts = formData.customer_name.trim().split(" ");
            const newLocalAddr: DbPatronAddress = {
              id: `addr-${Date.now()}`,
              user_id: customerUser.id,
              floor_building: formData.delivery_address.trim().split(",")[0]?.trim() || formData.delivery_address.trim(),
              area_street: formData.delivery_address.trim().split(",").slice(1).join(", ").trim() || formData.delivery_address.trim(),
              pincode: formData.pincode.trim(),
              city: finalCity,
              state: finalState,
              country: "India",
              first_name: nameParts[0] || "Patron",
              last_name: nameParts.slice(1).join(" ") || "Member",
              email: formData.customer_email.trim() || undefined,
              phone: customerUser.phone || formData.customer_phone.trim(),
              save_as: "Home",
              is_default: list.length === 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            localStorage.setItem(storageKey, JSON.stringify([newLocalAddr, ...list]));
          }
        } catch {}
      }

      // 2. Ensure server-side session cookie is synced for seamless order viewing
      if (customerUser || formData.customer_phone) {
        try {
          await fetch("/api/patron/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patronId: customerUser?.id || `patron-${formData.customer_phone.trim()}`,
              phone: formData.customer_phone.trim() || customerUser?.phone,
              email: formData.customer_email.trim() || customerUser?.email,
            }),
          });
        } catch {}
      }

      // 3. Clear cart bag
      clearCart();
      // 4. Close the drawer
      setIsCartOpen(false);
      // 5. Navigate to order confirmation
      router.push(`/orders/${data.orderNumber || data.orderId}`);
    } catch (err: unknown) {
      console.error("[KILN STUDIO] Order checkout error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#fcf9f4] border-l border-[#d3c3bd]/50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e5e2dd] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              {step === "shipping" ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStep("cart");
                  }}
                  disabled={isSubmitting}
                  className="p-1.5 -ml-1 text-[#81746f] hover:text-[#0e0300] hover:bg-[#f0ede9] rounded-full transition-colors cursor-pointer"
                  title="Back to Bag Review"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
              ) : (
                <span className="material-symbols-outlined text-[#895029] text-[24px]">shopping_bag</span>
              )}
              <div>
                <h2 className="font-display text-lg text-[#0e0300] font-medium tracking-wide">
                  {step === "cart" ? "Your Atelier Bag" : "Placement & Shipping"}
                </h2>
                <p className="text-xs text-[#81746f]">
                  {step === "cart"
                    ? `${totalItems} ${totalItems === 1 ? "Heirloom Item" : "Heirloom Items"}`
                    : `Step 2 of 2 — White-Glove Dispatch`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-[#81746f] hover:text-[#0e0300] rounded-full hover:bg-[#f0ede9] transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* White-Glove Delivery Banner */}
          <div className="bg-[#f0ede9] px-6 py-2.5 border-b border-[#e5e2dd] flex items-center gap-2.5 text-xs text-[#2c1a11] shrink-0">
            <span className="material-symbols-outlined text-[#895029] text-[18px]">local_shipping</span>
            <span>
              <strong>Complimentary White-Glove Delivery</strong> &amp; Master Joinery Setup
            </span>
          </div>

          {/* Drawer Body: Step 1 ('cart') vs Step 2 ('shipping') */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {step === "cart" ? (
              // STEP 1: BAG REVIEW
              items.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-4xl text-[#d3c3bd] mb-3 block">chair</span>
                  <p className="font-display text-lg text-[#0e0300] mb-2">Your Atelier Bag is Empty</p>
                  <p className="text-xs text-[#81746f] max-w-xs mx-auto mb-6">
                    Explore our solid wood dining chairs, credenzas, and handcrafted tables.
                  </p>
                  <Link
                    href="/shop"
                    onClick={handleClose}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#2c1a11] text-[#fcf9f4] text-xs uppercase tracking-widest rounded-lg font-semibold hover:bg-[#895029] transition-colors cursor-pointer"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl bg-white border border-[#e5e2dd] shadow-xs"
                    >
                      <div className="relative w-20 h-24 bg-[#f6f3ee] rounded-lg overflow-hidden shrink-0 border border-[#e5e2dd]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-display text-sm font-medium text-[#0e0300] leading-tight">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[#81746f] hover:text-[#ba1a1a] p-1 text-xs cursor-pointer"
                              title="Remove item"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-[#895029] font-medium mt-0.5">
                            {item.timberOption || item.timber}
                          </p>
                          {item.finish && (
                            <p className="text-[10px] text-[#81746f] line-clamp-1">{item.finish}</p>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-3 pt-2 border-t border-[#f0ede9]">
                          <div className="flex items-center border border-[#d3c3bd] rounded-md bg-[#fcf9f4]">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2 py-0.5 text-xs text-[#0e0300] hover:bg-[#f0ede9] cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2 py-0.5 text-xs text-[#0e0300] hover:bg-[#f0ede9] cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-sans font-semibold text-sm text-[#1A1A1A] tabular-nums">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // STEP 2: SHIPPING & CLIENT PLACEMENT FORM
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                {submitError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      Placement Notice
                    </div>
                    <p>{submitError}</p>
                  </div>
                )}

                {/* Items Summary Pill */}
                <div className="p-3 bg-white rounded-xl border border-[#e5e2dd] flex items-center justify-between text-xs">
                  <span className="text-[#81746f]">
                    {totalItems} {totalItems === 1 ? "Item" : "Items"} in Commission
                  </span>
                  <span className="font-sans font-semibold text-[#1A1A1A] tabular-nums">
                    Total: ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* SAVED RESIDENCES SELECTOR (When patron has saved addresses) */}
                {loadingAddresses ? (
                  <div className="p-3.5 bg-white rounded-xl border border-[#e5e2dd] flex items-center justify-between text-xs text-[#81746f] animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin text-[#895029]">
                        progress_activity
                      </span>
                      <span>Retrieving saved residences...</span>
                    </div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#895029]">home_pin</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300]">
                          Saved Residences
                        </span>
                      </div>
                      <span className="text-[10px] text-[#81746f]">
                        {addresses.length} {addresses.length === 1 ? "Address" : "Addresses"}
                      </span>
                    </div>

                    {/* Compact selector of address cards */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        const tagIcon =
                          addr.save_as === "Home"
                            ? "home"
                            : addr.save_as === "Work"
                            ? "apartment"
                            : "roofing";

                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left relative ${
                              isSelected
                                ? "bg-white border-[#1A1A1A] ring-1.5 ring-[#1A1A1A] shadow-xs"
                                : "bg-white/80 border-[#e5e2dd] hover:border-[#895029]/60 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Tag pill */}
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                                    isSelected
                                      ? "bg-[#1A1A1A] text-white"
                                      : "bg-[#f0ede9] text-[#4f4540]"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">{tagIcon}</span>
                                  <span>{addr.save_as}</span>
                                </span>

                                {/* DEFAULT badge */}
                                {addr.is_default && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#895029]/10 text-[#895029] font-bold text-[9px] uppercase tracking-wider">
                                    DEFAULT
                                  </span>
                                )}

                                {/* Recipient name */}
                                <span className="text-xs font-semibold text-[#0e0300]">
                                  {addr.first_name} {addr.last_name}
                                </span>
                              </div>

                              {/* Radio indicator */}
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "border-[#1A1A1A] bg-[#1A1A1A]"
                                    : "border-[#d3c3bd] bg-white"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            {/* Address snippet */}
                            <p className="text-[11px] text-[#4f4540] leading-relaxed line-clamp-2">
                              {addr.floor_building}, {addr.area_street}, {addr.city} —{" "}
                              <span className="font-mono">{addr.pincode}</span>
                            </p>

                            {/* Recipient phone */}
                            <p className="text-[10px] text-[#81746f] mt-1 font-mono">
                              Phone: +91 {addr.phone.replace(/\D/g, "").slice(-10)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Outline Button: + Add New Address */}
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(true)}
                      className="w-full py-2.5 px-3 border border-dashed border-[#895029]/60 hover:border-[#895029] bg-transparent hover:bg-[#895029]/5 text-[#895029] rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      <span>+ Add New Address</span>
                    </button>
                  </div>
                ) : (
                  // If authenticated but 0 saved addresses, provide outline button as alternative
                  customerUser && (
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#e5e2dd]">
                      <span className="text-[11px] text-[#81746f]">
                        No saved residences found.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(true)}
                        className="text-[11px] text-[#895029] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        <span>+ Add New Address</span>
                      </button>
                    </div>
                  )
                )}

                {/* Section Header: Recipient & White-Glove Destination */}
                <div className="pt-2 border-t border-[#e5e2dd] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300]">
                      Recipient &amp; White-Glove Destination
                    </span>
                    {selectedAddressId && (
                      <span className="text-[10px] text-[#895029] flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Populated
                      </span>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                      Full Name <span className="text-[#895029]">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Ananya Rao"
                      disabled={isSubmitting}
                      className={`w-full bg-white border ${
                        formErrors.customer_name ? "border-red-500" : "border-[#d3c3bd]"
                      } rounded-xl px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                    />
                    {formErrors.customer_name && (
                      <p className="text-[10px] text-red-600">{formErrors.customer_name}</p>
                    )}
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                        Phone Number <span className="text-[#895029]">*</span>
                      </label>
                      <div className={`flex items-center border ${
                        formErrors.customer_phone ? "border-red-500" : "border-[#d3c3bd]"
                      } focus-within:border-[#895029] rounded-xl bg-white overflow-hidden`}>
                        <span className="px-2.5 py-2 bg-[#f0ede9] text-[#0e0300] font-mono text-xs font-medium border-r border-[#d3c3bd] select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          name="customer_phone"
                          value={formData.customer_phone}
                          onChange={handlePhoneChange}
                          placeholder="9876543210"
                          disabled={isSubmitting}
                          className="flex-1 px-3 py-2 text-xs font-mono text-[#0e0300] focus:outline-none bg-transparent"
                        />
                      </div>
                      {formErrors.customer_phone && (
                        <p className="text-[10px] text-red-600">{formErrors.customer_phone}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                        Email Address <span className="text-[#895029]">*</span>
                      </label>
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        placeholder="ananya@example.com"
                        disabled={isSubmitting}
                        className={`w-full bg-white border ${
                          formErrors.customer_email ? "border-red-500" : "border-[#d3c3bd]"
                        } rounded-xl px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                      />
                      {formErrors.customer_email && (
                        <p className="text-[10px] text-red-600">{formErrors.customer_email}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                      Delivery Address <span className="text-[#895029]">*</span>
                    </label>
                    <textarea
                      name="delivery_address"
                      rows={2}
                      value={formData.delivery_address}
                      onChange={handleInputChange}
                      placeholder="Apartment, Wing, Street / Locality (e.g., Tower 3, 4th Cross Road)"
                      disabled={isSubmitting}
                      className={`w-full bg-white border ${
                        formErrors.delivery_address ? "border-red-500" : "border-[#d3c3bd]"
                      } rounded-xl px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029] resize-none`}
                    />
                    {formErrors.delivery_address && (
                      <p className="text-[10px] text-red-600">{formErrors.delivery_address}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold tracking-wider text-[#766E65] uppercase block">
                      Postal Pincode <span className="text-[#895029]">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[1-9][0-9]{5}"
                      maxLength={6}
                      name="pincode"
                      value={formData.pincode}
                      onChange={(e) => {
                        const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setFormData((prev) => ({ ...prev, pincode: numericOnly }));
                        if (formErrors.pincode) {
                          setFormErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.pincode;
                            return updated;
                          });
                        }
                      }}
                      placeholder="e.g. 560038"
                      disabled={isSubmitting}
                      className={`w-full bg-white border ${
                        formErrors.pincode ? "border-red-500" : "border-[#d3c3bd]"
                      } rounded-xl px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                    />
                    {formErrors.pincode && (
                      <p className="text-[10px] text-red-600">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Auto-save notice for new patrons */}
                {addresses.length === 0 && (
                  <p className="text-[10px] text-[#766E65] italic leading-tight">
                    * This address will be automatically saved to your patron profile for future white-glove commissions.
                  </p>
                )}

                {/* Payment & Inspection Notice */}
                <div className="p-3 bg-[#f0ede9] rounded-xl border border-[#d3c3bd]/50 space-y-1 text-xs text-[#4f4540]">
                  <div className="flex items-center gap-1.5 text-[#0e0300] font-semibold text-[11px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] text-[#895029]">verified_user</span>
                    Zero Upfront Payment Required
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Inspect the solid timber grain, joinery alignment, and hand-rubbed finish at your home during white-glove placement before paying via UPI, card, or bank transfer.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#e5e2dd] space-y-4 shrink-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#4f4540]">
                  <span>Subtotal</span>
                  <span className="font-sans font-semibold text-[#1A1A1A] tabular-nums">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#4f4540]">
                  <span>White-Glove Installation &amp; Placement</span>
                  <span className="text-[#895029] font-semibold uppercase tracking-wider text-[11px]">
                    Complimentary
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e5e2dd] flex justify-between text-base font-bold text-[#0e0300]">
                  <span>Total Amount</span>
                  <span className="font-sans text-lg font-semibold tracking-tight text-[#1A1A1A] tabular-nums">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {step === "cart" ? (
                // Step 1 Button: Strictly transitions to Step 2 ('shipping') and DOES NOT submit
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleProceedToPlacement}
                    className="w-full py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] transition-all rounded-lg font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <span>Proceed to Placement</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <p className="text-[10px] text-center text-[#81746f]">
                    Zero upfront payment · Complimentary white-glove delivery included
                  </p>
                </div>
              ) : (
                // Step 2 Button: Place Order
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] disabled:bg-[#81746f] disabled:cursor-not-allowed transition-all rounded-lg font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Confirming with Atelier...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Atelier Commission</span>
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStep("cart");
                    }}
                    disabled={isSubmitting}
                    className="w-full py-2 text-xs text-[#81746f] hover:text-[#0e0300] transition-colors cursor-pointer"
                  >
                    ← Modify Atelier Items
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Embedded Add Address Drawer */}
      <AddAddressDrawer
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        onAddressSaved={(newAddr) => {
          setAddresses((prev) => {
            const updated = [newAddr, ...prev.filter((a) => a.id !== newAddr.id)];
            try {
              const cleanPhone = customerUser?.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
              const storageKey = `teak_patron_addresses_${cleanPhone || customerUser?.id}`;
              localStorage.setItem(storageKey, JSON.stringify(updated));
            } catch {}
            return updated;
          });
          setSelectedAddressId(newAddr.id);
          populateFromAddress(newAddr);
          setIsAddAddressOpen(false);
        }}
      />
    </div>
  );
}

export default function CartDrawer() {
  const { isCartOpen } = useCart();
  if (!isCartOpen) return null;
  return <CartDrawerContent />;
}
