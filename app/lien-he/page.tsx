import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDiscoveryProducts } from "@/lib/discovery";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd, contactPageMetadata } from "@/lib/seo";
import { getPageIntro } from "@/lib/storefront-cms";
import { SITE_CONFIG } from "@/config/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return contactPageMetadata(Object.keys(params).length > 0);
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [{ products, databaseAvailable }, settings, intro] = await Promise.all([getDiscoveryProducts(), getSiteSettings(), getPageIntro("contact")]);
  const requestedSlug = typeof params.product === "string" ? params.product : null;
  const product = databaseAvailable ? products.find((item) => item.slug === requestedSlug) ?? null : null;
  const breadcrumbs = breadcrumbJsonLd([{ name: "Trang chủ", item: "/" }, { name: "Liên hệ", item: "/lien-he" }]);
  const displayPhone = settings?.contactPhone || SITE_CONFIG.contact.hotlineDisplay;
  const displayEmail = settings?.contactEmail || SITE_CONFIG.contact.supportEmail;
  const telHref = displayPhone ? "tel:" + displayPhone.replace(/\s+/g, "") : null;
  const mailtoHref = displayEmail ? "mailto:" + displayEmail : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <SiteHeader solid />
      <main className="lead-page contact-page">
        <section className="lead-hero container">
          <p className="eyebrow">{intro?.eyebrow ?? "NỘI DUNG ĐANG CẬP NHẬT"}</p>
          <h1>{intro?.title ?? "Liên hệ"}</h1>
          <p>{intro?.body ?? ""}</p>
        </section>
        <section className="lead-layout container">
          <div className="lead-form-panel">
            <p className="section-label">TƯ VẤN SẢN PHẨM</p>
            {product && <p className="lead-context">Bạn đang quan tâm: <strong>{product.name}</strong></p>}
            <LeadForm type="CONSULTATION" productSlug={product?.slug} />
          </div>
          <aside className="lead-aside">
            <p className="section-label">LIÊN HỆ TRỰC TIẾP</p>
            <div className="lead-direct">
              <p>Trao đổi trực tiếp qua hotline hoặc email hỗ trợ:</p>
              {displayPhone && telHref && <a href={telHref}>{displayPhone}</a>}
              {displayEmail && mailtoHref && <a href={mailtoHref}>{displayEmail}</a>}
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter contactPhone={displayPhone} contactEmail={displayEmail} />
    </>
  );
}
