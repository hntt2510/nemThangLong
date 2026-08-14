import { describe, expect, it } from "vitest";
import { demoProduct } from "../lib/product-data";
import { formatVnd } from "../lib/format";
import { canStartMomoPayment, getPaymentExpiry } from "../lib/payment-lifecycle";

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

  it("only starts MoMo while every payment state and reservation is active", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const snapshot = { orderStatus: "PENDING", orderPaymentStatus: "PENDING" as const, attemptStatus: "PENDING" as const, attemptExpiresAt: new Date("2026-01-01T00:30:00.000Z"), reservations: [{ status: "ACTIVE", expiresAt: new Date("2026-01-01T00:30:00.000Z") }] };
    expect(canStartMomoPayment(snapshot, now)).toBe(true);
    expect(canStartMomoPayment({ ...snapshot, attemptExpiresAt: now }, now)).toBe(false);
    expect(canStartMomoPayment({ ...snapshot, orderStatus: "CANCELLED" }, now)).toBe(false);
    expect(canStartMomoPayment({ ...snapshot, reservations: [{ status: "RELEASED", expiresAt: snapshot.attemptExpiresAt! }] }, now)).toBe(false);
  });

  it("derives bank TTL from settings and disables missing TTL", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(getPaymentExpiry("BANK_TRANSFER", now, 60)?.toISOString()).toBe("2026-01-01T01:00:00.000Z");
    expect(getPaymentExpiry("BANK_TRANSFER", now, null)).toBeNull();
    expect(getPaymentExpiry("BANK_TRANSFER", now, 4)).toBeNull();
  });
});
