import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";

export const HOMEPAGE_SLUGS = [
  "america",
  "classic",
  "hoat-tinh",
  "memory-foam",
  "cao-su-thien-nhien",
  "luxury",
] as const;

export type HomepageProductSummary = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  isDemo: boolean;
  imageIsDemo: boolean;
  minPrice: number | null;
  purchasable: boolean;
  materialStory?: { title: string; body: string } | null;
};

export type HomepageData = {
  products: HomepageProductSummary[];
  settings: {
    shippingFee: number | null;
    contactPhone: string | null;
    contactEmail: string | null;
    navigation: unknown;
  } | null;
};

export function getContactHref(settings: HomepageData["settings"]): string | null {
  return settings?.contactPhone ? `tel:${settings.contactPhone}` : settings?.contactEmail ? `mailto:${settings.contactEmail}` : null;
}

type HomepageProductRecord = Prisma.ProductGetPayload<{
  select: {
    slug: true;
    name: true;
    eyebrow: true;
    description: true;
    status: true;
    isDemo: true;
    content: true;
    media: { orderBy: { sortOrder: "asc" }; take: 1 };
    variants: { where: { active: true }; select: { price: true; stock: true } };
  };
}>;

const defaultNames: Record<(typeof HOMEPAGE_SLUGS)[number], { name: string; eyebrow: string }> = {
  america: { name: "Nệm Thăng Long America", eyebrow: "EVERYDAY COMFORT" },
  classic: { name: "Nệm Thăng Long Classic", eyebrow: "THE EVERYDAY STANDARD" },
  "hoat-tinh": { name: "Nệm Thăng Long Hoạt Tính", eyebrow: "RESPONSIVE COMFORT" },
  "memory-foam": { name: "Nệm Thăng Long Memory Foam", eyebrow: "CONTOURED COMFORT" },
  "cao-su-thien-nhien": { name: "Nệm Cao Su Thiên Nhiên", eyebrow: "THE NATURAL STANDARD" },
  luxury: { name: "Nệm Thăng Long Luxury", eyebrow: "THE THĂNG LONG SIGNATURE" },
};

const defaultImages: Record<(typeof HOMEPAGE_SLUGS)[number], string> = {
  america: "/images/homepage-range.webp",
  classic: "/images/homepage-hero.webp",
  "hoat-tinh": "/images/homepage-hoat-tinh.webp",
  "memory-foam": "/images/homepage-memory-foam.webp",
  "cao-su-thien-nhien": "/images/homepage-natural-latex.webp",
  luxury: "/images/luxury-hero.png",
};

function fallbackProduct(slug: (typeof HOMEPAGE_SLUGS)[number]): HomepageProductSummary {
  const defaults = defaultNames[slug];
  return {
    slug,
    name: defaults.name,
    eyebrow: defaults.eyebrow,
    description: "Thông tin sản phẩm đang được cập nhật từ CMS.",
    image: defaultImages[slug],
    imageAlt: `Hình ảnh minh họa ${defaults.name}`,
    isDemo: true,
    imageIsDemo: true,
    minPrice: null,
    purchasable: false,
    materialStory: null,
  };
}

function parseMaterialStory(value: Prisma.JsonValue | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const content = value as Record<string, unknown>;
  const story = content.materialStory;
  if (!story || typeof story !== "object" || Array.isArray(story)) return null;
  const item = story as Record<string, unknown>;
  if (item.published !== true || typeof item.title !== "string" || typeof item.body !== "string") return null;
  return { title: item.title, body: item.body };
}

function mapProduct(record: HomepageProductRecord): HomepageProductSummary {
  const isDemo = record.isDemo;
  const validPrices = isDemo ? [] : record.variants.map((variant) => variant.price).filter((price): price is number => typeof price === "number" && price > 0);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
  const purchasable = !isDemo && record.status === "PUBLISHED" && record.variants.some((variant) => typeof variant.price === "number" && variant.price > 0 && variant.stock > 0);
  const media = record.media[0];
  const imageIsDemo = isDemo || !media || media.isDemo;
  return {
    slug: record.slug,
    name: record.name,
    eyebrow: record.eyebrow ?? defaultNames[record.slug as (typeof HOMEPAGE_SLUGS)[number]]?.eyebrow ?? "NỆM THĂNG LONG",
    description: record.description?.trim() || "Thông tin sản phẩm đang được cập nhật từ CMS.",
    image: media?.url ?? defaultImages[record.slug as (typeof HOMEPAGE_SLUGS)[number]] ?? "/images/homepage-range.webp",
    imageAlt: media?.alt || `Hình ảnh minh họa ${record.name}`,
    isDemo,
    imageIsDemo,
    minPrice,
    purchasable,
    materialStory: parseMaterialStory(record.content),
  };
}

const productSelect = {
  slug: true,
  name: true,
  eyebrow: true,
  description: true,
  status: true,
  isDemo: true,
  content: true,
  media: { orderBy: { sortOrder: "asc" }, take: 1 },
  variants: { where: { active: true }, select: { price: true, stock: true } },
} satisfies Prisma.ProductSelect;

export async function getHomepageData(): Promise<HomepageData> {
  const fallbackSettings = null;
  let prisma;
  try {
    prisma = getPrisma();
  } catch {
    return { products: HOMEPAGE_SLUGS.map(fallbackProduct), settings: fallbackSettings };
  }
  if (!prisma) return { products: HOMEPAGE_SLUGS.map(fallbackProduct), settings: fallbackSettings };

  try {
    const [records, settings] = await Promise.all([
      prisma.product.findMany({ where: { slug: { in: [...HOMEPAGE_SLUGS] }, status: "PUBLISHED" }, select: productSelect }),
      prisma.siteSettings.findUnique({ where: { id: "default" }, select: { shippingFee: true, contactPhone: true, contactEmail: true, navigation: true } }),
    ]);
    const bySlug = new Map(records.map((record) => [record.slug, mapProduct(record as HomepageProductRecord)]));
    return {
      products: HOMEPAGE_SLUGS.map((slug) => bySlug.get(slug) ?? fallbackProduct(slug)),
      settings,
    };
  } catch {
    return { products: HOMEPAGE_SLUGS.map(fallbackProduct), settings: fallbackSettings };
  }
}
