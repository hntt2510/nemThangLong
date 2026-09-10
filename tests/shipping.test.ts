import { describe, expect, it } from "vitest";
import { shippingFeeForSubtotal } from "@/lib/shipping";

describe("shipping fee policy", () => {
  it("charges the configured fee below the free-shipping threshold", () => {
    expect(shippingFeeForSubtotal(9_000_000, { shippingFee: 250_000, freeShippingThreshold: 10_000_000 })).toBe(250_000);
  });

  it("waives the configured fee at or above the threshold", () => {
    expect(shippingFeeForSubtotal(10_000_000, { shippingFee: 250_000, freeShippingThreshold: 10_000_000 })).toBe(0);
  });

  it("does not invent a fee when shipping is not configured", () => {
    expect(shippingFeeForSubtotal(10_000_000, { shippingFee: null, freeShippingThreshold: 10_000_000 })).toBeNull();
  });
});
