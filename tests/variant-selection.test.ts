import { describe, expect, it } from "vitest";
import type { ProductVariant } from "@/lib/types";
import { dimensionOptions, initialSelection, resolveVariant, selectVariant, selectionFromVariant } from "@/lib/variant-selection";

const variant = (id: string, width: number, length: number, thickness: number): ProductVariant => ({
  id,
  width,
  length,
  thickness,
  price: 5000000,
  compareAtPrice: null,
  sku: id.toUpperCase(),
  stock: 2,
  active: true,
});

describe("variant selection", () => {
  it("reaches disconnected variants through real rows", () => {
    const variants = [variant("a", 160, 200, 10), variant("b", 180, 210, 20)];
    const start = initialSelection(variants);
    const selectedB = selectVariant(variants, start, "width", 180);
    expect(selectedB?.id).toBe("b");
    expect(resolveVariant(variants, selectionFromVariant(selectedB))).toMatchObject({ id: "b", width: 180, length: 210, thickness: 20 });
    expect(resolveVariant(variants, { width: 180, length: 200, thickness: 10 })).toBeNull();
    expect(dimensionOptions(variants, "width", start)).toEqual([160, 180]);
  });

  it("walks a partially connected matrix without synthesizing combinations", () => {
    const variants = [variant("a", 160, 200, 10), variant("b", 160, 200, 15), variant("c", 180, 200, 15)];
    const start = initialSelection(variants);
    const selectedB = selectVariant(variants, start, "thickness", 15);
    const selectedC = selectVariant(variants, selectionFromVariant(selectedB), "width", 180);
    expect([selectedB?.id, selectedC?.id]).toEqual(["b", "c"]);
    expect(resolveVariant(variants, { width: 180, length: 200, thickness: 10 })).toBeNull();
    expect(resolveVariant(variants, selectionFromVariant(selectedC))).toMatchObject({ id: "c", sku: "C", stock: 2 });
    const selectedA = selectVariant(variants, selectionFromVariant(selectedC), "width", 160);
    const finalA = selectVariant(variants, selectionFromVariant(selectedA), "thickness", 10);
    expect(finalA?.id).toBe("a");
  });
});
