import type { ProductVariant } from "@/lib/types";

export type VariantDimension = "width" | "length" | "thickness";

export function activeVariants(variants: ProductVariant[]) {
  return variants.filter((variant) => variant.active);
}

export function resolveVariant(variants: ProductVariant[], id: string | undefined) {
  return variants.find((variant) => variant.id === id) ?? null;
}

export function dimensionOptions(variants: ProductVariant[], dimension: VariantDimension, current?: ProductVariant | null) {
  const candidates = current
    ? activeVariants(variants).filter((variant) =>
      dimension === "width"
        ? variant.length === current.length && variant.thickness === current.thickness
        : dimension === "length"
          ? variant.width === current.width && variant.thickness === current.thickness
          : variant.width === current.width && variant.length === current.length,
    )
    : activeVariants(variants);
  const source = candidates.length > 0 ? candidates : activeVariants(variants);
  return [...new Set(source.map((variant) => variant[dimension]))].sort((a, b) => a - b);
}

export function selectVariant(variants: ProductVariant[], current: ProductVariant | null, dimension: VariantDimension, value: number) {
  const candidates = activeVariants(variants).filter((variant) => variant[dimension] === value);
  if (!current) return candidates[0] ?? null;
  return candidates.find((variant) => variant.width === current.width && variant.length === current.length && variant.thickness === current.thickness)
    ?? candidates.find((variant) => dimension === "width" && variant.length === current.length && variant.thickness === current.thickness)
    ?? candidates.find((variant) => dimension === "length" && variant.width === current.width && variant.thickness === current.thickness)
    ?? candidates.find((variant) => dimension === "thickness" && variant.width === current.width && variant.length === current.length)
    ?? candidates[0]
    ?? null;
}
