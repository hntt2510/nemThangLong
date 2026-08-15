import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPrisma }));

import { buildCompareRows, selectCompareProducts } from "@/lib/compare";
import { getDiscoveryProducts, sanitizeProductContent, toDiscoveryProduct } from "@/lib/discovery";
import { getDemoProduct } from "@/lib/product-data";
import { contactPageMetadata, discoveryPageMetadata } from "@/lib/seo";
import type { Product } from "@/lib/types";

function record(slug: string, status: "PUBLISHED" | "DRAFT" = "PUBLISHED") {
  return {
    id: slug,
    slug,
    name: slug,
    eyebrow: "LINE",
    description: "Verified description",
    status,
    isDemo: false,
    mattressLab: false,
    modelUrl: null,
    posterUrl: null,
    content: null,
    variants: [{ id: slug + "-variant", width: 160, length: 200, thickness: 15, price: 5000000, compareAtPrice: null, sku: slug.toUpperCase(), stock: 2, active: true }],
    media: [{ id: slug + "-media", type: "image", url: "/" + slug + ".webp", alt: slug, aspect: "4:5", focalX: 0.5, focalY: 0.5, fit: "cover", sortOrder: 0, isDemo: false }],
    layers: [],
    reviews: [],
  };
}

describe("shared discovery regression", () => {
  beforeEach(() => getPrisma.mockReset());

  it("excludes a valid catalogue slug when its Product is draft", async () => {
    getPrisma.mockReturnValue({ product: { findMany: vi.fn().mockResolvedValue([record("america", "DRAFT"), record("classic")]) } });
    const data = await getDiscoveryProducts();
    expect(data.products.map((product) => product.slug)).toEqual(["classic"]);
    expect(selectCompareProducts(data.products, ["america", "classic"]).map((product) => product.slug)).toEqual(["classic"]);
  });

  it("derives verified price capability only from real active priced variants", async () => {
    getPrisma.mockReturnValue({ product: { findMany: vi.fn().mockResolvedValue([record("america")]) } });
    const data = await getDiscoveryProducts();
    expect(data.hasVerifiedPrices).toBe(true);
    expect(data.products[0].hasVerifiedPrices).toBe(true);
  });

  it("keeps delivery and warranty body sections without titles", () => {
    const content = sanitizeProductContent({
      delivery: { published: true, body: "Giao hàng theo chính sách đã xác nhận." },
      warranty: { published: true, body: "Bảo hành theo chính sách đã xác nhận." },
      audience: { published: true, title: "", body: "invalid" },
    });
    expect(content.delivery).toEqual({ published: true, body: "Giao hàng theo chính sách đã xác nhận." });
    expect(content.warranty).toEqual({ published: true, body: "Bảo hành theo chính sách đã xác nhận." });
    expect(content.audience).toBeNull();
    const product = toDiscoveryProduct({ ...getDemoProduct("america"), isDemo: false, source: "database", content: content as Product["content"], variants: [{ id: "v", width: 160, length: 200, thickness: 15, price: 5000000, compareAtPrice: null, sku: "A", stock: 2, active: true }] });
    const rows = buildCompareRows([product]);
    expect(rows.find((row) => row.key === "delivery")?.values[0]).toContain("Giao hàng");
    expect(rows.find((row) => row.key === "warranty")?.values[0]).toContain("Bảo hành");
  });

  it("uses stable canonical and query noindex metadata", () => {
    expect(discoveryPageMetadata("finder", false)).toMatchObject({ alternates: { canonical: "/tim-nem" }, robots: { index: true, follow: true } });
    expect(discoveryPageMetadata("finder", true)).toMatchObject({ alternates: { canonical: "/tim-nem" }, robots: { index: false, follow: true } });
    expect(discoveryPageMetadata("compare", false)).toMatchObject({ alternates: { canonical: "/so-sanh" }, robots: { index: true, follow: true } });
    expect(discoveryPageMetadata("compare", true)).toMatchObject({ alternates: { canonical: "/so-sanh" }, robots: { index: false, follow: true } });
  });

  it("uses contact-specific index and noindex metadata", () => {
    expect(contactPageMetadata(false)).toMatchObject({ alternates: { canonical: "/lien-he" }, robots: { index: true, follow: true } });
    expect(contactPageMetadata(true)).toMatchObject({ alternates: { canonical: "/lien-he" }, robots: { index: false, follow: true } });
    expect(contactPageMetadata(false).description).toMatch(/liên hệ/i);
    expect(contactPageMetadata(false).description).not.toContain("Finder");
  });
});
