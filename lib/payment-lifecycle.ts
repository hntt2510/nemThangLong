import "server-only";

import { Prisma, type PaymentStatus, type PrismaClient } from "@prisma/client";
import { withSerializable } from "@/lib/transaction";

export const MOMO_PENDING_CODES = new Set([1000, 9000]);

export function getPaymentExpiry(paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO", now = new Date(), bankTransferReservationMinutes?: number | null) {
  if (paymentMethod === "MOMO") return new Date(now.getTime() + 30 * 60 * 1000);
  if (paymentMethod === "BANK_TRANSFER" && bankTransferReservationMinutes && bankTransferReservationMinutes >= 5 && bankTransferReservationMinutes <= 10080) return new Date(now.getTime() + bankTransferReservationMinutes * 60 * 1000);
  return null;
}

type Tx = Prisma.TransactionClient;

export type MomoPaymentSnapshot = {
  orderStatus: string;
  orderPaymentStatus: PaymentStatus;
  attemptStatus: PaymentStatus;
  attemptExpiresAt: Date | null;
  reservations: Array<{ status: string; expiresAt: Date }>;
};

export function canStartMomoPayment(snapshot: MomoPaymentSnapshot, now = new Date()) {
  return snapshot.orderStatus === "PENDING"
    && snapshot.orderPaymentStatus === "PENDING"
    && snapshot.attemptStatus === "PENDING"
    && Boolean(snapshot.attemptExpiresAt && snapshot.attemptExpiresAt > now)
    && snapshot.reservations.length > 0
    && snapshot.reservations.every((reservation) => reservation.status === "ACTIVE" && reservation.expiresAt > now);
}

async function releaseReservationsForOrder(tx: Tx, orderId: string, now: Date, onlyExpired: boolean) {
  const reservations = await tx.inventoryReservation.findMany({ where: { orderId, status: "ACTIVE", ...(onlyExpired ? { expiresAt: { lte: now } } : {}) } });
  let releasedCount = 0;
  for (const reservation of reservations) {
    const released = await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE" }, data: { status: "RELEASED", releasedAt: now } });
    if (released.count === 1) {
      releasedCount += 1;
      await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } });
    }
  }
  return releasedCount;
}

async function commitReservationsForOrder(tx: Tx, orderId: string, now: Date) {
  const reservations = await tx.inventoryReservation.findMany({ where: { orderId } });
  if (!reservations.length || reservations.some((reservation) => reservation.status !== "ACTIVE" || reservation.expiresAt <= now)) return false;
  for (const reservation of reservations) {
    const committed = await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE", expiresAt: { gt: now } }, data: { status: "COMMITTED", committedAt: now } });
    if (committed.count !== 1) return false;
  }
  return true;
}

export async function releaseExpiredReservations(prisma: PrismaClient, now = new Date()) {
  const candidates = await prisma.inventoryReservation.findMany({ where: { status: "ACTIVE", expiresAt: { lte: now } }, select: { orderId: true } });
  const orderIds = [...new Set(candidates.map((reservation) => reservation.orderId))];
  let released = 0;
  for (const orderId of orderIds) {
    released += await withSerializable(prisma, async (tx) => {
      const releasedForOrder = await releaseReservationsForOrder(tx, orderId, now, false);
      if (!releasedForOrder) return 0;
      const remaining = await tx.inventoryReservation.count({ where: { orderId, status: "ACTIVE" } });
      if (remaining === 0) {
        await tx.paymentAttempt.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "FAILED" } });
        await tx.order.updateMany({ where: { id: orderId, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
      }
      return releasedForOrder;
    });
  }
  return { released };
}

export type MomoIpnResult = "ignored" | "pending" | "paid" | "failed" | "review_required";

