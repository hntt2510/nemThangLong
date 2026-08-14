import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

const pendingCodes = new Set([1000, 9000]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, string | number> | null;
  const env = getEnv();
  const secretKey = env.MOMO_SECRET_KEY;
  if (!body || !secretKey) return new NextResponse(null, { status: 204 });
  const raw = `accessKey=${env.MOMO_ACCESS_KEY ?? ""}&amount=${body.amount}&extraData=${body.extraData ?? ""}&message=${body.message ?? ""}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  const expected = createHmac("sha256", secretKey).update(raw).digest("hex");
  const received = String(body.signature ?? "");
  if (String(body.partnerCode) !== env.MOMO_PARTNER_CODE || received.length !== expected.length || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return new NextResponse(null, { status: 204 });
  const prisma = getPrisma();
  if (!prisma) return new NextResponse(null, { status: 204 });
  const resultCode = Number(body.resultCode);
  const order = await prisma.order.findUnique({ where: { code: String(body.orderId) } });
  if (!order || order.total !== Number(body.amount) || order.paymentMethod !== "MOMO") return new NextResponse(null, { status: 204 });

  await prisma.$transaction(async (tx) => {
    const attempt = await tx.paymentAttempt.findFirst({ where: { orderId: order.id, provider: "MOMO" }, orderBy: { createdAt: "desc" } });
    if (!attempt || attempt.status === "PAID" || order.paymentStatus === "PAID" || order.paymentStatus === "FAILED") return;
    if (pendingCodes.has(resultCode)) {
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { lastResultCode: resultCode, rawResponse: body } });
      return;
    }
    if (resultCode === 0) {
      await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "PAID", lastResultCode: resultCode, providerTransactionId: String(body.transId), rawResponse: body } });
      await tx.order.updateMany({ where: { id: order.id, paymentStatus: { not: "PAID" } }, data: { paymentStatus: "PAID", status: "CONFIRMED" } });
      const reservations = await tx.inventoryReservation.findMany({ where: { orderId: order.id, status: "ACTIVE" } });
      for (const reservation of reservations) await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE" }, data: { status: "COMMITTED", committedAt: new Date() } });
      return;
    }
    await tx.paymentAttempt.updateMany({ where: { id: attempt.id, status: "PENDING" }, data: { status: "FAILED", lastResultCode: resultCode, rawResponse: body } });
    await tx.order.updateMany({ where: { id: order.id, paymentStatus: { not: "PAID" } }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
    const reservations = await tx.inventoryReservation.findMany({ where: { orderId: order.id, status: "ACTIVE" } });
    for (const reservation of reservations) {
      const released = await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE" }, data: { status: "RELEASED", releasedAt: new Date() } });
      if (released.count === 1) await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } });
    }
  });
  return new NextResponse(null, { status: 204 });
}
