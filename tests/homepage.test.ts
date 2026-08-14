import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPrisma } = vi.hoisted(() => ({ getPrisma: vi.fn() }));
vi.mock("@/lib/db", () => ({ getPrisma }));

import { getContactHref, getHomepageData } from "@/lib/homepage";
import { parseNavigation } from "@/lib/navigation";

describe("homepage repository", () => {
  beforeEach(() => getPrisma.mockReset());

  it("returns a six-product non-purchasable demo catalogue when database is unavailable", async () => {
    getPrisma.mockReturnValue(null);
    const data = await getHomepageData();
    expect(data.products).toHaveLength(6);
    expect(data.products.every((product) => product.isDemo && product.imageIsDemo && !product.purchasable && product.minPrice === null)).toBe(true);
    expect(new Set(data.products.map((product) => product.image)).size).toBe(6);
  });

  it("separates product demo status from media demo status", async () => {
    getPrisma.mockReturnValue({
      product: { findMany: vi.fn().mockResolvedValue([
        {
          slug: "america",
          name: "America",
          eyebrow: "EVERYDAY COMFORT",
          description: "Nội dung đã xác nhận.",
          status: "PUBLISHED",
          isDemo: false,
          content: null,
          media: [{ url: "/america-demo.jpg", alt: "America", isDemo: true }],
          variants: [{ price: 4900000, stock: 2 }, { price: 5900000, stock: 0 }],
        },
        {
          slug: "classic",
          name: "Classic",
          eyebrow: "CLASSIC",
          description: "Nội dung đã xác nhận.",
          status: "PUBLISHED",
          isDemo: false,
          content: null,
          media: [],
          variants: [{ price: 3900000, stock: 2 }],
        },
        {
          slug: "hoat-tinh",
          name: "Hoạt Tính",
          eyebrow: "RESPONSIVE",
          description: "Nội dung đã xác nhận.",
          status: "PUBLISHED",
          isDemo: false,
          content: null,
          media: [{ url: "/hoat-tinh.jpg", alt: "Hoạt Tính", isDemo: false }],
          variants: [{ price: 4900000, stock: 2 }],
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
    const classic = data.products.find((product) => product.slug === "classic");
    const hoatTinh = data.products.find((product) => product.slug === "hoat-tinh");
    const luxury = data.products.find((product) => product.slug === "luxury");
    expect(america).toMatchObject({ minPrice: 4900000, purchasable: true, isDemo: false, imageIsDemo: true });
    expect(classic).toMatchObject({ minPrice: 3900000, purchasable: true, isDemo: false, imageIsDemo: true });
    expect(hoatTinh).toMatchObject({ minPrice: 4900000, purchasable: true, isDemo: false, imageIsDemo: false });
    expect(luxury).toMatchObject({ minPrice: null, purchasable: false, isDemo: true, imageIsDemo: true });
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

describe("homepage contact fallback", () => {
  it("does not create a self-anchor without a configured contact method", () => {
    expect(getContactHref(null)).toBeNull();
    expect(getContactHref({ shippingFee: null, contactPhone: null, contactEmail: null, navigation: null })).toBeNull();
    expect(getContactHref({ shippingFee: null, contactPhone: "0900000000", contactEmail: "hello@example.com", navigation: null })).toBe("tel:0900000000");
    expect(getContactHref({ shippingFee: null, contactPhone: null, contactEmail: "hello@example.com", navigation: null })).toBe("mailto:hello@example.com");
  });
});
