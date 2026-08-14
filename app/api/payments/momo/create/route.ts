import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const env = getEnv();
  const prisma = getPrisma();
  if (!code || !prisma) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });
  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.paymentMethod !== "MOMO") return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  const partnerCode = env.MOMO_PARTNER_CODE;
  const accessKey = env.MOMO_ACCESS_KEY;
  const secretKey = env.MOMO_SECRET_KEY;
  if (!partnerCode || !accessKey || !secretKey) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });
  const requestId = `${order.code}-${Date.now()}`;
  const extraData = "";
  const orderInfo = `Thanh toan don hang ${order.code}`;
  const redirectUrl = `${env.NEXT_PUBLIC_SITE_URL}/checkout/success?code=${order.code}`;
  const ipnUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/ipn`;
  const raw = `accessKey=${accessKey}&amount=${order.total}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${order.code}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
  const signature = createHmac("sha256", secretKey).update(raw).digest("hex");
  const response = await fetch(env.MOMO_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ partnerCode, accessKey, requestId, amount: order.total, orderId: order.code, orderInfo, redirectUrl, ipnUrl, extraData, requestType: "captureWallet", lang: "vi", signature }) });
  const result = await response.json();
  await prisma.paymentAttempt.updateMany({ where: { orderId: order.id, provider: "MOMO" }, data: { requestId, providerOrderId: order.code, rawResponse: result } });
  if (!response.ok || result.resultCode !== 0) return NextResponse.json({ error: result.message ?? "Không thể tạo giao dịch MoMo." }, { status: 502 });
  return NextResponse.json({ payUrl: result.payUrl });
}
