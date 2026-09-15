/**
 * Canonical mattress pricing matrix extracted from official company price sheets.
 * Covers all 9 mattress product lines (A through I).
 *
 * Business Rules:
 * - oldPrice: GIÁ NIÊM YẾT (Strikethrough reference price)
 * - curPrice: GIÁ BÁN (Actual discounted selling price)
 * - savings: oldPrice - curPrice
 * - discountPercent: Math.round((savings / oldPrice) * 100)
 */

export interface CanonicalVariantPrice {
  width: number;
  length: number;
  thickness: number;
  curPrice: number;
  oldPrice: number;
  savings: number;
  discountPercent: number;
}

export function calculateSavings(oldPrice: number, curPrice: number) {
  const savings = Math.max(0, oldPrice - curPrice);
  const discountPercent = oldPrice > 0 ? Math.round((savings / oldPrice) * 100) : 0;
  return { savings, discountPercent };
}

function createVariant(
  width: number,
  length: number,
  thickness: number,
  curPrice: number,
  oldPrice: number
): CanonicalVariantPrice {
  const { savings, discountPercent } = calculateSavings(oldPrice, curPrice);
  return { width, length, thickness, curPrice, oldPrice, savings, discountPercent };
}

// --------------------------------------------------------------------------
// A. SUNHOME PRO (Ảnh 1)
// --------------------------------------------------------------------------
export const PRICING_SUNHOME_PRO: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 3612000, 4334400),
  createVariant(100, 200, 15, 4452000, 5342400),
  createVariant(100, 200, 20, 5292000, 6350400),
  // 120x200
  createVariant(120, 200, 10, 3948000, 4737600),
  createVariant(120, 200, 15, 4956000, 5947200),
  createVariant(120, 200, 20, 5964000, 7156800),
  // 140x200
  createVariant(140, 200, 10, 4284000, 5140800),
  createVariant(140, 200, 15, 5460000, 6552000),
  createVariant(140, 200, 20, 6636000, 7963200),
  // 160x200
  createVariant(160, 200, 10, 4668000, 5601600),
  createVariant(160, 200, 15, 5964000, 7156800),
  createVariant(160, 200, 20, 7308000, 8769600),
  // 180x200
  createVariant(180, 200, 10, 5304000, 6364800),
  createVariant(180, 200, 15, 6804000, 8164800),
  createVariant(180, 200, 20, 8316000, 9979200),
  // 220x200
  createVariant(220, 200, 10, 6636000, 7963200),
  createVariant(220, 200, 15, 8652000, 10382400),
  createVariant(220, 200, 20, 10500000, 12600000),
];

// --------------------------------------------------------------------------
// B. THĂNG LONG LUXURY (Ảnh 1)
// --------------------------------------------------------------------------
export const PRICING_THANG_LONG_LUXURY: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 3864000, 4636800),
  createVariant(100, 200, 15, 4763000, 5715600),
  createVariant(100, 200, 20, 5662000, 6794400),
  // 120x200
  createVariant(120, 200, 10, 4224000, 5068800),
  createVariant(120, 200, 15, 5302000, 6362400),
  createVariant(120, 200, 20, 6381000, 7657200),
  // 140x200
  createVariant(140, 200, 10, 4583000, 5499600),
  createVariant(140, 200, 15, 5842000, 7010400),
  createVariant(140, 200, 20, 7100000, 8520000),
  // 160x200
  createVariant(160, 200, 10, 4994000, 5992800),
  createVariant(160, 200, 15, 6381000, 7657200),
  createVariant(160, 200, 20, 7819000, 9382800),
  // 180x200
  createVariant(180, 200, 10, 5675000, 6810000),
  createVariant(180, 200, 15, 7280000, 8736000),
  createVariant(180, 200, 20, 8898000, 10677600),
  // 220x200
  createVariant(220, 200, 10, 7100000, 8520000),
  createVariant(220, 200, 15, 9257000, 11108400),
  createVariant(220, 200, 20, 11235000, 13482000),
];

