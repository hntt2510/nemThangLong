import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteHeaderClient } from "@/components/site-header-client";
import { CartProvider } from "@/lib/cart-context";
import { defaultNavigation } from "@/lib/navigation";
import {
  getProductEffectivePrice,
  getPriceTier,
  getRelatedPriceTierProducts,
} from "@/lib/product-recommendations";

const CONSOLIDATED_TEST_CATALOG = [
  { id: "1", slug: "america", name: "Nệm America", minPrice: 4900000 },
  { id: "2", slug: "classic", name: "Nệm Classic", minPrice: 6900000 },
  { id: "3", slug: "hoat-tinh", name: "Nệm Hoạt Tính", minPrice: 8900000 },
  { id: "4", slug: "memory-foam", name: "Nệm Memory Foam", minPrice: 10900000 },
  { id: "5", slug: "cao-su-thien-nhien", name: "Nệm Cao Su Thiên Nhiên 3/4", minPrice: 14900000 },
  { id: "6", slug: "khach-san", name: "Nệm Cao Su Cho Khách Sạn", minPrice: 18900000 },
];

describe("product-recommendations utilities", () => {
  it("resolves product effective prices via minPrice, variants, or slug fallback", () => {
    expect(getProductEffectivePrice({ slug: "america", minPrice: 4900000 })).toBe(4900000);
    expect(getProductEffectivePrice({ slug: "luxury", minPrice: null })).toBe(22000000);
    expect(
      getProductEffectivePrice({ slug: "unknown", variants: [{ price: 12500000, active: true }] })
    ).toBe(12500000);
  });

  it("classifies products into strict price tiers", () => {
    expect(getPriceTier(4900000, "america")).toBe("TIER_BUDGET");
    expect(getPriceTier(6900000, "classic")).toBe("TIER_BUDGET");
    expect(getPriceTier(8900000, "hoat-tinh")).toBe("TIER_MID");
    expect(getPriceTier(10900000, "memory-foam")).toBe("TIER_MID");
    expect(getPriceTier(18900000, "khach-san")).toBe("TIER_LUXURY");
  });

  it("never recommends budget products for a 20,000,000đ luxury mattress", () => {
    const luxuryProduct = { id: "6", slug: "khach-san", minPrice: 18900000 };
    const related = getRelatedPriceTierProducts(luxuryProduct, CONSOLIDATED_TEST_CATALOG, 3);

    expect(related).toHaveLength(3);
    const relatedSlugs = related.map((p) => p.slug);

    // Must not include budget mattresses (4.9M, 6.9M)
    expect(relatedSlugs).not.toContain("america");
    expect(relatedSlugs).not.toContain("classic");

    // Must include closest premium/mid options sorted by proximity
    expect(relatedSlugs).toEqual(["cao-su-thien-nhien", "memory-foam", "hoat-tinh"]);
  });

  it("never recommends luxury products for a budget mattress", () => {
    const budgetProduct = { id: "1", slug: "america", minPrice: 4900000 };
    const related = getRelatedPriceTierProducts(budgetProduct, CONSOLIDATED_TEST_CATALOG, 3);

    expect(related).toHaveLength(3);
    const relatedSlugs = related.map((p) => p.slug);

    // Must not include luxury mattresses (> 14M)
    expect(relatedSlugs).not.toContain("khach-san");
    expect(relatedSlugs).not.toContain("cao-su-thien-nhien");

    // Must include budget/mid matches
    expect(relatedSlugs).toEqual(["classic", "hoat-tinh", "memory-foam"]);
  });

  it("excludes self-match by id and slug", () => {
    const product = { id: "4", slug: "memory-foam", minPrice: 10900000 };
    const related = getRelatedPriceTierProducts(product, CONSOLIDATED_TEST_CATALOG, 3);
    expect(related.map((p) => p.slug)).not.toContain("memory-foam");
  });
});

describe("mobile navigation drawer architecture", () => {
  it("renders a full-width off-canvas sheet with sticky header and safe bottom padding", () => {
    const markup = renderToStaticMarkup(
      createElement(CartProvider, null, createElement(SiteHeaderClient, { navigation: defaultNavigation, solid: true }))
    );

    // 1. Off-canvas sheet container
    expect(markup).toContain('id="mobile-navigation"');
    expect(markup).toContain("fixed inset-0 z-50 flex flex-col bg-white");

    // 2. Safe bottom padding and full-width scrollable container
    expect(markup).toContain("flex-1 overflow-y-auto px-5 py-4 pb-16");

    // 3. Accordion trigger with full touch target
    expect(markup).toContain('aria-controls="mobile-mattress-accordion"');
    expect(markup).toContain("min-h-[48px]");

    // 4. Close button inside drawer
    expect(markup).toContain('aria-label="Đóng menu"');
  });
});
