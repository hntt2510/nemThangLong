import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GsapReveal } from "@/components/gsap-reveal";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Về Thăng Long - Nệm Thăng Long",
  description: "Tìm hiểu cách Thăng Long giúp gia đình chọn nệm theo nhu cầu nghỉ ngơi và không gian phòng ngủ.",
  alternates: { canonical: "/ve-thang-long" },
};

const proofItems = [
  ["20+", "năm đồng hành cùng giấc ngủ Việt"],
  ["1M+", "gia đình tin dùng sản phẩm Thăng Long"],
  ["100+", "đại lý và điểm tư vấn trên toàn quốc"],
  ["4.9/5", "mức đánh giá hài lòng từ khách hàng"],
];

const trustItems = [
  ["48.000+", "đơn hàng đã hoàn tất"],
  ["18.000+", "đánh giá từ khách hàng"],
  ["96%", "khách hàng sẵn sàng giới thiệu"],
  ["63", "tỉnh thành đã phục vụ"],
];

const feedback = [
  ["Chị Thanh Hà", "Quận 7, TP. Hồ Chí Minh", "Được tư vấn kỹ trước khi chọn nên nệm vừa với phòng ngủ và cảm giác nằm của cả nhà."],
  ["Anh Minh Quân", "Hải Châu, Đà Nẵng", "Thông tin rõ ràng, giao hàng đúng thời gian đã hẹn. Gia đình dùng thấy thoải mái hơn."],
  ["Chị Bích Ngọc", "Biên Hòa, Đồng Nai", "Nhân viên hỗ trợ nhiệt tình, hướng dẫn luôn cách sử dụng và bảo quản nệm tại nhà."],
];

const labelClass = "mb-3 text-[13px] font-extrabold tracking-[0.12em] text-brand-accent";
const primaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-brand bg-brand-ink px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#493d33] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-accent";
const secondaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-brand border border-brand-ink/25 px-5 py-3 text-sm font-bold text-brand-ink transition-colors duration-200 hover:border-brand-ink hover:bg-brand-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-accent";

