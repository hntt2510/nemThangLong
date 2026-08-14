import type { ProductVariant } from "@/lib/types";

export type VariantConstraints = {
  widths?: number[];
  lengths?: number[];
  thicknesses?: number[];
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean;
};

/** A single active row must satisfy every supplied constraint. */
export function variantMatchesConstraints(variant: ProductVariant, constraints: VariantConstraints) {
  if (!variant.active) return false;
  if (constraints.widths?.length && !constraints.widths.includes(variant.width)) return false;
  if (constraints.lengths?.length && !constraints.lengths.includes(variant.length)) return false;
  if (constraints.thicknesses?.length && !constraints.thicknesses.includes(variant.thickness)) return false;
  if (constraints.inStock && variant.stock <= 0) return false;
  if (constraints.minPrice !== null && constraints.minPrice !== undefined) {
    if (variant.price === null || variant.price <= 0 || variant.price < constraints.minPrice) return false;
  }
  if (constraints.maxPrice !== null && constraints.maxPrice !== undefined) {
    if (variant.price === null || variant.price <= 0 || variant.price > constraints.maxPrice) return false;
  }
  return true;
}

export function hasMatchingVariant(variants: ProductVariant[], constraints: VariantConstraints) {
  if (constraints.minPrice !== null && constraints.maxPrice !== null && constraints.minPrice !== undefined && constraints.maxPrice !== undefined && constraints.minPrice > constraints.maxPrice) return false;
  return variants.some((variant) => variantMatchesConstraints(variant, constraints));
}
