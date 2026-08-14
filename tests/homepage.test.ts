import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPrisma }));

import { getHomepageData } from "@/lib/homepage";
import { parseNavigation } from "@/lib/navigation";

describe("homepage repository", () => {
  beforeEach(() => getPrisma.mockReset());

  it("returns a six-product non-purchasable demo catalogue when database is unavailable", async () => {
    getPrisma.mockReturnValue(null);
    const data = await getHomepageData();
    expect(data.products).toHaveLength(6);
    expect(data.products.every((product) => product.isDemo && !product.purchasable && product.minPrice === null)).toBe(true);
  });

  it("uses published database prices and stock without trusting demo values", async () => {
    getPrisma.mockReturnValue({
      product: { findMany: vi.fn().mockResolvedValue([
        {
          slug: "america",
          name: "America thật",
          eyebrow: "EVERYDAY COMFORT",
          description: "Nội dung đã xác nhận.",
          status: "PUBLISHED",
          isDemo: false,
          content: null,
          media: [{ url: "/america.jpg", alt: "America", isDemo: false }],
          variants: [{ price: 4900000, stock: 2 }, { price: 5900000, stock: 0 }],
        },
        {
          slug: "luxury",
          name: "Luxury demo",
          eyebrow: "SIGNATURE",
          description: "Minh họa",
          status: "PUBLISHED",
          isDemo: true,
          content: null,
          media: [{ url: "/luxury.jpg", alt: "Luxury", isDemo: true }],
          variants: [{ price: 18900000, stock: 6 }],
        },
      ]), },
      siteSettings: { findUnique: vi.fn().mockResolvedValue(null) },
    } as never);
    const data = await getHomepageData();
    const america = data.products.find((product) => product.slug === "america");
    const luxury = data.products.find((product) => product.slug === "luxury");
    expect(america).toMatchObject({ minPrice: 4900000, purchasable: true, isDemo: false });
    expect(luxury).toMatchObject({ minPrice: null, purchasable: false, isDemo: true });
  });

  it("falls back safely when a product query fails", async () => {
    getPrisma.mockReturnValue({ product: { findMany: vi.fn().mockRejectedValue(new Error("offline")) } } as never);
    const data = await getHomepageData();
    expect(data.products.map((product) => product.slug)).toEqual(["america", "classic", "hoat-tinh", "memory-foam", "cao-su-thien-nhien", "luxury"]);
    expect(data.products.some((product) => product.minPrice !== null || product.purchasable)).toBe(false);
  });
});

describe("navigation parser", () => {
  it("rejects external and malformed destinations", () => {
    const navigation = parseNavigation({ mattressLines: [{ label: "Unsafe", href: "https://example.com" }, { label: "Luxury", href: "/nem/luxury" }] });
    expect(navigation.mattressLines).toEqual([{ label: "Luxury", href: "/nem/luxury" }]);
    expect(navigation.needs.length).toBeGreaterThan(0);
  });
});
