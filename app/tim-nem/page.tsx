import type { Metadata } from "next";
import { FinderResultsPanel } from "@/components/finder-results";
import { FinderWizard } from "@/components/finder-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildFinderResults, parseFinderQuery } from "@/lib/finder";
import { getDiscoveryProducts } from "@/lib/discovery";
import { getSiteSettings } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return { title: "Tìm nệm phù hợp — Nệm Thăng Long", description: "Khám phá dòng nệm theo kích thước và nhu cầu đã công bố.", alternates: { canonical: "/tim-nem" }, robots: Object.keys(params).length ? { index: false, follow: true } : { index: true, follow: true } };
}

export default async function FinderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [{ products }, settings] = await Promise.all([getDiscoveryProducts(), getSiteSettings()]);
  const query = parseFinderQuery(params);
  const results = buildFinderResults(products, query);
  return <><SiteHeader solid /><main className="finder-page"><section className="finder-intro container"><p className="eyebrow">THĂNG LONG / FIND YOUR MATTRESS</p><h1>Tìm cảm giác phù hợp<br />cho mỗi đêm.</h1><p>Chọn từ dữ liệu kích thước và thông tin đã được công bố. Nếu dữ liệu chưa đủ, chúng tôi sẽ nói rõ.</p></section><section className="finder-layout container"><FinderWizard products={products} query={query} /><aside className="finder-aside"><p className="section-label">MINH BẠCH DỮ LIỆU</p><p>Gợi ý không thay thế tư vấn chuyên môn và không tự suy luận thông số chưa được xác nhận.</p></aside></section><FinderResultsPanel results={results} /></main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
