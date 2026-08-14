import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getCatalogData } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Các dòng nệm — Nệm Thăng Long",
  description: "Khám phá các dòng nệm Thăng Long theo nhu cầu, kích thước và thông tin đã được xác nhận.",
  alternates: { canonical: "/nem" },
};

export default async function CatalogRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ products, facets, query, total, databaseAvailable }, settings] = await Promise.all([getCatalogData(await searchParams), getSiteSettings()]);
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Trang chủ", item: "/" },
    { name: "Dòng nệm", item: "/nem" },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <SiteHeader solid />
      <CatalogPage data={{ products, facets, query, total, databaseAvailable }} settings={settings ? { contactPhone: settings.contactPhone, contactEmail: settings.contactEmail } : null} />
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </>
  );
}
