import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { getStorefrontNavigation } from "@/lib/storefront-cms";

export class StorefrontUnavailableError extends Error {
  constructor() { super("STOREFRONT_UNAVAILABLE"); }
}

const isProduction = () => process.env.NODE_ENV === "production";

function database(): PrismaClient {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new StorefrontUnavailableError();
    return prisma;
  } catch (error) {
    if (error instanceof StorefrontUnavailableError) throw error;
    throw new StorefrontUnavailableError();
  }
}

function publicProductWhere(): Prisma.ProductWhereInput {
  return {
    status: "PUBLISHED",
    saleStatus: { not: "HIDDEN" },
    ...(isProduction() ? { verificationStatus: "VERIFIED" } : {}),
  };
}

function publicVariantWhere(): Prisma.ProductVariantWhereInput {
  return {
    active: true,
    ...(isProduction() ? { priceStatus: "VERIFIED", stockStatus: "VERIFIED" } : {}),
  };
}

function numericValues(values: string[]) {
  return [...new Set(values.flatMap((value) => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? [parsed] : [];
  }))];
}

function nullableMoney(value: string | null) {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export type PublicCatalogQuery = {
  q: string;
  lines: string[];
  widths: number[];
  thicknesses: number[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: "featured" | "price-asc" | "price-desc" | "name-asc";
  page: number;
  pageSize: number;
};

export function parsePublicCatalogQuery(params: URLSearchParams): PublicCatalogQuery {
  const rawSort = params.get("sort");
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "20");
  return {
    q: (params.get("q") ?? "").trim().slice(0, 100),
    lines: [...new Set(params.getAll("line").filter((line) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(line)))],
    widths: numericValues(params.getAll("width")),
    thicknesses: numericValues(params.getAll("thickness")),
    minPrice: nullableMoney(params.get("minPrice")),
    maxPrice: nullableMoney(params.get("maxPrice")),
    inStock: params.get("inStock") === "1",
    sort: rawSort === "price-asc" || rawSort === "price-desc" || rawSort === "name-asc" ? rawSort : "featured",
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000) : 1,
    pageSize: Number.isSafeInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 20,
  };
}

function toImage(link: { id: string; sortOrder: number; focalX: number; focalY: number; fit: string; role: string; mediaAsset: { url: string; alt: string } }) {
  return { linkId: link.id, url: link.mediaAsset.url, alt: link.mediaAsset.alt, sortOrder: link.sortOrder, focalX: link.focalX, focalY: link.focalY, fit: link.fit === "contain" ? "contain" as const : "cover" as const };
}

function isSaleableVariant(variant: { price: number | null; stock: number; active: boolean; priceStatus: string; stockStatus: string }) {
  return variant.active && variant.price !== null && variant.price > 0 && variant.stock > 0 && (!isProduction() || (variant.priceStatus === "VERIFIED" && variant.stockStatus === "VERIFIED"));
}

function toCard(product: { id: string; slug: string; name: string; shortName: string | null; eyebrow: string | null; saleStatus: string; verificationStatus: string; category: { slug: string; name: string } | null; variants: Array<{ width: number; thickness: number; price: number | null; stock: number; active: boolean; priceStatus: string; stockStatus: string }>; mediaLinks: Array<{ id: string; role: string; sortOrder: number; focalX: number; focalY: number; fit: string; mediaAsset: { url: string; alt: string } }>; reviews: Array<{ rating: number }> }) {
  const variants = product.variants.filter((variant) => variant.active);
  const priced = variants.filter((variant) => !isProduction() || variant.priceStatus === "VERIFIED").map((variant) => variant.price).filter((price): price is number => typeof price === "number" && price > 0);
  const primary = product.mediaLinks.find((link) => link.role === "primary")
    ?? product.mediaLinks.filter((link) => link.role === "gallery").sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const ratingCount = product.reviews.length;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortName: product.shortName,
    eyebrow: product.eyebrow,
    category: product.category,
    image: primary ? toImage(primary) : null,
    priceFrom: priced.length ? Math.min(...priced) : null,
    priceMode: priced.length ? "PRICED" as const : "CONTACT" as const,
    availability: product.saleStatus !== "ACTIVE" || !priced.length ? "CONTACT_REQUIRED" as const : variants.some(isSaleableVariant) ? "IN_STOCK" as const : "OUT_OF_STOCK" as const,
    widths: [...new Set(variants.map((variant) => variant.width))].sort((a, b) => a - b),
    thicknesses: [...new Set(variants.map((variant) => variant.thickness))].sort((a, b) => a - b),
    ratingAverage: ratingCount ? product.reviews.reduce((total, review) => total + review.rating, 0) / ratingCount : null,
    ratingCount,
    isTestData: product.verificationStatus !== "VERIFIED" || variants.some((variant) => variant.priceStatus !== "VERIFIED" || variant.stockStatus !== "VERIFIED"),
  };
}

