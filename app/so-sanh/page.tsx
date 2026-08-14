import type { Metadata } from "next";
import { CompareMatrix } from "@/components/compare-matrix";
import { ComparePicker } from "@/components/compare-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildCompareRows, parseCompareItems, selectCompareProducts } from "@/lib/compare";
import { getDiscoveryProducts } from "@/lib/discovery";
import { getSiteSettings } from "@/lib/products";
import { discoveryPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return discoveryPageMetadata("compare", Object.keys(params).length > 0);
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [{ products }, settings] = await Promise.all([getDiscoveryProducts(), getSiteSettings()]);
  const items = parseCompareItems(params);
  const selected = selectCompareProducts(products, items);
  const options = products.map((product) => ({ slug: product.slug, name: product.name }));
  return <><SiteHeader solid /><main className="compare-page"><section className="compare-intro container"><p className="eyebrow">THĂNG LONG / COMPARE</p><h1>Đặt cạnh những<br />lựa chọn khác.</h1><p>Chỉ thông tin đã được công bố mới xuất hiện trong bảng. Dữ liệu thiếu sẽ được ghi rõ.</p></section><section className="compare-picker-section container"><ComparePicker selected={selected.map((product) => product.slug)} options={options} />{selected.length < 2 && <p className="compare-guidance">Chọn ít nhất hai dòng nệm để bắt đầu so sánh.</p>}</section>{selected.length >= 2 && <section className="compare-table-section container"><CompareMatrix products={selected} rows={buildCompareRows(selected)} /></section>}</main><SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} /></>;
}
