import { describe, expect, it } from "vitest";
import { buildCompareRows, parseCompareItems } from "@/lib/compare";
import { buildFinderResults, matchingFinderVariants, parseFinderQuery, rankFinderProducts } from "@/lib/finder";
import type { DiscoveryProduct } from "@/lib/discovery";
import type { ProductVariant } from "@/lib/types";
import { getDemoProduct } from "@/lib/product-data";
import { toDiscoveryProduct, sanitizeProductContent } from "@/lib/discovery";

function product(slug: string, variants: ProductVariant[], comfort: DiscoveryProduct["comfort"] = null, index = 0): DiscoveryProduct {
  return { product: {} as never, slug, name: slug, eyebrow: "LINE", description: "Verified", media: [], image: "/" + slug, imageAlt: slug, imageIsDemo: false, isDemo: false, variants, widths: [...new Set(variants.map((item) => item.width))], lengths: [...new Set(variants.map((item) => item.length))], thicknesses: [...new Set(variants.map((item) => item.thickness))], combinations: variants.map(({ width, length, thickness }) => ({ width, length, thickness })), minPrice: Math.min(...variants.map((item) => item.price ?? Infinity)), maxPrice: Math.max(...variants.map((item) => item.price ?? 0)), inStock: variants.some((item) => item.stock > 0), purchasable: variants.some((item) => item.price !== null && item.price > 0 && item.stock > 0), comfort, audience: null, materialStory: null, delivery: null, warranty: null, hasVerifiedPrices: variants.some((item) => item.price !== null && item.price > 0), source: "database", catalogueIndex: index };
}

const v = (id: string, width: number, length: number, thickness: number, price = 5000000, stock = 2): ProductVariant => ({ id, width, length, thickness, price, compareAtPrice: null, sku: id, stock, active: true });

