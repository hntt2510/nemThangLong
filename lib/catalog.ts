import "server-only";

import type { Product, ProductVariant } from "@/lib/types";
import { CATALOG_SLUGS, getDemoProduct } from "@/lib/product-data";
import { getDiscoveryProducts } from "@/lib/discovery";
import { hasMatchingVariant } from "@/lib/variant-constraints";

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "name-asc";

export type CatalogQuery = {
  search: string;
  lines: string[];
  widths: number[];
  thicknesses: number[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: CatalogSort;
};

export type CatalogProductSummary = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  isDemo: boolean;
  imageIsDemo: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  purchasable: boolean;
  inStock: boolean;
  widths: number[];
  thicknesses: number[];
  variants: ProductVariant[];
  skus: string[];
  materialStory?: { title: string; body: string } | null;
  isShowcase?: boolean;
  previewPurchasable?: boolean;
};

export type CatalogFacets = {
  widths: number[];
  thicknesses: number[];
  minPrice: number | null;
  maxPrice: number | null;
  hasVerifiedPrices: boolean;
};

export type CatalogData = {
  products: CatalogProductSummary[];
  facets: CatalogFacets;
  query: CatalogQuery;
  total: number;
  databaseAvailable: boolean;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function values(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
}

function positiveInts(value: string | string[] | undefined) {
  return values(value).flatMap((item) => {
    const parsed = Number(item);
    return Number.isSafeInteger(parsed) && parsed > 0 ? [parsed] : [];
  });
}

function optionalPrice(value: string | string[] | undefined) {
  const parsed = Number(values(value)[0]);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function parseCatalogQuery(params: RawSearchParams = {}): CatalogQuery {
  const sort = values(params.sort)[0];
  return {
    search: values(params.q)[0]?.trim().slice(0, 100) ?? "",
    lines: values(params.line).filter((line): line is (typeof CATALOG_SLUGS)[number] => (CATALOG_SLUGS as readonly string[]).includes(line)),
    widths: positiveInts(params.width),
    thicknesses: positiveInts(params.thickness),
    minPrice: optionalPrice(params.minPrice),
    maxPrice: optionalPrice(params.maxPrice),
    inStock: values(params.inStock)[0] === "1",
    sort: sort === "price-asc" || sort === "price-desc" || sort === "name-asc" ? sort : "featured",
  };
}

function materialStory(product: Product) {
  const story = product.content?.materialStory;
  return story?.published && story.title && story.body ? { title: story.title, body: story.body } : null;
}

export function toCatalogProduct(product: Product): CatalogProductSummary {
  const isShowcase = product.source === "showcase" || Boolean(product.isShowcase) || Boolean(product.previewPurchasable);
  const variants = product.isDemo && !isShowcase ? [] : product.variants.filter((variant) => variant.active);
  const priced = variants.map((variant) => variant.price).filter((price): price is number => typeof price === "number" && price > 0);
  const media = product.media[0];
  return {
    slug: product.slug,
    name: product.name,
    eyebrow: product.eyebrow,
    description: product.description || "Thông tin sản phẩm đang được cập nhật từ CMS.",
    image: media?.url ?? product.posterUrl ?? "",
    imageAlt: media?.alt ?? `Hình ảnh minh họa ${product.name}`,
    isDemo: product.isDemo,
    imageIsDemo: product.isDemo || !media || media.isDemo === true,
    minPrice: priced.length > 0 ? Math.min(...priced) : null,
    maxPrice: priced.length > 0 ? Math.max(...priced) : null,
    purchasable: (!product.isDemo || isShowcase) && variants.some((variant) => variant.active && typeof variant.price === "number" && variant.price > 0 && variant.stock > 0),
    inStock: variants.some((variant) => variant.stock > 0),
    widths: [...new Set(variants.map((variant) => variant.width))].sort((a, b) => a - b),
    thicknesses: [...new Set(variants.map((variant) => variant.thickness))].sort((a, b) => a - b),
    variants,
    skus: variants.map((variant) => variant.sku),
    materialStory: materialStory(product),
    isShowcase: product.isShowcase,
    previewPurchasable: product.previewPurchasable,
  };
}

function matches(product: CatalogProductSummary, query: CatalogQuery) {
  if (query.lines.length > 0 && !query.lines.includes(product.slug)) return false;
  if (query.search) {
    const haystack = [product.name, product.description, ...product.skus].join(" ").toLocaleLowerCase("vi");
    if (!haystack.includes(query.search.toLocaleLowerCase("vi"))) return false;
  }
  const hasVariantFilters =
    query.widths.length > 0 ||
    query.thicknesses.length > 0 ||
    query.minPrice !== null ||
    query.maxPrice !== null ||
    query.inStock;
  if (hasVariantFilters) {
    if (query.minPrice !== null && query.maxPrice !== null && query.minPrice > query.maxPrice) return false;
    if (!hasMatchingVariant(product.variants, {
      widths: query.widths,
      thicknesses: query.thicknesses,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: query.inStock,
    })) return false;
  }
  return true;
}

export function filterCatalogProducts(products: CatalogProductSummary[], query: CatalogQuery) {
  return products.filter((product) => matches(product, query));
}

export function sortCatalogProducts(products: CatalogProductSummary[], sort: CatalogSort) {
  const featuredIndex = (slug: string) => CATALOG_SLUGS.indexOf(slug as (typeof CATALOG_SLUGS)[number]);
  return [...products].sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name, "vi");
    if (sort === "price-asc" || sort === "price-desc") {
      if (a.minPrice === null && b.minPrice !== null) return 1;
      if (a.minPrice !== null && b.minPrice === null) return -1;
      if (a.minPrice !== null && b.minPrice !== null) return sort === "price-asc" ? a.minPrice - b.minPrice : b.minPrice - a.minPrice;
    }
    return featuredIndex(a.slug) - featuredIndex(b.slug);
  });
}

function facets(products: CatalogProductSummary[]): CatalogFacets {
  const prices = products.flatMap((product) => product.variants.map((variant) => variant.price)).filter((price): price is number => typeof price === "number" && price > 0);
  return {
    widths: [...new Set(products.flatMap((product) => product.widths))].sort((a, b) => a - b),
    thicknesses: [...new Set(products.flatMap((product) => product.thicknesses))].sort((a, b) => a - b),
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    maxPrice: prices.length > 0 ? Math.max(...prices) : null,
    hasVerifiedPrices: prices.length > 0,
  };
}

export async function getCatalogProducts({ fallbackMissing = false } = {}): Promise<{ products: CatalogProductSummary[]; databaseAvailable: boolean }> {
  const source = await getDiscoveryProducts();
  const bySlug = new Map(source.products.map((item) => [item.slug, toCatalogProduct(item.product)]));
  const products = fallbackMissing
    ? CATALOG_SLUGS.map((slug) => bySlug.get(slug) ?? toCatalogProduct(getDemoProduct(slug)))
    : source.products.map((item) => bySlug.get(item.slug)!).filter(Boolean);
  return { products, databaseAvailable: source.databaseAvailable };
}

export async function getCatalogData(params: RawSearchParams = {}) {
  const query = parseCatalogQuery(params);
  const source = await getCatalogProducts();
  const filtered = sortCatalogProducts(filterCatalogProducts(source.products, query), query.sort);
  return { products: filtered, facets: facets(source.products), query, total: filtered.length, databaseAvailable: source.databaseAvailable } satisfies CatalogData;
}

export async function getRelatedCatalogProducts(slug: string, limit = 3) {
  const source = await getCatalogProducts();
  return sortCatalogProducts(source.products.filter((product) => product.slug !== slug), "featured").slice(0, limit);
}
