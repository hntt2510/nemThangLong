import "server-only";

import { getCatalogProducts, type CatalogProductSummary } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/products";

export type HomepageProductSummary = CatalogProductSummary;

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

export async function getHomepageData(): Promise<HomepageData> {
  const [{ products }, settings] = await Promise.all([getCatalogProducts({ fallbackMissing: true }), getSiteSettings()]);
  return {
    products,
    settings: settings ? { shippingFee: settings.shippingFee, contactPhone: settings.contactPhone, contactEmail: settings.contactEmail, navigation: settings.navigation } : null,
  };
}
