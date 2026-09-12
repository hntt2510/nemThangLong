import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import type { Product, ProductContent } from "@/lib/types";
import { sanitizeProductContent } from "@/lib/product-content";

export const productInclude = {
  variants: { orderBy: [{ width: "asc" }, { length: "asc" }, { thickness: "asc" }] },
  mediaLinks: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } },
  profile: true,
  contentBlocks: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
  facts: { orderBy: { sortOrder: "asc" } },
  layers: { orderBy: { sortOrder: "asc" } },
  reviews: { where: { approved: true, ...(process.env.NODE_ENV === "production" ? { isFixture: false } : {}) }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function parseContent(value: Prisma.JsonValue | null): ProductContent | null {
  return sanitizeProductContent(value);
}

export function isProductSellable(verificationStatus: "PLACEHOLDER" | "VERIFIED", saleStatus: "HIDDEN" | "CONTACT_ONLY" | "ACTIVE") {
  return saleStatus === "ACTIVE" && (verificationStatus === "VERIFIED" || process.env.NODE_ENV !== "production");
}

import { getDemoProduct } from "@/lib/product-data";

export function mapProduct(record: ProductRecord, source: "database" = "database"): Product {
  const isDemo = Boolean(record.isDemo);
  const rawVariants = record.variants ?? [];
  const variants = rawVariants.map((variant) => ({ id: variant.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice, sku: variant.sku, stock: variant.stock ?? 0, active: variant.active ?? true, priceStatus: variant.priceStatus, stockStatus: variant.stockStatus }));
  const rawLinks = record.mediaLinks ?? [];
  const legacyMedia = (record as unknown as { media?: Array<{ id?: string; type?: string; url: string; alt?: string; aspect?: string | null; focalX?: number; focalY?: number; fit?: string; isDemo?: boolean }> }).media ?? [];
  const media = rawLinks.length > 0
    ? rawLinks
        .filter((link) => link.mediaAsset.reviewStatus === "APPROVED" || process.env.NODE_ENV !== "production")
        .map((link) => ({ id: link.mediaAsset.id, type: link.mediaAsset.type as "image" | "video" | "model", url: link.mediaAsset.url, alt: link.mediaAsset.alt, aspect: link.mediaAsset.aspect ?? undefined, focalX: link.focalX, focalY: link.focalY, fit: link.fit as "cover" | "contain", isDemo: false }))
    : legacyMedia.map((m, idx) => ({
        id: m.id ?? `media-${idx}`,
        type: (m.type ?? "image") as "image" | "video" | "model",
        url: m.url,
        alt: m.alt ?? record.name,
        aspect: m.aspect ?? undefined,
        focalX: m.focalX ?? 0.5,
        focalY: m.focalY ?? 0.5,
        fit: (m.fit ?? "cover") as "cover" | "contain",
        isDemo: Boolean(m.isDemo),
      }));
  const legacyContent = parseContent(record.content);
  const block = (type: "AUDIENCE" | "MATERIAL_STORY" | "DELIVERY" | "WARRANTY") => (record.contentBlocks ?? []).find((item) => item.type === type);
  const content: ProductContent = {
    comfort: record.profile && (record.profile.dataStatus === "VERIFIED" || process.env.NODE_ENV !== "production") ? { published: true, firmnessLabel: record.profile.firmnessLabel ?? undefined, firmnessScore: record.profile.firmnessScore, support: record.profile.support, breathability: record.profile.breathability, motionIsolation: record.profile.motionIsolation } : legacyContent?.comfort,
    audience: block("AUDIENCE") ? { published: true, title: block("AUDIENCE")?.title ?? "Phù hợp cho", body: block("AUDIENCE")!.body } : legacyContent?.audience,
    materialStory: block("MATERIAL_STORY") ? { published: true, title: block("MATERIAL_STORY")?.title ?? "Cấu trúc vật liệu", body: block("MATERIAL_STORY")!.body } : legacyContent?.materialStory,
    delivery: block("DELIVERY") ? { published: true, title: block("DELIVERY")?.title ?? undefined, body: block("DELIVERY")!.body } : legacyContent?.delivery,
    warranty: block("WARRANTY") ? { published: true, title: block("WARRANTY")?.title ?? undefined, body: block("WARRANTY")!.body } : legacyContent?.warranty,
  };
  const reviews = record.reviews ?? [];
  return {
    id: record.id, slug: record.slug, name: record.name, eyebrow: record.eyebrow ?? "THE THĂNG LONG SIGNATURE", description: record.description ?? "",
    media,
    variants,
    layers: (record.layers ?? []).map((layer) => ({ id: layer.id, sortOrder: layer.sortOrder, name: layer.name, material: layer.material, thickness: layer.thickness, description: layer.description, nodeName: layer.nodeName, explodeDistance: layer.explodeDistance, showHotspot: layer.showHotspot, published: layer.published })),
    modelUrl: record.modelUrl, posterUrl: record.posterUrl, mattressLab: record.mattressLab,
    reviews: reviews.map((review) => ({ authorName: review.authorName, rating: review.rating, comfort: review.comfort ?? undefined, quality: review.quality ?? undefined, value: review.value ?? undefined, body: review.body, createdAt: review.createdAt ? (typeof review.createdAt === "string" ? review.createdAt : (review.createdAt as Date).toISOString()) : new Date().toISOString(), isFixture: review.isFixture })),
    facts: (record.facts ?? []).filter((fact) => fact.dataStatus === "VERIFIED" || process.env.NODE_ENV !== "production").map((fact) => ({ key: fact.key, label: fact.label, value: fact.value, dataStatus: fact.dataStatus })),
    content, isDemo, source, presentation: record.presentation, saleStatus: record.saleStatus, verificationStatus: record.verificationStatus,
    curPrice: record.curPrice, oldPrice: record.oldPrice, badge: record.badge,
    purchasable: record.status === "PUBLISHED" && isProductSellable(record.verificationStatus ?? "VERIFIED", record.saleStatus ?? "ACTIVE") && variants.some((variant) => variant.active && variant.price !== null && variant.price > 0 && variant.stock > 0 && (process.env.NODE_ENV !== "production" || (variant.priceStatus === "VERIFIED" && variant.stockStatus === "VERIFIED"))),
  };
}

export async function getStorefrontProduct(slug: string): Promise<Product | null> {
  let prisma;
  try { prisma = getPrisma(); } catch { return getDemoProduct(slug); }
  if (!prisma) return getDemoProduct(slug);
  try {
    const record = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: productInclude });
    return record ? mapProduct(record) : getDemoProduct(slug);
  } catch { return getDemoProduct(slug); }
}

export async function getAdminProduct(slug: string) {
  let prisma;
  try { prisma = getPrisma(); } catch { return null; }
  if (!prisma) return null;
  try { return await prisma.product.findUnique({ where: { slug }, include: productInclude }); } catch { return null; }
}

export async function getSiteSettings() {
  let prisma;
  try { prisma = getPrisma(); } catch { return null; }
  if (!prisma) return null;
  try { return await prisma.siteSettings.findUnique({ where: { id: "default" } }); } catch { return null; }
}
