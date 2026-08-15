import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma, PrismaClient } from "@prisma/client";
import { createAfterSalesRequest, getAdminAfterSales, listCustomerAfterSales, updateAfterSalesRequest } from "@/lib/after-sales";
import { getAccountOrder, updateAccountAddress, deleteAccountAddress } from "@/lib/account";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const runId = Date.now().toString(36);
let userId = "";
let foreignUserId = "";
let orderId = "";
let itemId = "";
let addressId = "";
let guestOrderId = "";

integration.sequential("account and after-sales integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
    const product = await prisma.product.create({ data: { slug: `qa-account-${runId}`, name: "QA Account Product", status: "PUBLISHED", isDemo: false } });
    const variant = await prisma.productVariant.create({ data: { productId: product.id, width: 160, length: 200, thickness: 15, sku: `QA-ACCOUNT-${runId}`, price: 100, stock: 2 } });
    const user = await prisma.user.create({ data: { email: `qa-account-${runId}@example.com`, name: "QA Account", phone: "0900000001" } }); userId = user.id;
    const foreign = await prisma.user.create({ data: { email: `qa-foreign-${runId}@example.com`, name: "QA Foreign" } }); foreignUserId = foreign.id;
    const order = await prisma.order.create({ data: { code: `QA-ACCOUNT-${runId}`, userId, customerName: "QA Account", customerPhone: "0900000001", guestEmail: null, shippingAddress: { line1: "Original", province: "Hanoi" } as Prisma.InputJsonValue, subtotal: 100, shippingFee: 0, total: 100, paymentMethod: "COD", paymentStatus: "PENDING", items: { create: { variantId: variant.id, productName: product.name, sku: variant.sku, width: 160, length: 200, thickness: 15, quantity: 1, unitPrice: 100 } } }, include: { items: true } }); orderId = order.id; itemId = order.items[0].id;
    const address = await prisma.address.create({ data: { userId, fullName: "QA Account", phone: "0900000001", line1: "Original address", province: "Hanoi" } }); addressId = address.id; await prisma.order.update({ where: { id: orderId }, data: { addressId } });
    const guest = await prisma.order.create({ data: { code: `QA-GUEST-${runId}`, customerName: "Guest", customerPhone: "0900000002", guestEmail: user.email, shippingAddress: { line1: "Guest", province: "Hanoi" } as Prisma.InputJsonValue, subtotal: 100, shippingFee: 0, total: 100, paymentMethod: "COD", paymentStatus: "PENDING" } }); guestOrderId = guest.id;
  });

  afterAll(async () => {
    await prisma.afterSalesRequest.deleteMany({ where: { userId: { in: [userId, foreignUserId] } } });
    await prisma.order.deleteMany({ where: { id: { in: [orderId, guestOrderId] } } });
    if (addressId) await prisma.address.deleteMany({ where: { id: addressId } });
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

  it("enforces account ownership and keeps the shipping snapshot independent", async () => {
    expect(await getAccountOrder(prisma, foreignUserId, orderId)).toBeNull();
    const original = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { shippingAddress: true } });
    await updateAccountAddress(prisma, userId, addressId, { label: undefined, fullName: "Updated", phone: "0900000001", line1: "Updated address", province: "Hanoi", district: undefined, postalCode: undefined });
    expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { shippingAddress: true } })).shippingAddress).toEqual(original.shippingAddress);
    await expect(updateAccountAddress(prisma, foreignUserId, addressId, { label: undefined, fullName: "No", phone: "0900000001", line1: "No", province: "Hanoi", district: undefined, postalCode: undefined })).rejects.toThrow("NOT_FOUND");
    await expect(deleteAccountAddress(prisma, foreignUserId, addressId)).rejects.toThrow("NOT_FOUND");
    await deleteAccountAddress(prisma, userId, addressId);
    const afterDelete = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { addressId: true, shippingAddress: true } }); expect(afterDelete.addressId).toBeNull(); expect(afterDelete.shippingAddress).toEqual(original.shippingAddress);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: guestOrderId }, select: { userId: true, guestEmail: true } })).userId).toBeNull();
  });
});
