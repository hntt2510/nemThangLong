import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { sepayWebhookSchema } from "@/lib/api-validation";
import { applySePayWebhook } from "@/lib/payment-lifecycle";
import { extractSePayPaymentCode, getSePayConfiguration, getSePayTransactionId, verifySePayWebhook } from "@/lib/sepay";

export const runtime = "nodejs";

function acknowledgement() {
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const configuration = getSePayConfiguration();
  if (!configuration.ready) return NextResponse.json({ error: "SePay Test Mode không khả dụng." }, { status: 503 });
  const rawBody = await request.text().catch(() => "");
  if (!verifySePayWebhook(rawBody, request.headers.get("x-sepay-timestamp"), request.headers.get("x-sepay-signature"), configuration.webhookSecret)) {
    return NextResponse.json({ success: false, error: "Invalid webhook signature." }, { status: 401 });
  }
  let decoded: unknown;
  try { decoded = JSON.parse(rawBody); } catch {
    if (process.env.NODE_ENV === "development") console.warn(JSON.stringify({ event: "sepay_webhook_schema_invalid", reason: "invalid_json" }));
    return NextResponse.json({ success: false, error: "Invalid webhook payload." }, { status: 400 });
  }
  const parsed = sepayWebhookSchema.safeParse(decoded);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(JSON.stringify({
        event: "sepay_webhook_schema_invalid",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })),
      }));
    }
    return NextResponse.json({ success: false, error: "Invalid webhook payload." }, { status: 400 });
  }
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 });
  try {
    const paymentCode = extractSePayPaymentCode(parsed.data.code, parsed.data.content, parsed.data.description);
    const transactionId = getSePayTransactionId(parsed.data, rawBody);
    const outcome = await applySePayWebhook(prisma, {
      transactionId, paymentCode, amount: parsed.data.transferAmount,
      transferType: parsed.data.transferType, gateway: parsed.data.gateway, accountNumber: parsed.data.accountNumber,
      payload: parsed.data as Prisma.InputJsonValue,
    });
    console.info(JSON.stringify({ event: "sepay_webhook", transactionId, paymentCode, outcome }));
    return acknowledgement();
  } catch {
    return NextResponse.json({ error: "Không thể xử lý giao dịch SePay." }, { status: 503 });
  }
}
