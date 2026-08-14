import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient, Prisma } from "@prisma/client";
import { applyMomoIpn, releaseExpiredReservations } from "../lib/payment-lifecycle";

if (process.env.RUN_INTEGRATION === "true" && !process.env.DATABASE_URL) throw new Error("RUN_INTEGRATION requires DATABASE_URL");
const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const createdProductIds: string[] = [];
let sequence = 0;

async function createScenario(paymentMethod: "BANK_TRANSFER" | "MOMO", expiresAt: Date) {
  sequence += 1;
  const code = `QA-LIFECYCLE-${Date.now()}-${sequence}`;
  const product = await prisma.product.create({ data: { slug: `qa-lifecycle-${Date.now()}-${sequence}`, name: "QA Lifecycle Product", status: "PUBLISHED", isDemo: false } });
  createdProductIds.push(product.id);
  const variant = await prisma.productVariant.create({ data: { productId: product.id, width: 160, length: 200, thickness: 15, price: 100, sku: `QA-LIFECYCLE-SKU-${Date.now()}-${sequence}`, stock: 0, active: true } });
  return prisma.order.create({ data: { code, customerName: "QA", customerPhone: "0900000000", guestEmail: "qa@example.com", shippingAddress: { line1: "QA", province: "Hanoi" } as Prisma.InputJsonValue, subtotal: 100, shippingFee: 0, total: 100, status: "PENDING", paymentMethod, paymentStatus: "PENDING", items: { create: { variantId: variant.id, productName: product.name, sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: 1, unitPrice: 100 } }, payments: { create: { provider: paymentMethod, providerOrderId: code, amount: 100, expiresAt } }, reservations: { create: { variantId: variant.id, quantity: 1, expiresAt } } } });
}

integration.sequential("payment lifecycle integration", () => {
  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.order.deleteMany({ where: { code: { startsWith: "QA-LIFECYCLE-" } } }); if (createdProductIds.length) await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } }); await prisma.$disconnect(); });

  it("commits an active MoMo reservation and is idempotent", async () => {
    const now = new Date(Date.now() + 60_000); const order = await createScenario("MOMO", new Date(now.getTime() + 60 * 60 * 1000));
    expect(await applyMomoIpn(prisma, { orderCode: order.code, amount: 100, resultCode: 0, transactionId: `tx-${order.code}`, rawResponse: { resultCode: 0 } }, now)).toBe("paid");
    expect(await applyMomoIpn(prisma, { orderCode: order.code, amount: 100, resultCode: 0, transactionId: `tx-${order.code}`, rawResponse: { resultCode: 0 } }, now)).toBe("ignored");
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true } });
    expect(saved.paymentStatus).toBe("PAID"); expect(saved.status).toBe("CONFIRMED"); expect(saved.payments[0].status).toBe("PAID"); expect(saved.reservations[0].status).toBe("COMMITTED");
  });

  it("releases expired bank inventory and marks its payment attempt failed", async () => {
    const now = new Date(); const order = await createScenario("BANK_TRANSFER", new Date(now.getTime() - 1_000));
    expect((await releaseExpiredReservations(prisma, now)).released).toBe(1);
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true, items: true } });
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: saved.items[0].variantId } });
    expect(saved.paymentStatus).toBe("FAILED"); expect(saved.status).toBe("CANCELLED"); expect(saved.payments[0].status).toBe("FAILED"); expect(saved.reservations[0].status).toBe("RELEASED"); expect(variant.stock).toBe(1);
    expect((await releaseExpiredReservations(prisma, now)).released).toBe(0);
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(1);
  });

  it("records a verified late MoMo success for manual review without reacquiring stock", async () => {
    const now = new Date(); const order = await createScenario("MOMO", new Date(now.getTime() - 1_000));
    await releaseExpiredReservations(prisma, now);
    expect(await applyMomoIpn(prisma, { orderCode: order.code, amount: 100, resultCode: 0, transactionId: `late-${order.code}`, rawResponse: { resultCode: 0 } }, now)).toBe("review_required");
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true, items: true } });
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: saved.items[0].variantId } });
    expect(saved.paymentStatus).toBe("REVIEW_REQUIRED"); expect(saved.status).toBe("CANCELLED"); expect(saved.payments[0].status).toBe("REVIEW_REQUIRED"); expect(saved.payments[0].providerTransactionId).toBe(`late-${order.code}`); expect(variant.stock).toBe(1);
    expect(await applyMomoIpn(prisma, { orderCode: order.code, amount: 100, resultCode: 0, transactionId: `late-${order.code}`, rawResponse: { resultCode: 0 } }, now)).toBe("ignored");
  });

  it("resolves the cron/IPN expiry race to one terminal outcome", async () => {
    const now = new Date(); const order = await createScenario("MOMO", new Date(now.getTime() - 1_000));
    await Promise.all([releaseExpiredReservations(prisma, now), applyMomoIpn(prisma, { orderCode: order.code, amount: 100, resultCode: 0, transactionId: `race-${order.code}`, rawResponse: { resultCode: 0 } }, now)]);
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true, items: true } });
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: saved.items[0].variantId } });
    expect(["FAILED", "REVIEW_REQUIRED"]).toContain(saved.paymentStatus); expect(["FAILED", "REVIEW_REQUIRED"]).toContain(saved.payments[0].status); expect(saved.reservations[0].status).not.toBe("ACTIVE"); expect(variant.stock).toBe(1);
  });
});