// --------------------------------------------------------------------------
// C. CSTN VINHA LATEX (Ảnh 1)
// Neo giá niêm yết (oldPrice) cao hơn 25% để hiển thị tâm lý ưu đãi
// --------------------------------------------------------------------------
export const PRICING_CSTN_VINHA_LATEX: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 5, 5970000, 7460000),
  createVariant(100, 200, 10, 8730000, 10910000),
  createVariant(100, 200, 15, 14070000, 17590000),
  // 120x200
  createVariant(120, 200, 5, 6720000, 8400000),
  createVariant(120, 200, 10, 9970000, 12460000),
  createVariant(120, 200, 15, 15360000, 19200000),
  // 140x200
  createVariant(140, 200, 5, 7570000, 9460000),
  createVariant(140, 200, 10, 11550000, 14440000),
  createVariant(140, 200, 15, 16480000, 20600000),
  // 160x200
  createVariant(160, 200, 5, 8240000, 10300000),
  createVariant(160, 200, 10, 12670000, 15840000),
  createVariant(160, 200, 15, 18120000, 22650000),
  // 180x200
  createVariant(180, 200, 5, 9350000, 11690000),
  createVariant(180, 200, 10, 13280000, 16600000),
  createVariant(180, 200, 15, 21130000, 26410000),
];

// --------------------------------------------------------------------------
// D. THĂNG LONG GOLD (Ảnh 2)
// --------------------------------------------------------------------------
export const PRICING_THANG_LONG_GOLD: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 2400000, 2880000),
  createVariant(100, 200, 15, 3000000, 3600000),
  createVariant(100, 200, 20, 3600000, 4320000),
  // 120x200
  createVariant(120, 200, 10, 2700000, 3240000),
  createVariant(120, 200, 15, 3400000, 4080000),
  createVariant(120, 200, 20, 4300000, 5160000),
  // 140x200
  createVariant(140, 200, 10, 3000000, 3600000),
  createVariant(140, 200, 15, 3850000, 4620000),
  createVariant(140, 200, 20, 4600000, 5520000),
  // 160x200
  createVariant(160, 200, 10, 3300000, 3960000),
  createVariant(160, 200, 15, 4250000, 5100000),
  createVariant(160, 200, 20, 5100000, 6120000),
  // 180x200
  createVariant(180, 200, 10, 3900000, 4680000),
  createVariant(180, 200, 15, 4850000, 5820000),
  createVariant(180, 200, 20, 5700000, 6840000),
  // 220x200
  createVariant(220, 200, 10, 4900000, 5880000),
  createVariant(220, 200, 15, 5750000, 6900000),
  createVariant(220, 200, 20, 6950000, 8340000),
];

// --------------------------------------------------------------------------
// E. SUNHOME - TỔNG HỢP (Ảnh 2)
// --------------------------------------------------------------------------
export const PRICING_SUNHOME_TONG_HOP: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 2558000, 3069600),
  createVariant(100, 200, 15, 3153000, 3783600),
  createVariant(100, 200, 20, 3748000, 4497600),
  // 120x200
  createVariant(120, 200, 10, 2796000, 3355200),
  createVariant(120, 200, 15, 3510000, 4212000),
  createVariant(120, 200, 20, 4224000, 5068800),
  // 140x200
  createVariant(140, 200, 10, 3034000, 3640800),
  createVariant(140, 200, 15, 3867000, 4640400),
  createVariant(140, 200, 20, 4700000, 5640000),
  // 160x200
  createVariant(160, 200, 10, 3350000, 4020000),
  createVariant(160, 200, 15, 4224000, 5068800),
  createVariant(160, 200, 20, 5175000, 6210000),
  // 180x200
  createVariant(180, 200, 10, 3757000, 4508400),
  createVariant(180, 200, 15, 4819000, 5782800),
  createVariant(180, 200, 20, 5890000, 7068000),
  // 220x200
  createVariant(220, 200, 10, 4700000, 5640000),
  createVariant(220, 200, 15, 6128000, 7353600),
  createVariant(220, 200, 20, 7437000, 8924400),
];

// --------------------------------------------------------------------------
// F. SUNHOME (Ảnh 2)
// --------------------------------------------------------------------------
export const PRICING_SUNHOME: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 3010000, 3612000),
  createVariant(100, 200, 15, 3710000, 4452000),
  createVariant(100, 200, 20, 4410000, 5292000),
  // 120x200
  createVariant(120, 200, 10, 3290000, 3948000),
  createVariant(120, 200, 15, 4130000, 4956000),
  createVariant(120, 200, 20, 4970000, 5964000),
  // 140x200
  createVariant(140, 200, 10, 3570000, 4284000),
  createVariant(140, 200, 15, 4550000, 5460000),
  createVariant(140, 200, 20, 5530000, 6636000),
  // 160x200
  createVariant(160, 200, 10, 3890000, 4668000),
  createVariant(160, 200, 15, 4970000, 5964000),
  createVariant(160, 200, 20, 6090000, 7308000),
  // 180x200
  createVariant(180, 200, 10, 4420000, 5304000),
  createVariant(180, 200, 15, 5670000, 6804000),
  createVariant(180, 200, 20, 6930000, 8316000),
  // 220x200
  createVariant(220, 200, 10, 5530000, 6636000),
  createVariant(220, 200, 15, 7210000, 8652000),
  createVariant(220, 200, 20, 8750000, 10500000),
];

