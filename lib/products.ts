import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { getDemoProduct } from "@/lib/product-data";
import type { Product, ProductContent } from "@/lib/types";
import { mediaAlt } from "@/lib/product-media";

export const productInclude = {
  variants: { orderBy: [{ width: "asc" }, { length: "asc" }, { thickness: "asc" }] },
  media: { orderBy: { sortOrder: "asc" } },
  layers: { orderBy: { sortOrder: "asc" } },
  reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function parseContent(value: Prisma.JsonValue | null): ProductContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as ProductContent;
}

export function mapProduct(record: ProductRecord, source: "database" | "demo"): Product {
  const isDemo = source === "demo" || Boolean(record.isDemo);
  const rawVariants = record.variants ?? [];
  const rawMedia = record.media ?? [];
  const variants = rawVariants.map((variant) => ({ id: variant.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: isDemo ? null : variant.price, compareAtPrice: isDemo ? null : variant.compareAtPrice, sku: variant.sku, stock: isDemo ? 0 : (variant.stock ?? 0), active: isDemo ? false : (variant.active ?? true) }));
  const productionDemo = isDemo && process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
  const mediaRecords = rawMedia.length > 0 ? rawMedia : [getDemoProduct(record.slug).media[0]];
  const media = mediaRecords.map((item) => {
    const normalized = {
      id: item.id,
      type: item.type as "image" | "video" | "model",
      url: item.url,
      alt: item.alt,
      aspect: item.aspect ?? undefined,
      focalX: item.focalX,
      focalY: item.focalY,
      fit: item.fit as "cover" | "contain",
      isDemo: isDemo || item.isDemo === true,
    };
    return { ...normalized, alt: mediaAlt({ isDemo }, normalized) };
  });
  return {
    id: record.id, slug: record.slug, name: record.name, eyebrow: record.eyebrow ?? "THE THĂNG LONG SIGNATURE", description: record.description ?? "",
    media,
    variants,
    layers: (record.layers ?? []).map((layer) => ({ id: layer.id, sortOrder: layer.sortOrder, name: layer.name, material: layer.material, thickness: layer.thickness, description: layer.description, nodeName: layer.nodeName, explodeDistance: layer.explodeDistance, showHotspot: layer.showHotspot, published: productionDemo ? false : layer.published })),
    modelUrl: productionDemo ? null : record.modelUrl, posterUrl: record.posterUrl, mattressLab: record.mattressLab,
    reviews: (record.reviews ?? []).map((review) => ({ rating: review.rating, comfort: review.comfort ?? undefined, quality: review.quality ?? undefined, value: review.value ?? undefined })),
    content: parseContent(record.content), isDemo, source,
    purchasable: !isDemo && record.status === "PUBLISHED" && variants.some((variant) => variant.active && variant.price !== null && variant.price > 0 && variant.stock > 0),
  };
}

export async function getStorefrontProduct(slug: string): Promise<Product> {
  let prisma;
  try { prisma = getPrisma(); } catch { return getDemoProduct(slug); }
  if (!prisma) return getDemoProduct(slug);
  try {
    const record = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: productInclude });
    return record ? mapProduct(record, "database") : getDemoProduct(slug);
  } catch {
    return getDemoProduct(slug);
  }
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
