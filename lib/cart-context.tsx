"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "thang-long-cart";
const CART_VERSION = 1;

function readCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    const entries = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && "version" in parsed && "items" in parsed && (parsed as { version?: unknown; items?: unknown }).version === CART_VERSION && Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items
        : [];
    const valid = entries.filter((item): item is CartItem => Boolean(
      item && typeof item === "object" &&
      typeof (item as CartItem).variantId === "string" &&
      typeof (item as CartItem).productName === "string" &&
      Number.isInteger((item as CartItem).quantity) &&
      (item as CartItem).quantity >= 1,
    ));
    return valid.slice(0, 20).map((item) => ({ ...item, quantity: Math.min(10, item.quantity) }));
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading first prevents an empty server render from overwriting a saved cart.
    setItems(readCart(window.localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CART_VERSION, items }));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    addItem: (item) => setItems((current) => {
      const existing = current.find((entry) => entry.variantId === item.variantId);
      if (existing) return current.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity: Math.min(10, entry.quantity + item.quantity) } : entry);
      if (current.length >= 20) return current;
      return [...current, { ...item, quantity: Math.min(10, Math.max(1, item.quantity)) }];
    }),
    removeItem: (variantId) => setItems((current) => current.filter((entry) => entry.variantId !== variantId)),
    setQuantity: (variantId, quantity) => setItems((current) => current.map((entry) => entry.variantId === variantId ? { ...entry, quantity: Math.min(10, Math.max(1, Math.trunc(quantity) || 1)) } : entry)),
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
