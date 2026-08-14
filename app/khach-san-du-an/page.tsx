import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khách sạn & dự án — Nệm Thăng Long",
  description: "Trao đổi nhu cầu nệm cho khách sạn và dự án với thông tin được xác nhận trước khi báo giá.",
  alternates: { canonical: "/khach-san-du-an" },
};

export default async function HotelProjectPage() {
  const [{ products }, settings] = await Promise.all([getCatalogProducts({ fallbackMissing: false }), getSiteSettings()]);
  const breadcrumbs = breadcrumbJsonLd([{ name: "Trang chủ", item: "/" }, { name: "Khách sạn & dự án", item: "/khach-san-du-an" }]);
  const contactHref = settings?.contactPhone ? "tel:" + settings.contactPhone : settings?.contactEmail ? "mailto:" + settings.contactEmail : null;
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} /><SiteHeader solid /><main className="b2b-page"><section className="b2b-hero"><div className="container b2b-hero-grid"><div><p className="eyebrow">THĂNG LONG / HOTEL &amp; PROJECT</p><h1>Trao đổi nhu cầu nệm cho khách sạn và dự án.</h1><p>Cung cấp thông tin quy mô, kích thước và nhu cầu để đội ngũ xác nhận phương án. Mỗi yêu cầu sẽ được trao đổi trước khi báo giá.</p><Link href="#project-inquiry" className="button button-primary">Gửi yêu cầu dự án</Link></div><div className="b2b-hero-media"><Image src="/images/homepage-hotel.webp" alt="Hình ảnh minh họa không gian khách sạn" fill priority sizes="(max-width: 860px) 100vw, 55vw" /><span className="demo-badge">Hình ảnh minh họa</span></div></div></section><section className="b2b-intro container"><div><p className="section-label">TRAO ĐỔI DỰ ÁN</p><h2>Thông tin rõ ràng trước mỗi bước tiếp theo.</h2></div><p>Chúng tôi bắt đầu từ nhu cầu thực tế của không gian, số lượng dự kiến và các kích thước cần trao đổi. Thông tin giao hàng, giá và phương án cụ thể chỉ được đưa ra sau khi xác nhận.</p></section><section className="b2b-steps container"><div><span>01</span><strong>Chia sẻ nhu cầu</strong><p>Gửi quy mô, địa điểm và thông tin bạn đã có.</p></div><div><span>02</span><strong>Cùng xác nhận thông tin</strong><p>Đội ngũ trao đổi các chi tiết cần làm rõ.</p></div><div><span>03</span><strong>Trao đổi phương án</strong><p>Mọi nội dung tiếp theo dựa trên dữ liệu đã xác nhận.</p></div></section><section className="b2b-products container"><div className="b2b-section-heading"><div><p className="section-label">KHÁM PHÁ DÒNG NỆM</p><h2>Những dòng nệm đang có thông tin trên hệ thống.</h2></div><p>Đây là các lựa chọn để bắt đầu trao đổi, không phải đánh giá dành riêng cho khách sạn hay dự án.</p></div>{products.length > 0 ? <div className="catalog-grid">{products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div> : <p>Danh mục đang được cập nhật.</p>}</section><section className="b2b-checklist container"><div><p className="section-label">THÔNG TIN NÊN CHUẨN BỊ</p><h2>Bắt đầu với những điều bạn đã biết.</h2></div><ul><li>Địa điểm và loại hình dự án</li><li>Số lượng dự kiến nếu đã có</li><li>Kích thước hoặc yêu cầu không gian</li><li>Thời điểm cần trao đổi</li></ul></section><section id="project-inquiry" className="lead-section"><div className="container lead-layout"><div><p className="eyebrow">PROJECT INQUIRY</p><h2>Gửi thông tin để cùng trao đổi.</h2><p>Chưa cần có đầy đủ mọi chi tiết. Những thông tin ban đầu sẽ giúp cuộc trao đổi rõ ràng hơn.</p></div><div className="lead-form-panel"><LeadForm type="B2B_PROJECT" /></div></div></section><section className="lead-direct-section container">{contactHref ? <><p className="section-label">KÊNH LIÊN HỆ</p><p>Trao đổi thêm qua thông tin đã cấu hình.</p>{settings?.contactPhone && <a href={"tel:" + settings.contactPhone}>{settings.contactPhone}</a>}{settings?.contactEmail && <a href={"mailto:" + settings.contactEmail}>{settings.contactEmail}</a>}</> : <p>Thông tin liên hệ trực tiếp đang được cập nhật.</p>}</section></main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
