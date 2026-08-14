import type { DiscoveryProduct } from "@/lib/discovery";
import type { ProductVariant } from "@/lib/types";
import { variantMatchesConstraints } from "@/lib/variant-constraints";

export type FinderFeel = "soft" | "balanced" | "firm" | "unsure";
export type FinderPriority = "support" | "breathability" | "motion-isolation" | "unsure";
export type FinderQuery = {
  width: number | null;
  length: number | null;
  thickness: number | null;
  maxPrice: number | null;
  feel: FinderFeel;
  priority: FinderPriority;
  inStock: boolean;
};

type SearchParamsLike = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positive(value: string | string[] | undefined) {
  const parsed = Number(first(value));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseFinderQuery(params: SearchParamsLike = {}): FinderQuery {
  const feel = first(params.feel);
  const priority = first(params.priority);
  return {
    width: positive(params.width),
    length: positive(params.length),
    thickness: positive(params.thickness),
    maxPrice: positive(params.maxPrice),
    feel: feel === "soft" || feel === "balanced" || feel === "firm" ? feel : "unsure",
    priority: priority === "support" || priority === "breathability" || priority === "motion-isolation" ? priority : "unsure",
    inStock: first(params.inStock) === "1",
  };
}

export function matchingFinderVariants(product: DiscoveryProduct, query: FinderQuery) {
  return product.variants.filter((variant) => variantMatchesConstraints(variant, {
    widths: query.width === null ? [] : [query.width],
    lengths: query.length === null ? [] : [query.length],
    thicknesses: query.thickness === null ? [] : [query.thickness],
    maxPrice: query.maxPrice,
    inStock: query.inStock,
  }));
}

function requestedSoftCriteria(query: FinderQuery) {
  return [query.feel !== "unsure", query.priority !== "unsure"].filter(Boolean).length;
}

function feelMatches(score: number, feel: FinderFeel) {
  if (feel === "soft") return score <= 2;
  if (feel === "balanced") return score === 3;
  if (feel === "firm") return score >= 4;
  return false;
}

function criterion(product: DiscoveryProduct, query: FinderQuery, key: "feel" | "priority") {
  if (key === "feel") {
    const score = product.comfort?.firmnessScore ?? null;
    if (score === null || query.feel === "unsure") return null;
    return { value: feelMatches(score, query.feel) ? 1 : 0, reason: feelMatches(score, query.feel) ? `Độ vững đã công bố phù hợp nhóm ${query.feel}.` : `Độ vững đã công bố thuộc nhóm khác.`, label: "độ vững" };
  }
  const score = query.priority === "support"
    ? product.comfort?.support ?? null
    : query.priority === "breathability"
      ? product.comfort?.breathability ?? null
      : product.comfort?.motionIsolation ?? null;
  if (score === null || query.priority === "unsure") return null;
  return { value: (score - 1) / 4, reason: `${query.priority} có điểm đã công bố ${score}/5.`, label: query.priority };
}

export type FinderCandidate = {
  product: DiscoveryProduct;
  variants: ProductVariant[];
  bestVariant: ProductVariant | null;
  coverage: number;
  normalizedScore: number;
  fullCoverage: boolean;
  reasons: string[];
  missingData: string[];
  purchasable: boolean;
};

export function scoreFinderProduct(product: DiscoveryProduct, query: FinderQuery): FinderCandidate {
  const variants = matchingFinderVariants(product, query);
  const soft = [
    query.feel !== "unsure" ? criterion(product, query, "feel") : null,
    query.priority !== "unsure" ? criterion(product, query, "priority") : null,
  ];
  const known = soft.filter((item): item is NonNullable<typeof item> => item !== null);
  const score = known.length ? known.reduce((sum, item) => sum + item.value, 0) / known.length : 0;
  const requested = requestedSoftCriteria(query);
  const missingData = [
    query.feel !== "unsure" && criterion(product, query, "feel") === null ? "độ vững" : null,
    query.priority !== "unsure" && criterion(product, query, "priority") === null ? query.priority : null,
  ].filter((item): item is string => Boolean(item));
  const pricedInStock = variants.find((variant) => variant.price !== null && variant.price > 0 && variant.stock > 0) ?? null;
  return {
    product,
    variants,
    bestVariant: pricedInStock ?? variants[0] ?? null,
    coverage: requested ? known.length / requested : 0,
    normalizedScore: score,
    fullCoverage: requested > 0 && known.length === requested,
    reasons: known.map((item) => item.reason),
    missingData,
    purchasable: !product.isDemo && Boolean(pricedInStock),
  };
}

export function rankFinderProducts(products: DiscoveryProduct[], query: FinderQuery) {
  return products.map((product) => scoreFinderProduct(product, query)).sort((a, b) =>
    b.coverage - a.coverage || b.normalizedScore - a.normalizedScore || a.product.catalogueIndex - b.product.catalogueIndex,
  );
}

export type FinderResults = { primary: FinderCandidate | null; alternatives: FinderCandidate[]; shortlist: boolean };

export function buildFinderResults(products: DiscoveryProduct[], query: FinderQuery): FinderResults {
  const ranked = rankFinderProducts(products, query);
  const softSelected = query.feel !== "unsure" || query.priority !== "unsure";
  const full = ranked.filter((candidate) => candidate.fullCoverage && candidate.purchasable);
  const top = full[0];
  const next = full[1];
  const primary = softSelected && top && (!next || top.normalizedScore > next.normalizedScore) ? top : null;
  const list = primary ? ranked.filter((candidate) => candidate !== primary).slice(0, 3) : ranked.slice(0, 4);
  return { primary, alternatives: list, shortlist: !primary };
}

export function finderDimensionOptions(products: DiscoveryProduct[], query: FinderQuery, dimension: "width" | "length" | "thickness") {
  const variants = products.flatMap((product) => matchingFinderVariants(product, { ...query, [dimension === "width" ? "width" : dimension === "length" ? "length" : "thickness"]: null }));
  return [...new Set(variants.map((variant) => variant[dimension]))].sort((a, b) => a - b);
}
