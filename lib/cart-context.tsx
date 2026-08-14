"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "./types";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("thang-long-cart");
    if (saved) {
      try { // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(saved) as CartItem[]);
      } catch { window.localStorage.removeItem("thang-long-cart"); }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("thang-long-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    addItem: (item) => setItems((current) => {
      const existing = current.find((entry) => entry.variantId === item.variantId);
      if (existing) return current.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity: Math.min(10, entry.quantity + item.quantity) } : entry);
      return [...current, item];
    }),
    removeItem: (variantId) => setItems((current) => current.filter((entry) => entry.variantId !== variantId)),
    clear: () => setItems([]),
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
