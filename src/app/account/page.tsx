"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import {
  DbPatronAddress,
  DbPatronWishlist,
  OrderStatus,
  OrderTimeframeFilter,
  OrderStatusFilter,
} from "@/types/database";
import { OrderWithItems } from "@/lib/orders";
import AddAddressDrawer from "@/components/account/AddAddressDrawer";

type TabType = "personal" | "addresses" | "orders" | "wishlist";

const STATUS_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "delivered", label: "Delivered" },
  { value: "dispatched", label: "In White-Glove Transit" },
  { value: "production", label: "In Production" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const TIMEFRAME_OPTIONS: { value: OrderTimeframeFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "30_days", label: "Last 30 Days" },
  { value: "3_months", label: "Last 3 Months" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
];

function AccountDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "personal";

  const {
    customerUser,
    profile,
    isLoading: authLoading,
    setIsAuthModalOpen,
    updateProfile,
    signOutCustomer,
  } = useCustomerAuth();

  const { addItem, setIsCartOpen } = useCart();

  const tabFromUrl = searchParams.get("tab") as TabType;
  const [localTab, setLocalTab] = useState<TabType>(initialTab);
  const activeTab: TabType = (tabFromUrl && ["personal", "addresses", "orders", "wishlist"].includes(tabFromUrl))
    ? tabFromUrl
    : localTab;
  const setActiveTab = setLocalTab;

  const [referenceTime] = useState(() => Date.now());

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMarketing, setEditMarketing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<DbPatronAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<DbPatronAddress | null>(null);

  // Orders State
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [timeframeFilter, setTimeframeFilter] = useState<OrderTimeframeFilter>("all");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [timeframeMenuOpen, setTimeframeMenuOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const timeframeDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusMenuOpen(false);
      }
      if (
        timeframeDropdownRef.current &&
        !timeframeDropdownRef.current.contains(event.target as Node)
      ) {
        setTimeframeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState<DbPatronWishlist[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const handleStartEditProfile = () => {
    if (profile) {
      setEditFirstName(profile.first_name || "");
      setEditLastName(profile.last_name || "");
      setEditEmail(profile.email || "");
      setEditMarketing(profile.marketing_opt_in ?? true);
    } else if (customerUser) {
      setEditEmail(customerUser.email || "");
    }
    setIsEditingProfile(true);
  };

  // Fetch Addresses
  const fetchAddresses = async (userId: string) => {
    setLoadingAddresses(true);
    try {
      const res = await fetch(`/api/patron/addresses?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.addresses) {
          setAddresses(data.addresses);
        }
      }
    } catch (e) {
      console.warn("Failed fetching addresses:", e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async (phoneOrEmail: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/patron/orders?phone=${encodeURIComponent(phoneOrEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.warn("Failed fetching orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Wishlist
  const fetchWishlist = async (userId: string) => {
    setLoadingWishlist(true);
    try {
      const res = await fetch(`/api/patron/wishlist?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.wishlist) {
          setWishlistItems(data.wishlist);
        }
      }
    } catch (e) {
      console.warn("Failed fetching wishlist:", e);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Load data whenever customer user is present
  useEffect(() => {
    if (customerUser?.id) {
      const id = customerUser.id;
      const phone = customerUser.phone;
      queueMicrotask(() => {
        fetchAddresses(id);
        fetchOrders(phone);
        fetchWishlist(id);
      });
    }
  }, [customerUser?.id, customerUser?.phone]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const res = await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        marketingOptIn: editMarketing,
      });

      if (res.success) {
        setIsEditingProfile(false);
        setProfileSuccessMsg("Profile details saved successfully.");
        showToast("Personal details updated.");
      }
    } catch {
      // Handled in context
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Address Actions
  const handleSetDefaultAddress = async (addressId: string) => {
    if (!customerUser) return;
    try {
      const res = await fetch("/api/patron/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customerUser.id,
          addressId,
          is_default: true,
        }),
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            is_default: a.id === addressId,
          }))
        );
        showToast("Default delivery residence updated.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!customerUser) return;
    if (!confirm("Are you sure you want to remove this delivery address?")) return;

    try {
      const res = await fetch(
        `/api/patron/addresses?userId=${encodeURIComponent(customerUser.id)}&addressId=${encodeURIComponent(addressId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        showToast("Delivery residence removed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Wishlist Actions
  const handleRemoveWishlist = async (productId: string) => {
    if (!customerUser) return;
    try {
      const res = await fetch(
        `/api/patron/wishlist?userId=${encodeURIComponent(customerUser.id)}&productId=${encodeURIComponent(productId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setWishlistItems((prev) => prev.filter((i) => i.product_id !== productId));
        showToast("Piece removed from your wishlist.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWishlistToCart = async (item: DbPatronWishlist) => {
    if (!item.product) return;
    const prod = item.product;

    // 1. Add item to cart
    addItem(
      {
        id: `${prod.id}-${prod.timber || "teak"}`,
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        timber: prod.timber,
        finish: "Natural Matte Hardwax Oil",
        image: prod.image,
      },
      1
    );

    // 2. Optimistic removal from wishlist state
    setWishlistItems((prev) => prev.filter((i) => i.product_id !== prod.id));
    setIsCartOpen(true);
    showToast(`${prod.name} moved to your Atelier Bag.`);

    // 3. Delete from backend wishlist
    if (customerUser?.id) {
      try {
        await fetch(
          `/api/patron/wishlist?userId=${encodeURIComponent(customerUser.id)}&productId=${encodeURIComponent(prod.id)}`,
          { method: "DELETE" }
        );
      } catch (e) {
        console.warn("Failed to sync wishlist deletion after move to bag:", e);
      }
    }
  };

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Status Filter
      if (statusFilter !== "all" && ord.status !== statusFilter) {
        return false;
      }

      // 2. Timeframe Filter
      if (timeframeFilter !== "all" && ord.created_at) {
        const orderDate = new Date(ord.created_at).getTime();
        if (timeframeFilter === "30_days") {
          if (referenceTime - orderDate > 30 * 24 * 60 * 60 * 1000) return false;
        } else if (timeframeFilter === "3_months") {
          if (referenceTime - orderDate > 90 * 24 * 60 * 60 * 1000) return false;
        } else if (timeframeFilter === "2026") {
          const yr = new Date(ord.created_at).getFullYear();
          if (yr !== 2026) return false;
        } else if (timeframeFilter === "2025") {
          const yr = new Date(ord.created_at).getFullYear();
          if (yr !== 2025) return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, timeframeFilter, referenceTime]);

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : customerUser?.phone
    ? `Patron ${customerUser.phone.replace("+91", "")}`
    : "Patron";

  // Auth gate if user is completely unauthenticated
  if (!authLoading && !customerUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#EAE7E1] rounded-2xl p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px] text-[#895029]">person</span>
          </div>
          <div className="space-y-2">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase">
              Kiln Studio Atelier
            </span>
            <h1 className="font-serif text-3xl text-[#1A1A1A] font-medium">Patron Account</h1>
            <p className="text-xs text-[#766E65] leading-relaxed">
              Sign in with your mobile number to view commissioned pieces, saved delivery addresses, and private wishlist collections.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-all rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Sign In to Atelier</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 xl:px-16">
      <div className="max-w-[1560px] mx-auto space-y-8">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Breadcrumb & Kicker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#766E65]">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#1A1A1A] font-medium">Patron Dashboard</span>
          </div>

          <button
            onClick={() => signOutCustomer()}
            className="text-xs text-red-700 hover:text-red-900 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Patron Welcome Header (Stitch Screen 7c540298d80646e9b94a451b700671ca) */}
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase">
                  Atelier Patron
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified Mobile
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-medium leading-tight">
                Welcome, {displayName}
              </h1>
              <p className="text-xs text-[#766E65] max-w-xl leading-relaxed">
                Indiranagar &amp; VR Whitefield Studio Patron Privileges. Manage your delivery residences, commissioned timber orders, and held reserves.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl text-right">
                <span className="font-sans text-[10px] uppercase font-semibold text-[#766E65] block">
                  Patron Mobile
                </span>
                <span className="font-mono text-xs font-semibold text-[#1A1A1A]">
                  {customerUser?.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Screen 7c540298d80646e9b94a451b700671ca & 64cad1e44ffb40c0a237bbf849fe328b) */}
        <div className="flex border-b border-[#EAE7E1] overflow-x-auto no-scrollbar gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab("personal")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "personal"
                ? "border-[#895029] text-[#1A1A1A] font-semibold"
                : "border-transparent text-[#766E65] hover:text-[#1A1A1A]"
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "addresses"
                ? "border-[#895029] text-[#1A1A1A] font-semibold"
                : "border-transparent text-[#766E65] hover:text-[#1A1A1A]"
            }`}
          >
            <span>Delivery Addresses</span>
            {addresses.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#EAE7E1] text-[#1A1A1A] font-mono">
                {addresses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "border-[#895029] text-[#1A1A1A] font-semibold"
                : "border-transparent text-[#766E65] hover:text-[#1A1A1A]"
            }`}
          >
            <span>Commissioned Orders</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#EAE7E1] text-[#1A1A1A] font-mono">
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "wishlist"
                ? "border-[#895029] text-[#1A1A1A] font-semibold"
                : "border-transparent text-[#766E65] hover:text-[#1A1A1A]"
            }`}
          >
            <span>Saved Pieces &amp; Wishlist</span>
            {wishlistItems.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#EAE7E1] text-[#1A1A1A] font-mono">
                {wishlistItems.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Personal Details */}
        {activeTab === "personal" && (
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
                  onClick={handleStartEditProfile}
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
              <form onSubmit={handleSaveProfile} className="space-y-5 pt-2 max-w-xl">
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
        )}

        {/* TAB 2: Delivery Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
                  Saved Delivery Residences
                </h3>
                <p className="text-xs text-[#766E65] pt-0.5">
                  Addresses configured for white-glove room-of-choice placement and assembly across Bengaluru.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddressToEdit(null);
                  setIsAddressDrawerOpen(true);
                }}
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
                    Save your Bengaluru home or workspace address for streamlined white-glove checkout and logistics scheduling.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddressToEdit(null);
                    setIsAddressDrawerOpen(true);
                  }}
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
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-medium text-[#895029] hover:text-[#1A1A1A] hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAddressToEdit(addr);
                            setIsAddressDrawerOpen(true);
                          }}
                          className="text-xs text-[#766E65] hover:text-[#1A1A1A] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
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
        )}

        {/* TAB 3: Commissioned Orders (Stitch Screen 64cad1e44ffb40c0a237bbf849fe328b) */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
                  Commissioned Atelier Orders
                </h3>
                <p className="text-xs text-[#766E65] pt-0.5">
                  Track real-time workshop fabrication, white-glove transit, and delivery receipts.
                </p>
              </div>

              {/* Dual Filter Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Status Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5" ref={statusDropdownRef}>
                  <span className="text-[10px] font-semibold tracking-wider text-[#766E65] uppercase">
                    ORDER STATUS
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusMenuOpen(!statusMenuOpen);
                        setTimeframeMenuOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#EAE7E1] rounded-xl text-xs font-medium text-[#1A1A1A] cursor-pointer hover:border-[#1A1A1A] min-w-[150px]"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#766E65]">filter_list</span>
                        <span>{STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "All Status"}</span>
                      </span>
                      <span className={`material-symbols-outlined text-[16px] text-[#766E65] transition-transform duration-200 ${statusMenuOpen ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </button>

                    {statusMenuOpen && (
                      <div className="absolute right-0 sm:left-0 mt-1 bg-white border border-[#EAE7E1] shadow-lg rounded-xl py-1 z-20 min-w-[175px]">
                        {STATUS_OPTIONS.map((opt) => {
                          const isActive = statusFilter === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setStatusFilter(opt.value);
                                setStatusMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-[#1A1A1A] hover:bg-[#FAF9F6] cursor-pointer transition-colors text-left ${
                                isActive ? "font-semibold bg-[#FAF9F6] text-[#895029]" : ""
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isActive && (
                                <span className="material-symbols-outlined text-[14px] text-[#895029]">check</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeframe Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5" ref={timeframeDropdownRef}>
                  <span className="text-[10px] font-semibold tracking-wider text-[#766E65] uppercase">
                    ORDER TIME
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setTimeframeMenuOpen(!timeframeMenuOpen);
                        setStatusMenuOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#EAE7E1] rounded-xl text-xs font-medium text-[#1A1A1A] cursor-pointer hover:border-[#1A1A1A] min-w-[135px]"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#766E65]">calendar_today</span>
                        <span>{TIMEFRAME_OPTIONS.find((o) => o.value === timeframeFilter)?.label || "All Time"}</span>
                      </span>
                      <span className={`material-symbols-outlined text-[16px] text-[#766E65] transition-transform duration-200 ${timeframeMenuOpen ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </button>

                    {timeframeMenuOpen && (
                      <div className="absolute right-0 sm:left-0 mt-1 bg-white border border-[#EAE7E1] shadow-lg rounded-xl py-1 z-20 min-w-[160px]">
                        {TIMEFRAME_OPTIONS.map((opt) => {
                          const isActive = timeframeFilter === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setTimeframeFilter(opt.value);
                                setTimeframeMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-[#1A1A1A] hover:bg-[#FAF9F6] cursor-pointer transition-colors text-left ${
                                isActive ? "font-semibold bg-[#FAF9F6] text-[#895029]" : ""
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isActive && (
                                <span className="material-symbols-outlined text-[14px] text-[#895029]">check</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loadingOrders ? (
              <div className="p-12 text-center text-xs text-[#766E65]">
                Loading commissioned orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-[#EAE7E1] rounded-2xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto text-[#895029]">
                  <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xl text-[#1A1A1A]">No Orders Found</h4>
                  <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                    {orders.length === 0
                      ? "You haven't commissioned any bespoke solid wood furniture yet."
                      : "No orders match the selected status and timeframe filters."}
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5"
                >
                  <span>Explore Atelier Pieces</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((ord) => {
                  const statusColors: Record<OrderStatus, { bg: string; label: string; icon: string }> = {
                    delivered: { bg: "bg-emerald-50 border-emerald-200 text-emerald-800", label: "Delivered", icon: "check_circle" },
                    dispatched: { bg: "bg-amber-50 border-amber-200 text-amber-800", label: "In White-Glove Transit", icon: "local_shipping" },
                    production: { bg: "bg-blue-50 border-blue-200 text-blue-800", label: "In Kiln Production", icon: "carpenter" },
                    confirmed: { bg: "bg-stone-100 border-stone-300 text-stone-800", label: "Confirmed", icon: "verified" },
                    pending: { bg: "bg-amber-50 border-amber-200 text-amber-800", label: "Pending Verification", icon: "schedule" },
                    cancelled: { bg: "bg-red-50 border-red-200 text-red-800", label: "Cancelled", icon: "cancel" },
                  };

                  const currentStatus = statusColors[ord.status] || statusColors.pending;

                  return (
                    <div
                      key={ord.id}
                      className="bg-white border border-[#EAE7E1] rounded-2xl overflow-hidden shadow-xs hover:border-[#d3c3bd] transition-all"
                    >
                      {/* Order Reference Top Banner */}
                      <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#EAE7E1] flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-[#1A1A1A]">
                              #{ord.order_number}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${currentStatus.bg}`}
                            >
                              <span className="material-symbols-outlined text-[13px]">{currentStatus.icon}</span>
                              <span>{currentStatus.label}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-[#766E65]">
                            Commissioned on{" "}
                            {ord.created_at
                              ? new Date(ord.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-sans text-[10px] uppercase font-semibold text-[#766E65] block">
                              Total Consideration
                            </span>
                            <span className="font-sans tabular-nums text-base sm:text-lg font-bold text-[#1A1A1A]">
                              ₹{ord.total.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <Link
                            href={`/orders/${ord.id || ord.order_number}`}
                            className="px-4 py-2 bg-white border border-[#EAE7E1] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5"
                          >
                            <span>Tracking Receipt</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>

                      {/* White-Glove Dispatch Destination Sub-bar */}
                      <div className="px-5 sm:px-6 py-2.5 bg-white border-b border-[#EAE7E1]/60 flex items-center gap-2 text-xs text-[#766E65]">
                        <span className="material-symbols-outlined text-[16px] text-[#895029]">location_on</span>
                        <span className="truncate">
                          White-Glove Placement:{" "}
                          <strong className="text-[#1A1A1A] font-medium">
                            {ord.delivery_address} ({ord.pincode})
                          </strong>
                        </span>
                      </div>

                      {/* Order Item Rows */}
                      <div className="p-5 sm:p-6 divide-y divide-[#EAE7E1]/70">
                        {ord.order_items && ord.order_items.length > 0 ? (
                          ord.order_items.map((item) => (
                            <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center text-[#895029] overflow-hidden shrink-0">
                                  <span className="material-symbols-outlined text-[24px]">chair</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h5 className="font-serif text-base text-[#1A1A1A] font-medium">
                                    {item.product_name}
                                  </h5>
                                  <p className="text-xs text-[#766E65]">
                                    Timber: {item.timber_option || "Solid Teak & Natural Oil Finish"}
                                  </p>
                                  <p className="text-[11px] text-[#766E65]">
                                    Qty: <span className="font-mono text-[#1A1A1A] font-semibold">{item.quantity}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-sans tabular-nums text-sm font-semibold text-[#1A1A1A]">
                                  ₹{item.line_total.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-xs text-[#766E65]">
                            Standard Bespoke Commission
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Saved Pieces & Wishlist (Stitch Screen 64cad1e44ffb40c0a237bbf849fe328b) */}
        {activeTab === "wishlist" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] font-medium">
                  Saved Pieces &amp; Held Reserves
                </h3>
                <p className="text-xs text-[#766E65] pt-0.5">
                  Private curation of architectural kiln designs held under your patron credentials.
                </p>
              </div>

              <Link
                href="/shop"
                className="px-4 py-2 border border-[#EAE7E1] hover:border-[#1A1A1A] rounded-xl text-xs font-medium text-[#1A1A1A] transition-all inline-flex items-center gap-1.5"
              >
                <span>Browse Full Catalogue</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            {loadingWishlist ? (
              <div className="p-12 text-center text-xs text-[#766E65]">
                Loading your curated wishlist...
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="bg-white border border-[#EAE7E1] rounded-2xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto text-[#895029]">
                  <span className="material-symbols-outlined text-[28px]">favorite</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xl text-[#1A1A1A]">Your Atelier Wishlist is Empty</h4>
                  <p className="text-xs text-[#766E65] max-w-sm mx-auto">
                    Save handcrafted dining tables, credenzas, and lounge chairs to monitor timber availability and place priority holds.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5"
                >
                  <span>Explore Furniture Collections</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              /* 2-Column Bento / Editorial Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlistItems.map((item) => {
                  const prod = item.product;
                  if (!prod) return null;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#EAE7E1] rounded-2xl overflow-hidden shadow-xs hover:border-[#d3c3bd] transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-4/3 w-full bg-[#FAF9F6] overflow-hidden">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top corner reserve indicator badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 backdrop-blur-xs text-[#895029] border border-[#EAE7E1] shadow-xs">
                            Reserve Held: 8 Days Left
                          </span>
                        </div>

                        {/* Top corner Heart removal trigger */}
                        <button
                          type="button"
                          onClick={() => handleRemoveWishlist(prod.id)}
                          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-xs text-red-600 hover:bg-white shadow-xs transition-transform active:scale-90 cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <span className="material-symbols-outlined text-[18px] fill-current">
                            favorite
                          </span>
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase">
                              {prod.category}
                            </span>
                            <span className="font-sans tabular-nums text-base font-bold text-[#1A1A1A]">
                              ₹{prod.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <h4 className="font-serif text-2xl text-[#1A1A1A] font-medium leading-snug">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-[#766E65] line-clamp-2">
                            {prod.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#EAE7E1] flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveWishlist(prod.id)}
                            className="text-xs text-[#766E65] hover:text-red-700 font-medium transition-colors cursor-pointer"
                          >
                            Remove Piece
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddWishlistToCart(item)}
                            className="px-5 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99]"
                          >
                            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                            <span>Move to Bag</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Address Slide-Over Drawer */}
        <AddAddressDrawer
          isOpen={isAddressDrawerOpen}
          onClose={() => {
            setIsAddressDrawerOpen(false);
            setAddressToEdit(null);
          }}
          addressToEdit={addressToEdit}
          onAddressSaved={() => {
            if (customerUser?.id) {
              fetchAddresses(customerUser.id);
            }
            showToast("Delivery residence saved successfully.");
          }}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-8 text-xs text-[#766E65]">
          Loading patron account...
        </div>
      }
    >
      <AccountDashboardContent />
    </Suspense>
  );
}
