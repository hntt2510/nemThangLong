import { SHOWCASE_PRODUCTS, getShowcaseProductBySlug } from "./products";
import { SHOWCASE_SETTINGS } from "./settings";
import { SHOWCASE_CART_ITEMS } from "./cart";
import { SHOWCASE_PROFILE, SHOWCASE_ADDRESSES, SHOWCASE_ORDERS, SHOWCASE_AFTER_SALES_CASES } from "./account";
import type { Product } from "@/lib/types";

/**
 * Checks if the runtime environment is considered real production.
 * In real production, UI showcase mode is strictly impossible (fails closed).
 */
export function isRealProduction(env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): boolean {
  if (!env) return false;
  if (env.VERCEL_ENV === "production" || env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    return true;
  }
  if (
    env.ENVIRONMENT === "production" ||
    env.APP_ENV === "production" ||
    env.DEPLOY_ENV === "production" ||
    env.SITE_ENV === "production"
  ) {
    return true;
  }
  return false;
}

/**
 * Single authoritative check for UI Showcase Mode.
 * - In real production: ALWAYS false (fail-closed, cannot be overridden by flags).
 * - In local / preview / staging: requires explicit server-side `UI_SHOWCASE_MODE=true`.
 * - Note: `NEXT_PUBLIC_UI_SHOWCASE_MODE` alone must NEVER enable server-side showcase mode.
 */
export function isUiShowcaseMode(env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): boolean {
  if (!env) return false;

  // 1. Hard block in real production
  if (isRealProduction(env)) {
    return false;
  }

  // 2. Server-side single source of truth: UI_SHOWCASE_MODE
  return env.UI_SHOWCASE_MODE === "true";
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
