import "server-only";

import { getPrisma } from "@/lib/db";
import { CATALOG_SLUGS, getDemoCatalogProducts } from "@/lib/product-data";
import { mapProduct, productInclude } from "@/lib/products";
import { mediaAlt } from "@/lib/product-media";
import type { Product, ProductMedia, ProductVariant } from "@/lib/types";

export type PublishedTextSection = { title: string; body: string };
export type DiscoveryComfort = {
  firmnessLabel: string | null;
  firmnessScore: number | null;
  support: number | null;
  breathability: number | null;
  motionIsolation: number | null;
};

export type DiscoveryProduct = {
  product: Product;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  media: ProductMedia[];
  image: string;
  imageAlt: string;
  imageIsDemo: boolean;
  isDemo: boolean;
  variants: ProductVariant[];
  widths: number[];
  lengths: number[];
  thicknesses: number[];
  combinations: Array<{ width: number; length: number; thickness: number }>;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  purchasable: boolean;
  comfort: DiscoveryComfort | null;
  audience: PublishedTextSection | null;
  materialStory: PublishedTextSection | null;
  delivery: PublishedTextSection | null;
  warranty: PublishedTextSection | null;
  source: "database" | "demo";
  catalogueIndex: number;
};

function finiteScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5 ? value : null;
}

function publishedText(value: unknown): PublishedTextSection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (item.published !== true || typeof item.title !== "string" || typeof item.body !== "string") return null;
  const title = item.title.trim();
  const body = item.body.trim();
  return title && body ? { title, body } : null;
}

export function sanitizeProductContent(content: unknown) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return { comfort: null, audience: null, materialStory: null, delivery: null, warranty: null };
  const source = content as Record<string, unknown>;
  const rawComfort = source.comfort;
  let comfort: DiscoveryComfort | null = null;
  if (rawComfort && typeof rawComfort === "object" && !Array.isArray(rawComfort) && (rawComfort as Record<string, unknown>).published === true) {
    const item = rawComfort as Record<string, unknown>;
    comfort = {
      firmnessLabel: typeof item.firmnessLabel === "string" && item.firmnessLabel.trim() ? item.firmnessLabel.trim() : null,
      firmnessScore: finiteScore(item.firmnessScore),
      support: finiteScore(item.support),
      breathability: finiteScore(item.breathability),
      motionIsolation: finiteScore(item.motionIsolation),
    };
  }
  return {
    comfort,
    audience: publishedText(source.audience),
    materialStory: publishedText(source.materialStory),
    delivery: publishedText(source.delivery),
    warranty: publishedText(source.warranty),
  };
}

export function toDiscoveryProduct(product: Product, catalogueIndex = CATALOG_SLUGS.indexOf(product.slug as (typeof CATALOG_SLUGS)[number])): DiscoveryProduct {
  const variants = product.isDemo ? [] : product.variants.filter((variant) => variant.active);
  const priced = variants.map((variant) => variant.price).filter((price): price is number => typeof price === "number" && Number.isFinite(price) && price > 0);
  const media = product.media.length > 0 ? product.media : [];
  const primary = media[0];
  const content = sanitizeProductContent(product.content);
  return {
    product,
    slug: product.slug,
    name: product.name,
    eyebrow: product.eyebrow,
    description: product.description.trim(),
    media,
    image: primary?.url ?? product.posterUrl ?? "",
    imageAlt: primary ? mediaAlt(product, primary) : `Hình ảnh minh họa ${product.name}`,
    imageIsDemo: Boolean(product.isDemo || !primary || primary.isDemo),
    isDemo: product.isDemo,
    variants,
    widths: [...new Set(variants.map((variant) => variant.width))].sort((a, b) => a - b),
    lengths: [...new Set(variants.map((variant) => variant.length))].sort((a, b) => a - b),
    thicknesses: [...new Set(variants.map((variant) => variant.thickness))].sort((a, b) => a - b),
    combinations: variants.map((variant) => ({ width: variant.width, length: variant.length, thickness: variant.thickness })),
    minPrice: priced.length ? Math.min(...priced) : null,
    maxPrice: priced.length ? Math.max(...priced) : null,
    inStock: variants.some((variant) => variant.stock > 0),
    purchasable: !product.isDemo && product.purchasable,
    comfort: content.comfort,
    audience: content.audience,
    materialStory: content.materialStory,
    delivery: content.delivery,
    warranty: content.warranty,
    source: product.source,
    catalogueIndex: catalogueIndex < 0 ? CATALOG_SLUGS.length : catalogueIndex,
  };
}

export async function getDiscoveryProducts(): Promise<{ products: DiscoveryProduct[]; databaseAvailable: boolean }> {
  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return { products: getDemoCatalogProducts().map((product, index) => toDiscoveryProduct(product, index)), databaseAvailable: false };
  try {
    const records = await prisma.product.findMany({ where: { slug: { in: [...CATALOG_SLUGS] }, status: "PUBLISHED" }, include: productInclude });
    const products = records
      .filter((record) => record.status === "PUBLISHED")
      .map((record) => toDiscoveryProduct(mapProduct(record, "database"), CATALOG_SLUGS.indexOf(record.slug as (typeof CATALOG_SLUGS)[number])))
      .sort((a, b) => a.catalogueIndex - b.catalogueIndex);
    return { products, databaseAvailable: true };
  } catch {
    return { products: getDemoCatalogProducts().map((product, index) => toDiscoveryProduct(product, index)), databaseAvailable: false };
  }
}

export async function getDiscoveryProduct(slug: string) {
  const source = await getDiscoveryProducts();
  return source.products.find((product) => product.slug === slug) ?? null;
}
