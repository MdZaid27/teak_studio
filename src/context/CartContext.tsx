"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  productId?: string;
  timberOption?: string;
  name: string;
  timber: string;
  finish: string;
  price: number;
  quantity: number;
  image: string;
  dimensions?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "kiln_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hydrate cart from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => {
            setItems(parsed);
          });
        }
      }
    } catch (err) {
      console.error("[KILN STUDIO] Error reading cart from localStorage:", err);
    } finally {
      queueMicrotask(() => {
        setIsHydrated(true);
      });
    }
  }, []);

  // Sync to localStorage whenever items change, but strictly only after initial hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("[KILN STUDIO] Error saving cart to localStorage:", err);
    }
  }, [items, isHydrated]);

  const addItem = React.useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const updateQuantity = React.useCallback((id: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    } catch {}
  }, []);

  const totalItems = React.useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);
  const subtotal = React.useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);

  const value = React.useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      isCartOpen,
      setIsCartOpen,
      totalItems,
      subtotal,
      clearCart,
    }),
    [items, addItem, removeItem, updateQuantity, isCartOpen, totalItems, subtotal, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
