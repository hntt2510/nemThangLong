import type { Metadata } from "next";
import { Building2, Flame, PackageCheck, Ruler, Truck } from "lucide-react";
import { B2BPartnerMarquee } from "@/components/b2b-partner-marquee";
import { B2BHeroMotion } from "@/components/b2b-hero-motion";
import { B2BMattressExploder } from "@/components/b2b-mattress-exploder";
import { B2BReveal } from "@/components/b2b-reveal";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khách sạn & dự án — Nệm Thăng Long",
  description: "Giải pháp nệm cho khách sạn, resort và căn hộ dịch vụ. Gửi yêu cầu để nhận tư vấn cấu hình dự án.",
  alternates: { canonical: "/khach-san-du-an" },
};

const segments = [
  {
    title: "Resort & khách sạn 4–5 sao",
    standard: "Cấu hình tham khảo: nệm lò xo túi độc lập 28–32 cm, có thể phối topper foam.",
    body: "Ưu tiên trải nghiệm nằm êm, hạn chế rung động và hoàn thiện phù hợp không gian lưu trú cao cấp.",
  },
  {
    title: "Boutique hotel & homestay",
    standard: "Cấu hình tham khảo: nệm cao su đa tầng hoặc foam 15–20 cm.",
    body: "Cân bằng giữa khả năng nâng đỡ, thao tác thay ga thuận tiện và chi phí vận hành dài hạn.",
  },
  {
    title: "Căn hộ dịch vụ & lưu trú dài ngày",
    standard: "Cấu hình tham khảo: nệm foam tỷ trọng cao hoặc bông ép kháng khuẩn.",
    body: "Tập trung vào lựa chọn gọn gàng, linh hoạt theo ngân sách và điều kiện sử dụng thực tế.",
  },
];

const differentiators = [
  { icon: Flame, title: "Yêu cầu an toàn", body: "Trao đổi trước về yêu cầu vật liệu, vải bọc và hồ sơ kỹ thuật theo tiêu chuẩn của dự án." },
  { icon: PackageCheck, title: "Kế hoạch độ bền", body: "Cấu hình được đề xuất theo tần suất sử dụng, quy trình bảo quản và thời hạn bảo hành cần có." },
  { icon: Ruler, title: "May đo theo công trình", body: "Có thể trao đổi kích thước phi tiêu chuẩn, hoàn thiện viền và phương án nhận diện theo thiết kế." },
  { icon: Truck, title: "Giao hàng & setup", body: "Thống nhất phương án giao từng tầng, tiến độ bàn giao và hỗ trợ thay mới trước khi ký kết." },
];

const workflow = [
  ["01", "Tiếp nhận & khảo sát", "Trao đổi tiêu chuẩn lưu trú, số lượng phòng, mốc vận hành và ngân sách dự kiến."],
  ["02", "Nệm mẫu trải nghiệm", "Sắp xếp phương án dùng thử hoặc xem mẫu theo điều kiện thực tế của dự án."],
  ["03", "Báo giá & hợp đồng", "Xác nhận cấu hình, số lượng, điều khoản thanh toán và hồ sơ cần thiết trước khi triển khai."],
  ["04", "Sản xuất & bàn giao", "Phối hợp tiến độ giao hàng, lắp đặt và nghiệm thu theo kế hoạch đã thống nhất."],
] as const;

