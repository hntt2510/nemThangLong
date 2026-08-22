import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isUiShowcaseMode,
  isRealProduction,
  evaluateCheckoutMutationGuard,
  SHOWCASE_CHECKOUT_BLOCKED_MESSAGE,
  getShowcaseProducts,
  getShowcaseProduct,
  getShowcaseCartItems,
  getShowcaseProfile,
  getShowcaseAddresses,
  getShowcaseOrders,
  getShowcaseSiteSettings,
  SHOWCASE_COMPARE_DEFAULT_ITEMS,
} from "@/lib/ui-showcase";
import { toCatalogProduct } from "@/lib/catalog";
import { toDiscoveryProduct } from "@/lib/discovery";

describe("UI Showcase Mode Layer & Isolation Guards", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.UI_SHOWCASE_MODE;
    delete process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE;
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    delete process.env.ENVIRONMENT;
    delete process.env.APP_ENV;
    delete process.env.DEPLOY_ENV;
    delete process.env.SITE_ENV;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // A. no env -> showcase false
  it("A. defaults to disabled when env flags are absent", () => {
    expect(isUiShowcaseMode({})).toBe(false);
    expect(isUiShowcaseMode(process.env)).toBe(false);
  });

  // B. local + UI_SHOWCASE_MODE=true -> showcase true
  it("B. enables when local and UI_SHOWCASE_MODE='true'", () => {
    expect(isUiShowcaseMode({ UI_SHOWCASE_MODE: "true", NODE_ENV: "development" })).toBe(true);
    expect(isUiShowcaseMode({ UI_SHOWCASE_MODE: "true", NODE_ENV: "test" })).toBe(true);
  });

  // C. preview/staging + explicit flag -> showcase true
  it("C. enables in preview or staging with explicit UI_SHOWCASE_MODE='true'", () => {
    expect(isUiShowcaseMode({ UI_SHOWCASE_MODE: "true", VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(true);
    expect(isUiShowcaseMode({ UI_SHOWCASE_MODE: "true", ENVIRONMENT: "staging", NODE_ENV: "production" })).toBe(true);
    expect(isUiShowcaseMode({ UI_SHOWCASE_MODE: "true", APP_ENV: "staging", NODE_ENV: "production" })).toBe(true);
    expect(isUiShowcaseMode({ UI_SHOWCASE_MODE: "true", ENVIRONMENT: "preview", NODE_ENV: "production" })).toBe(true);
  });

  // D. real production + flag absent -> showcase false
  it("D. disabled in real production when flag is absent", () => {
    expect(isUiShowcaseMode({ VERCEL_ENV: "production" })).toBe(false);
    expect(isUiShowcaseMode({ ENVIRONMENT: "production" })).toBe(false);
    expect(isRealProduction({ VERCEL_ENV: "production" })).toBe(true);
    expect(isRealProduction({ ENVIRONMENT: "production" })).toBe(true);
  });

  // E. real production + UI_SHOWCASE_MODE=true -> showcase STILL false
  it("E. hard-blocks showcase mode in real production even if UI_SHOWCASE_MODE='true'", () => {
    expect(isUiShowcaseMode({ VERCEL_ENV: "production", UI_SHOWCASE_MODE: "true" })).toBe(false);
    expect(isUiShowcaseMode({ ENVIRONMENT: "production", UI_SHOWCASE_MODE: "true" })).toBe(false);
    expect(isUiShowcaseMode({ APP_ENV: "production", UI_SHOWCASE_MODE: "true", NEXT_PUBLIC_UI_SHOWCASE_MODE: "true" })).toBe(false);
  });

  // E2. generic production fallback: NODE_ENV=production without deployment markers fails closed
  it("E2. generic production fallback: NODE_ENV=production without explicit preview/staging fails closed", () => {
    const genericProductionEnv = { NODE_ENV: "production", UI_SHOWCASE_MODE: "true" };
    expect(isRealProduction(genericProductionEnv)).toBe(true);
    expect(isUiShowcaseMode(genericProductionEnv)).toBe(false);
  });

  // F. NEXT_PUBLIC_UI_SHOWCASE_MODE alone -> must NOT enable server Showcase mode
  it("F. NEXT_PUBLIC_UI_SHOWCASE_MODE alone must NOT enable server-side showcase mode", () => {
    expect(isUiShowcaseMode({ NEXT_PUBLIC_UI_SHOWCASE_MODE: "true" })).toBe(false);
  });

  // G. showcase fixtures identified as Showcase -> not database
  it("G. showcase fixtures are clearly identified as Showcase and not database data", () => {
    const products = getShowcaseProducts();
    expect(products).toHaveLength(6);

    for (const product of products) {
      expect(product.source).toBe("showcase");
      expect(product.source).not.toBe("database");
      expect(product.isDemo).toBe(true);
      expect(product.isShowcase).toBe(true);
      expect(product.previewPurchasable).toBe(true);
      expect(product.purchasable).toBe(false);

      // Verify catalog transformation preserves presentation readiness
      const catalogItem = toCatalogProduct(product);
      expect(catalogItem.minPrice).toBeGreaterThan(0);
      expect(catalogItem.purchasable).toBe(true);
      expect(catalogItem.variants.length).toBeGreaterThan(0);

      // Verify discovery transformation preserves presentation readiness
      const discoveryItem = toDiscoveryProduct(product);
      expect(discoveryItem.source).toBe("showcase");
      expect(discoveryItem.hasVerifiedPrices).toBe(true);
      expect(discoveryItem.purchasable).toBe(true);
      expect(discoveryItem.variants.length).toBeGreaterThan(0);
    }
  });

  // H. showcase products contain no fake customer reviews
  it("H. showcase products contain no fake customer reviews", () => {
    const products = getShowcaseProducts();
    for (const product of products) {
      expect(product.reviews).toEqual([]);
    }
  });

  // I. audit copy for unsupported claims
  it("I. showcase fixtures contain no unsupported medical or durability claims", () => {
    const products = getShowcaseProducts();
    const forbiddenPhrases = [
      "kháng khuẩn",
      "khử mùi",
      "hấp thụ ẩm",
      "không võng lún sau thời gian dài",
      "hỗ trợ người lớn tuổi",
      "giải tỏa áp lực",
      "áp lực cột sống",
      "bảo vệ cột sống",
    ];

    for (const product of products) {
      const allText = JSON.stringify(product).toLowerCase();
      for (const phrase of forbiddenPhrases) {
        expect(allText.includes(phrase)).toBe(false);
      }
    }
  });

  // J. checkout mutation safety regression coverage
  it("J. checkout mutation safety guard blocks real checkout when showcase is active and allows when inactive", () => {
    // 1. In showcase mode: mutation must be strictly blocked with UI preview message
    const showcaseGuard = evaluateCheckoutMutationGuard(true);
    expect(showcaseGuard.allowed).toBe(false);
    if (!showcaseGuard.allowed) {
      expect(showcaseGuard.message).toBe(SHOWCASE_CHECKOUT_BLOCKED_MESSAGE);
    }

    // 2. In normal mode: mutation is permitted to proceed to API handlers
    const normalGuard = evaluateCheckoutMutationGuard(false);
    expect(normalGuard.allowed).toBe(true);

    // 3. Integration with isUiShowcaseMode():
    // With showcase enabled
    const activeShowcaseEnv = { UI_SHOWCASE_MODE: "true", NODE_ENV: "development" };
    expect(evaluateCheckoutMutationGuard(isUiShowcaseMode(activeShowcaseEnv)).allowed).toBe(false);

    // In production without showcase
    const prodEnv = { VERCEL_ENV: "production" };
    expect(evaluateCheckoutMutationGuard(isUiShowcaseMode(prodEnv)).allowed).toBe(true);
  });

  it("finds showcase product by slug", () => {
    const america = getShowcaseProduct("america");
    expect(america).toBeDefined();
    expect(america?.name).toBe("Nệm Thăng Long America");
    expect(america?.variants[0].price).toBe(4900000);

    const luxury = getShowcaseProduct("luxury");
    expect(luxury).toBeDefined();
    expect(luxury?.name).toBe("Nệm Thăng Long Luxury");
    expect(luxury?.variants.length).toBe(6);

    const nonExistent = getShowcaseProduct("unknown-mattress");
    expect(nonExistent).toBeNull();
  });

  it("supplies presentation cart items with synthetic prices", () => {
    const items = getShowcaseCartItems();
    expect(items).toHaveLength(2);
    expect(items[0].productSlug).toBe("luxury");
    expect(items[1].productSlug).toBe("classic");
  });

  it("supplies presentation account fixtures with synthetic test domains", () => {
    const profile = getShowcaseProfile();
    expect(profile.name).toBe("Nguyễn Minh Anh");
    expect(profile.email).toBe("minhanh@example.test");

    const addresses = getShowcaseAddresses();
    expect(addresses).toHaveLength(2);

    const orders = getShowcaseOrders();
    expect(orders).toHaveLength(4);
    expect(orders.map((o) => o.status)).toContain("Đang xử lý");
    expect(orders.map((o) => o.status)).toContain("Đang giao");
    expect(orders.map((o) => o.status)).toContain("Hoàn tất");
    expect(orders.map((o) => o.status)).toContain("Cần hỗ trợ");
  });

  it("supplies presentation site settings with clearly synthetic data", () => {
    const settings = getShowcaseSiteSettings();
    expect(settings.contactEmail).toBe("hotro@example.test");
    expect(settings.contactPhone).toBe("0900 000 000");
    const bank = settings.bankTransferInfo as Record<string, string>;
    expect(bank.bankName).toContain("Demo Bank");
    expect(bank.accountNumber).toBe("0000 0000 0000");
    expect(SHOWCASE_COMPARE_DEFAULT_ITEMS).toEqual(["america", "memory-foam", "luxury"]);
  });
});
