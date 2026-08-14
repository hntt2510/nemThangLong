import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, string | number> | null;
  const env = getEnv();
  const secretKey = env.MOMO_SECRET_KEY;
  if (!body || !secretKey) return new NextResponse(null, { status: 204 });
  const raw = `accessKey=${env.MOMO_ACCESS_KEY ?? ""}&amount=${body.amount}&extraData=${body.extraData ?? ""}&message=${body.message ?? ""}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  const expected = createHmac("sha256", secretKey).update(raw).digest("hex");
  const received = String(body.signature ?? "");
  if (received.length !== expected.length || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return new NextResponse(null, { status: 204 });
  const prisma = getPrisma();
  if (prisma && Number(body.resultCode) === 0) {
    const order = await prisma.order.findUnique({ where: { code: String(body.orderId) } });
    if (order && order.total === Number(body.amount)) await prisma.$transaction([prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED" } }), prisma.paymentAttempt.updateMany({ where: { orderId: order.id, provider: "MOMO" }, data: { status: "PAID", providerTransactionId: String(body.transId), rawResponse: body } })]);
  }
  return new NextResponse(null, { status: 204 });
}
