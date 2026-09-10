import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GsapReveal } from "@/components/gsap-reveal";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getPageIntro } from "@/lib/storefront-cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khách sạn & dự án — Nệm Thăng Long",
  description: "Trao đổi nhu cầu nệm cho khách sạn và dự án với thông tin được xác nhận trước khi báo giá.",
  alternates: { canonical: "/khach-san-du-an" },
};

const needs = [
  ["01", "Trang bị mới", "Trao đổi về không gian, số lượng và tiến độ dự kiến."],
  ["02", "Thay nệm hiện tại", "Đối chiếu kích thước và nhu cầu sử dụng thực tế."],
  ["03", "Chọn cấu hình", "Xác nhận kích thước và số lượng trước khi báo giá."],
];

export default async function HotelProjectPage() {
  const [{ products }, settings, intro] = await Promise.all([
    getCatalogProducts(),
    getSiteSettings(),
    getPageIntro("hotel-project"),
  ]);
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Trang chủ", item: "/" },
    { name: "Khách sạn & dự án", item: "/khach-san-du-an" },
  ]);
  const hasContact = Boolean(settings?.contactPhone || settings?.contactEmail);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <SiteHeader solid />
      <main className="bg-brand-canvas pt-18 text-brand-ink sm:pt-16">
        <GsapReveal variant="hero">
          <section className="border-b border-brand-ink/10 bg-brand-surface/45">
            <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-8 py-9 md:w-[min(calc(100%-64px),1280px)] lg:grid-cols-[45fr_55fr] lg:items-stretch lg:gap-14 lg:py-14">
              <div data-gsap-hero-copy className="flex max-w-xl flex-col justify-center py-3 lg:py-8">
                <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-brand-accent">
                  <span className="h-px w-10 bg-brand-accent/70" />
                  {intro?.eyebrow ?? "KHÁCH SẠN & DỰ ÁN"}
                </p>
                <h1 className="font-brand-display text-5xl leading-[1.06] font-semibold tracking-[-0.025em] sm:text-6xl">
                  Nệm cho khách sạn và dự án.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-[1.7] text-brand-copy">
                  {intro?.body ?? "Trao đổi cùng đội ngũ về nhu cầu trang bị không gian nghỉ ngơi."}
                </p>
                <Link
                  href="#project-inquiry"
                  className="mt-8 inline-flex min-h-11 w-fit items-center gap-3 rounded-brand bg-brand-ink px-5 py-3 text-sm font-bold text-white transition duration-200 hover:bg-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Trao đổi nhu cầu <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div data-gsap-hero-media className="relative min-h-70 overflow-hidden rounded-brand bg-[#ded3c3] sm:min-h-90 lg:min-h-105">
                <Image
                  src="/images/homepage-hotel.webp"
                  alt="Không gian phòng nghỉ"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal variant="stagger">
          <section className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-8 py-12 md:w-[min(calc(100%-64px),1280px)] md:py-18 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-18">
            <div>
              <p className="mb-4 text-xs font-bold tracking-[0.16em] text-brand-accent">NHU CẦU TRANG BỊ</p>
              <h2 className="font-brand-display text-4xl leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[2.25rem]">
                Thông tin rõ ràng trước khi lựa chọn.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-brand border border-brand-ink/12 bg-brand-ink/12 sm:grid-cols-3">
              {needs.map(([number, title, body]) => (
                <article key={number} className="bg-brand-canvas px-5 py-6 sm:px-6">
                  <p className="text-xs font-bold tracking-[0.14em] text-brand-accent">{number}</p>
                  <h3 className="mt-7 text-base font-bold text-brand-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-brand-copy">{body}</p>
                </article>
              ))}
            </div>
          </section>
        </GsapReveal>

        <GsapReveal variant="editorial">
          <section className="border-y border-brand-ink/10 bg-brand-surface/55">
            <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-8 py-12 md:w-[min(calc(100%-64px),1280px)] md:py-18 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div data-gsap-editorial-copy className="max-w-2xl">
                <p className="mb-4 text-xs font-bold tracking-[0.16em] text-brand-accent">KHÁM PHÁ SẢN PHẨM</p>
                <h2 className="font-brand-display text-4xl leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[2.25rem]">
                  Xem danh mục để trao đổi cấu hình.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-[1.7] text-brand-copy">
                  Chưa có dữ liệu phân loại sản phẩm riêng cho khách sạn và dự án. Hãy xem thông tin từng dòng nệm trước khi trao đổi nhu cầu cụ thể.
                </p>
                {products.length === 0 ? <p className="mt-5 text-sm text-brand-copy">Danh mục đang được cập nhật.</p> : null}
              </div>
              <Link
                href="/nem"
                className="inline-flex min-h-11 w-fit items-center gap-3 rounded-brand border border-brand-ink/55 px-5 py-3 text-sm font-bold text-brand-ink transition duration-200 hover:border-brand-ink hover:bg-brand-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                Xem sản phẩm <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </GsapReveal>

        <section id="project-inquiry" className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-8 py-12 md:w-[min(calc(100%-64px),1280px)] md:py-18 lg:grid-cols-[0.8fr_1.2fr] lg:gap-18">
          <GsapReveal variant="editorial">
            <div data-gsap-editorial-copy className="max-w-md lg:pt-8">
              <p className="mb-4 text-xs font-bold tracking-[0.16em] text-brand-accent">GỬI YÊU CẦU</p>
              <h2 className="font-brand-display text-4xl leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[2.25rem]">
                Cho chúng tôi biết nhu cầu của bạn.
              </h2>
              <p className="mt-5 text-base leading-[1.7] text-brand-copy">Thông tin sẽ được dùng để chuẩn bị trao đổi phù hợp hơn cho không gian của bạn.</p>
            </div>
          </GsapReveal>
          <div className="rounded-brand border border-brand-ink/12 bg-white p-5 sm:p-7">
            <LeadForm type="B2B_PROJECT" />
          </div>
        </section>

        <section className="border-t border-brand-ink/10 bg-brand-surface/40">
          <div className="mx-auto flex w-[min(calc(100%-40px),1280px)] flex-col justify-between gap-5 py-8 md:w-[min(calc(100%-64px),1280px)] md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-brand-accent">KÊNH LIÊN HỆ</p>
              <p className="mt-2 text-sm leading-6 text-brand-copy">Liên hệ trực tiếp nếu bạn cần trao đổi sớm hơn.</p>
            </div>
            {hasContact ? (
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-brand-ink">
                {settings?.contactPhone ? <a className="hover:text-brand-accent" href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a> : null}
                {settings?.contactEmail ? <a className="hover:text-brand-accent" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> : null}
              </div>
            ) : (
              <p className="text-sm text-brand-copy">Thông tin liên hệ trực tiếp đang được cập nhật.</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </>
  );
}
