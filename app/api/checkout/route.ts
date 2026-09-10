import { createHash, randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { decrementCheckoutStock } from "@/lib/checkout-stock";
import { getPrisma } from "@/lib/db";
import { getPaymentExpiry } from "@/lib/payment-lifecycle";
import { getSePayConfiguration, makeSePayPaymentCode } from "@/lib/sepay";
import { shippingFeeForSubtotal } from "@/lib/shipping";
import { withSerializable } from "@/lib/transaction";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";

export const runtime = "nodejs";

class CheckoutError extends Error {
  constructor(readonly status: number, message: string, readonly code: string) {
    super(message);
  }
}

function makeOrderCode() {
  return `TL-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function requestHash(input: CheckoutInput, userId: string | null) {
  return sha256(JSON.stringify({
    userId,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    guestEmail: input.guestEmail?.trim().toLowerCase() || null,
    address: { line1: input.address.line1.trim(), district: input.address.district?.trim() || null, province: input.address.province.trim() },
    paymentMethod: input.paymentMethod,
    items: [...input.items].sort((left, right) => left.variantId.localeCompare(right.variantId)).map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
  }));
}

function checkoutResult(order: { code: string; publicToken: string; total: number; paymentMethod: string }) {
  return { orderCode: order.code, resultToken: order.publicToken, total: order.total, nextAction: order.paymentMethod === "COD" ? "cod_result" : order.paymentMethod === "BANK_TRANSFER" ? "bank_pending" : "payment_pending" };
}

function checkoutResponse(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) } });
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return checkoutResponse({ error: "Thông tin checkout chưa đầy đủ hoặc không hợp lệ.", code: "VALIDATION_ERROR" }, { status: 400 });

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 255) {
    return checkoutResponse({ error: "Thiếu mã xác nhận checkout. Vui lòng thử lại bằng nút đặt hàng.", code: "IDEMPOTENCY_KEY_REQUIRED" }, { status: 400 });
  }

  const input = parsed.data;
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId && !input.guestEmail) return checkoutResponse({ error: "Guest checkout cần email để theo dõi đơn hàng.", code: "GUEST_EMAIL_REQUIRED" }, { status: 400 });

  const prisma = getPrisma();
  if (!prisma) return checkoutResponse({ error: "Checkout tạm thời chưa khả dụng.", code: "DATABASE_UNAVAILABLE" }, { status: 503 });

  const keyHash = sha256(`checkout:${idempotencyKey}`);
  const normalizedRequestHash = requestHash(input, userId);

  try {
    const existing = await prisma.checkoutRequest.findUnique({ where: { keyHash }, include: { order: true } });
    if (existing) {
      if (existing.requestHash !== normalizedRequestHash) return checkoutResponse({ error: "Mã xác nhận này đã được dùng cho một checkout khác.", code: "IDEMPOTENCY_CONFLICT" }, { status: 409 });
      return checkoutResponse(checkoutResult(existing.order));
    }

    const order = await withSerializable(prisma, async (tx) => {
      const settings = await tx.siteSettings.findUnique({ where: { id: "default" } });
      if (!settings || settings.shippingFee === null) throw new CheckoutError(503, "Chính sách phí vận chuyển chưa được cấu hình.", "CHECKOUT_NOT_CONFIGURED");
      if (input.paymentMethod === "BANK_TRANSFER" && (!settings.bankTransferInfo || !settings.bankTransferReservationMinutes || settings.bankTransferReservationMinutes < 5 || settings.bankTransferReservationMinutes > 10080)) throw new CheckoutError(503, "Thông tin hoặc thời hạn chuyển khoản chưa được cấu hình.", "CHECKOUT_NOT_CONFIGURED");
      const sepay = input.paymentMethod === "SEPAY" ? getSePayConfiguration() : null;
      if (input.paymentMethod === "SEPAY" && !sepay?.ready) throw new CheckoutError(503, sepay?.reason ?? "SePay Test Mode chưa sẵn sàng.", "SEPAY_NOT_CONFIGURED");

      const allowPlaceholder = process.env.NODE_ENV !== "production";
      const variants = await tx.productVariant.findMany({ where: { id: { in: input.items.map((item) => item.variantId) }, active: true, ...(allowPlaceholder ? {} : { priceStatus: "VERIFIED", stockStatus: "VERIFIED" }), product: { status: "PUBLISHED", saleStatus: "ACTIVE", ...(allowPlaceholder ? {} : { verificationStatus: "VERIFIED" }) } }, include: { product: true } });
      if (variants.length !== input.items.length) throw new CheckoutError(409, "Một sản phẩm trong giỏ không còn khả dụng.", "VARIANT_UNAVAILABLE");
      const lines = input.items.map((item) => {
        const variant = variants.find((candidate) => candidate.id === item.variantId);
        if (!variant || variant.price === null || variant.price <= 0 || variant.stock < item.quantity) throw new CheckoutError(409, "Sản phẩm vừa được cập nhật hoặc hết tồn kho.", "INSUFFICIENT_STOCK");
        return { item, variant };
      });
      const subtotal = lines.reduce((sum, line) => sum + (line.variant.price ?? 0) * line.item.quantity, 0);
      const shippingFee = shippingFeeForSubtotal(subtotal, settings);
      if (shippingFee === null) throw new CheckoutError(503, "Chính sách phí vận chuyển chưa được cấu hình.", "CHECKOUT_NOT_CONFIGURED");
      const total = subtotal + shippingFee;
      const reservationExpiresAt = getPaymentExpiry(input.paymentMethod, new Date(), settings.bankTransferReservationMinutes);

      await decrementCheckoutStock(tx, lines.map(({ item, variant }) => ({ variantId: variant.id, quantity: item.quantity })).sort((left, right) => left.variantId.localeCompare(right.variantId)));
      const created = await tx.order.create({ data: {
        code: makeOrderCode(), userId, guestEmail: input.guestEmail?.trim() || null, customerName: input.customerName.trim(), customerPhone: input.customerPhone.trim(),
        shippingAddress: { line1: input.address.line1.trim(), district: input.address.district?.trim() || null, province: input.address.province.trim() }, subtotal, shippingFee, total, paymentMethod: input.paymentMethod,
        status: input.paymentMethod === "COD" ? "CONFIRMED" : "PENDING", paymentStatus: "PENDING",
        items: { create: lines.map(({ item, variant }) => ({ variantId: variant.id, productName: variant.product.name, sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: item.quantity, unitPrice: variant.price ?? 0 })) },
        payments: { create: {
          provider: input.paymentMethod, amount: total, expiresAt: reservationExpiresAt,
          providerOrderId: input.paymentMethod === "SEPAY" ? makeSePayPaymentCode() : undefined,
          recipientBank: input.paymentMethod === "SEPAY" && sepay?.ready ? sepay.bank : undefined,
          recipientAccountNumber: input.paymentMethod === "SEPAY" && sepay?.ready ? sepay.accountNumber : undefined,
          recipientAccountName: input.paymentMethod === "SEPAY" && sepay?.ready ? sepay.accountName : undefined,
        } },
        reservations: reservationExpiresAt ? { create: lines.map(({ item, variant }) => ({ variantId: variant.id, quantity: item.quantity, expiresAt: reservationExpiresAt })) } : undefined,
      } });
      await tx.paymentAttempt.updateMany({ where: { orderId: created.id, providerOrderId: null }, data: { providerOrderId: created.code } });
      await tx.checkoutRequest.create({ data: { keyHash, requestHash: normalizedRequestHash, orderId: created.id } });
      return created;
    });
    return checkoutResponse(checkoutResult(order));
  } catch (error) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await prisma.checkoutRequest.findUnique({ where: { keyHash }, include: { order: true } });
      if (existing) {
        if (existing.requestHash !== normalizedRequestHash) return checkoutResponse({ error: "Mã xác nhận này đã được dùng cho một checkout khác.", code: "IDEMPOTENCY_CONFLICT" }, { status: 409 });
        return checkoutResponse(checkoutResult(existing.order));
      }
    }
    const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
    const unavailable = /database server|P1001|Can't reach/i.test(message);
    return checkoutResponse({ error: unavailable ? "Database hiện chưa khả dụng." : "Không thể tạo đơn hàng. Vui lòng thử lại cùng thông tin này.", code: unavailable ? "DATABASE_UNAVAILABLE" : "CHECKOUT_FAILED" }, { status: unavailable ? 503 : 409 });
  }
}
