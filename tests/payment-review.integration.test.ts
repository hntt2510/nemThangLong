import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { paymentReviewResolutionSchema, resolvePaymentReview } from "@/lib/payment-review";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const runId = Date.now().toString(36);
let userId = "";
const orderIds: string[] = [];
const productIds: string[] = [];

async function fixture(label: string, stocks: number[], quantities: number[]) {
  const user = userId ? await prisma.user.findUniqueOrThrow({ where: { id: userId } }) : await prisma.user.create({ data: { email: `qa-review-${runId}@example.com`, role: "ADMIN" } }); userId = user.id;
  const variants = [];
  for (let index = 0; index < stocks.length; index += 1) { const product = await prisma.product.create({ data: { slug: `qa-review-${runId}-${label}-${index}`, name: `QA Review ${label}`, status: "PUBLISHED", isDemo: false } }); productIds.push(product.id); variants.push(await prisma.productVariant.create({ data: { productId: product.id, width: 160 + index * 20, length: 200, thickness: 15, sku: `QA-REVIEW-${runId}-${label}-${index}`, price: 100, stock: stocks[index], active: true } })); }
  const code = `QA-REVIEW-${runId}-${label}`;
  const total = quantities.reduce((sum, quantity) => sum + 100 * quantity, 0);
  const order = await prisma.order.create({ data: { code, userId: user.id, customerName: "QA Review", customerPhone: "0900000000", shippingAddress: { line1: "QA", province: "Hanoi" }, subtotal: total, shippingFee: 0, total, status: "CANCELLED", paymentMethod: "MOMO", paymentStatus: "REVIEW_REQUIRED", items: { create: variants.map((variant, index) => ({ variantId: variant.id, productName: "QA Review", sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: quantities[index], unitPrice: 100 })) }, payments: { create: { provider: "MOMO", providerOrderId: code, providerTransactionId: `QA-TX-${runId}-${label}`, amount: total, status: "REVIEW_REQUIRED", expiresAt: new Date(Date.now() + 1800000) } }, reservations: { create: variants.map((variant, index) => ({ variantId: variant.id, quantity: quantities[index], expiresAt: new Date(Date.now() - 1000), status: "RELEASED", releasedAt: new Date() })) } } }); orderIds.push(order.id); return { order, variants };
}

integration.sequential("payment review integration", () => {
  beforeAll(() => prisma.$connect());
  afterAll(async () => { await prisma.paymentReviewResolution.deleteMany({ where: { orderId: { in: orderIds } } }); await prisma.order.deleteMany({ where: { id: { in: orderIds } } }); await prisma.product.deleteMany({ where: { id: { in: productIds } } }); if (userId) await prisma.user.delete({ where: { id: userId } }); await prisma.$disconnect(); });

  it("fulfills once and keeps released reservations", async () => {
    const { order, variants } = await fixture("fulfill", [5], [2]);
    const result = await resolvePaymentReview(prisma, userId, order.id, { action: "FULFILL" }); expect(result.action).toBe("FULFILL");
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variants[0].id } })).stock).toBe(3);
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, reservations: true } }); expect(saved.status).toBe("CONFIRMED"); expect(saved.paymentStatus).toBe("PAID"); expect(saved.payments[0].status).toBe("PAID"); expect(saved.reservations[0].status).toBe("RELEASED");
    await expect(resolvePaymentReview(prisma, userId, order.id, { action: "FULFILL" })).rejects.toThrow("ALREADY_RESOLVED"); expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variants[0].id } })).stock).toBe(3);
  });

  it("rolls back all item stock on insufficient multi-item fulfillment", async () => {
    const { order, variants } = await fixture("insufficient", [5, 0], [2, 1]); await expect(resolvePaymentReview(prisma, userId, order.id, { action: "FULFILL" })).rejects.toThrow("INSUFFICIENT_STOCK"); expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variants[0].id } })).stock).toBe(5); expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variants[1].id } })).stock).toBe(0); expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).paymentStatus).toBe("REVIEW_REQUIRED"); expect(await prisma.paymentReviewResolution.count({ where: { orderId: order.id } })).toBe(0);
  });

  it("requires confirmation for manual refund and does not touch stock", async () => {
    const { order, variants } = await fixture("refund", [4], [1]); await expect(resolvePaymentReview(prisma, userId, order.id, { action: "MANUAL_REFUND_RECORDED", note: "external ref" })).rejects.toThrow(); expect(paymentReviewResolutionSchema.safeParse({ action: "MANUAL_REFUND_RECORDED", confirmation: true, note: "external ref" }).success).toBe(true); await resolvePaymentReview(prisma, userId, order.id, { action: "MANUAL_REFUND_RECORDED", confirmation: true, note: "external ref" }); expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variants[0].id } })).stock).toBe(4); const saved = await prisma.order.findUniqueOrThrow({ where: { id: order.id, paymentStatus: "REFUNDED" }, include: { payments: true } }); expect(saved.status).toBe("CANCELLED"); expect(saved.payments[0].status).toBe("REFUNDED");
  });
});
