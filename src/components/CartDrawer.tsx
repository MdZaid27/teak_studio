"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  const router = useRouter();

  // Multi-step drawer state: 1 = Bag Review, 2 = Shipping & Placement
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset step & errors when drawer is opened or closed
  useEffect(() => {
    if (!isCartOpen) {
      setStep(1);
      setSubmitError(null);
      setFormErrors({});
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errs.customer_name = "Full patron name is required";
    }
    if (!formData.customer_phone.trim() || formData.customer_phone.trim().length < 10) {
      errs.customer_phone = "Valid 10-digit contact number is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customer_email.trim() || !emailRegex.test(formData.customer_email.trim())) {
      errs.customer_email = "Valid email address is required for dispatch receipt";
    }
    if (!formData.delivery_address.trim() || formData.delivery_address.trim().length < 6) {
      errs.delivery_address = "Complete address with street/building is required";
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 4) {
      errs.pincode = "Valid postal pincode is required";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        delivery_address: formData.delivery_address.trim(),
        pincode: formData.pincode.trim(),
        payment_method: "offline",
        items: items.map((item) => ({
          productId: item.productId || item.id.split("-")[0],
          quantity: item.quantity,
          timberOption: item.timberOption || item.timber,
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

      // Order created successfully: clear cart, close drawer, navigate to confirmation
      clearCart();
      setIsCartOpen(false);
      router.push(`/orders/${data.orderNumber}`);
    } catch (err: any) {
      console.error("[KILN STUDIO] Order checkout error:", err);
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting) setIsCartOpen(false);
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#fcf9f4] border-l border-[#d3c3bd]/50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e5e2dd] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="p-1.5 -ml-1 text-[#81746f] hover:text-[#0e0300] hover:bg-[#f0ede9] rounded-full transition-colors"
                  title="Back to Bag Review"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
              ) : (
                <span className="material-symbols-outlined text-[#895029] text-[24px]">shopping_bag</span>
              )}
              <div>
                <h2 className="font-display text-lg text-[#0e0300] font-medium tracking-wide">
                  {step === 1 ? "Your Atelier Bag" : "Placement & Shipping"}
                </h2>
                <p className="text-xs text-[#81746f]">
                  {step === 1
                    ? `${totalItems} ${totalItems === 1 ? "Heirloom Item" : "Heirloom Items"}`
                    : `Step 2 of 2 — Bengaluru White-Glove Dispatch`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!isSubmitting) setIsCartOpen(false);
              }}
              disabled={isSubmitting}
              className="p-2 text-[#81746f] hover:text-[#0e0300] rounded-full hover:bg-[#f0ede9] transition-colors"
              aria-label="Close cart drawer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Bengaluru Delivery Banner */}
          <div className="bg-[#f0ede9] px-6 py-2.5 border-b border-[#e5e2dd] flex items-center gap-2.5 text-xs text-[#2c1a11] shrink-0">
            <span className="material-symbols-outlined text-[#895029] text-[18px]">local_shipping</span>
            <span>
              <strong>Free Bengaluru White-Glove Delivery</strong> &amp; Master Joinery Setup
            </span>
          </div>

          {/* Drawer Body: Step 1 vs Step 2 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {step === 1 ? (
              // STEP 1: BAG REVIEW
              items.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-4xl text-[#d3c3bd] mb-3 block">chair</span>
                  <p className="font-display text-lg text-[#0e0300] mb-2">Your Bag is Empty</p>
                  <p className="text-xs text-[#81746f] max-w-xs mx-auto mb-6">
                    Explore our solid wood dining chairs, credenzas, and handcrafted tables.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#2c1a11] text-[#fcf9f4] text-xs uppercase tracking-widest rounded-lg font-semibold hover:bg-[#895029] transition-colors"
                  >
                    Explore Collection
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
                              className="text-[#81746f] hover:text-[#ba1a1a] p-1 text-xs"
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
                              className="px-2 py-0.5 text-xs text-[#0e0300] hover:bg-[#f0ede9]"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2 py-0.5 text-xs text-[#0e0300] hover:bg-[#f0ede9]"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold text-sm text-[#0e0300]">
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
                  <span className="font-display font-semibold text-[#0e0300]">
                    Total: ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                    Full Name *
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
                    } rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                  />
                  {formErrors.customer_name && (
                    <p className="text-[10px] text-red-600">{formErrors.customer_name}</p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      placeholder="+91 98450 XXXXX"
                      disabled={isSubmitting}
                      className={`w-full bg-white border ${
                        formErrors.customer_phone ? "border-red-500" : "border-[#d3c3bd]"
                      } rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                    />
                    {formErrors.customer_phone && (
                      <p className="text-[10px] text-red-600">{formErrors.customer_phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                      Email Address *
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
                      } rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                    />
                    {formErrors.customer_email && (
                      <p className="text-[10px] text-red-600">{formErrors.customer_email}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                    Bangalore Delivery Address *
                  </label>
                  <textarea
                    name="delivery_address"
                    rows={2}
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    placeholder="Apartment, Wing, Street / Locality (e.g., Indiranagar, Whitefield, Lavelle Rd)"
                    disabled={isSubmitting}
                    className={`w-full bg-white border ${
                      formErrors.delivery_address ? "border-red-500" : "border-[#d3c3bd]"
                    } rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029] resize-none`}
                  />
                  {formErrors.delivery_address && (
                    <p className="text-[10px] text-red-600">{formErrors.delivery_address}</p>
                  )}
                </div>

                {/* Pincode */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0e0300] block">
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 560038"
                    disabled={isSubmitting}
                    className={`w-full bg-white border ${
                      formErrors.pincode ? "border-red-500" : "border-[#d3c3bd]"
                    } rounded-lg px-3 py-2 text-xs text-[#0e0300] focus:outline-none focus:border-[#895029]`}
                  />
                  {formErrors.pincode && (
                    <p className="text-[10px] text-red-600">{formErrors.pincode}</p>
                  )}
                </div>

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
                  <span className="font-semibold text-[#0e0300]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#4f4540]">
                  <span>Bengaluru White-Glove Installation</span>
                  <span className="text-[#895029] font-semibold uppercase tracking-wider text-[11px]">Free</span>
                </div>
                <div className="pt-2 border-t border-[#e5e2dd] flex justify-between text-base font-bold text-[#0e0300]">
                  <span>Total Amount</span>
                  <span className="font-display">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {step === 1 ? (
                // Step 1 Button: Proceed to Shipping
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] transition-all rounded-lg font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
                  >
                    <span>Proceed to Placement</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <p className="text-[10px] text-center text-[#81746f]">
                    Zero upfront payment · White-glove Bangalore delivery included
                  </p>
                </div>
              ) : (
                // Step 2 Button: Place Order
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0e0300] text-[#fcf9f4] hover:bg-[#895029] disabled:bg-[#81746f] disabled:cursor-not-allowed transition-all rounded-lg font-title-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
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
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="w-full py-2 text-xs text-[#81746f] hover:text-[#0e0300] transition-colors"
                  >
                    ← Modify Atelier Items
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
