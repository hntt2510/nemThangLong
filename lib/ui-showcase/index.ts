import { SHOWCASE_PRODUCTS, getShowcaseProductBySlug } from "./products";
import { SHOWCASE_SETTINGS } from "./settings";
import { SHOWCASE_CART_ITEMS } from "./cart";
import { SHOWCASE_PROFILE, SHOWCASE_ADDRESSES, SHOWCASE_ORDERS, SHOWCASE_AFTER_SALES_CASES } from "./account";
import type { Product } from "@/lib/types";

export function isUiShowcaseMode(): boolean {
  if (typeof process === "undefined") return false;
  return process.env.UI_SHOWCASE_MODE === "true" || process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE === "true";
}

export function getShowcaseProduct(slug: string): Product | null {
  return getShowcaseProductBySlug(slug);
}

export function getShowcaseProducts(): Product[] {
  return SHOWCASE_PRODUCTS;
}

export function getShowcaseSiteSettings() {
  return SHOWCASE_SETTINGS;
}

export function getShowcaseCartItems() {
  return SHOWCASE_CART_ITEMS;
}

export function getShowcaseProfile() {
  return SHOWCASE_PROFILE;
}

export function getShowcaseAddresses() {
  return SHOWCASE_ADDRESSES;
}

export function getShowcaseOrders() {
  return SHOWCASE_ORDERS;
}

export function getShowcaseOrder(idOrCode: string) {
  return SHOWCASE_ORDERS.find((order) => order.id === idOrCode || order.code === idOrCode) ?? null;
}

export function getShowcaseAfterSales() {
  return SHOWCASE_AFTER_SALES_CASES;
}

export const SHOWCASE_COMPARE_DEFAULT_ITEMS = ["america", "memory-foam", "luxury"];
