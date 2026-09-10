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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  return discoveryPageMetadata("finder", Object.keys(params).length > 0);
}

export default async function FinderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ products, hasVerifiedPrices }, settings] = await Promise.all([
    getDiscoveryProducts(),
    getSiteSettings(),
  ]);
  const query = sanitizeFinderQuery(params, { hasVerifiedPrices });
  const results = buildFinderResults(products, query);

  return (
    <>
      <SiteHeader solid />
      <main className="bg-brand-canvas pt-16 text-brand-ink xl:pt-[72px]">
        <section className="mx-auto w-[min(calc(100%-40px),960px)] py-14 text-center md:w-[min(calc(100%-64px),960px)] md:py-18">
          <p className="text-xs font-extrabold tracking-[0.16em] text-brand-accent">
            THEO NHU CẦU
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-balance font-brand-ui text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Tìm chiếc nệm phù hợp với bạn.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-copy">
            Trả lời vài câu hỏi về không gian, cảm giác nằm và điều bạn ưu tiên để xem các lựa chọn phù hợp.
          </p>
        </section>

        <section className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-6 pb-12 md:w-[min(calc(100%-64px),1280px)] md:pb-[72px] xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="overflow-hidden rounded-2xl border border-brand-primary/12 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
            <FinderWizard
              products={products}
              query={query}
              hasVerifiedPrices={hasVerifiedPrices}
            />
          </div>

          <aside className="rounded-2xl border border-brand-primary/12 bg-brand-surface/70 p-6 xl:sticky xl:top-24">
            <p className="text-xs font-extrabold tracking-[0.14em] text-brand-accent">
              CÁCH GỢI Ý
            </p>
            <h2 className="mt-3 text-lg font-extrabold tracking-[-0.02em] text-brand-ink">
              Lựa chọn dựa trên nhu cầu thực tế.
            </h2>
            <p className="mt-3 text-sm leading-6 text-brand-copy">
              Kết quả dựa trên các kích thước và thông tin đã công bố. Khi dữ liệu chưa đủ, chúng tôi hiển thị lựa chọn để bạn tham khảo.
            </p>
          </aside>
        </section>

        <FinderResultsPanel results={results} />
      </main>
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </>
  );
}
