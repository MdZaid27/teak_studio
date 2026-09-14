"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import {
  DbPatronAddress,
  DbPatronWishlist,
  OrderStatusFilter,
  OrderTimeframeFilter,
} from "@/types/database";
import { OrderWithItems } from "@/lib/orders";
import AddAddressDrawer from "@/components/account/AddAddressDrawer";
import PersonalTab from "@/components/account/PersonalTab";
import AddressesTab from "@/components/account/AddressesTab";
import OrdersTab from "@/components/account/OrdersTab";
import WishlistTab from "@/components/account/WishlistTab";

type TabType = "personal" | "addresses" | "orders" | "wishlist";

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    customerUser,
    profile,
    isLoading: authLoading,
    setIsAuthModalOpen,
    updateProfile,
    signOutCustomer,
  } = useCustomerAuth();

  const { addItem, setIsCartOpen } = useCart();

  const initialTab = (searchParams.get("tab") as TabType) || "personal";
  const [activeTab, setActiveTab] = useState<TabType>(
    ["personal", "addresses", "orders", "wishlist"].includes(initialTab) ? initialTab : "personal"
  );

  // Sync state when URL search parameter changes (e.g. back/forward navigation or direct links)
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && ["personal", "addresses", "orders", "wishlist"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    window.history.replaceState(null, "", `/account?tab=${newTab}`);
  };

  const [referenceTime] = useState(() => Date.now());

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

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState<DbPatronWishlist[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Pre-hydrate cached data from localStorage immediately on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const localSaved = localStorage.getItem("kiln_patron_session");
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        const userId = parsed?.id;
        const cleanPhone = parsed?.phone ? parsed.phone.replace(/\D/g, "").slice(-10) : "";
        if (userId) {
          const cachedAddr = localStorage.getItem(`teak_patron_addresses_${cleanPhone || userId}`);
          if (cachedAddr) {
            const a = JSON.parse(cachedAddr);
            if (Array.isArray(a) && a.length > 0) setAddresses(a);
          }
          const cachedOrders = localStorage.getItem(`teak_patron_orders_${userId}`);
          if (cachedOrders) {
            const o = JSON.parse(cachedOrders);
            if (Array.isArray(o) && o.length > 0) setOrders(o);
          }
          const cachedWishlist = localStorage.getItem(`teak_patron_wishlist_${userId}`);
          if (cachedWishlist) {
            const w = JSON.parse(cachedWishlist);
            if (Array.isArray(w) && w.length > 0) setWishlistItems(w);
          }
        }
      }
    } catch {}
  }, []);

  // Fetch Addresses
  const fetchAddresses = async (userId: string, userPhone?: string) => {
    const cleanPhone = userPhone ? userPhone.replace(/\D/g, "").slice(-10) : "";
    const storageKey = `teak_patron_addresses_${cleanPhone || userId}`;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
        }
      }
    } catch {}

    setLoadingAddresses(true);
    try {
      const effectivePhone = userPhone || customerUser?.phone;
      const phoneParam = effectivePhone ? `&phone=${encodeURIComponent(effectivePhone)}` : "";
      const res = await fetch(`/api/patron/addresses?userId=${encodeURIComponent(userId)}${phoneParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.addresses) {
          setAddresses(data.addresses);
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.addresses));
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Failed fetching addresses:", e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async (phoneOrEmail: string, userId?: string) => {
    setLoadingOrders(true);
    try {
      const url = `/api/patron/orders?phone=${encodeURIComponent(phoneOrEmail)}${
        userId ? `&userId=${encodeURIComponent(userId)}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
          if (userId) {
            try {
              localStorage.setItem(`teak_patron_orders_${userId}`, JSON.stringify(data.orders));
            } catch {}
          }
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
          try {
            localStorage.setItem(`teak_patron_wishlist_${userId}`, JSON.stringify(data.wishlist));
          } catch {}
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
        fetchAddresses(id, phone);
        fetchOrders(phone, id);
        fetchWishlist(id);
      });
    }
  }, [customerUser?.id, customerUser?.phone]);

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
        setAddresses((prev) => {
          const updated = prev.map((a) => ({
            ...a,
            is_default: a.id === addressId,
          }));
          try {
            const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
            const storageKey = `teak_patron_addresses_${cleanPhone || customerUser.id}`;
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch {}
          return updated;
        });
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
        `/api/patron/addresses?userId=${encodeURIComponent(customerUser.id)}&addressId=${encodeURIComponent(
          addressId
        )}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setAddresses((prev) => {
          const updated = prev.filter((a) => a.id !== addressId);
          try {
            const cleanPhone = customerUser.phone ? customerUser.phone.replace(/\D/g, "").slice(-10) : "";
            const storageKey = `teak_patron_addresses_${cleanPhone || customerUser.id}`;
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch {}
          return updated;
        });
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
        `/api/patron/wishlist?userId=${encodeURIComponent(customerUser.id)}&productId=${encodeURIComponent(
          productId
        )}`,
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
          `/api/patron/wishlist?userId=${encodeURIComponent(customerUser.id)}&productId=${encodeURIComponent(
            prod.id
          )}`,
          { method: "DELETE" }
        );
      } catch (e) {
        console.warn("Failed to sync wishlist deletion after move to bag:", e);
      }
    }
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : customerUser?.phone
    ? `Patron ${customerUser.phone.replace("+91", "")}`
    : "Patron";

  // While auth status is verifying on initial load, render a graceful matching skeleton
  if (authLoading && !customerUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 xl:px-16 animate-pulse">
        <div className="max-w-[1560px] mx-auto space-y-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-[#EAE7E1] rounded-md" />
            <div className="h-4 w-16 bg-[#EAE7E1] rounded-md" />
          </div>

          {/* Header Skeleton */}
          <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="h-3 w-32 bg-[#EAE7E1] rounded-md" />
            <div className="h-8 sm:h-9 w-64 bg-[#EAE7E1] rounded-md" />
            <div className="h-4 w-96 max-w-full bg-[#EAE7E1] rounded-md" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex border-b border-[#EAE7E1] gap-6 pb-3.5">
            <div className="h-4 w-28 bg-[#EAE7E1] rounded-md" />
            <div className="h-4 w-36 bg-[#EAE7E1] rounded-md" />
            <div className="h-4 w-36 bg-[#EAE7E1] rounded-md" />
            <div className="h-4 w-40 bg-[#EAE7E1] rounded-md" />
          </div>

          {/* Content Card Skeleton */}
          <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="h-6 w-56 bg-[#EAE7E1] rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="h-16 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl" />
              <div className="h-16 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl" />
              <div className="h-16 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl" />
              <div className="h-16 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth gate if user is completely unauthenticated
  if (!customerUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#EAE7E1] rounded-2xl p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#EAE7E1] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px] text-[#895029]">person</span>
          </div>
          <div className="space-y-2">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase">
              TEAK HAUS Atelier
            </span>
            <h1 className="font-serif text-3xl text-[#1A1A1A] font-medium">Patron Account</h1>
            <p className="text-xs text-[#766E65] leading-relaxed">
              Sign in with your mobile number to view commissioned pieces, saved delivery addresses, and private wishlist collections.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-colors duration-150 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
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

        {/* Patron Welcome Header */}
        <div className="bg-white border border-[#EAE7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] font-semibold tracking-wider text-[#895029] uppercase">
                  PATRON ACCOUNT PORTAL
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
                White-glove unboxing, leveling, and on-site joinery placement. Manage your delivery residences, commissioned timber orders, and held reserves.
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EAE7E1] overflow-x-auto no-scrollbar gap-2 sm:gap-6">
          <button
            onClick={() => handleTabChange("personal")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap cursor-pointer ${
              activeTab === "personal"
                ? "border-[#895029] text-[#1A1A1A] font-semibold"
                : "border-transparent text-[#766E65] hover:text-[#1A1A1A]"
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => handleTabChange("addresses")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
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
            onClick={() => handleTabChange("orders")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
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
            onClick={() => handleTabChange("wishlist")}
            className={`pb-3.5 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
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

        {/* Tab 1: Personal Details */}
        {activeTab === "personal" && (
          <PersonalTab
            profile={profile}
            customerUser={customerUser}
            onUpdateProfile={updateProfile}
            onShowToast={showToast}
          />
        )}

        {/* Tab 2: Delivery Addresses */}
        {activeTab === "addresses" && (
          <AddressesTab
            addresses={addresses}
            loadingAddresses={loadingAddresses}
            onAddNewAddress={() => {
              setAddressToEdit(null);
              setIsAddressDrawerOpen(true);
            }}
            onEditAddress={(addr) => {
              setAddressToEdit(addr);
              setIsAddressDrawerOpen(true);
            }}
            onSetDefaultAddress={handleSetDefaultAddress}
            onDeleteAddress={handleDeleteAddress}
          />
        )}

        {/* Tab 3: Commissioned Orders */}
        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            loadingOrders={loadingOrders}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            timeframeFilter={timeframeFilter}
            setTimeframeFilter={setTimeframeFilter}
            referenceTime={referenceTime}
          />
        )}

        {/* Tab 4: Saved Pieces & Wishlist */}
        {activeTab === "wishlist" && (
          <WishlistTab
            wishlistItems={wishlistItems}
            loadingWishlist={loadingWishlist}
            onAddToCart={handleAddWishlistToCart}
            onRemoveWishlist={handleRemoveWishlist}
          />
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
              fetchAddresses(customerUser.id, customerUser.phone);
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
