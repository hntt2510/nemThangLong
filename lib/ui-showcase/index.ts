import { SHOWCASE_PRODUCTS, getShowcaseProductBySlug } from "./products";
import { SHOWCASE_SETTINGS } from "./settings";
import { SHOWCASE_CART_ITEMS } from "./cart";
import { SHOWCASE_PROFILE, SHOWCASE_ADDRESSES, SHOWCASE_ORDERS, SHOWCASE_AFTER_SALES_CASES } from "./account";
import type { Product } from "@/lib/types";

/**
 * Checks if the runtime environment is considered real production.
 * In real production, UI showcase mode is strictly impossible (fails closed).
 *
 * Policy:
 * 1. Explicit production markers (VERCEL_ENV, ENVIRONMENT, APP_ENV, DEPLOY_ENV, SITE_ENV = 'production') -> true
 * 2. Generic NODE_ENV = 'production' without an explicit preview/staging marker -> fails closed to true
 * 3. Explicit preview/staging (VERCEL_ENV = 'preview', APP_ENV = 'staging', etc.) -> false
 */
export function isRealProduction(env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): boolean {
  if (!env) return false;

  // 1. Explicit production markers across hosting environments
  if (
    env.VERCEL_ENV === "production" ||
    env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    env.ENVIRONMENT === "production" ||
    env.APP_ENV === "production" ||
    env.DEPLOY_ENV === "production" ||
    env.SITE_ENV === "production"
  ) {
    return true;
  }

  // 2. Generic Node.js production runtime fail-closed fallback
  if (env.NODE_ENV === "production") {
    const isExplicitNonProduction =
      env.VERCEL_ENV === "preview" ||
      env.VERCEL_ENV === "development" ||
      env.ENVIRONMENT === "staging" ||
      env.ENVIRONMENT === "preview" ||
      env.ENVIRONMENT === "development" ||
      env.ENVIRONMENT === "test" ||
      env.ENVIRONMENT === "local" ||
      env.APP_ENV === "staging" ||
      env.APP_ENV === "preview" ||
      env.APP_ENV === "development" ||
      env.APP_ENV === "test" ||
      env.APP_ENV === "local" ||
      env.PREVIEW_MODE === "true" ||
      env.IS_PREVIEW === "true";

    if (!isExplicitNonProduction) {
      return true;
    }
  }

  return false;
}

export const SHOWCASE_CHECKOUT_BLOCKED_MESSAGE = "Đây là chế độ UI Preview — không tạo đơn hàng thực tế.";

export type CheckoutMutationGuardResult =
  | { allowed: true }
  | { allowed: false; message: string };

/**
 * Pure mutation safety guard for CheckoutForm submission.
 * Blocks actual /api/checkout and payment mutations when showcase mode is active.
 */
export function evaluateCheckoutMutationGuard(showcaseMode: boolean): CheckoutMutationGuardResult {
  if (showcaseMode) {
    return {
      allowed: false,
      message: SHOWCASE_CHECKOUT_BLOCKED_MESSAGE,
    };
  }
  return { allowed: true };
}

/**
 * Single authoritative check for UI Showcase Mode.
 * - In real production: ALWAYS false (fail-closed, cannot be overridden by flags).
 * - When called with an explicit env map (tests): requires explicit `env.UI_SHOWCASE_MODE === "true"`.
 * - When called with no arguments in app code: direct static access so Next.js bundler inlines flags.
 */
export function isUiShowcaseMode(env?: Record<string, string | undefined>): boolean {
  if (env) {
    if (isRealProduction(env)) {
      return false;
    }
    return env.UI_SHOWCASE_MODE === "true";
  }

  if (isRealProduction()) {
    return false;
  }

  return (
    process.env.UI_SHOWCASE_MODE === "true" ||
    process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE === "true"
  );
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
