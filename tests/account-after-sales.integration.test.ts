import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma, PrismaClient } from "@prisma/client";
import { createAfterSalesRequest, getAdminAfterSales, listCustomerAfterSales, updateAfterSalesRequest } from "@/lib/after-sales";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const runId = Date.now().toString(36);
let userId = "";
let foreignUserId = "";
let orderId = "";
let itemId = "";

integration.sequential("account and after-sales integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
    const product = await prisma.product.create({ data: { slug: `qa-account-${runId}`, name: "QA Account Product", status: "PUBLISHED", isDemo: false } });
    const variant = await prisma.productVariant.create({ data: { productId: product.id, width: 160, length: 200, thickness: 15, sku: `QA-ACCOUNT-${runId}`, price: 100, stock: 2 } });
    const user = await prisma.user.create({ data: { email: `qa-account-${runId}@example.com`, name: "QA Account", phone: "0900000001" } }); userId = user.id;
    const foreign = await prisma.user.create({ data: { email: `qa-foreign-${runId}@example.com`, name: "QA Foreign" } }); foreignUserId = foreign.id;
    const order = await prisma.order.create({ data: { code: `QA-ACCOUNT-${runId}`, userId, customerName: "QA Account", customerPhone: "0900000001", guestEmail: null, shippingAddress: { line1: "Original", province: "Hanoi" } as Prisma.InputJsonValue, subtotal: 100, shippingFee: 0, total: 100, paymentMethod: "COD", paymentStatus: "PENDING", items: { create: { variantId: variant.id, productName: product.name, sku: variant.sku, width: 160, length: 200, thickness: 15, quantity: 1, unitPrice: 100 } } }, include: { items: true } }); orderId = order.id; itemId = order.items[0].id;
  });

  afterAll(async () => {
    await prisma.afterSalesRequest.deleteMany({ where: { userId: { in: [userId, foreignUserId] } } });
    await prisma.order.deleteMany({ where: { id: orderId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, foreignUserId] } } });
    await prisma.product.deleteMany({ where: { slug: `qa-account-${runId}` } });
    await prisma.$disconnect();
  });

  it("scopes create/read to the owning order item and hides internal notes", async () => {
    await expect(createAfterSalesRequest(prisma, foreignUserId, { orderId, orderItemId: itemId, type: "WARRANTY_REVIEW", subject: "Foreign", description: "This must not be accepted." })).rejects.toThrow("NOT_FOUND");
    const created = await createAfterSalesRequest(prisma, userId, { orderId, orderItemId: itemId, type: "PRODUCT_SUPPORT", subject: "Support", description: "Please inspect this product." });
    const customer = await listCustomerAfterSales(prisma, userId);
    expect(customer[0]).not.toHaveProperty("internalNote"); expect(created.status).toBe("SUBMITTED");
    const current = await prisma.afterSalesRequest.findUniqueOrThrow({ where: { id: created.id } });
    const updated = await updateAfterSalesRequest(prisma, created.id, { status: "REVIEWING", internalNote: "Private triage", updatedAt: current.updatedAt.toISOString() });
    expect(updated.status).toBe("REVIEWING");
    await expect(updateAfterSalesRequest(prisma, created.id, { status: "SUBMITTED", internalNote: "bad", updatedAt: updated.updatedAt.toISOString() })).rejects.toThrow("INVALID_TRANSITION");
    expect((await getAdminAfterSales(prisma, created.id))?.internalNote).toBe("Private triage");
  });
});