// --------------------------------------------------------------------------
// G. AMERICAN (Ảnh 3)
// --------------------------------------------------------------------------
export const PRICING_AMERICAN: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 900000, 1170000),
  createVariant(100, 200, 15, 1250000, 1625000),
  createVariant(100, 200, 20, 1600000, 2080000),
  // 120x200
  createVariant(120, 200, 10, 1000000, 1300000),
  createVariant(120, 200, 15, 1350000, 1755000),
  createVariant(120, 200, 20, 1700000, 2210000),
  // 140x200
  createVariant(140, 200, 10, 1100000, 1430000),
  createVariant(140, 200, 15, 1500000, 1950000),
  createVariant(140, 200, 20, 1900000, 2470000),
  // 160x200
  createVariant(160, 200, 10, 1200000, 1560000),
  createVariant(160, 200, 15, 1600000, 2080000),
  createVariant(160, 200, 20, 2100000, 2730000),
  // 180x200
  createVariant(180, 200, 10, 1400000, 1820000),
  createVariant(180, 200, 15, 1900000, 2470000),
  createVariant(180, 200, 20, 2400000, 3120000),
  // 220x200
  createVariant(220, 200, 10, 1800000, 2340000),
  createVariant(220, 200, 15, 2450000, 3185000),
  createVariant(220, 200, 20, 2950000, 3835000),
];

// --------------------------------------------------------------------------
// H. THĂNG LONG BASIC (Ảnh 3)
// --------------------------------------------------------------------------
export const PRICING_THANG_LONG_BASIC: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 1650000, 1980000),
  createVariant(100, 200, 15, 2050000, 2460000),
  createVariant(100, 200, 20, 2450000, 2940000),
  // 120x200
  createVariant(120, 200, 10, 1750000, 2100000),
  createVariant(120, 200, 15, 2150000, 2580000),
  createVariant(120, 200, 20, 2550000, 3060000),
  // 140x200
  createVariant(140, 200, 10, 1850000, 2220000),
  createVariant(140, 200, 15, 2350000, 2820000),
  createVariant(140, 200, 20, 2850000, 3420000),
  // 160x200
  createVariant(160, 200, 10, 1950000, 2340000),
  createVariant(160, 200, 15, 2550000, 3060000),
  createVariant(160, 200, 20, 3150000, 3780000),
  // 180x200
  createVariant(180, 200, 10, 2150000, 2580000),
  createVariant(180, 200, 15, 2850000, 3420000),
  createVariant(180, 200, 20, 3550000, 4260000),
  // 220x200
  createVariant(220, 200, 10, 2750000, 3300000),
  createVariant(220, 200, 15, 3650000, 4380000),
  createVariant(220, 200, 20, 4550000, 5460000),
];

// --------------------------------------------------------------------------
// I. THĂNG LONG GRAY (Ảnh 3)
// --------------------------------------------------------------------------
export const PRICING_THANG_LONG_GRAY: CanonicalVariantPrice[] = [
  // 100x200
  createVariant(100, 200, 10, 2150000, 2580000),
  createVariant(100, 200, 15, 2650000, 3180000),
  createVariant(100, 200, 20, 3150000, 3780000),
  // 120x200
  createVariant(120, 200, 10, 2350000, 2820000),
  createVariant(120, 200, 15, 2950000, 3540000),
  createVariant(120, 200, 20, 3550000, 4260000),
  // 140x200
  createVariant(140, 200, 10, 2550000, 3060000),
  createVariant(140, 200, 15, 3250000, 3900000),
  createVariant(140, 200, 20, 3950000, 4740000),
  // 160x200
  createVariant(160, 200, 10, 2750000, 3300000),
  createVariant(160, 200, 15, 3550000, 4260000),
  createVariant(160, 200, 20, 4350000, 5220000),
  // 180x200
  createVariant(180, 200, 10, 3150000, 3780000),
  createVariant(180, 200, 15, 4050000, 4860000),
  createVariant(180, 200, 20, 4950000, 5940000),
  // 220x200
  createVariant(220, 200, 10, 3950000, 4740000),
  createVariant(220, 200, 15, 5150000, 6180000),
  createVariant(220, 200, 20, 6250000, 7500000),
];

