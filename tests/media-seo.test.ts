import { describe, expect, it } from "vitest";
import { getDemoProduct } from "@/lib/product-data";
import { isDemoMedia, mediaAlt } from "@/lib/product-media";
import { productJsonLd, productMetadata } from "@/lib/seo";
import type { Product } from "@/lib/types";

function realProduct(): Product {
  return {
    ...getDemoProduct("america"),
    isDemo: false,
    source: "database",
    description: "Verified product description",
    media: [
      { id: "verified", type: "image", url: "/verified.webp", alt: "Verified image", isDemo: false },
      { id: "demo", type: "image", url: "/demo.webp", alt: "Secondary image", isDemo: true },
    ],
    variants: [{ id: "v", width: 160, length: 200, thickness: 15, price: 5000000, sku: "VERIFIED", stock: 2, active: true }],
  };
}

describe("demo media semantics", () => {
  it("marks real products with demo secondary media without marking verified media", () => {
    const product = realProduct();
    expect(isDemoMedia(product, product.media[0])).toBe(false);
    expect(isDemoMedia(product, product.media[1])).toBe(true);
    expect(mediaAlt(product, product.media[1])).toContain("Hình ảnh minh họa");
    expect(mediaAlt(product, product.media[0])).toBe("Verified image");
    expect(mediaAlt(product, { ...product.media[0], alt: "Hình ảnh minh họa do CMS nhập" })).not.toMatch(/^Hình ảnh minh họa/);
  });
});

describe("catalog PDP metadata", () => {
  it("noindexes demo products and excludes them from product JSON-LD", () => {
    const product = getDemoProduct("america");
    const metadata = productMetadata(product, "/nem/america");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(productJsonLd(product, "/nem/america")).toBeNull();
  });

  it("keeps verified products indexable and emits only verified product data", () => {
    const product = realProduct();
    const metadata = productMetadata(product, "/nem/america");
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph?.images).toEqual(["/verified.webp"]);
    const jsonLd = productJsonLd(product, "/nem/america") as Record<string, unknown>;
    expect(jsonLd.image).toEqual(["/verified.webp"]);
    expect(JSON.stringify(jsonLd)).not.toContain("/demo.webp");
    expect(jsonLd).not.toHaveProperty("aggregateRating");
  });
});
