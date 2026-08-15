import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma, PrismaClient } from "@prisma/client";
import { adjustInventory } from "@/lib/inventory-admin";
import { decrementCheckoutStock } from "@/lib/checkout-stock";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const runId = Date.now().toString(36);
let productId = "";
let variantId = "";
let actorId = "";
const orderCodes: string[] = [];

integration.sequential("inventory adjustment integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
    const product = await prisma.product.create({ data: { slug: `qa-inventory-${runId}`, name: "QA Inventory", status: "PUBLISHED", isDemo: false } }); productId = product.id;
    const variant = await prisma.productVariant.create({ data: { productId, width: 160, length: 200, thickness: 15, sku: `QA-INVENTORY-${runId}`, price: 100, stock: 5, active: true } }); variantId = variant.id;
    const actor = await prisma.user.create({ data: { email: `qa-inventory-${runId}@example.com`, role: "ADMIN" } }); actorId = actor.id;
  });

  afterAll(async () => {
    await prisma.inventoryAdjustment.deleteMany({ where: { variantId } });
    await prisma.order.deleteMany({ where: { code: { in: orderCodes } } });
    if (actorId) await prisma.user.delete({ where: { id: actorId } });
    if (productId) await prisma.product.delete({ where: { id: productId } });
    await prisma.$disconnect();
  });

  it("persists receipt and correction audits with resulting stock", async () => {
    const receipt = await adjustInventory(prisma, actorId, { variantId, delta: 10, reason: "RECEIPT" });
    expect(receipt.resultingStock).toBe(15);
    const correction = await adjustInventory(prisma, actorId, { variantId, delta: -3, reason: "CORRECTION" });
    expect(correction.resultingStock).toBe(12);
    const rows = await prisma.inventoryAdjustment.findMany({ where: { variantId }, orderBy: { createdAt: "asc" } });
    expect(rows.map((row) => [row.delta, row.resultingStock])).toEqual([[10, 15], [-3, 12]]);
  });

  it("rolls back an insufficient negative adjustment without an audit", async () => {
    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 2 } });
    const before = await prisma.inventoryAdjustment.count({ where: { variantId } });
    await expect(adjustInventory(prisma, actorId, { variantId, delta: -3, reason: "DAMAGE" })).rejects.toThrow("INSUFFICIENT_STOCK");
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).stock).toBe(2);
    expect(await prisma.inventoryAdjustment.count({ where: { variantId } })).toBe(before);
  });

  it("serializes checkout decrement and manual adjustment without negative stock or silent order creation", async () => {
    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 1 } });
    const code = `QA-INVENTORY-ORDER-${runId}`; orderCodes.push(code);
    const checkout = prisma.$transaction(async (tx) => { await decrementCheckoutStock(tx, [{ variantId, quantity: 1 }]); return tx.order.create({ data: { code, customerName: "QA", customerPhone: "0900000000", guestEmail: "qa@example.com", shippingAddress: { line1: "QA", province: "Hanoi" } as Prisma.InputJsonValue, subtotal: 100, shippingFee: 0, total: 100, paymentMethod: "COD", paymentStatus: "PENDING", status: "CONFIRMED" } }); });
    const adjustment = adjustInventory(prisma, actorId, { variantId, delta: -1, reason: "DAMAGE" });
    const outcomes = await Promise.allSettled([checkout, adjustment]);
    const savedVariant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(savedVariant.stock).toBeGreaterThanOrEqual(0);
    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
    const orderCount = await prisma.order.count({ where: { code } });
    expect(orderCount).toBe(outcomes[0].status === "fulfilled" ? 1 : 0);
    const audits = await prisma.inventoryAdjustment.findMany({ where: { variantId, reason: "DAMAGE" } });
    expect(audits.every((audit) => audit.resultingStock >= 0)).toBe(true);
  });

  it("keeps concurrent positive receipts additive", async () => {
    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 0 } });
    const before = await prisma.inventoryAdjustment.count({ where: { variantId } });
    await Promise.all([
      adjustInventory(prisma, actorId, { variantId, delta: 10, reason: "RECEIPT" }),
      adjustInventory(prisma, actorId, { variantId, delta: 7, reason: "RECEIPT" }),
    ]);
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).stock).toBe(17);
    expect(await prisma.inventoryAdjustment.count({ where: { variantId } })).toBe(before + 2);
  });
});
