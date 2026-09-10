import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GenericProductPdp } from "@/components/generic-product-pdp";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRelatedCatalogProducts } from "@/lib/catalog";
import { getStorefrontProduct, getSiteSettings } from "@/lib/products";
import { productMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  return product ? productMetadata(product, "/nem/" + slug) : { title: "Dòng nệm — Nệm Thăng Long" };
}

export default async function GenericProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, related, settings] = await Promise.all([getStorefrontProduct(slug), getRelatedCatalogProducts(slug), getSiteSettings()]);
  if (!product) notFound();
  return (
    <>
      <SiteHeader solid />
      <GenericProductPdp product={product} related={related} settings={settings ? { contactPhone: settings.contactPhone, contactEmail: settings.contactEmail } : null} />
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </>
  );
}
