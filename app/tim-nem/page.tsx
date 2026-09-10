import type { Metadata } from "next";
import { FinderResultsPanel } from "@/components/finder-results";
import { FinderWizard } from "@/components/finder-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildFinderResults, sanitizeFinderQuery } from "@/lib/finder";
import { getDiscoveryProducts } from "@/lib/discovery";
import { getSiteSettings } from "@/lib/products";
import { discoveryPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return discoveryPageMetadata("finder", Object.keys(params).length > 0);
}

export default async function FinderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [{ products, hasVerifiedPrices }, settings] = await Promise.all([getDiscoveryProducts(), getSiteSettings()]);
  const query = sanitizeFinderQuery(params, { hasVerifiedPrices });
  const results = buildFinderResults(products, query);
  return <><SiteHeader solid /><main className="finder-page"><section className="finder-intro container"><p className="eyebrow">THEO NHU CẦU</p><h1>Tìm chiếc nệm phù hợp với bạn.</h1><p>Trả lời vài câu hỏi về không gian, cảm giác nằm và điều bạn ưu tiên để xem các lựa chọn phù hợp.</p></section><section className="finder-layout container"><FinderWizard products={products} query={query} hasVerifiedPrices={hasVerifiedPrices} /><aside className="finder-aside"><p className="section-label">CÁCH GỢI Ý</p><p>Kết quả dựa trên các kích thước và thông tin đã được công bố. Khi dữ liệu chưa đủ, chúng tôi sẽ hiển thị lựa chọn để bạn tham khảo.</p></aside></section><FinderResultsPanel results={results} /></main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
