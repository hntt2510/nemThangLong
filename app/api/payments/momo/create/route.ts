import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";
import { canStartMomoPayment } from "@/lib/payment-lifecycle";
import { momoCreateSchema } from "@/lib/api-validation";

export async function POST(request: Request) {
  const parsed = momoCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Yêu cầu MoMo không hợp lệ." }, { status: 400 });
  const body = parsed.data;
  const prisma = getPrisma();
  const env = getEnv();
  if (!prisma) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      const candidate = await tx.order.findUnique({ where: { publicToken: body.token }, include: { payments: { where: { provider: "MOMO" }, orderBy: { createdAt: "desc" }, take: 1 }, reservations: true } });
      const candidateAttempt = candidate?.payments[0];
      return { candidate, eligible: Boolean(candidate && candidateAttempt && canStartMomoPayment({ orderStatus: candidate.status, orderPaymentStatus: candidate.paymentStatus, attemptStatus: candidateAttempt.status, attemptExpiresAt: candidateAttempt.expiresAt, reservations: candidate.reservations }, new Date())) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!order?.candidate || order.candidate.paymentMethod !== "MOMO") return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  if (!order.eligible) return NextResponse.json({ error: "Giao dịch đã hết hạn hoặc không còn khả dụng." }, { status: 409 });
  const paymentOrder = order.candidate;
  const partnerCode = env.MOMO_PARTNER_CODE;
  const accessKey = env.MOMO_ACCESS_KEY;
  const secretKey = env.MOMO_SECRET_KEY;
  if (!partnerCode || !accessKey || !secretKey) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });
  const attempt = paymentOrder.payments[0];
  if (!attempt) return NextResponse.json({ error: "Giao dịch đã hết hạn hoặc không còn khả dụng." }, { status: 409 });
  const existingResponse = attempt.rawResponse && typeof attempt.rawResponse === "object" && !Array.isArray(attempt.rawResponse) ? attempt.rawResponse as { payUrl?: string } : null;
  if (existingResponse?.payUrl) return NextResponse.json({ payUrl: existingResponse.payUrl });
  const requestId = attempt.requestId ?? `TL-${paymentOrder.code}`;
  const extraData = "";
  const orderInfo = `Thanh toan don hang ${paymentOrder.code}`;
  const redirectUrl = `${env.NEXT_PUBLIC_SITE_URL}/checkout/result?token=${paymentOrder.publicToken}`;
  const ipnUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/ipn`;
  const raw = `accessKey=${accessKey}&amount=${paymentOrder.total}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${paymentOrder.code}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
  const signature = createHmac("sha256", secretKey).update(raw).digest("hex");
  let response: Response;
  try {
    response = await fetch(env.MOMO_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ partnerCode, accessKey, requestId, amount: paymentOrder.total, orderId: paymentOrder.code, orderInfo, redirectUrl, ipnUrl, extraData, requestType: "captureWallet", orderExpireTime: 30, lang: "vi", signature }) });
  } catch { return NextResponse.json({ error: "Không thể kết nối MoMo." }, { status: 502 }); }
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  try { await prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { requestId, providerOrderId: paymentOrder.code, rawResponse: result as PrismaTypes.InputJsonValue, lastResultCode: typeof result.resultCode === "number" ? result.resultCode : null } }); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
  if (!response.ok || result.resultCode !== 0 || typeof result.payUrl !== "string") return NextResponse.json({ error: typeof result.message === "string" ? result.message : "Không thể tạo giao dịch MoMo." }, { status: 502 });
  return NextResponse.json({ payUrl: result.payUrl });
}
