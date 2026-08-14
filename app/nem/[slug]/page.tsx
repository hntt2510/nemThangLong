import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GenericProductPdp } from "@/components/generic-product-pdp";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRelatedCatalogProducts } from "@/lib/catalog";
import { getStorefrontProduct, getSiteSettings } from "@/lib/products";
import { productMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PDP_SLUGS = ["america", "classic", "hoat-tinh", "memory-foam", "cao-su-thien-nhien"] as const;

function isPdpSlug(slug: string): slug is (typeof PDP_SLUGS)[number] {
  return PDP_SLUGS.includes(slug as (typeof PDP_SLUGS)[number]);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isPdpSlug(slug)) return { title: "Dòng nệm — Nệm Thăng Long" };
  const product = await getStorefrontProduct(slug);
  return productMetadata(product, "/nem/" + slug);
}

export default async function GenericProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPdpSlug(slug)) notFound();
  const [product, related, settings] = await Promise.all([getStorefrontProduct(slug), getRelatedCatalogProducts(slug), getSiteSettings()]);
  return (
    <>
      <SiteHeader solid />
      <GenericProductPdp product={product} related={related} settings={settings ? { contactPhone: settings.contactPhone, contactEmail: settings.contactEmail } : null} />
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </>
  );
}
