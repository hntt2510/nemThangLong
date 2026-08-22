import type { DiscoveryProduct } from "@/lib/discovery";
import type { ProductVariant } from "@/lib/types";
import { variantMatchesConstraints } from "@/lib/variant-constraints";

export type FinderFeel = "soft" | "balanced" | "firm" | "unsure";
export type FinderPriority = "support" | "breathability" | "motion-isolation" | "unsure";
export type FinderCriterion = "feel" | "support" | "breathability" | "motion-isolation";
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
export type FinderCapabilities = { hasVerifiedPrices: boolean };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positive(value: string | string[] | undefined) {
  const parsed = Number(first(value));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function hasFinderHardConstraints(query: FinderQuery) {
  return query.width !== null || query.length !== null || query.thickness !== null || query.maxPrice !== null || query.inStock;
}

export function parseFinderQuery(params: SearchParamsLike = {}, capabilities: FinderCapabilities = { hasVerifiedPrices: true }): FinderQuery {
  const feel = first(params.feel);
  const priority = first(params.priority);
  return {
    width: positive(params.width),
    length: positive(params.length),
    thickness: positive(params.thickness),
    maxPrice: capabilities.hasVerifiedPrices ? positive(params.maxPrice) : null,
    feel: feel === "soft" || feel === "balanced" || feel === "firm" ? feel : "unsure",
    priority: priority === "support" || priority === "breathability" || priority === "motion-isolation" ? priority : "unsure",
    inStock: first(params.inStock) === "1",
  };
}

export function sanitizeFinderQuery(params: SearchParamsLike = {}, capabilities: FinderCapabilities = { hasVerifiedPrices: true }) {
  return parseFinderQuery(params, capabilities);
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

function feelLabel(feel: FinderFeel) {
  return feel === "soft" ? "êm hơn" : feel === "balanced" ? "cân bằng" : "vững hơn";
}

function priorityLabel(priority: Exclude<FinderPriority, "unsure">) {
  return priority === "support" ? "nâng đỡ" : priority === "breathability" ? "độ thoáng" : "hạn chế ảnh hưởng chuyển động";
}

function requestedCriteria(query: FinderQuery): FinderCriterion[] {
  return [
    ...(query.feel !== "unsure" ? ["feel" as const] : []),
    ...(query.priority !== "unsure" ? [query.priority] : []),
  ];
}

type Evidence = {
  key: FinderCriterion;
  status: "matched" | "mismatched" | "neutral" | "missing";
  value: number | null;
  reason: string | null;
  missingLabel: string;
};

function evidence(product: DiscoveryProduct, query: FinderQuery): Evidence[] {
  const items: Evidence[] = [];
  if (query.feel !== "unsure") {
    const score = product.comfort?.firmnessScore ?? null;
    if (score === null) {
      items.push({ key: "feel", status: "missing", value: null, reason: null, missingLabel: "cảm giác vững/êm" });
    } else {
      const matched = query.feel === "soft" ? score <= 2 : query.feel === "balanced" ? score === 3 : score >= 4;
      const actual = score <= 2 ? "êm hơn" : score === 3 ? "cân bằng" : "vững hơn";
      items.push({
        key: "feel",
        status: matched ? "matched" : "mismatched",
        value: matched ? 1 : 0,
        reason: matched ? "Độ vững đã công bố phù hợp cảm giác " + feelLabel(query.feel) + "." : "Độ vững đã công bố thuộc nhóm " + actual + ".",
        missingLabel: "cảm giác vững/êm",
      });
    }
  }
  if (query.priority !== "unsure") {
    const score = query.priority === "support"
      ? product.comfort?.support ?? null
      : query.priority === "breathability"
        ? product.comfort?.breathability ?? null
        : product.comfort?.motionIsolation ?? null;
    const label = priorityLabel(query.priority);
    if (score === null) {
      items.push({ key: query.priority, status: "missing", value: null, reason: null, missingLabel: label });
    } else if (score >= 4) {
      items.push({ key: query.priority, status: "matched", value: (score - 1) / 4, reason: "Dữ liệu " + label + " đã công bố ở mức " + score + "/5.", missingLabel: label });
    } else if (score === 3) {
      items.push({ key: query.priority, status: "neutral", value: (score - 1) / 4, reason: "Dữ liệu " + label + " đã công bố ở mức " + score + "/5, chưa đủ để ưu tiên.", missingLabel: label });
    } else {
      items.push({ key: query.priority, status: "mismatched", value: (score - 1) / 4, reason: "Dữ liệu " + label + " đã công bố ở mức " + score + "/5.", missingLabel: label });
    }
  }
  return items;
}

export type FinderCandidate = {
  product: DiscoveryProduct;
  variants: ProductVariant[];
  bestVariant: ProductVariant | null;
  hardEligible: boolean;
  knownCriteria: FinderCriterion[];
  matchedCriteria: FinderCriterion[];
  mismatchedCriteria: FinderCriterion[];
  neutralCriteria: FinderCriterion[];
  coverage: number;
  normalizedScore: number;
  fullCoverage: boolean;
  allRequestedMatched: boolean;
  reasons: string[];
  missingData: string[];
  purchasable: boolean;
};

export function scoreFinderProduct(product: DiscoveryProduct, query: FinderQuery): FinderCandidate {
  const variants = matchingFinderVariants(product, query);
  const hardEligible = !hasFinderHardConstraints(query) || variants.length > 0;
  const requested = requestedCriteria(query);
  const items = evidence(product, query);
  const known = items.filter((item) => item.status !== "missing");
  const matched = items.filter((item) => item.status === "matched");
  const mismatched = items.filter((item) => item.status === "mismatched");
  const neutral = items.filter((item) => item.status === "neutral");
  const normalizedScore = known.length ? known.reduce((sum, item) => sum + (item.value ?? 0), 0) / known.length : 0;
  const pricedInStock = variants.find((variant) => variant.price !== null && variant.price > 0 && variant.stock > 0) ?? null;
  return {
    product,
    variants,
    bestVariant: pricedInStock ?? variants[0] ?? null,
    hardEligible,
    knownCriteria: known.map((item) => item.key),
    matchedCriteria: matched.map((item) => item.key),
    mismatchedCriteria: mismatched.map((item) => item.key),
    neutralCriteria: neutral.map((item) => item.key),
    coverage: requested.length ? known.length / requested.length : 0,
    normalizedScore,
    fullCoverage: requested.length > 0 && known.length === requested.length,
    allRequestedMatched: requested.length > 0 && matched.length === requested.length,
    reasons: items.flatMap((item) => item.reason ? [item.reason] : []),
    missingData: items.filter((item) => item.status === "missing").map((item) => item.missingLabel),
    purchasable: (!product.isDemo || product.source === "showcase" || Boolean(product.isShowcase) || Boolean(product.previewPurchasable)) && Boolean(pricedInStock),
  };
}

export function rankFinderProducts(products: DiscoveryProduct[], query: FinderQuery) {
  return products
    .map((product) => scoreFinderProduct(product, query))
    .filter((candidate) => candidate.hardEligible)
    .sort((a, b) => b.coverage - a.coverage || b.normalizedScore - a.normalizedScore || a.product.catalogueIndex - b.product.catalogueIndex);
}

export type FinderResults = { primary: FinderCandidate | null; alternatives: FinderCandidate[]; shortlist: boolean; empty: boolean };

export function buildFinderResults(products: DiscoveryProduct[], query: FinderQuery): FinderResults {
  const ranked = rankFinderProducts(products, query);
  if (ranked.length === 0) return { primary: null, alternatives: [], shortlist: false, empty: true };
  const full = ranked.filter((candidate) => candidate.purchasable && candidate.fullCoverage);
  const top = full[0] ?? null;
  const next = full[1] ?? null;
  const primary = query.feel !== "unsure" || query.priority !== "unsure"
    ? top && top.allRequestedMatched && (!next || top.normalizedScore > next.normalizedScore) ? top : null
    : null;
  return {
    primary,
    alternatives: (primary ? ranked.filter((candidate) => candidate !== primary) : ranked).slice(0, primary ? 3 : 4),
    shortlist: !primary,
    empty: false,
  };
}

export function finderDimensionOptions(products: DiscoveryProduct[], query: FinderQuery, dimension: "width" | "length" | "thickness") {
  const variants = products.flatMap((product) => matchingFinderVariants(product, { ...query, [dimension === "width" ? "width" : dimension === "length" ? "length" : "thickness"]: null }));
  return [...new Set(variants.map((variant) => variant[dimension]))].sort((a, b) => a - b);
}