function withVariantFilters(query: PublicCatalogQuery): Prisma.ProductVariantWhereInput | null {
  if (query.minPrice !== null && query.maxPrice !== null && query.minPrice > query.maxPrice) return { id: { in: [] } };
  if (!query.widths.length && !query.thicknesses.length && query.minPrice === null && query.maxPrice === null && !query.inStock) return null;
  return {
    ...publicVariantWhere(),
    ...(query.widths.length ? { width: { in: query.widths } } : {}),
    ...(query.thicknesses.length ? { thickness: { in: query.thicknesses } } : {}),
    ...(query.minPrice !== null || query.maxPrice !== null ? { price: { ...(query.minPrice !== null ? { gte: query.minPrice } : {}), ...(query.maxPrice !== null ? { lte: query.maxPrice } : {}) } } : {}),
    ...(query.inStock ? { stock: { gt: 0 } } : {}),
  };
}

const cardInclude = {
  category: { select: { slug: true, name: true } },
  variants: { where: { active: true }, select: { width: true, thickness: true, price: true, stock: true, active: true, priceStatus: true, stockStatus: true } },
  mediaLinks: { include: { mediaAsset: { select: { url: true, alt: true } } }, orderBy: { sortOrder: "asc" as const } },
  reviews: { where: { approved: true, ...(isProduction() ? { isFixture: false } : {}) }, select: { rating: true } },
} satisfies Prisma.ProductInclude;

