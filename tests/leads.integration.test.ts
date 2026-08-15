import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { POST as postLead } from "@/app/api/leads/route";
import { hashLeadRateLimitKey } from "@/lib/lead-rate-limit";
import { updateLead } from "@/lib/admin-leads";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const runId = Date.now().toString(36);
const publishedSlug = "america";
const draftSlug = "classic";
const leadNamePrefix = `QA Lead ${runId}`;
const rateLimitSecret = process.env.LEAD_RATE_LIMIT_SECRET ?? "test-secret-with-at-least-32-characters";
const touchedHashes = new Set<string>();
let consultationLeadId = "";
let baselineCommerce: { orders: number; payments: number; reservations: number };

function rememberKeys(ip: string, normalizedPhone: string) {
  touchedHashes.add(hashLeadRateLimitKey("IP", ip, rateLimitSecret));
  touchedHashes.add(hashLeadRateLimitKey("PHONE", normalizedPhone, rateLimitSecret));
}

async function submit(payload: Record<string, unknown>, ip: string) {
  const rawPhone = String(payload.phone ?? "");
  const normalizedPhone = rawPhone.trim().startsWith("+") ? "+" + rawPhone.trim().replace(/\D/g, "") : rawPhone.trim().replace(/\D/g, "");
  rememberKeys(ip, normalizedPhone);
  const response = await postLead(new Request("http://localhost/api/leads", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(payload) }));
  return { response, body: await response.json() as Record<string, unknown> };
}

