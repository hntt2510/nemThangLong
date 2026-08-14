import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { token?: string } | null;
  const prisma = getPrisma();
  const env = getEnv();
  if (!body?.token || !prisma) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });
  let order;
  try { order = await prisma.order.findUnique({ where: { publicToken: body.token }, include: { payments: { where: { provider: "MOMO" }, orderBy: { createdAt: "desc" }, take: 1 } } }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!order || order.paymentMethod !== "MOMO") return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  const partnerCode = env.MOMO_PARTNER_CODE;
  const accessKey = env.MOMO_ACCESS_KEY;
  const secretKey = env.MOMO_SECRET_KEY;
  if (!partnerCode || !accessKey || !secretKey) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });
  const attempt = order.payments[0];
  if (!attempt || attempt.status === "PAID") return NextResponse.json({ error: "Giao dịch đã hoàn tất hoặc không còn khả dụng." }, { status: 409 });
  const existingResponse = attempt.rawResponse && typeof attempt.rawResponse === "object" && !Array.isArray(attempt.rawResponse) ? attempt.rawResponse as { payUrl?: string } : null;
  if (existingResponse?.payUrl) return NextResponse.json({ payUrl: existingResponse.payUrl });
  const requestId = attempt.requestId ?? `TL-${order.code}`;
  const extraData = "";
  const orderInfo = `Thanh toan don hang ${order.code}`;
  const redirectUrl = `${env.NEXT_PUBLIC_SITE_URL}/checkout/result?token=${order.publicToken}`;
  const ipnUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/ipn`;
  const raw = `accessKey=${accessKey}&amount=${order.total}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${order.code}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
  const signature = createHmac("sha256", secretKey).update(raw).digest("hex");
  let response: Response;
  try {
    response = await fetch(env.MOMO_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ partnerCode, accessKey, requestId, amount: order.total, orderId: order.code, orderInfo, redirectUrl, ipnUrl, extraData, requestType: "captureWallet", orderExpireTime: 30, lang: "vi", signature }) });
  } catch { return NextResponse.json({ error: "Không thể kết nối MoMo." }, { status: 502 }); }
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  try { await prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { requestId, providerOrderId: order.code, rawResponse: result as Prisma.InputJsonValue, lastResultCode: typeof result.resultCode === "number" ? result.resultCode : null } }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!response.ok || result.resultCode !== 0 || typeof result.payUrl !== "string") return NextResponse.json({ error: typeof result.message === "string" ? result.message : "Không thể tạo giao dịch MoMo." }, { status: 502 });
  return NextResponse.json({ payUrl: result.payUrl });
}
