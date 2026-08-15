import { describe, expect, it } from "vitest";
import { addressInputSchema, profileUpdateSchema } from "@/lib/account-validation";
import { afterSalesAdminUpdateSchema, afterSalesCreateSchema, canTransitionAfterSalesStatus } from "@/lib/after-sales";

describe("account and after-sales contracts", () => {
  it("normalizes safe profile phone fields and rejects auth fields", () => {
    expect(profileUpdateSchema.parse({ name: "Nguyen Van A", phone: "+84 (90) 123-4567" }).phone).toBe("+84901234567");
    expect(profileUpdateSchema.safeParse({ name: "Nguyen Van A", role: "ADMIN" }).success).toBe(false);
  });

  it("validates an address and rejects user ownership input", () => {
    expect(addressInputSchema.parse({ fullName: "Nguyen Van A", phone: "090 123 4567", line1: "12 Pho Hue", province: "Ha Noi" }).phone).toBe("0901234567");
    expect(addressInputSchema.safeParse({ fullName: "Nguyen Van A", phone: "0901234567", line1: "12 Pho Hue", province: "Ha Noi", userId: "other" }).success).toBe(false);
  });

  it("rejects customer status/internal note and accepts only owned-request fields", () => {
    expect(afterSalesCreateSchema.safeParse({ orderId: "o1", orderItemId: "i1", type: "WARRANTY_REVIEW", subject: "Kiem tra", description: "Can kiem tra san pham nay." }).success).toBe(true);
    expect(afterSalesCreateSchema.safeParse({ orderId: "o1", orderItemId: "i1", type: "WARRANTY_REVIEW", subject: "Kiem tra", description: "Can kiem tra san pham nay.", status: "CLOSED", internalNote: "private" }).success).toBe(false);
    expect(afterSalesAdminUpdateSchema.safeParse({ status: "REVIEWING", internalNote: "note", updatedAt: new Date().toISOString() }).success).toBe(true);
  });

  it("enforces neutral after-sales transitions", () => {
    expect(canTransitionAfterSalesStatus("SUBMITTED", "REVIEWING")).toBe(true);
    expect(canTransitionAfterSalesStatus("CLOSED", "REVIEWING")).toBe(true);
    expect(canTransitionAfterSalesStatus("CLOSED", "SUBMITTED")).toBe(false);
    expect(canTransitionAfterSalesStatus("REVIEWING", "SUBMITTED")).toBe(false);
  });
});
