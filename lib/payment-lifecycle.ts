import "server-only";

import { Prisma, type PaymentStatus, type PrismaClient } from "@prisma/client";
import { withSerializable } from "@/lib/transaction";

export function getPaymentExpiry(paymentMethod: "COD" | "BANK_TRANSFER" | "SEPAY", now = new Date(), bankTransferReservationMinutes?: number | null) {
  if (paymentMethod === "SEPAY") return new Date(now.getTime() + 30 * 60 * 1000);
  if (paymentMethod === "BANK_TRANSFER" && bankTransferReservationMinutes && bankTransferReservationMinutes >= 5 && bankTransferReservationMinutes <= 10080) return new Date(now.getTime() + bankTransferReservationMinutes * 60 * 1000);
  return null;
}

type Tx = Prisma.TransactionClient;

export type PendingPaymentSnapshot = {
  orderStatus: string;
  orderPaymentStatus: PaymentStatus;
  attemptStatus: PaymentStatus;
  attemptExpiresAt: Date | null;
  reservations: Array<{ status: string; expiresAt: Date }>;
};

export function canStartPendingPayment(snapshot: PendingPaymentSnapshot, now = new Date()) {
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

export async function commitReservationsForOrder(tx: Tx, orderId: string, now: Date) {
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

export type SePayWebhookOutcome = "paid" | "review_required" | "ignored" | "already_paid" | "duplicate";

export async function applySePayWebhook(
  prisma: PrismaClient,
  input: { transactionId: string; paymentCode: string | null; amount: number; transferType: "in" | "out"; gateway: string; accountNumber: string; payload: Prisma.InputJsonValue },
  now = new Date(),
): Promise<SePayWebhookOutcome> {
  return withSerializable(prisma, async (tx) => {
    try {
      await tx.sePayWebhookReceipt.create({ data: { transactionId: input.transactionId, outcome: "received", payload: input.payload } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "duplicate";
      throw error;
    }

    const attempt = input.paymentCode
      ? await tx.paymentAttempt.findFirst({ where: { provider: "SEPAY", providerOrderId: input.paymentCode }, include: { order: { include: { reservations: true } } } })
      : null;
    const receipt = await tx.sePayWebhookReceipt.findUniqueOrThrow({ where: { transactionId: input.transactionId } });
    if (!attempt || !attempt.order || input.transferType !== "in" || attempt.amount !== input.amount || attempt.order.total !== input.amount || attempt.recipientBank !== input.gateway || attempt.recipientAccountNumber !== input.accountNumber) {
      await tx.sePayWebhookReceipt.update({ where: { id: receipt.id }, data: { outcome: "ignored", orderId: attempt?.orderId ?? null } });
      return "ignored";
    }

    const order = attempt.order;
    if (attempt.status === "PAID" || order.paymentStatus === "PAID") {
      await tx.sePayWebhookReceipt.update({ where: { id: receipt.id }, data: { outcome: "already_paid", orderId: order.id } });
      return "already_paid";
    }
    if (attempt.status === "REVIEW_REQUIRED" || order.paymentStatus === "REVIEW_REQUIRED" || attempt.status === "REFUNDED" || order.paymentStatus === "REFUNDED") {
      await tx.sePayWebhookReceipt.update({ where: { id: receipt.id }, data: { outcome: "ignored", orderId: order.id } });
      return "ignored";
    }
    const eligible = canStartPendingPayment({ orderStatus: order.status, orderPaymentStatus: order.paymentStatus, attemptStatus: attempt.status, attemptExpiresAt: attempt.expiresAt, reservations: order.reservations }, now);
    if (eligible && await commitReservationsForOrder(tx, order.id, now)) {
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "PAID", providerTransactionId: input.transactionId, rawResponse: input.payload } });
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
      await tx.sePayWebhookReceipt.update({ where: { id: receipt.id }, data: { outcome: "paid", orderId: order.id } });
      return "paid";
    }
    await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "REVIEW_REQUIRED", providerTransactionId: input.transactionId, rawResponse: input.payload } });
    await releaseReservationsForOrder(tx, order.id, now, false);
    await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REVIEW_REQUIRED", status: "CANCELLED" } });
    await tx.sePayWebhookReceipt.update({ where: { id: receipt.id }, data: { outcome: "review_required", orderId: order.id } });
    return "review_required";
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

export async function confirmCodCollected(prisma: PrismaClient, orderId: string) {
  return withSerializable(prisma, async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("NOT_FOUND");
    if (order.paymentMethod !== "COD" || order.status !== "SHIPPED") throw new Error("INVALID_STATE");
    if (order.paymentStatus === "PAID") return order;
    if (order.paymentStatus !== "PENDING") throw new Error("INVALID_STATE");
    await tx.paymentAttempt.updateMany({ where: { orderId: order.id, provider: "COD", status: "PENDING" }, data: { status: "PAID" } });
    return tx.order.update({ where: { id: order.id, paymentStatus: "PENDING" }, data: { paymentStatus: "PAID" } });
  });
}

export async function cancelOrder(prisma: PrismaClient, orderId: string, now = new Date()) {
  return withSerializable(prisma, async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, reservations: true } });
    if (!order) throw new Error("NOT_FOUND");
    if (order.status === "CANCELLED") return order;
    if (order.status === "SHIPPED" || order.status === "COMPLETED" || order.paymentStatus === "PAID" || order.paymentStatus === "REVIEW_REQUIRED" || order.paymentStatus === "REFUNDED") throw new Error("INVALID_STATE");
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