export async function listPublicProducts(query: PublicCatalogQuery) {
  const prisma = database();
  const baseWhere: Prisma.ProductWhereInput = {
    ...publicProductWhere(),
    ...(query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" } }, { shortName: { contains: query.q, mode: "insensitive" } }, { description: { contains: query.q, mode: "insensitive" } }] } : {}),
    ...(query.lines.length ? { slug: { in: query.lines } } : {}),
  };
  const variantFilter = withVariantFilters(query);
  const where: Prisma.ProductWhereInput = { ...baseWhere, ...(variantFilter ? { variants: { some: variantFilter } } : {}) };
  try {
    const [records, total, facetRecords] = await prisma.$transaction([
      prisma.product.findMany({ where, include: cardInclude, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.product.count({ where }),
      prisma.product.findMany({ where: baseWhere, select: { variants: { where: publicVariantWhere(), select: { width: true, thickness: true, price: true } } } }),
    ]);
    const cards = records.map(toCard).sort((left, right) => {
      if (query.sort === "name-asc") return left.name.localeCompare(right.name, "vi") || left.id.localeCompare(right.id);
      if (query.sort === "price-asc" || query.sort === "price-desc") {
        if (left.priceFrom === null) return right.priceFrom === null ? left.id.localeCompare(right.id) : 1;
        if (right.priceFrom === null) return -1;
        return (query.sort === "price-asc" ? left.priceFrom - right.priceFrom : right.priceFrom - left.priceFrom) || left.id.localeCompare(right.id);
      }
      return 0;
    });
    const facetVariants = facetRecords.flatMap((record) => record.variants);
    const facetPrices = facetVariants.map((variant) => variant.price).filter((price): price is number => typeof price === "number" && price > 0);
    return {
      items: cards.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      total,
      page: query.page,
      pageSize: query.pageSize,
      facets: {
        widths: [...new Set(facetVariants.map((variant) => variant.width))].sort((a, b) => a - b),
        thicknesses: [...new Set(facetVariants.map((variant) => variant.thickness))].sort((a, b) => a - b),
        minPrice: facetPrices.length ? Math.min(...facetPrices) : null,
        maxPrice: facetPrices.length ? Math.max(...facetPrices) : null,
      },
    };
  } catch {
    throw new StorefrontUnavailableError();
  }
}

export async function getPublicProduct(slug: string) {
  const prisma = database();
  try {
    const product = await prisma.product.findFirst({
      where: { slug, ...publicProductWhere() },
      include: {
        category: { select: { slug: true, name: true } },
        variants: { where: { active: true }, orderBy: [{ width: "asc" }, { length: "asc" }, { thickness: "asc" }] },
        mediaLinks: { include: { mediaAsset: { select: { url: true, alt: true, reviewStatus: true } } }, orderBy: { sortOrder: "asc" } },
        contentBlocks: { where: { status: "PUBLISHED", ...(isProduction() ? { dataStatus: "VERIFIED" } : {}) }, orderBy: { sortOrder: "asc" } },
        facts: { where: isProduction() ? { dataStatus: "VERIFIED" } : {}, orderBy: { sortOrder: "asc" } },
        reviews: { where: { approved: true, ...(isProduction() ? { isFixture: false } : {}) }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!product) return null;
    const visibleLinks = product.mediaLinks.filter((link) => !isProduction() || link.mediaAsset.reviewStatus === "APPROVED");
    const variants = product.variants.map((variant) => {
      const verified = !isProduction() || (variant.priceStatus === "VERIFIED" && variant.stockStatus === "VERIFIED");
      const price = verified ? variant.price : null;
      const stock = verified ? variant.stock : null;
      return { id: variant.id, sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, price, compareAtPrice: verified ? variant.compareAtPrice : null, stock, availability: product.saleStatus !== "ACTIVE" || price === null ? "CONTACT_REQUIRED" : stock && stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK", active: variant.active, isTestData: variant.priceStatus !== "VERIFIED" || variant.stockStatus !== "VERIFIED" };
    });
    const ratingCount = product.reviews.length;
    const byContentType = new Map(product.contentBlocks.map((block) => [block.type, { title: block.title, body: block.body }]));
    const gallery = visibleLinks.filter((link) => link.role === "gallery").map(toImage);
    const construction = visibleLinks.filter((link) => link.role === "construction").map(toImage)[0] ?? null;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortName: product.shortName,
      eyebrow: product.eyebrow,
      description: product.description,
      category: product.category,
      presentation: product.presentation,
      seo: { title: product.seoTitle, description: product.seoDescription },
      gallery,
      constructionImage: construction,
      variants,
      content: { audience: byContentType.get("AUDIENCE") ?? null, materialStory: byContentType.get("MATERIAL_STORY") ?? null, delivery: byContentType.get("DELIVERY") ?? null, warranty: byContentType.get("WARRANTY") ?? null },
      facts: product.facts.map((fact) => ({ key: fact.key, label: fact.label, value: fact.value })),
      reviews: product.reviews.map((review) => ({ authorName: review.authorName, rating: review.rating, body: review.body, createdAt: review.createdAt.toISOString(), isFixture: review.isFixture })),
      ratingAverage: ratingCount ? product.reviews.reduce((total, review) => total + review.rating, 0) / ratingCount : null,
      ratingCount,
      purchasable: product.saleStatus === "ACTIVE" && variants.some((variant) => variant.availability === "IN_STOCK"),
    };
  } catch {
    throw new StorefrontUnavailableError();
  }
}

export async function getPublicSettings() {
  const prisma = database();
  try {
    const [settings, navigation] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" }, select: { contactPhone: true, contactEmail: true, shippingFee: true, freeShippingThreshold: true, bankTransferInfo: true, bankTransferReservationMinutes: true } }),
      getStorefrontNavigation(),
    ]);
    const bankReady = Boolean(settings?.bankTransferInfo && settings.bankTransferReservationMinutes && settings.bankTransferReservationMinutes >= 5);
    return {
      contactPhone: settings?.contactPhone ?? null,
      contactEmail: settings?.contactEmail ?? null,
      shipping: { fee: settings?.shippingFee ?? null, freeThreshold: settings?.freeShippingThreshold ?? null },
      paymentMethods: ["COD", ...(bankReady ? ["BANK_TRANSFER"] : [])],
      menus: navigation,
    };
  } catch {
    throw new StorefrontUnavailableError();
  }
}
