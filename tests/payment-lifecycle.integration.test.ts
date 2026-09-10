import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient, Prisma } from "@prisma/client";
import { applySePayWebhook, releaseExpiredReservations } from "../lib/payment-lifecycle";

if (process.env.RUN_INTEGRATION === "true" && !process.env.DATABASE_URL) throw new Error("RUN_INTEGRATION requires DATABASE_URL");
const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const createdProductIds: string[] = [];
let sequence = 0;
const runId = Date.now().toString(36);

async function createScenario(expiresAt: Date) {
  sequence += 1;
  const suffix = `${Date.now()}-${sequence}`;
  const paymentCode = `NEMQA${suffix.replace(/\D/g, "").slice(-12)}`;
  const product = await prisma.product.create({ data: { slug: `qa-sepay-${suffix}`, name: "QA SePay Product", status: "PUBLISHED", isDemo: false } });
  createdProductIds.push(product.id);
  const variant = await prisma.productVariant.create({ data: { productId: product.id, width: 160, length: 200, thickness: 15, price: 100, sku: `QA-SEPAY-${suffix}`, stock: 0, active: true } });
  const order = await prisma.order.create({ data: {
    code: `QA-SEPAY-${suffix}`, customerName: "QA", customerPhone: "0900000000", guestEmail: "qa@example.com", shippingAddress: { line1: "QA", province: "Hanoi" } as Prisma.InputJsonValue,
    subtotal: 100, shippingFee: 0, total: 100, status: "PENDING", paymentMethod: "SEPAY", paymentStatus: "PENDING",
    items: { create: { variantId: variant.id, productName: product.name, sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: 1, unitPrice: 100 } },
    payments: { create: { provider: "SEPAY", providerOrderId: paymentCode, amount: 100, expiresAt, recipientBank: "Vietcombank", recipientAccountNumber: "1234567890", recipientAccountName: "CONG TY TEST" } },
    reservations: { create: { variantId: variant.id, quantity: 1, expiresAt } },
  }, include: { payments: true } });
  return { order, variant, paymentCode };
}

function webhook(transactionId: string, paymentCode: string | null, overrides: Partial<{ amount: number; transferType: "in" | "out"; gateway: string; accountNumber: string }> = {}) {
  return { transactionId, paymentCode, amount: 100, transferType: "in" as const, gateway: "Vietcombank", accountNumber: "1234567890", payload: { id: Number(transactionId.replace(/\D/g, "").slice(-8)) || 1 }, ...overrides };
}

integration.sequential("SePay payment lifecycle integration", () => {
  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.sePayWebhookReceipt.deleteMany({ where: { order: { code: { startsWith: "QA-SEPAY-" } } } }); await prisma.order.deleteMany({ where: { code: { startsWith: "QA-SEPAY-" } } }); if (createdProductIds.length) await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } }); await prisma.$disconnect(); });

  it("confirms an exact incoming transaction once and commits its reservation", async () => {
    const now = new Date(); const { order, paymentCode } = await createScenario(new Date(now.getTime() + 60_000));
    expect(await applySePayWebhook(prisma, webhook(`${runId}-100${sequence}`, paymentCode), now)).toBe("paid");
    expect(await applySePayWebhook(prisma, webhook(`${runId}-100${sequence}`, paymentCode), now)).toBe("duplicate");
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true } });
    expect(saved.paymentStatus).toBe("PAID"); expect(saved.status).toBe("CONFIRMED"); expect(saved.payments[0].status).toBe("PAID"); expect(saved.reservations[0].status).toBe("COMMITTED");
  });

  it("never pays wrong amount, code, or outgoing transaction", async () => {
    const now = new Date(); const { order, paymentCode } = await createScenario(new Date(now.getTime() + 60_000));
    expect(await applySePayWebhook(prisma, webhook(`${runId}-200${sequence}`, paymentCode, { amount: 99 }), now)).toBe("ignored");
    expect(await applySePayWebhook(prisma, webhook(`${runId}-201${sequence}`, "NEMWRONG"), now)).toBe("ignored");
    expect(await applySePayWebhook(prisma, webhook(`${runId}-202${sequence}`, paymentCode, { transferType: "out" }), now)).toBe("ignored");
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).paymentStatus).toBe("PENDING");
  });

  it("records a new transaction against an already-paid order without changing inventory", async () => {
    const now = new Date(); const { order, paymentCode } = await createScenario(new Date(now.getTime() + 60_000));
    expect(await applySePayWebhook(prisma, webhook(`${runId}-300${sequence}`, paymentCode), now)).toBe("paid");
    expect(await applySePayWebhook(prisma, webhook(`${runId}-301${sequence}`, paymentCode), now)).toBe("already_paid");
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).paymentStatus).toBe("PAID");
  });

  it("moves a verified late transaction to payment review after expiry", async () => {
    const now = new Date(); const { order, paymentCode, variant } = await createScenario(new Date(now.getTime() - 1_000));
    await releaseExpiredReservations(prisma, now);
    expect(await applySePayWebhook(prisma, webhook(`${runId}-400${sequence}`, paymentCode), now)).toBe("review_required");
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true } });
    expect(saved.paymentStatus).toBe("REVIEW_REQUIRED"); expect(saved.payments[0].status).toBe("REVIEW_REQUIRED"); expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(1);
  });
});
