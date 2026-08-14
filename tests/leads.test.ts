import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicLeadSchema } from "@/lib/lead-validation";
import { canTransitionLeadStatus, createPublicLead, leadSourceForType, resetLeadIpLimitForTests, consumeLeadIpLimit, LeadRateLimitError, LeadValidationError } from "@/lib/leads";

describe("lead validation and lifecycle", () => {
  beforeEach(() => resetLeadIpLimitForTests());

  it("normalizes public contact values and rejects admin fields", () => {
    const parsed = publicLeadSchema.safeParse({ type: "CONSULTATION", fullName: "  Nguyen Van A ", phone: "+84 (90) 123-4567", email: " USER@Example.COM ", message: "Hello", status: "CLOSED" });
    expect(parsed.success).toBe(false);
    const valid = publicLeadSchema.parse({ type: "CONSULTATION", fullName: "  Nguyen Van A ", phone: "+84 (90) 123-4567", email: " USER@Example.COM " });
    expect(valid).toMatchObject({ fullName: "Nguyen Van A", phone: "+84901234567", email: "user@example.com" });
  });

  it("enforces positive safe quantity and source mapping", () => {
    expect(publicLeadSchema.safeParse({ type: "B2B_PROJECT", fullName: "Project", phone: "0900000000", estimatedQuantity: 0 }).success).toBe(false);
    expect(publicLeadSchema.safeParse({ type: "B2B_PROJECT", fullName: "Project", phone: "0900000000", estimatedQuantity: 2 }).success).toBe(true);
    expect(leadSourceForType("CONSULTATION")).toBe("CONTACT_PAGE");
    expect(leadSourceForType("B2B_PROJECT")).toBe("B2B_PAGE");
  });

  it("applies the exact status transition rules", () => {
    expect(canTransitionLeadStatus("NEW", "IN_PROGRESS")).toBe(true);
    expect(canTransitionLeadStatus("NEW", "CLOSED")).toBe(true);
    expect(canTransitionLeadStatus("IN_PROGRESS", "NEW")).toBe(false);
    expect(canTransitionLeadStatus("CLOSED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionLeadStatus("CLOSED", "NEW")).toBe(false);
  });

  it("limits process-local IP attempts", () => {
    for (let index = 0; index < 5; index += 1) expect(consumeLeadIpLimit("198.51.100.10", 1_000)).toBe(true);
    expect(consumeLeadIpLimit("198.51.100.10", 1_000)).toBe(false);
    expect(consumeLeadIpLimit("198.51.100.10", 1_000 + 10 * 60 * 1000)).toBe(true);
  });

  it("rechecks published product context and throttles normalized phone", async () => {
    const create = vi.fn().mockResolvedValue({ id: "lead-1" });
    const count = vi.fn().mockResolvedValue(0);
    const findFirst = vi.fn().mockResolvedValue({ slug: "america" });
    const prisma = { $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ product: { findFirst }, lead: { count, create } }) } as never;
    const input = publicLeadSchema.parse({ type: "CONSULTATION", fullName: "Buyer", phone: "0900 000 000", productSlug: "america" });
    await createPublicLead(prisma, input);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ phone: "0900000000", productSlug: "america", source: "CONTACT_PAGE" }) }));
    findFirst.mockResolvedValue(null);
    await expect(createPublicLead(prisma, input)).rejects.toBeInstanceOf(LeadValidationError);
    findFirst.mockResolvedValue({ slug: "america" });
    count.mockResolvedValue(3);
    await expect(createPublicLead(prisma, input)).rejects.toBeInstanceOf(LeadRateLimitError);
  });
});