export default async function AboutPage() {
  const [{ products }, settings] = await Promise.all([getCatalogProducts(), getSiteSettings()]);
  const contactHref = settings?.contactPhone ? `tel:${settings.contactPhone}` : settings?.contactEmail ? `mailto:${settings.contactEmail}` : "/lien-he";
  const breadcrumbs = breadcrumbJsonLd([{ name: "Trang chủ", item: "/" }, { name: "Về Thăng Long", item: "/ve-thang-long" }]);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
    <SiteHeader solid />
    <main className="bg-brand-canvas pt-[72px] text-brand-ink sm:pt-16">
      <GsapReveal variant="hero">
        <section className="mx-auto grid min-h-[380px] w-[min(calc(100%-64px),1280px)] grid-cols-1 lg:grid-cols-[45fr_55fr] sm:w-[min(calc(100%-40px),1280px)]">
          <div data-gsap-hero-copy className="flex min-h-[346px] flex-col justify-center py-12 pr-0 lg:pr-14">
            <p className={labelClass}>VỀ THĂNG LONG</p>
            <h1 className="max-w-[11ch] font-brand-display text-4xl leading-[1.12] font-semibold tracking-[-0.03em] text-brand-ink lg:text-5xl">Chọn nệm dễ hơn cho từng gia đình.</h1>
            <p className="mt-5 max-w-[40ch] font-brand-ui text-base leading-[1.65] text-brand-copy">Thăng Long tập trung vào những lựa chọn gần gũi với nhu cầu nghỉ ngơi hằng ngày: vừa với phòng ngủ, vừa với cảm giác nằm và dễ sử dụng lâu dài.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/nem" className={primaryButton}>Khám phá sản phẩm <span aria-hidden="true">→</span></Link><Link href="/tim-nem" className={secondaryButton}>Tìm theo nhu cầu <span aria-hidden="true">→</span></Link></div>
          </div>
          <div data-gsap-hero-media className="relative min-h-[280px] overflow-hidden bg-brand-surface lg:min-h-0"><Image src="/images/landing-showroom-v2.png" alt="Không gian trưng bày nệm Thăng Long" fill priority sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover" /></div>
        </section>
      </GsapReveal>

      <GsapReveal variant="stagger" staggerSelector="[data-proof]">
        <section className="bg-brand-ink"><div className="mx-auto grid w-[min(calc(100%-64px),1280px)] grid-cols-1 sm:w-[min(calc(100%-40px),1280px)] md:grid-cols-2 lg:grid-cols-4">{proofItems.map(([value, label]) => <article key={label} data-proof className="grid min-h-0 content-center gap-2 border-b border-white/20 py-6 last:border-b-0 md:min-h-[148px] md:border-r md:px-7 md:py-7 md:nth-[2n]:border-r-0 lg:nth-[2n]:border-r lg:last:border-r-0 lg:first:pl-0"><strong className="font-brand-display text-4xl leading-none font-semibold text-[#fffdf9] lg:text-[44px]">{value}</strong><span className="max-w-[18ch] font-brand-ui text-sm leading-[1.45] text-white/80">{label}</span></article>)}</div></section>
      </GsapReveal>

      <GsapReveal variant="stagger" staggerSelector="[data-need]">
        <section className="mx-auto grid w-[min(calc(100%-64px),1280px)] grid-cols-1 gap-7 py-10 sm:w-[min(calc(100%-40px),1280px)] lg:grid-cols-[34fr_66fr] lg:gap-10 lg:py-[72px]"><div><p className={labelClass}>CHỌN TỪ NHU CẦU THỰC TẾ</p><h2 className="max-w-[12ch] font-brand-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] lg:text-4xl">Bắt đầu từ điều bạn cần mỗi ngày.</h2></div><div className="grid grid-cols-1 border-t border-brand-ink/15 md:grid-cols-3">{[["Kích thước phù hợp", "Chọn theo phòng ngủ, khung giường và số người sử dụng."], ["Cảm giác nằm", "Cân nhắc độ êm, khả năng nâng đỡ và thói quen nghỉ ngơi."], ["Sử dụng và bảo quản", "Xem hướng dẫn chăm sóc phù hợp với từng dòng nệm trước khi lựa chọn."]].map(([title, body]) => <article key={title} data-need className="border-b border-brand-ink/15 py-4 md:border-r md:px-5 md:py-[18px] md:last:border-r-0 md:first:pl-0"><h3 className="mb-2 font-brand-display text-2xl leading-[1.2] font-semibold">{title}</h3><p className="font-brand-ui text-sm leading-[1.5] text-brand-copy">{body}</p></article>)}</div></section>
      </GsapReveal>

      <GsapReveal variant="stagger" staggerSelector="[data-trust]">
        <section className="bg-brand-surface py-10 lg:py-[72px]"><div className="mx-auto grid w-[min(calc(100%-64px),1280px)] grid-cols-1 gap-8 sm:w-[min(calc(100%-40px),1280px)] lg:grid-cols-[42fr_58fr] lg:gap-16"><div><p className={labelClass}>NIỀM TIN TỪ TRẢI NGHIỆM THỰC TẾ</p><h2 className="max-w-[12ch] font-brand-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] lg:text-4xl">Những con số được xây dựng qua từng đơn hàng.</h2><p className="mt-[18px] max-w-[38ch] font-brand-ui text-base leading-[1.65] text-brand-copy">Mỗi lượt tư vấn, giao nhận và hỗ trợ sau mua đều góp phần tạo nên lựa chọn phù hợp hơn cho gia đình Việt.</p><Link href="/lien-he" className="mt-5 inline-flex min-h-11 items-center gap-2 font-brand-ui text-sm font-extrabold text-brand-accent transition-colors hover:text-brand-ink">Trao đổi cùng Thăng Long <span aria-hidden="true">→</span></Link></div><dl className="grid grid-cols-1 border-t border-brand-ink/15 md:grid-cols-2">{trustItems.map(([value, label]) => <div key={label} data-trust className="min-h-0 border-b border-brand-ink/15 py-5 md:min-h-40 md:border-r md:p-7 md:nth-[2n]:border-r-0"><dt className="font-brand-display text-4xl leading-none font-semibold text-brand-ink lg:text-[44px]">{value}</dt><dd className="mt-2.5 font-brand-ui text-sm leading-[1.45] text-brand-copy">{label}</dd></div>)}</dl></div></section>
      </GsapReveal>

      <GsapReveal variant="editorial">
        <section className="bg-brand-surface"><div className="mx-auto grid min-h-[440px] w-[min(calc(100%-64px),1280px)] grid-cols-1 sm:w-[min(calc(100%-40px),1280px)] lg:grid-cols-[52fr_48fr]"><div data-gsap-editorial-media className="relative min-h-[260px] overflow-hidden"><Image src="/images/homepage-latex.webp" alt="Chi tiết bề mặt chất liệu nệm" fill sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover" /></div><div data-gsap-editorial-copy className="flex flex-col justify-center py-9 lg:py-14 lg:pl-16"><p className={labelClass}>CHẤT LIỆU VÀ KHÔNG GIAN</p><h2 className="max-w-[12ch] font-brand-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] lg:text-4xl">Một lựa chọn hài hoà với căn phòng của bạn.</h2><p className="mt-[18px] max-w-[42ch] font-brand-ui text-base leading-[1.65] text-brand-copy">Hình ảnh, thông tin kích thước và mô tả từng dòng nệm được trình bày rõ để bạn dễ đối chiếu trước khi xem trực tiếp hoặc nhận tư vấn.</p><Link href="/tim-nem" className="mt-6 inline-flex min-h-11 items-center gap-2 font-brand-ui text-sm font-extrabold text-brand-accent transition-colors hover:text-brand-ink">Bắt đầu tìm nệm <span aria-hidden="true">→</span></Link></div></div></section>
      </GsapReveal>

      <GsapReveal variant="stagger" staggerSelector=".landing-product-card">
        <section className="mx-auto w-[min(calc(100%-64px),1280px)] py-10 sm:w-[min(calc(100%-40px),1280px)] lg:py-[72px]"><div className="mb-7 flex flex-col items-start justify-between gap-5 md:mb-[30px] md:flex-row md:items-end"><div><p className={labelClass}>BỘ SƯU TẬP</p><h2 className="font-brand-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] lg:text-4xl">Những dòng nệm đang có.</h2></div><Link href="/nem" className="inline-flex min-h-11 items-center gap-2 font-brand-ui text-sm font-extrabold text-brand-accent transition-colors hover:text-brand-ink">Xem tất cả <span aria-hidden="true">→</span></Link></div><div className="grid grid-cols-1 gap-6 lg:grid-cols-3">{products.slice(0, 3).map((product, index) => <ProductCard key={product.slug} product={product} index={index} presentation="landing" />)}</div></section>
      </GsapReveal>

      <GsapReveal variant="stagger" staggerSelector="[data-feedback]">
        <section className="mx-auto w-[min(calc(100%-64px),1280px)] pb-10 sm:w-[min(calc(100%-40px),1280px)] lg:pb-[72px]"><div className="mb-7 md:mb-[30px]"><p className={labelClass}>PHẢN HỒI KHÁCH HÀNG</p><h2 className="font-brand-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] lg:text-4xl">Những chia sẻ sau khi sử dụng.</h2></div><div className="grid grid-cols-1 gap-5 lg:grid-cols-3">{feedback.map(([name, location, quote]) => <article key={name} data-feedback className="flex min-h-0 flex-col justify-between rounded-brand border border-brand-ink/15 bg-[#fffdf9] p-6 lg:min-h-[220px]"><div><span className="font-brand-ui text-sm tracking-[0.12em] text-brand-accent" aria-label="5 trên 5">★★★★★</span><p className="mt-4 font-brand-ui text-base leading-[1.65] text-brand-ink">“{quote}”</p></div><footer className="mt-5 grid gap-1"><b className="font-brand-ui text-sm text-brand-ink">{name}</b><small className="font-brand-ui text-[13px] text-brand-copy">{location}</small></footer></article>)}</div></section>
      </GsapReveal>

      <GsapReveal variant="editorial">
        <section className="mx-auto w-[min(calc(100%-64px),1280px)] py-10 sm:w-[min(calc(100%-40px),1280px)] lg:py-[72px]"><div data-gsap-editorial-media className="relative h-[260px] overflow-hidden bg-brand-surface lg:h-100"><Image src="/images/landing-showroom-v2.png" alt="Showroom nệm Thăng Long" fill sizes="(max-width: 1023px) 100vw, 1280px" className="object-cover" /></div><div data-gsap-editorial-copy className="flex flex-col items-start justify-between gap-6 border-b border-brand-ink/15 py-6 md:flex-row md:items-end"><div><p className={labelClass}>THỬ NỆM TRỰC TIẾP</p><h2 className="mb-2 font-brand-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] lg:text-4xl">Đến xem và nhận tư vấn.</h2><p className="max-w-[46ch] font-brand-ui text-base leading-[1.65] text-brand-copy">Liên hệ trước để được hướng dẫn theo nhu cầu và thông tin hiện có.</p></div><a href={contactHref} className={secondaryButton}>Liên hệ showroom <span aria-hidden="true">→</span></a></div></section>
      </GsapReveal>
    </main>
    <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
  </>;
}
