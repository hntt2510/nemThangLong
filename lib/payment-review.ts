import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { withSerializable } from "@/lib/transaction";

export const paymentReviewResolutionSchema = z.object({ action: z.enum(["FULFILL", "MANUAL_REFUND_RECORDED"]), confirmation: z.literal(true).optional(), note: z.string().trim().min(2).max(2000).optional() }).strict().superRefine((value, context) => { if (value.action === "MANUAL_REFUND_RECORDED" && (value.confirmation !== true || !value.note)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmation"], message: "Explicit confirmation and note are required." }); });

const reviewSelect = { id: true, code: true, total: true, status: true, paymentStatus: true, customerName: true, customerPhone: true, guestEmail: true, createdAt: true, items: { select: { id: true, variantId: true, productName: true, sku: true, width: true, length: true, thickness: true, quantity: true, variant: { select: { stock: true } } } }, payments: { where: { provider: "MOMO" }, orderBy: { createdAt: "desc" }, take: 1, select: { id: true, status: true, amount: true, providerTransactionId: true, expiresAt: true, updatedAt: true } }, reservations: { select: { id: true, variantId: true, quantity: true, status: true, expiresAt: true, releasedAt: true } } } satisfies Prisma.OrderSelect;

export function maskReviewContact(value: string | null | undefined) { if (!value) return null; if (value.includes("@")) { const [name, domain] = value.split("@"); return `${name.slice(0, 1)}***@${domain}`; } return `${value.slice(0, 3)}***${value.slice(-2)}`; }

export async function listPaymentReviews(prisma: PrismaClient) {
  const rows = await prisma.order.findMany({ where: { paymentMethod: "MOMO", paymentStatus: "REVIEW_REQUIRED" }, orderBy: { updatedAt: "desc" }, take: 50, select: reviewSelect });
  return rows.map((row) => ({ ...row, customerPhone: maskReviewContact(row.customerPhone), guestEmail: maskReviewContact(row.guestEmail) }));
}

export async function getPaymentReview(prisma: PrismaClient, id: string) {
  return prisma.order.findFirst({ where: { id, paymentMethod: "MOMO", paymentStatus: "REVIEW_REQUIRED" }, select: reviewSelect });
}

export async function resolvePaymentReview(prisma: PrismaClient, actorId: string, orderId: string, input: unknown) {
  const parsed = paymentReviewResolutionSchema.parse(input);
  return withSerializable(prisma, async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, payments: { where: { provider: "MOMO" }, orderBy: { createdAt: "desc" }, take: 1 }, reservations: true } });
    if (!order || order.paymentMethod !== "MOMO") throw new Error("NOT_FOUND");
    if (await tx.paymentReviewResolution.findFirst({ where: { orderId: order.id } })) throw new Error("ALREADY_RESOLVED");
    const attempt = order.payments[0];
    if (!attempt || attempt.status !== "REVIEW_REQUIRED" || !attempt.providerTransactionId || order.paymentStatus !== "REVIEW_REQUIRED" || order.status !== "CANCELLED") throw new Error("INVALID_STATE");
    if (parsed.action === "MANUAL_REFUND_RECORDED") {
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "REFUNDED" } });
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED", status: "CANCELLED" } });
      return tx.paymentReviewResolution.create({ data: { orderId: order.id, paymentAttemptId: attempt.id, action: "MANUAL_REFUND_RECORDED", actorId, note: parsed.note! }, select: { id: true, action: true, createdAt: true } });
    }
    if (!order.reservations.length || order.reservations.some((reservation) => reservation.status !== "RELEASED")) throw new Error("INVALID_RESERVATIONS");
    const quantities = new Map<string, number>(); for (const item of order.items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
    for (const [variantId, quantity] of quantities) { const updated = await tx.productVariant.updateMany({ where: { id: variantId, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } }); if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK"); }
    await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "PAID" } });
    await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
    return tx.paymentReviewResolution.create({ data: { orderId: order.id, paymentAttemptId: attempt.id, action: "FULFILL", actorId, note: parsed.note ?? null }, select: { id: true, action: true, createdAt: true } });
  });
}
