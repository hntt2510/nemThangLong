import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPrisma }));

import { filterCatalogProducts, getCatalogProducts, parseCatalogQuery, sortCatalogProducts, toCatalogProduct } from "@/lib/catalog";
import { getDemoProduct } from "@/lib/product-data";
import type { Product } from "@/lib/types";

function record(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    id: slug,
    slug,
    name: slug,
    eyebrow: "LINE",
    description: "Verified description",
    status: "PUBLISHED",
    isDemo: false,
    mattressLab: false,
    modelUrl: null,
    posterUrl: null,
    content: null,
    variants: [{ id: slug + "-variant", width: 160, length: 200, thickness: 15, price: 5000000, compareAtPrice: null, sku: slug.toUpperCase() + "-160", stock: 2, active: true }],
    media: [{ id: slug + "-media", type: "image", url: "/" + slug + ".webp", alt: slug, aspect: "4:5", focalX: 0.5, focalY: 0.5, fit: "cover", sortOrder: 0, isDemo: false }],
    layers: [],
    reviews: [],
    ...overrides,
  };
}

describe("catalog repository", () => {
  beforeEach(() => getPrisma.mockReset());

  it("uses six safe unique demos when the database is unavailable", async () => {
    getPrisma.mockReturnValue(null);
    const result = await getCatalogProducts();
    expect(result.databaseAvailable).toBe(false);
    expect(result.products).toHaveLength(6);
    expect(new Set(result.products.map((item) => item.image)).size).toBe(6);
    expect(result.products.every((item) => item.isDemo && item.minPrice === null && !item.purchasable)).toBe(true);
  });

  it("excludes drafts when the database is available", async () => {
    getPrisma.mockReturnValue({ product: { findMany: vi.fn().mockResolvedValue([record("america"), record("classic", { status: "DRAFT" })]) } });
    const result = await getCatalogProducts();
    expect(result.databaseAvailable).toBe(true);
    expect(result.products.map((item) => item.slug)).toEqual(["america"]);
  });

  it("keeps a real product separate from demo media and fallback media", () => {
    const demoMedia = toCatalogProduct({ ...getDemoProduct("america"), isDemo: false, source: "database" });
    expect(demoMedia).toMatchObject({ isDemo: false, imageIsDemo: true, minPrice: null, purchasable: false });
    const verified = toCatalogProduct({ ...getDemoProduct("america"), isDemo: false, source: "database", description: "Verified", media: [{ id: "m", type: "image", url: "/real.webp", alt: "real", isDemo: false }], variants: [{ id: "v", width: 160, length: 200, thickness: 15, price: 5000000, sku: "REAL", stock: 2, active: true }] } as Product);
    expect(verified).toMatchObject({ isDemo: false, imageIsDemo: false, minPrice: 5000000, purchasable: true });
  });
});

describe("catalog query and filtering", () => {
  it("parses shareable URL filters and preserves same-variant dimensions", () => {
    const query = parseCatalogQuery({ q: "REAL", line: ["america", "unsafe"], width: ["160"], thickness: ["15"], inStock: "1", sort: "price-desc" });
    expect(query).toMatchObject({ search: "REAL", lines: ["america"], widths: [160], thicknesses: [15], inStock: true, sort: "price-desc" });
    const product = toCatalogProduct({ ...getDemoProduct("america"), isDemo: false, source: "database", variants: [{ id: "a", width: 160, length: 200, thickness: 15, price: 5000000, sku: "REAL", stock: 1, active: true }, { id: "b", width: 180, length: 200, thickness: 20, price: 6000000, sku: "B", stock: 1, active: true }] } as Product);
    expect(filterCatalogProducts([product], query)).toHaveLength(1);
    expect(filterCatalogProducts([product], { ...query, thicknesses: [20] })).toHaveLength(0);
  });

  it("puts products without a verified price last for price sorting", () => {
    const demo = toCatalogProduct(getDemoProduct("classic"));
    const priced = toCatalogProduct({ ...getDemoProduct("america"), isDemo: false, source: "database", variants: [{ id: "v", width: 160, length: 200, thickness: 15, price: 4000000, sku: "A", stock: 1, active: true }] } as Product);
    expect(sortCatalogProducts([demo, priced], "price-asc").map((item) => item.slug)).toEqual(["america", "classic"]);
  });

  it("requires every variant-level filter to match one active variant", () => {
    const product = toCatalogProduct({
      ...getDemoProduct("america"),
      isDemo: false,
      source: "database",
      variants: [
        { id: "a", width: 160, length: 200, thickness: 10, price: 5000000, sku: "A", stock: 0, active: true },
        { id: "b", width: 180, length: 200, thickness: 20, price: 10000000, sku: "B", stock: 2, active: true },
      ],
    } as Product);

    expect(filterCatalogProducts([product], parseCatalogQuery({ width: "160", inStock: "1" }))).toHaveLength(0);
    expect(filterCatalogProducts([product], parseCatalogQuery({ width: "160", minPrice: "6000000" }))).toHaveLength(0);
    expect(filterCatalogProducts([product], parseCatalogQuery({ width: "180", minPrice: "6000000" }))).toHaveLength(1);
    expect(filterCatalogProducts([product], parseCatalogQuery({ thickness: "10", inStock: "1" }))).toHaveLength(0);
    expect(filterCatalogProducts([product], parseCatalogQuery({ minPrice: "6000000", maxPrice: "9000000" }))).toHaveLength(0);
    expect(filterCatalogProducts([product], parseCatalogQuery({ minPrice: "9000000", maxPrice: "6000000" }))).toHaveLength(0);
    expect(filterCatalogProducts([product], parseCatalogQuery({ minPrice: "4000000", maxPrice: "6000000" }))).toHaveLength(1);
    expect(filterCatalogProducts([product], parseCatalogQuery({ width: ["160", "180"], thickness: ["20"] }))).toHaveLength(1);
  });
});