describe("finder", () => {
  it("keeps demo products fail-closed and marks fallback media", () => {
    const demo = toDiscoveryProduct(getDemoProduct("america"));
    expect(demo.isDemo).toBe(true);
    expect(demo.imageIsDemo).toBe(true);
    expect(demo.variants).toHaveLength(0);
    const realWithoutMedia = toDiscoveryProduct({ ...getDemoProduct("america"), isDemo: false, source: "database", media: [] });
    expect(realWithoutMedia.isDemo).toBe(false);
    expect(realWithoutMedia.imageIsDemo).toBe(true);
  });

  it("sanitizes published comfort field by field", () => {
    const content = sanitizeProductContent({ comfort: { published: true, firmnessScore: 8, support: 4, breathability: "5" }, audience: { published: true, title: " ", body: "claim" } });
    expect(content.comfort).toMatchObject({ firmnessScore: null, support: 4, breathability: null });
    expect(content.audience).toBeNull();
  });

  it("sanitizes params and applies all hard constraints to one variant", () => {
    const query = parseFinderQuery({ width: "160", length: "200", maxPrice: "6000000", inStock: "1", feel: "soft", priority: "unsafe" });
    expect(query).toMatchObject({ width: 160, length: 200, maxPrice: 6000000, inStock: true, feel: "soft", priority: "unsure" });
    const item = product("america", [v("a", 160, 200, 10, 5000000, 0), v("b", 180, 200, 15, 6000000, 2)]);
    expect(matchingFinderVariants(item, query)).toHaveLength(0);
  });

  it("filters alternatives through the hard gate before soft scoring", () => {
    const matching = product("matching", [v("match", 160, 200, 10, 5000000, 2)], { firmnessLabel: "Êm", firmnessScore: 2, support: 4, breathability: null, motionIsolation: null }, 0);
    const wrongWidth = product("wrong-width", [v("width", 180, 200, 10, 5000000, 2)], matching.comfort, 1);
    const wrongBudget = product("wrong-budget", [v("budget", 160, 200, 10, 9000000, 2)], matching.comfort, 2);
    const wrongStock = product("wrong-stock", [v("stock", 160, 200, 10, 5000000, 0)], matching.comfort, 3);
    const results = buildFinderResults([matching, wrongWidth, wrongBudget, wrongStock], parseFinderQuery({ width: "160", maxPrice: "6000000", inStock: "1", feel: "soft" }));
    expect([results.primary?.product.slug, ...results.alternatives.map((item) => item.product.slug)]).toEqual(["matching"]);
  });

  it("returns a real empty result when no variant satisfies hard constraints", () => {
    const item = product("wrong", [v("wrong", 180, 210, 20, 9000000, 0)]);
    const results = buildFinderResults([item], parseFinderQuery({ width: "160", length: "200", maxPrice: "6000000", inStock: "1" }));
    expect(results).toMatchObject({ empty: true, primary: null, alternatives: [] });
  });

  it("never lets a demo satisfy hard constraints", () => {
    const demo = toDiscoveryProduct(getDemoProduct("america"));
    const results = buildFinderResults([demo], parseFinderQuery({ width: "160", inStock: "1" }));
    expect(results.empty).toBe(true);
  });

  it("keeps budget query unavailable when no verified price capability exists", () => {
    expect(parseFinderQuery({ maxPrice: "1000" }, { hasVerifiedPrices: false }).maxPrice).toBeNull();
    expect(parseFinderQuery({ maxPrice: "1000" }, { hasVerifiedPrices: true }).maxPrice).toBe(1000);
  });

  it("does not declare a winner with incomplete or tied evidence", () => {
    const items = [product("a", [v("a", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: null, breathability: null, motionIsolation: null }, 0), product("b", [v("b", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: null, breathability: null, motionIsolation: null }, 1)];
    const results = buildFinderResults(items, parseFinderQuery({ feel: "soft", priority: "support" }));
    expect(results.primary).toBeNull();
    expect(results.alternatives).toHaveLength(2);
  });

  it("does not declare a primary for contradictory or neutral evidence", () => {
    const mismatch = product("mismatch", [v("mismatch", 160, 200, 10)], { firmnessLabel: "Vững", firmnessScore: 5, support: 5, breathability: null, motionIsolation: null }, 0);
    expect(buildFinderResults([mismatch], parseFinderQuery({ feel: "soft" })).primary).toBeNull();
    const neutral = product("neutral", [v("neutral", 160, 200, 10)], { firmnessLabel: "Cân bằng", firmnessScore: 3, support: 3, breathability: null, motionIsolation: null }, 0);
    expect(buildFinderResults([neutral], parseFinderQuery({ priority: "support" })).primary).toBeNull();
  });

  it("allows a unique positive primary and suppresses ties", () => {
    const strong = product("strong", [v("strong", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: 5, breathability: null, motionIsolation: null }, 0);
    const weaker = product("weaker", [v("weaker", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: 4, breathability: null, motionIsolation: null }, 1);
    expect(buildFinderResults([strong], parseFinderQuery({ feel: "soft", priority: "support" })).primary?.product.slug).toBe("strong");
    expect(buildFinderResults([strong, strong], parseFinderQuery({ feel: "soft", priority: "support" })).primary).toBeNull();
    expect(buildFinderResults([strong, weaker], parseFinderQuery({ feel: "soft", priority: "support" })).primary?.product.slug).toBe("strong");
  });


  it("uses customer-facing fact-only rationale", () => {
    const item = product("rationale", [v("rationale", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: 5, breathability: null, motionIsolation: null }, 0);
    const candidate = rankFinderProducts([item], parseFinderQuery({ feel: "soft", priority: "support" }))[0];
    expect(candidate.reasons.join(" ")).toContain("êm hơn");
    expect(candidate.reasons.join(" ")).toContain("nâng đỡ");
    expect(candidate.reasons.join(" ")).not.toContain("soft");
    expect(candidate.reasons.join(" ")).not.toContain("support");
  });

  it("ranks coverage before score and keeps catalogue order stable", () => {
    const items = [product("first", [v("a", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: 1, breathability: null, motionIsolation: null }, 0), product("second", [v("b", 160, 200, 10)], { firmnessLabel: "Êm", firmnessScore: 2, support: null, breathability: null, motionIsolation: null }, 1)];
    expect(rankFinderProducts(items, parseFinderQuery({ feel: "soft", priority: "support" })).map((item) => item.product.slug)).toEqual(["first", "second"]);
  });
});

describe("compare", () => {
  it("parses repeated/csv items, removes unknowns and caps at three", () => {
    expect(parseCompareItems({ items: ["america,luxury", "america", "classic", "draft", "hoat-tinh"] })).toEqual(["america", "luxury", "classic"]);
  });

  it("hides all-unknown rows and keeps partial values explicit", () => {
    const a = product("a", [v("a", 160, 200, 10)], null);
    const b = product("b", [v("b", 180, 200, 15)], null);
    const rows = buildCompareRows([a, b]);
    expect(rows.some((row) => row.key === "support")).toBe(false);
    expect(rows.find((row) => row.key === "description")?.values).toEqual(["Verified", "Verified"]);
  });
});
