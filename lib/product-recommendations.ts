import { SITE_CONFIG } from "@/config/site-config";

export type PriceTier = "TIER_BUDGET" | "TIER_MID" | "TIER_LUXURY";

export const CANONICAL_TIER_PRICES: Record<string, number> = {
  america: 900000,
  "nem-cao-su-america": 900000,
  classic: 2400000,
  "nem-thang-long-classic": 2400000,
  "hoat-tinh": 2150000,
  "nem-thang-long-hoat-tinh": 2150000,
  "memory-foam": 3612000,
  "nem-thang-long-memoryfoam": 3612000,
  "cao-su-thien-nhien": 5970000,
  "nem-cao-su-thien-nhien-thang-long-34": 5970000,
  "khach-san": 3864000,
  "khach-san-du-an": 22000000,
  luxury: 22000000,
};

export type AnyProductWithPrice = {
  id?: string;
  slug: string;
  price?: number | null;
  minPrice?: number | null;
  variants?: Array<{ price?: number | null; active?: boolean }>;
};

/**
 * Resolves the effective base price for a product gracefully.
 * Checks minPrice, direct price, active variant prices, and canonical tier fallback pricing.
 */
export function getProductEffectivePrice(product: AnyProductWithPrice): number {
  if (typeof product.minPrice === "number" && product.minPrice > 0) {
    return product.minPrice;
  }
  if (typeof product.price === "number" && product.price > 0) {
    return product.price;
  }
  if (product.variants && Array.isArray(product.variants)) {
    const validPrices = product.variants
      .filter((v) => v && (v.active ?? true))
      .map((v) => v.price)
      .filter((p): p is number => typeof p === "number" && p > 0);
    if (validPrices.length > 0) {
      return Math.min(...validPrices);
    }
  }
  if (product.slug) {
    const slugLower = product.slug.toLowerCase();
    for (const [key, price] of Object.entries(CANONICAL_TIER_PRICES)) {
      if (slugLower === key || slugLower.includes(key) || key.includes(slugLower)) {
        return price;
      }
    }
  }
  return SITE_CONFIG.pricingTiers.budgetMax;
}

/**
 * Assigns a product to a price tier:
 * - TIER_BUDGET (< 8.000.000đ): America, Classic
 * - TIER_MID (8.000.000d - 14.000.000d): Than Hoạt Tính, Memory Foam, Cao Su 3/4
 * - TIER_LUXURY (> 14.000.000d): Cao Su Thiên Nhiên 100%, Khách Sạn Dự Án / Luxury
 */
export function getPriceTier(price: number, slug?: string): PriceTier {
  if (slug) {
    const s = slug.toLowerCase();
    if (s.includes("khach-san") || s.includes("luxury")) return "TIER_LUXURY";
    if (s.includes("america") || s.includes("classic")) return "TIER_BUDGET";
  }
  if (price > SITE_CONFIG.pricingTiers.luxuryMin) return "TIER_LUXURY";
  if (price >= SITE_CONFIG.pricingTiers.budgetMax) return "TIER_MID";
  return "TIER_BUDGET";
}

/**
 * Deterministically finds related products within the same price tier or proximity.
 * Excludes the current product and sorts by minimal absolute price difference.
 */
export function getRelatedPriceTierProducts<T extends AnyProductWithPrice>(
  currentProduct: AnyProductWithPrice,
  allProducts: T[],
  limit = 3
): T[] {
  const currentPrice = getProductEffectivePrice(currentProduct);
  const currentTier = getPriceTier(currentPrice, currentProduct.slug);
  const currentId = currentProduct.id;
  const currentSlug = currentProduct.slug?.toLowerCase();

  // 1. Exclude the current product itself (matching by id and/or slug)
  const pool = allProducts.filter((candidate) => {
    if (currentId && candidate.id && candidate.id === currentId) return false;
    if (currentSlug && candidate.slug && candidate.slug.toLowerCase() === currentSlug) return false;
    return true;
  });

  if (pool.length === 0) return [];

  const minProximity = 0.65 * currentPrice;
  const maxProximity = 1.45 * currentPrice;

  // 2. Price Proximity Filter: 0.65 * currentPrice <= candidatePrice <= 1.45 * currentPrice
  const proximityCandidates = pool.filter((candidate) => {
    const price = getProductEffectivePrice(candidate);
    return price >= minProximity && price <= maxProximity;
  });

  // Sort proximity candidates by minimal absolute price difference
  proximityCandidates.sort((a, b) => {
    const deltaA = Math.abs(getProductEffectivePrice(a) - currentPrice);
    const deltaB = Math.abs(getProductEffectivePrice(b) - currentPrice);
    return deltaA - deltaB;
  });

  // If price proximity has >= limit candidates, return top candidates
  if (proximityCandidates.length >= limit) {
    return proximityCandidates.slice(0, limit);
  }

  // 3. Fallback: Combine proximity matches and same-tier matches
  const result: T[] = [...proximityCandidates];
  const seenSlugs = new Set(result.map((item) => item.slug.toLowerCase()));

  // Add same-tier items
  const sameTierCandidates = pool.filter((candidate) => {
    if (seenSlugs.has(candidate.slug.toLowerCase())) return false;
    const price = getProductEffectivePrice(candidate);
    const tier = getPriceTier(price, candidate.slug);
    return tier === currentTier;
  });

  sameTierCandidates.sort((a, b) => {
    const deltaA = Math.abs(getProductEffectivePrice(a) - currentPrice);
    const deltaB = Math.abs(getProductEffectivePrice(b) - currentPrice);
    return deltaA - deltaB;
  });

  for (const item of sameTierCandidates) {
    if (result.length >= limit) break;
    result.push(item);
    seenSlugs.add(item.slug.toLowerCase());
  }

  // 4. Backfill from adjacent tiers if still fewer than limit
  if (result.length < limit) {
    const remaining = pool.filter((candidate) => !seenSlugs.has(candidate.slug.toLowerCase()));
    remaining.sort((a, b) => {
      const deltaA = Math.abs(getProductEffectivePrice(a) - currentPrice);
      const deltaB = Math.abs(getProductEffectivePrice(b) - currentPrice);
      return deltaA - deltaB;
    });

    for (const item of remaining) {
      if (result.length >= limit) break;
      result.push(item);
      seenSlugs.add(item.slug.toLowerCase());
    }
  }

  return result.slice(0, limit);
}
