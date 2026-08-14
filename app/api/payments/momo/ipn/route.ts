import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { applyMomoIpn } from "@/lib/payment-lifecycle";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, string | number> | null;
  const env = getEnv();
  const secretKey = env.MOMO_SECRET_KEY;
  if (!body || !secretKey) return new NextResponse(null, { status: 204 });
  const raw = `accessKey=${env.MOMO_ACCESS_KEY ?? ""}&amount=${body.amount}&extraData=${body.extraData ?? ""}&message=${body.message ?? ""}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  const expected = createHmac("sha256", secretKey).update(raw).digest("hex");
  const received = String(body.signature ?? "");
  if (String(body.partnerCode) !== env.MOMO_PARTNER_CODE || received.length !== expected.length || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return new NextResponse(null, { status: 204 });
  let prisma;
  try { prisma = getPrisma(); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!prisma) return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 });
  let order;
  try { order = await prisma.order.findUnique({ where: { code: String(body.orderId) }, select: { total: true, paymentMethod: true } }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!order || order.total !== Number(body.amount) || order.paymentMethod !== "MOMO") return new NextResponse(null, { status: 204 });
  try {
    await applyMomoIpn(prisma, { orderCode: String(body.orderId), amount: Number(body.amount), resultCode: Number(body.resultCode), transactionId: String(body.transId), rawResponse: body as Prisma.InputJsonValue });
  } catch { return NextResponse.json({ error: "Không thể lưu kết quả MoMo." }, { status: 503 }); }
  return new NextResponse(null, { status: 204 });
}
