import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isUiShowcaseMode,
  getShowcaseProducts,
  getShowcaseProduct,
  getShowcaseCartItems,
  getShowcaseProfile,
  getShowcaseAddresses,
  getShowcaseOrders,
  getShowcaseSiteSettings,
  SHOWCASE_COMPARE_DEFAULT_ITEMS,
} from "@/lib/ui-showcase";

describe("UI Showcase Mode Layer", () => {
  const originalEnv = process.env.UI_SHOWCASE_MODE;
  const originalPublicEnv = process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE;

  beforeEach(() => {
    delete process.env.UI_SHOWCASE_MODE;
    delete process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE;
  });

  afterEach(() => {
    if (originalEnv !== undefined) process.env.UI_SHOWCASE_MODE = originalEnv;
    else delete process.env.UI_SHOWCASE_MODE;
    if (originalPublicEnv !== undefined) process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE = originalPublicEnv;
    else delete process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE;
  });

  it("defaults to disabled when env flags are absent", () => {
    expect(isUiShowcaseMode()).toBe(false);
  });

  it("enables when UI_SHOWCASE_MODE is 'true'", () => {
    process.env.UI_SHOWCASE_MODE = "true";
    expect(isUiShowcaseMode()).toBe(true);
  });

  it("enables when NEXT_PUBLIC_UI_SHOWCASE_MODE is 'true'", () => {
    process.env.NEXT_PUBLIC_UI_SHOWCASE_MODE = "true";
    expect(isUiShowcaseMode()).toBe(true);
  });

  it("supplies all 6 product lines with rich variant matrices", () => {
    const products = getShowcaseProducts();
    expect(products).toHaveLength(6);

    const slugs = products.map((p) => p.slug);
    expect(slugs).toEqual(["america", "classic", "hoat-tinh", "memory-foam", "cao-su-thien-nhien", "luxury"]);

    for (const product of products) {
      expect(product.variants.length).toBeGreaterThanOrEqual(5);
      expect(product.media.length).toBeGreaterThanOrEqual(3);
      expect(product.purchasable).toBe(true);
      expect(product.content?.comfort).toBeDefined();

      for (const variant of product.variants) {
        expect(variant.width).toBeGreaterThan(0);
        expect(variant.length).toBeGreaterThan(0);
        expect(variant.thickness).toBeGreaterThan(0);
        expect(variant.price).toBeGreaterThan(0);
      }
    }
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

  it("supplies presentation cart items without touching DB", () => {
    const items = getShowcaseCartItems();
    expect(items).toHaveLength(2);
    expect(items[0].productSlug).toBe("luxury");
    expect(items[1].productSlug).toBe("classic");
  });

  it("supplies presentation account fixtures", () => {
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

  it("supplies preselected compare default items", () => {
    expect(SHOWCASE_COMPARE_DEFAULT_ITEMS).toEqual(["america", "memory-foam", "luxury"]);
  });

  it("provides valid site settings", () => {
    const settings = getShowcaseSiteSettings();
    expect(settings.contactPhone).toBe("0901 234 567");
    expect(settings.contactEmail).toBe("tuvan@nemthanglong.vn");
    expect(settings.bankTransferInfo).toBeDefined();
    expect(settings.freeShippingThreshold).toBe(0);
  });
});
