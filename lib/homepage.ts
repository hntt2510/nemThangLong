import "server-only";

import { getCatalogProducts, type CatalogProductSummary } from "@/lib/catalog";
import { getPrisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/products";

export type HomepageProductSummary = CatalogProductSummary;

export type HomepageData = {
  products: HomepageProductSummary[];
  reviews: Array<{ authorName: string; body: string; rating: number; productName: string }>;
  databaseAvailable: boolean;
  settings: {
    shippingFee: number | null;
    contactPhone: string | null;
    contactEmail: string | null;
    navigation: unknown;
  } | null;
};

async function getHomepageReviews() {
  let prisma;
  try { prisma = getPrisma(); } catch { return []; }
  if (!prisma) return [];
  try {
    return await prisma.review.findMany({
      where: { approved: true, ...(process.env.NODE_ENV === "production" ? { isFixture: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { authorName: true, body: true, rating: true, product: { select: { name: true } } },
    }).then((reviews) => reviews.map((review) => ({ ...review, productName: review.product.name })));
  } catch {
    return [];
  }
}

import { fallbackHomepageProducts, fallbackReviews } from "@/lib/homepage-fallback-data";

export function getContactHref(settings: HomepageData["settings"]): string | null {
  return settings?.contactPhone ? `tel:${settings.contactPhone}` : settings?.contactEmail ? `mailto:${settings.contactEmail}` : null;
}

export async function getHomepageData(): Promise<HomepageData> {
  const [{ products, databaseAvailable }, settings, reviews] = await Promise.all([getCatalogProducts(), getSiteSettings(), getHomepageReviews()]);
  return {
    products: products.length > 0 ? products : fallbackHomepageProducts,
    reviews: reviews.length > 0 ? reviews : fallbackReviews,
    databaseAvailable,
    settings: settings ? { shippingFee: settings.shippingFee, contactPhone: settings.contactPhone, contactEmail: settings.contactEmail, navigation: settings.navigation } : null,
  };
}
