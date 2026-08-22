import "server-only";

import { getPrisma } from "@/lib/db";
import { CATALOG_SLUGS, getDemoCatalogProducts } from "@/lib/product-data";
import { mapProduct, productInclude } from "@/lib/products";
import { mediaAlt } from "@/lib/product-media";
import type { Product, ProductMedia, ProductVariant } from "@/lib/types";
import { sanitizePublishedContent, type PublishedBodySection, type PublishedTitledSection } from "@/lib/product-content";

export type PublishedTextSection = PublishedTitledSection;
export type DiscoveryBodySection = PublishedBodySection;
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
  delivery: DiscoveryBodySection | null;
  warranty: DiscoveryBodySection | null;
  hasVerifiedPrices: boolean;
  source: "database" | "demo" | "showcase";
  catalogueIndex: number;
  isShowcase?: boolean;
  previewPurchasable?: boolean;
};

export function sanitizeProductContent(value: unknown) {
  const sanitized = sanitizePublishedContent(value);
  return {
    comfort: sanitized.comfort ? { ...sanitized.comfort, firmnessLabel: sanitized.comfort.firmnessLabel ?? null } : null,
    audience: sanitized.audience,
    materialStory: sanitized.materialStory,
    delivery: sanitized.delivery,
    warranty: sanitized.warranty,
  };
}

export function toDiscoveryProduct(product: Product, catalogueIndex = CATALOG_SLUGS.indexOf(product.slug as (typeof CATALOG_SLUGS)[number])): DiscoveryProduct {
  const isShowcase = product.source === "showcase" || Boolean(product.isShowcase) || Boolean(product.previewPurchasable);
  const variants = product.isDemo && !isShowcase ? [] : product.variants.filter((variant) => variant.active);
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
    purchasable: (!product.isDemo || isShowcase) && (product.purchasable || Boolean(product.previewPurchasable)),
    comfort: content.comfort,
    audience: content.audience,
    materialStory: content.materialStory,
    delivery: content.delivery,
    warranty: content.warranty,
    hasVerifiedPrices: (!product.isDemo || isShowcase) && priced.length > 0,
    source: product.source,
    catalogueIndex: catalogueIndex < 0 ? CATALOG_SLUGS.length : catalogueIndex,
    isShowcase: product.isShowcase,
    previewPurchasable: product.previewPurchasable,
  };
}

export type DiscoveryData = { products: DiscoveryProduct[]; databaseAvailable: boolean; hasVerifiedPrices: boolean };

function discoveryData(products: DiscoveryProduct[], databaseAvailable: boolean): DiscoveryData {
  return { products, databaseAvailable, hasVerifiedPrices: products.some((product) => product.hasVerifiedPrices) };
}

import { isUiShowcaseMode, getShowcaseProducts } from "@/lib/ui-showcase";

export async function getDiscoveryProducts(): Promise<DiscoveryData> {
  if (isUiShowcaseMode()) {
    return discoveryData(getShowcaseProducts().map((product, index) => toDiscoveryProduct(product, index)), true);
  }
  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return discoveryData(getDemoCatalogProducts().map((product, index) => toDiscoveryProduct(product, index)), false);
  try {
    const records = await prisma.product.findMany({ where: { slug: { in: [...CATALOG_SLUGS] }, status: "PUBLISHED" }, include: productInclude });
    const products = records
      .filter((record) => record.status === "PUBLISHED")
      .map((record) => toDiscoveryProduct(mapProduct(record, "database"), CATALOG_SLUGS.indexOf(record.slug as (typeof CATALOG_SLUGS)[number])))
      .sort((a, b) => a.catalogueIndex - b.catalogueIndex);
    return discoveryData(products, true);
  } catch {
    return discoveryData(getDemoCatalogProducts().map((product, index) => toDiscoveryProduct(product, index)), false);
  }
}

export async function getDiscoveryProduct(slug: string) {
  const source = await getDiscoveryProducts();
  return source.products.find((product) => product.slug === slug) ?? null;
}
