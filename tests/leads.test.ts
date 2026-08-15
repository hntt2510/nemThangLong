import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicLeadSchema } from "@/lib/lead-validation";
import { canTransitionLeadStatus, createPublicLead, leadSourceForType, LeadRateLimitError, LeadValidationError } from "@/lib/leads";
import { cleanupExpiredLeadRateLimitBuckets, consumeLeadRateLimitBucket, hashLeadRateLimitKey } from "@/lib/lead-rate-limit";

describe("lead validation and lifecycle", () => {
  beforeEach(() => vi.restoreAllMocks());

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

  it("hashes IP and phone keys with stable, distinct HMACs", () => {
    const secret = "test-secret-with-at-least-32-characters";
    const ipHash = hashLeadRateLimitKey("IP", "198.51.100.10", secret);
    expect(ipHash).toBe(hashLeadRateLimitKey("IP", "198.51.100.10", secret));
    expect(ipHash).not.toContain("198.51.100.10");
    expect(ipHash).not.toBe(hashLeadRateLimitKey("PHONE", "198.51.100.10", secret));
  });

  it("uses an atomic bucket query and bounded cleanup", async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ count: 5 }]);
    const executeRaw = vi.fn().mockResolvedValue(2);
    expect(await consumeLeadRateLimitBucket({ $queryRaw: queryRaw, $executeRaw: executeRaw }, "IP", "hash", new Date("2026-01-01T00:00:00.000Z"), 600_000)).toBe(5);
    expect(queryRaw).toHaveBeenCalledOnce();
    expect(await cleanupExpiredLeadRateLimitBuckets({ $queryRaw: queryRaw, $executeRaw: executeRaw }, new Date("2026-01-01T00:00:00.000Z"), 10_000)).toBe(2);
    expect(executeRaw).toHaveBeenCalledOnce();
  });

  it("rechecks published product context and throttles normalized phone", async () => {
    const create = vi.fn().mockResolvedValue({ id: "lead-1" });
    const queryRaw = vi.fn().mockResolvedValue([{ count: 1 }]);
    const findFirst = vi.fn().mockResolvedValue({ slug: "america" });
    const prisma = { $executeRaw: vi.fn().mockResolvedValue(0), $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ product: { findFirst }, lead: { create }, $queryRaw: queryRaw }) } as never;
    const input = publicLeadSchema.parse({ type: "CONSULTATION", fullName: "Buyer", phone: "0900 000 000", productSlug: "america" });
    await createPublicLead(prisma, input, { ipAddress: "198.51.100.10", rateLimitSecret: "test-secret-with-at-least-32-characters" });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ phone: "0900000000", productSlug: "america", source: "CONTACT_PAGE" }) }));
    findFirst.mockResolvedValue(null);
    await expect(createPublicLead(prisma, input, { ipAddress: "198.51.100.11", rateLimitSecret: "test-secret-with-at-least-32-characters" })).rejects.toBeInstanceOf(LeadValidationError);
    findFirst.mockResolvedValue({ slug: "america" });
    let rateCall = 0;
    queryRaw.mockReset().mockImplementation(async () => [{ count: ++rateCall === 1 ? 1 : 4 }]);
    const outcome = await createPublicLead(prisma, input, { ipAddress: "198.51.100.12", rateLimitSecret: "test-secret-with-at-least-32-characters" }).then(() => "resolved", (error) => error);
    expect(outcome).toBeInstanceOf(LeadRateLimitError);
  });
});
