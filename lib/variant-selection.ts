import type { ProductVariant } from "@/lib/types";

export type VariantDimension = "width" | "length" | "thickness";

export type VariantSelection = {
  width: number | null;
  length: number | null;
  thickness: number | null;
};

export type VariantSelectionLike = VariantSelection | ProductVariant | null | undefined;

export function activeVariants(variants: ProductVariant[]) {
  return variants.filter((variant) => variant.active);
}

export function selectionFromVariant(variant: ProductVariant | null | undefined): VariantSelection {
  return {
    width: variant?.width ?? null,
    length: variant?.length ?? null,
    thickness: variant?.thickness ?? null,
  };
}

export function initialSelection(variants: ProductVariant[]): VariantSelection {
  const active = activeVariants(variants);
  if (!active.length) return selectionFromVariant(null);
  const preferred = active.find((v) => v.width === 160) ?? active[0];
  return selectionFromVariant(preferred);
}

function asSelection(value: VariantSelectionLike) {
  return value && "id" in value ? selectionFromVariant(value) : value ?? selectionFromVariant(null);
}

export function resolveVariant(variants: ProductVariant[], selection: VariantSelectionLike | string) {
  if (typeof selection === "string") return activeVariants(variants).find((variant) => variant.id === selection) ?? null;
  const current = asSelection(selection);
  if (current.width === null || current.length === null || current.thickness === null) return null;
  return activeVariants(variants).find((variant) =>
    variant.width === current.width &&
    variant.length === current.length &&
    variant.thickness === current.thickness,
  ) ?? null;
}

export function dimensionOptions(variants: ProductVariant[], dimension: VariantDimension, selection?: VariantSelectionLike) {
  const active = activeVariants(variants);
  const current = asSelection(selection);
  const candidates = active.filter((variant) => {
    if (dimension === "width") return true;
    if (current.width !== null && variant.width !== current.width) return false;
    if (dimension === "length") return true;
    return current.length === null || variant.length === current.length;
  });
  const source = candidates.length > 0 ? candidates : active;
  return [...new Set(source.map((variant) => variant[dimension]))].sort((a, b) => a - b);
}

export function selectVariant(variants: ProductVariant[], selection: VariantSelectionLike, dimension: VariantDimension, value: number) {
  const active = activeVariants(variants);
  const current = asSelection(selection);
  const candidates = active.filter((variant) => {
    if (variant[dimension] !== value) return false;
    if (dimension !== "width" && current.width !== null && variant.width !== current.width) return false;
    if (dimension === "thickness" && current.length !== null && variant.length !== current.length) return false;
    return true;
  });
  if (candidates.length === 0) return null;

  const preferred = candidates.find((variant) =>
    dimension === "width"
      ? variant.length === current.length && variant.thickness === current.thickness
      : dimension === "length"
        ? variant.thickness === current.thickness
        : true,
  );
  return preferred ?? candidates[0];
}