integration.sequential("lead management integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.product.createMany({ data: [
      { slug: publishedSlug, name: "QA Published Product", status: "PUBLISHED", isDemo: false },
      { slug: draftSlug, name: "QA Draft Product", status: "DRAFT", isDemo: false },
    ] });
    baselineCommerce = {
      orders: await prisma.order.count(),
      payments: await prisma.paymentAttempt.count(),
      reservations: await prisma.inventoryReservation.count(),
    };
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { fullName: { startsWith: leadNamePrefix } } });
    if (touchedHashes.size) await prisma.leadRateLimitBucket.deleteMany({ where: { keyHash: { in: [...touchedHashes] } } });
    await prisma.product.deleteMany({ where: { slug: { in: [publishedSlug, draftSlug] } } });
    await prisma.$disconnect();
  });

  it("persists consultation and B2B leads with normalized fields and server sources", async () => {
    const consultation = await submit({ type: "CONSULTATION", fullName: `${leadNamePrefix} Consultation`, phone: "0900 000 001", email: "INTEGRATION@EXAMPLE.COM", productSlug: publishedSlug }, "2001:db8::102");
    expect(consultation.response.status).toBe(201);
    const consultationRecord = await prisma.lead.findFirstOrThrow({ where: { fullName: `${leadNamePrefix} Consultation` } });
    consultationLeadId = consultationRecord.id;
    expect(consultationRecord).toMatchObject({ phone: "0900000001", email: "integration@example.com", source: "CONTACT_PAGE", type: "CONSULTATION", productSlug: publishedSlug });

    const b2b = await submit({ type: "B2B_PROJECT", fullName: `${leadNamePrefix} B2B`, phone: "0900 000 002", organization: "QA Organization", projectLocation: "Hanoi", estimatedQuantity: 12, message: "Project request" }, "2001:db8::103");
    expect(b2b.response.status).toBe(201);
    expect(await prisma.lead.findFirstOrThrow({ where: { fullName: `${leadNamePrefix} B2B` } })).toMatchObject({ phone: "0900000002", source: "B2B_PAGE", type: "B2B_PROJECT", organization: "QA Organization", estimatedQuantity: 12 });
  });

  it("rejects invalid, unpublished-product and honeypot requests without persistence", async () => {
    const invalid = await submit({ type: "CONSULTATION", fullName: `${leadNamePrefix} Invalid`, phone: "0900 000 003", status: "CLOSED" }, "2001:db8::104");
    expect(invalid.response.status).toBe(400);
    const draft = await submit({ type: "CONSULTATION", fullName: `${leadNamePrefix} Draft`, phone: "0900 000 004", productSlug: draftSlug }, "2001:db8::105");
    expect(draft.response.status).toBe(400);
    const honeypot = await submit({ type: "CONSULTATION", fullName: `${leadNamePrefix} Bot`, phone: "0900 000 005", website: "https://bot.invalid" }, "2001:db8::106");
    expect(honeypot.response.status).toBe(200);
    expect(await prisma.lead.count({ where: { fullName: { startsWith: `${leadNamePrefix} Invalid` } } })).toBe(0);
    expect(await prisma.lead.count({ where: { fullName: { startsWith: `${leadNamePrefix} Draft` } } })).toBe(0);
    expect(await prisma.lead.count({ where: { fullName: { startsWith: `${leadNamePrefix} Bot` } } })).toBe(0);
    expect(await prisma.leadRateLimitBucket.count({ where: { keyHash: { in: [hashLeadRateLimitKey("IP", "2001:db8::104", rateLimitSecret), hashLeadRateLimitKey("IP", "2001:db8::105", rateLimitSecret), hashLeadRateLimitKey("IP", "2001:db8::106", rateLimitSecret)] } } })).toBe(0);
  });

  it("enforces the IP bucket atomically under concurrent submissions", async () => {
    const ip = "2001:db8::201";
    const results = await Promise.all(Array.from({ length: 8 }, (_, index) => submit({ type: "CONSULTATION", fullName: `${leadNamePrefix} IP ${index}`, phone: `0900001${String(index).padStart(3, "0")}` }, ip)));
    expect(results.filter((item) => item.response.status === 201)).toHaveLength(5);
    expect(results.filter((item) => item.response.status === 429)).toHaveLength(3);
    const bucket = await prisma.leadRateLimitBucket.findUnique({ where: { kind_keyHash: { kind: "IP", keyHash: hashLeadRateLimitKey("IP", ip, rateLimitSecret) } } });
    expect(bucket?.count).toBe(5);
  });

  it("enforces the phone bucket atomically under concurrent submissions", async () => {
    const sharedPhone = "0900000999";
    const results = await Promise.all(Array.from({ length: 6 }, (_, index) => submit({ type: "CONSULTATION", fullName: `${leadNamePrefix} Phone ${index}`, phone: sharedPhone }, `2001:db8::3${index + 1}`)));
    expect(results.filter((item) => item.response.status === 201)).toHaveLength(3);
    expect(results.filter((item) => item.response.status === 429)).toHaveLength(3);
    const bucket = await prisma.leadRateLimitBucket.findUnique({ where: { kind_keyHash: { kind: "PHONE", keyHash: hashLeadRateLimitKey("PHONE", sharedPhone, rateLimitSecret) } } });
    expect(bucket?.count).toBe(3);
  });

  it("supports linear and reopen transitions, rejects invalid and stale writes", async () => {
    const current = await prisma.lead.findUniqueOrThrow({ where: { id: consultationLeadId } });
    const inProgress = await updateLead(prisma, consultationLeadId, { status: "IN_PROGRESS", internalNote: "triage", updatedAt: current.updatedAt.toISOString() });
    const closed = await updateLead(prisma, consultationLeadId, { status: "CLOSED", internalNote: "closed", updatedAt: inProgress.updatedAt.toISOString() });
    const reopened = await updateLead(prisma, consultationLeadId, { status: "IN_PROGRESS", internalNote: "reopened", updatedAt: closed.updatedAt.toISOString() });
    expect(reopened.status).toBe("IN_PROGRESS");
    await expect(updateLead(prisma, consultationLeadId, { status: "NEW", internalNote: "invalid", updatedAt: reopened.updatedAt.toISOString() })).rejects.toThrow("INVALID_TRANSITION");
    await expect(updateLead(prisma, consultationLeadId, { status: "CLOSED", internalNote: "stale", updatedAt: current.updatedAt.toISOString() })).rejects.toThrow("STALE");
  });

  it("does not create commerce records for lead submissions", async () => {
    expect(await prisma.order.count()).toBe(baselineCommerce.orders);
    expect(await prisma.paymentAttempt.count()).toBe(baselineCommerce.payments);
    expect(await prisma.inventoryReservation.count()).toBe(baselineCommerce.reservations);
  });
});
