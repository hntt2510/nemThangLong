import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { publicLeadSchema } from "@/lib/lead-validation";
import { createPublicLead } from "@/lib/leads";
import { updateLead } from "@/lib/admin-leads";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const phone = `+849${String(Date.now()).slice(-8)}`;
const leadIds: string[] = [];

integration.sequential("lead management integration", () => {
  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { if (leadIds.length) await prisma.lead.deleteMany({ where: { id: { in: leadIds } } }); await prisma.$disconnect(); });

  it("persists normalized consultation data and supports optimistic admin update", async () => {
    const input = publicLeadSchema.parse({ type: "CONSULTATION", fullName: "Integration Buyer", phone, email: "INTEGRATION@EXAMPLE.COM", message: "QA" });
    const created = await createPublicLead(prisma, input);
    leadIds.push(created.id);
    expect(created.phone).toBe(phone);
    expect(created.email).toBe("integration@example.com");
    const updated = await updateLead(prisma, created.id, { status: "IN_PROGRESS", internalNote: "Reviewed", updatedAt: created.updatedAt.toISOString() });
    expect(updated.status).toBe("IN_PROGRESS");
    await expect(updateLead(prisma, created.id, { status: "CLOSED", internalNote: "stale", updatedAt: created.updatedAt.toISOString() })).rejects.toThrow("STALE");
  });

  it("enforces the normalized phone throttle", async () => {
    const input = publicLeadSchema.parse({ type: "CONSULTATION", fullName: "Integration Buyer", phone });
    for (let index = 0; index < 2; index += 1) leadIds.push((await createPublicLead(prisma, input)).id);
    await expect(createPublicLead(prisma, input)).rejects.toThrow("Vui lòng thử lại sau.");
  });
});