// --------------------------------------------------------------------------
// Official Catalog Master Registry
// --------------------------------------------------------------------------
export const CANONICAL_LINES = {
  SUNHOME_PRO: {
    name: "Nệm Sunhome Pro",
    matrix: PRICING_SUNHOME_PRO,
    minCurPrice: 3612000,
    minOldPrice: 4334400,
  },
  THANG_LONG_LUXURY: {
    name: "Nệm Thăng Long Luxury",
    matrix: PRICING_THANG_LONG_LUXURY,
    minCurPrice: 3864000,
    minOldPrice: 4636800,
  },
  CSTN_VINHA_LATEX: {
    name: "Nệm Cao Su Thiên Nhiên Vinha Latex",
    matrix: PRICING_CSTN_VINHA_LATEX,
    minCurPrice: 5970000,
    minOldPrice: 7460000,
  },
  THANG_LONG_GOLD: {
    name: "Nệm Thăng Long Gold",
    matrix: PRICING_THANG_LONG_GOLD,
    minCurPrice: 2400000,
    minOldPrice: 2880000,
  },
  SUNHOME_TONG_HOP: {
    name: "Nệm Sunhome Tổng Hợp",
    matrix: PRICING_SUNHOME_TONG_HOP,
    minCurPrice: 2558000,
    minOldPrice: 3069600,
  },
  SUNHOME: {
    name: "Nệm Sunhome",
    matrix: PRICING_SUNHOME,
    minCurPrice: 3010000,
    minOldPrice: 3612000,
  },
  AMERICAN: {
    name: "Nệm Thăng Long America",
    matrix: PRICING_AMERICAN,
    minCurPrice: 900000,
    minOldPrice: 1170000,
  },
  THANG_LONG_BASIC: {
    name: "Nệm Thăng Long Basic",
    matrix: PRICING_THANG_LONG_BASIC,
    minCurPrice: 1650000,
    minOldPrice: 1980000,
  },
  THANG_LONG_GRAY: {
    name: "Nệm Thăng Long Gray (Hoạt Tính)",
    matrix: PRICING_THANG_LONG_GRAY,
    minCurPrice: 2150000,
    minOldPrice: 2580000,
  },
} as const;

// --------------------------------------------------------------------------
// Storefront Slug Mapping
// --------------------------------------------------------------------------
export const CANONICAL_STOREFRONT_MAPPING: Record<
  string,
  {
    curPrice: number;
    oldPrice: number;
    badge: "BEST_SELLER" | "HOT_DEAL" | "DOCTOR_RECOMMENDED";
    variants: CanonicalVariantPrice[];
  }
> = {
  america: {
    curPrice: CANONICAL_LINES.AMERICAN.minCurPrice,
    oldPrice: CANONICAL_LINES.AMERICAN.minOldPrice,
    badge: "HOT_DEAL",
    variants: PRICING_AMERICAN,
  },
  classic: {
    curPrice: CANONICAL_LINES.THANG_LONG_GOLD.minCurPrice,
    oldPrice: CANONICAL_LINES.THANG_LONG_GOLD.minOldPrice,
    badge: "BEST_SELLER",
    variants: PRICING_THANG_LONG_GOLD,
  },
  "cao-su-thien-nhien": {
    curPrice: CANONICAL_LINES.CSTN_VINHA_LATEX.minCurPrice,
    oldPrice: CANONICAL_LINES.CSTN_VINHA_LATEX.minOldPrice,
    badge: "DOCTOR_RECOMMENDED",
    variants: PRICING_CSTN_VINHA_LATEX,
  },
  "hoat-tinh": {
    curPrice: CANONICAL_LINES.THANG_LONG_GRAY.minCurPrice,
    oldPrice: CANONICAL_LINES.THANG_LONG_GRAY.minOldPrice,
    badge: "HOT_DEAL",
    variants: PRICING_THANG_LONG_GRAY,
  },
  "memory-foam": {
    curPrice: CANONICAL_LINES.SUNHOME_PRO.minCurPrice,
    oldPrice: CANONICAL_LINES.SUNHOME_PRO.minOldPrice,
    badge: "DOCTOR_RECOMMENDED",
    variants: PRICING_SUNHOME_PRO,
  },
  "khach-san": {
    curPrice: CANONICAL_LINES.THANG_LONG_LUXURY.minCurPrice,
    oldPrice: CANONICAL_LINES.THANG_LONG_LUXURY.minOldPrice,
    badge: "BEST_SELLER",
    variants: PRICING_THANG_LONG_LUXURY,
  },
  luxury: {
    curPrice: CANONICAL_LINES.THANG_LONG_LUXURY.minCurPrice,
    oldPrice: CANONICAL_LINES.THANG_LONG_LUXURY.minOldPrice,
    badge: "BEST_SELLER",
    variants: PRICING_THANG_LONG_LUXURY,
  },
};
