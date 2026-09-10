import type { Metadata } from "next";
import { ShowroomLocator } from "@/components/showroom/showroom-locator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hệ Thống Showroom & Đại Lý - Nệm Thăng Long",
  description: "Trải nghiệm nằm thử 100 đêm tại 7 chi nhánh Nệm Thăng Long (Đồng Nai, Tây Ninh, Bình Phước, Long An). Định vị GPS tự động chi nhánh gần bạn nhất và dẫn đường 1 chạm Google Maps.",
  alternates: { canonical: "/showrooms" },
};

export default async function ShowroomsPage() {
  const settings = await getSiteSettings();
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Trang chủ", item: "/" },
    { name: "Showroom & Đại lý", item: "/showrooms" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <SiteHeader solid />
      <main className="bg-[#FAF9F6] pt-20 pb-16 text-brand-ink sm:pt-24 sm:pb-24">
        <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
          <ShowroomLocator contactPhone={settings?.contactPhone} />
        </div>
      </main>
      <SiteFooter
        contactPhone={settings?.contactPhone}
        contactEmail={settings?.contactEmail}
      />
    </>
  );
}
