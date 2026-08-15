import "server-only";

import { CATALOG_SLUGS } from "@/lib/product-data";
import type { PrismaClient, Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";
import { productInclude } from "@/lib/products";
import { withSerializable } from "@/lib/transaction";
import { neutralCatalogProductName } from "@/lib/catalog-names";
import { adminProductDocumentSchema, type AdminProductDocument, catalogSlugSchema, type CatalogSlug } from "@/lib/admin-product-validation";

export { adminContentSchema, adminLayerSchema, adminMediaSchema, adminProductDocumentSchema, adminVariantSchema, catalogSlugSchema } from "@/lib/admin-product-validation";
export type { AdminProductDocument, CatalogSlug } from "@/lib/admin-product-validation";

export function isCatalogSlug(slug: string): slug is CatalogSlug {
  return (CATALOG_SLUGS as readonly string[]).includes(slug);
}

export function neutralProductName(slug: CatalogSlug) {
  return neutralCatalogProductName(slug);
}

export async function initializeAdminProduct(prisma: PrismaClient, slug: CatalogSlug) {
  return prisma.product.create({ data: { slug, name: neutralProductName(slug), status: "DRAFT", isDemo: true, mattressLab: false }, select: { id: true, slug: true, name: true, status: true, isDemo: true, updatedAt: true } });
}

export async function saveAdminProductDocument(prisma: PrismaClient, slug: CatalogSlug, document: AdminProductDocument) {
  if (!isCatalogSlug(slug)) throw new Error("INVALID_SLUG");
  if (document.general.isDemo && document.variants.some((variant) => variant.active || variant.price !== null)) throw new Error("DEMO_PRODUCT_INVALID");
  const dimensionKeys = new Set<string>();
  const skuKeys = new Set<string>();
  for (const variant of document.variants) {
    const key = `${variant.width}:${variant.length}:${variant.thickness}`;
    if (dimensionKeys.has(key)) throw new Error("DUPLICATE_DIMENSIONS");
    dimensionKeys.add(key);
    if (skuKeys.has(variant.sku)) throw new Error("DUPLICATE_SKU");
    skuKeys.add(variant.sku);
  }
  return withSerializable(prisma, async (tx) => {
    const current = await tx.product.findUnique({ where: { slug }, include: { variants: true, media: true, layers: true } });
    if (!current) throw new Error("NOT_FOUND");
    if (document.general.isDemo && current.variants.some((variant) => variant.stock > 0)) throw new Error("DEMO_PRODUCT_STOCK");
    if (current.updatedAt.toISOString() !== document.updatedAt) throw new Error("OPTIMISTIC_CONFLICT");
    const variantIds = new Set(document.variants.flatMap((item) => item.id ? [item.id] : []));
    const mediaIds = new Set(document.media.flatMap((item) => item.id ? [item.id] : []));
    const layerIds = new Set(document.layers.flatMap((item) => item.id ? [item.id] : []));
    if ([...variantIds].some((id) => !current.variants.some((item) => item.id === id)) || [...mediaIds].some((id) => !current.media.some((item) => item.id === id)) || [...layerIds].some((id) => !current.layers.some((item) => item.id === id))) throw new Error("OWNERSHIP");
    const skuRows = await tx.productVariant.findMany({ where: { sku: { in: document.variants.map((item) => item.sku) }, NOT: { productId: current.id } }, select: { sku: true } });
    if (skuRows.length) throw new Error("DUPLICATE_SKU");
    const detachedMediaUrls = current.media.filter((item) => !mediaIds.has(item.id)).map((item) => item.url);
    const updated = await tx.product.updateMany({ where: { id: current.id, updatedAt: new Date(document.updatedAt) }, data: { name: document.general.name, eyebrow: document.general.eyebrow ?? null, description: document.general.description ?? null, status: document.general.status, isDemo: document.general.isDemo, mattressLab: document.general.mattressLab, modelUrl: detachedMediaUrls.includes(document.general.modelUrl ?? "") ? null : document.general.modelUrl ?? null, posterUrl: detachedMediaUrls.includes(document.general.posterUrl ?? "") ? null : document.general.posterUrl ?? null, content: document.general.content ? document.general.content as Prisma.InputJsonValue : PrismaNamespace.JsonNull } });
    if (updated.count !== 1) throw new Error("OPTIMISTIC_CONFLICT");
    await tx.productVariant.updateMany({ where: { productId: current.id, id: { notIn: [...variantIds] } }, data: { active: false } });
    await tx.mediaAsset.deleteMany({ where: { productId: current.id, id: { notIn: [...mediaIds] } } });
    await tx.productLayer.deleteMany({ where: { productId: current.id, id: { notIn: [...layerIds] } } });
    for (const variant of document.variants) { const data = { productId: current.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice ?? null, sku: variant.sku, active: variant.active }; if (variant.id) await tx.productVariant.update({ where: { id: variant.id }, data }); else await tx.productVariant.create({ data: { ...data, stock: 0 } }); }
    for (const media of document.media) { const data = { productId: current.id, type: media.type, url: media.url, alt: media.alt, aspect: media.aspect ?? null, focalX: media.focalX ?? .5, focalY: media.focalY ?? .5, fit: media.fit ?? "cover", sortOrder: media.sortOrder, isDemo: media.id ? (media.isDemo ?? false) : true }; if (media.id) await tx.mediaAsset.update({ where: { id: media.id }, data }); else await tx.mediaAsset.create({ data }); }
    for (const layer of document.layers) { const data = { productId: current.id, sortOrder: layer.sortOrder, name: layer.name, material: layer.material ?? null, thickness: layer.thickness ?? null, description: layer.description ?? null, textureUrl: layer.textureUrl ?? null, nodeName: layer.nodeName ?? null, explodeDistance: layer.explodeDistance ?? 0, showHotspot: layer.showHotspot ?? false, published: layer.published }; if (layer.id) await tx.productLayer.update({ where: { id: layer.id }, data }); else await tx.productLayer.create({ data }); }
    return tx.product.findUnique({ where: { id: current.id }, include: productInclude });
  });
}