export async function applyMomoIpn(
  prisma: PrismaClient,
  input: { orderCode: string; amount: number; resultCode: number; transactionId: string; rawResponse: Prisma.InputJsonValue },
  now = new Date(),
): Promise<MomoIpnResult> {
  return withSerializable(prisma, async (tx) => {
    const order = await tx.order.findUnique({ where: { code: input.orderCode }, include: { payments: { where: { provider: "MOMO" }, orderBy: { createdAt: "desc" }, take: 1 }, reservations: true } });
    if (!order || order.total !== input.amount || order.paymentMethod !== "MOMO") return "ignored";
    const attempt = order.payments[0];
    if (!attempt || attempt.status === "PAID" || attempt.status === "REFUNDED" || order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") return "ignored";
    if (attempt.status === "REVIEW_REQUIRED" || order.paymentStatus === "REVIEW_REQUIRED") return "ignored";
    if (MOMO_PENDING_CODES.has(input.resultCode)) {
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { lastResultCode: input.resultCode, rawResponse: input.rawResponse } });
      return "pending";
    }
    if (input.resultCode === 0) {
      const eligible = canStartMomoPayment({ orderStatus: order.status, orderPaymentStatus: order.paymentStatus, attemptStatus: attempt.status, attemptExpiresAt: attempt.expiresAt, reservations: order.reservations }, now);
      if (eligible && await commitReservationsForOrder(tx, order.id, now)) {
        await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "PAID", lastResultCode: 0, providerTransactionId: input.transactionId, rawResponse: input.rawResponse } });
        await tx.order.updateMany({ where: { id: order.id, paymentStatus: "PENDING", status: "PENDING" }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
        return "paid";
      }
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "REVIEW_REQUIRED", lastResultCode: 0, providerTransactionId: input.transactionId, rawResponse: input.rawResponse } });
      await releaseReservationsForOrder(tx, order.id, now, false);
      await tx.order.updateMany({ where: { id: order.id, paymentStatus: { not: "PAID" } }, data: { paymentStatus: "REVIEW_REQUIRED", status: "CANCELLED" } });
      return "review_required";
    }
    await tx.paymentAttempt.updateMany({ where: { id: attempt.id, status: "PENDING" }, data: { status: "FAILED", lastResultCode: input.resultCode, rawResponse: input.rawResponse } });
    await releaseReservationsForOrder(tx, order.id, now, false);
    await tx.order.updateMany({ where: { id: order.id, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
    return "failed";
  });
}

export async function confirmBankTransfer(prisma: PrismaClient, orderId: string, now = new Date()) {
  return withSerializable(prisma, async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { reservations: true } });
    if (!order) throw new Error("NOT_FOUND");
    if (order.paymentMethod !== "BANK_TRANSFER" || order.paymentStatus !== "PENDING" || order.status !== "PENDING") throw new Error("INVALID_STATE");
    if (!(await commitReservationsForOrder(tx, order.id, now))) throw new Error("EXPIRED");
    await tx.paymentAttempt.updateMany({ where: { orderId: order.id, provider: "BANK_TRANSFER", status: "PENDING" }, data: { status: "PAID" } });
    return tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
  });
}

export async function cancelOrder(prisma: PrismaClient, orderId: string, now = new Date()) {
  return withSerializable(prisma, async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, reservations: true } });
    if (!order) throw new Error("NOT_FOUND");
    if (order.status === "CANCELLED") return order;
    if (order.paymentStatus === "PAID" || order.paymentStatus === "REVIEW_REQUIRED" || order.paymentStatus === "REFUNDED") throw new Error("INVALID_STATE");
    const activeReservations = order.reservations.filter((reservation) => reservation.status === "ACTIVE");
    if (activeReservations.length) {
      for (const reservation of activeReservations) {
        const released = await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE" }, data: { status: "RELEASED", releasedAt: now } });
        if (released.count === 1) await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } });
      }
    } else if (!order.reservations.length) {
      for (const item of order.items) await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
    }
    await tx.paymentAttempt.updateMany({ where: { orderId: order.id, status: "PENDING" }, data: { status: "FAILED" } });
    return tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
  });
}