export default async function HotelProjectPage() {
  const settings = await getSiteSettings();
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Trang chủ", item: "/" },
    { name: "Khách sạn & dự án", item: "/khach-san-du-an" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <SiteHeader solid />
      <main className="bg-brand-canvas pt-16 text-brand-ink xl:pt-[72px]">
        <B2BReveal>
          <section className="border-b border-brand-primary/10 bg-brand-surface/45">
            <B2BHeroMotion />
          </section>
        </B2BReveal>

        <section className="border-b border-brand-primary/10 bg-white">
          <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] grid-cols-1 divide-y divide-brand-primary/10 md:w-[min(calc(100%-64px),1280px)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              [Building2, "Trang bị dự án mới", "Khảo sát diện tích, đề xuất độ dày nệm và kết cấu phù hợp theo chuẩn vận hành của từng hạng phòng."],
              [Ruler, "May đo theo kiến trúc", "Có thể trao đổi kích thước phi tiêu chuẩn, hoàn thiện vải gấm và nhận diện thương hiệu theo hồ sơ dự án."],
              [Truck, "Vận chuyển & bàn giao tận phòng", "Thống nhất phương án giao nệm nguyên kiện theo tầng, buồng phòng và tiến độ khai trương."],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof Building2;
              return <div key={title as string} className="flex items-start gap-3 px-0 py-5 md:px-6 md:py-6"><ItemIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-accent" /><div><p className="text-sm font-extrabold text-brand-ink">{title as string}</p><p className="mt-1 text-sm leading-5 text-brand-copy">{body as string}</p></div></div>;
            })}
          </div>
        </section>

        <B2BReveal>
          <section className="mx-auto w-[min(calc(100%-40px),1280px)] py-12 md:w-[min(calc(100%-64px),1280px)] md:py-[72px]">
            <div className="max-w-2xl"><h2 className="text-balance font-brand-ui text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Giải pháp theo mô hình lưu trú.</h2><p className="mt-4 text-base leading-7 text-brand-copy">Mỗi cấu hình là điểm khởi đầu để trao đổi; thông số cuối cùng được xác nhận theo hồ sơ và điều kiện vận hành của dự án.</p></div>
            <div className="mt-9 grid gap-5 lg:grid-cols-3">
              {segments.map((segment) => <article key={segment.title} data-segment className="border-t-2 border-brand-primary bg-brand-surface/45 p-6"><h3 className="text-xl font-extrabold tracking-[-0.025em] text-brand-ink">{segment.title}</h3><p className="mt-5 text-sm font-bold leading-6 text-brand-primary">{segment.standard}</p><p className="mt-4 text-sm leading-6 text-brand-copy">{segment.body}</p></article>)}
            </div>
          </section>
        </B2BReveal>

        <B2BReveal>
          <section className="border-y border-brand-primary/10 bg-brand-surface/60">
            <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-9 py-12 md:w-[min(calc(100%-64px),1280px)] md:py-[72px] lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
              <div data-gsap-editorial-copy className="max-w-md"><p className="text-xs font-extrabold tracking-[0.15em] text-brand-accent">YÊU CẦU KỸ THUẬT</p><h2 className="mt-4 text-balance font-brand-ui text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Vận hành rõ ràng, triển khai chủ động.</h2><p className="mt-5 text-base leading-7 text-brand-copy">Các hạng mục dưới đây được rà soát cùng dự án trước khi báo giá. Chứng từ hoặc tiêu chuẩn cụ thể chỉ được xác nhận khi có hồ sơ kỹ thuật tương ứng.</p></div>
              <div className="grid gap-px overflow-hidden rounded-2xl border border-brand-primary/12 bg-brand-primary/12 sm:grid-cols-2">
                {differentiators.map(({ icon: Icon, title, body }) => <article key={title} className="bg-brand-canvas p-6"><Icon aria-hidden="true" className="size-5 text-brand-accent" /><h3 className="mt-8 text-base font-extrabold text-brand-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-brand-copy">{body}</p></article>)}
              </div>
            </div>
          </section>
        </B2BReveal>

        <B2BReveal><B2BMattressExploder /></B2BReveal>

        <section id="project-inquiry" className="b2b-project-inquiry border-y border-brand-primary/10 bg-brand-ink text-white">
          <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-8 py-12 md:w-[min(calc(100%-64px),1280px)] md:py-[56px] lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
            <div className="max-w-lg"><p className="b2b-inquiry-kicker mb-2 text-xs font-semibold uppercase tracking-wider text-[#C89D66]">TƯ VẤN NHANH CHO DỰ ÁN</p><h2 className="b2b-inquiry-heading mb-4 text-balance font-brand-ui text-3xl font-bold tracking-tight text-white md:text-4xl">Nhận phương án cấu hình & báo giá dự án.</h2><p className="b2b-inquiry-copy max-w-md text-sm leading-relaxed text-slate-300">Thông tin dự án được bảo mật; đội ngũ sẽ chuẩn bị phương án trao đổi và lựa chọn nệm mẫu phù hợp.</p></div>
            <div className="rounded-2xl bg-white p-5 text-brand-ink sm:p-7"><LeadForm type="B2B_PROJECT" /></div>
          </div>
        </section>

        <B2BReveal>
          <section className="mx-auto w-[min(calc(100%-40px),1280px)] py-12 md:w-[min(calc(100%-64px),1280px)] md:py-[72px]">
            <div className="max-w-2xl"><h2 className="text-balance font-brand-ui text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Quy trình hợp tác dự án.</h2><p className="mt-4 text-base leading-7 text-brand-copy">Một đầu mối trao đổi xuyên suốt từ khảo sát đến nghiệm thu.</p></div>
            <ol className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map(([number, title, body]) => <li key={number} data-workflow-step className="border-t border-brand-primary/25 pt-5"><p className="text-sm font-extrabold text-brand-accent">{number}</p><h3 className="mt-6 text-lg font-extrabold tracking-[-0.02em] text-brand-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-brand-copy">{body}</p></li>)}
            </ol>
          </section>
        </B2BReveal>

        <B2BPartnerMarquee />

        <section className="bg-brand-surface/45"><div className="mx-auto flex w-[min(calc(100%-40px),1280px)] flex-col justify-between gap-5 py-8 md:w-[min(calc(100%-64px),1280px)] md:flex-row md:items-center"><p className="max-w-2xl text-sm leading-6 text-brand-copy">Hồ sơ năng lực, yêu cầu kỹ thuật và thông tin dự án được trao đổi trực tiếp theo phạm vi công việc.</p>{settings?.contactPhone || settings?.contactEmail ? <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-brand-primary">{settings?.contactPhone ? <a href={`tel:${settings.contactPhone}`} className="hover:text-brand-accent">{settings.contactPhone}</a> : null}{settings?.contactEmail ? <a href={`mailto:${settings.contactEmail}`} className="hover:text-brand-accent">{settings.contactEmail}</a> : null}</div> : null}</div></section>
      </main>
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </>
  );
}
