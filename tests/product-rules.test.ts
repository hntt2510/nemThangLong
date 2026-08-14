import { describe, expect, it } from "vitest";
import { demoProduct } from "../lib/product-data";
import { formatVnd } from "../lib/format";

describe("safe demo product", () => {
  it("is never purchasable and contains no priced stock", () => {
    expect(demoProduct.isDemo).toBe(true);
    expect(demoProduct.purchasable).toBe(false);
    expect(demoProduct.variants.every((variant) => variant.price === null && variant.stock === 0 && !variant.active)).toBe(true);
  });

  it("formats integer VND without a decimal price", () => {
    expect(formatVnd(18900000)).toContain("18.900.000");
    expect(formatVnd(0)).toContain("0");
  });
});
