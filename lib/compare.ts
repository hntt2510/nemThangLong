import { CATALOG_SLUGS } from "@/lib/product-data";
import type { DiscoveryProduct } from "@/lib/discovery";
import { formatVnd } from "@/lib/format";

export const COMPARE_LIMIT = 3;

type SearchParamsLike = Record<string, string | string[] | undefined>;

function values(value: string | string[] | undefined) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function parseCompareItems(params: SearchParamsLike = {}) {
  const raw = values(params.items).flatMap((value) => value.split(",").map((item) => item.trim()));
  const allowed = new Set<string>(CATALOG_SLUGS);
  return [...new Set(raw.filter((item) => allowed.has(item)))].slice(0, COMPARE_LIMIT);
}

export function selectCompareProducts(products: DiscoveryProduct[], items: string[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return items.map((slug) => bySlug.get(slug)).filter((product): product is DiscoveryProduct => Boolean(product)).slice(0, COMPARE_LIMIT);
}

export type CompareRow = { key: string; label: string; values: Array<string | number | null>; kind?: "text" | "number" };

function show(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? null : value;
}

function formatPriceRange(min: number | null, max: number | null) {
  if (min === null) return null;
  if (max === null || min === max) return formatVnd(min);
  return `${formatVnd(min)} – ${formatVnd(max)}`;
}

function sectionText(section: { title?: string; body: string } | null) {
  if (!section) return null;
  return section.title ? section.title + ": " + section.body : section.body;
}

export function buildCompareRows(products: DiscoveryProduct[]): CompareRow[] {
  const rows: CompareRow[] = [
    { key: "description", label: "Mô tả đã công bố", values: products.map((product) => product.isDemo ? null : show(product.description)) },
    { key: "price", label: "Khoảng giá đã xác nhận", values: products.map((product) => formatPriceRange(product.minPrice, product.maxPrice)) },
    { key: "purchasable", label: "Khả năng mua", values: products.map((product) => product.isDemo ? null : product.purchasable ? "Có" : "Chưa sẵn sàng") },
    { key: "stock", label: "Tồn kho", values: products.map((product) => product.isDemo ? null : product.inStock ? "Còn biến thể" : "Hết hàng") },
    { key: "widths", label: "Chiều rộng", values: products.map((product) => product.widths.length ? product.widths.join(", ") + " cm" : null) },
    { key: "lengths", label: "Chiều dài", values: products.map((product) => product.lengths.length ? product.lengths.join(", ") + " cm" : null) },
    { key: "thicknesses", label: "Độ dày", values: products.map((product) => product.thicknesses.length ? product.thicknesses.join(", ") + " cm" : null) },
    { key: "combinations", label: "Tổ hợp kích thước", values: products.map((product) => product.combinations.length ? product.combinations.map((item) => `${item.width}×${item.length}×${item.thickness}`).join(" · ") : null) },
    { key: "firmness", label: "Độ vững", values: products.map((product) => product.comfort?.firmnessLabel ?? product.comfort?.firmnessScore ?? null) },
    { key: "support", label: "Nâng đỡ", values: products.map((product) => product.comfort?.support ?? null), kind: "number" },
    { key: "breathability", label: "Thoáng khí", values: products.map((product) => product.comfort?.breathability ?? null), kind: "number" },
    { key: "motionIsolation", label: "Cách truyền động", values: products.map((product) => product.comfort?.motionIsolation ?? null), kind: "number" },
    { key: "material", label: "Câu chuyện vật liệu", values: products.map((product) => sectionText(product.materialStory)) },
    { key: "delivery", label: "Giao hàng", values: products.map((product) => sectionText(product.delivery)) },
    { key: "warranty", label: "Bảo hành", values: products.map((product) => sectionText(product.warranty)) },
  ];
  return rows.filter((row) => row.values.some((value) => value !== null));
}
