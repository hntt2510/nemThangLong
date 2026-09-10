import type { Metadata } from "next";
import { AboutCoreValues } from "@/components/about/about-core-values";
import { AboutCraftStory } from "@/components/about/about-craft-story";
import { AboutFeaturedCollections } from "@/components/about/about-featured-collections";
import { AboutHero } from "@/components/about/about-hero";
import { AboutShowroomCTA } from "@/components/about/about-showroom-cta";
import { AboutTestimonials } from "@/components/about/about-testimonials";
import { AboutTrustStats } from "@/components/about/about-trust-stats";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Về Thăng Long - Nệm Thăng Long",
  description: "20 năm đồng hành cùng giấc ngủ gia đình Việt. Khám phá các dòng nệm nâng đỡ công thái học, nguyên liệu an toàn và trải nghiệm tại hệ thống showroom.",
  alternates: { canonical: "/ve-thang-long" },
};

export default async function AboutPage() {
  const [{ products }, settings] = await Promise.all([getCatalogProducts(), getSiteSettings()]);
  const contactHref = settings?.contactPhone
    ? `tel:${settings.contactPhone}`
    : settings?.contactEmail
      ? `mailto:${settings.contactEmail}`
      : "/lien-he";
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Trang chủ", item: "/" },
    { name: "Về Thăng Long", item: "/ve-thang-long" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <SiteHeader solid />
      <main className="bg-brand-canvas pt-16 text-brand-ink xl:pt-[72px]">
        <AboutHero />
        <AboutTrustStats />
        <AboutCoreValues />
        <AboutCraftStory />
        <AboutFeaturedCollections products={products} />
        <AboutTestimonials />
        <AboutShowroomCTA
          contactPhone={settings?.contactPhone}
          contactHref={contactHref}
        />
      </main>
      <SiteFooter
        contactPhone={settings?.contactPhone}
        contactEmail={settings?.contactEmail}
      />
    </>
  );
}
