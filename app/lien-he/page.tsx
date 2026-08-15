import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDiscoveryProducts } from "@/lib/discovery";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd, contactPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return contactPageMetadata(Object.keys(params).length > 0);
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [{ products, databaseAvailable }, settings] = await Promise.all([getDiscoveryProducts(), getSiteSettings()]);
  const requestedSlug = typeof params.product === "string" ? params.product : null;
  const product = databaseAvailable ? products.find((item) => item.slug === requestedSlug) ?? null : null;
  const breadcrumbs = breadcrumbJsonLd([{ name: "Trang chủ", item: "/" }, { name: "Liên hệ", item: "/lien-he" }]);
  const contactHref = settings?.contactPhone ? "tel:" + settings.contactPhone : settings?.contactEmail ? "mailto:" + settings.contactEmail : null;
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} /><SiteHeader solid /><main className="lead-page contact-page"><section className="lead-hero container"><p className="eyebrow">THĂNG LONG / LIÊN HỆ</p><h1>Bắt đầu từ một<br />câu hỏi phù hợp.</h1><p>Chia sẻ điều bạn đang tìm kiếm. Đội ngũ sẽ xem thông tin đã được xác nhận và trao đổi thêm trước khi gợi ý.</p></section><section className="lead-layout container"><div className="lead-form-panel"><p className="section-label">TƯ VẤN SẢN PHẨM</p>{product && <p className="lead-context">Bạn đang quan tâm: <strong>{product.name}</strong>{product.imageIsDemo && " · Minh họa"}</p>}<LeadForm type="CONSULTATION" productSlug={product?.slug} /></div><aside className="lead-aside"><p className="section-label">LIÊN HỆ TRỰC TIẾP</p>{contactHref ? <div className="lead-direct"><p>Trao đổi thêm qua kênh đã cấu hình.</p>{settings?.contactPhone && <a href={"tel:" + settings.contactPhone}>{settings.contactPhone}</a>}{settings?.contactEmail && <a href={"mailto:" + settings.contactEmail}>{settings.contactEmail}</a>}</div> : <p>Thông tin liên hệ trực tiếp đang được cập nhật.</p>}</aside></section></main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
