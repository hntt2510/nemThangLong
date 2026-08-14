import type { Product } from "@/lib/types";
import type { CatalogProductSummary } from "@/lib/catalog";

export type BreadcrumbItem = { name: string; item: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function productJsonLd(product: Product, canonical: string) {
  const media = product.media.find((item) => !item.isDemo && item.type === "image");
  const variants = product.variants.filter((variant) => variant.active && typeof variant.price === "number" && variant.price > 0);
  if (product.isDemo || !media || !product.description.trim() || variants.length === 0) return null;
  const prices = variants.map((variant) => variant.price as number);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [media.url],
    url: canonical,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: variants.length,
      availability: variants.some((variant) => variant.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonical,
    },
  };
}

export function catalogBreadcrumbs(slug: string, name: string): BreadcrumbItem[] {
  return [
    { name: "Trang chủ", item: "/" },
    { name: "Dòng nệm", item: "/nem" },
    { name, item: "/nem/" + slug },
  ];
}

export function catalogSummaryJsonLd(product: CatalogProductSummary, canonical: string) {
  if (product.isDemo || product.imageIsDemo || !product.description.trim() || product.minPrice === null) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image],
    url: canonical,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: product.minPrice,
      highPrice: product.maxPrice ?? product.minPrice,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonical,
    },
  };
}
