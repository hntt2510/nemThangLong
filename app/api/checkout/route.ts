import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { checkoutSchema } from "@/lib/validation";
import { getPaymentExpiry } from "@/lib/payment-lifecycle";

export const runtime = "nodejs";

function makeOrderCode() { return `TL-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`; }

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thông tin checkout chưa đầy đủ hoặc không hợp lệ." }, { status: 400 });
  const input = parsed.data;
  const session = await auth();
  if (!session?.user?.id && !input.guestEmail) return NextResponse.json({ error: "Guest checkout cần email để theo dõi đơn hàng." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Checkout tạm thời chưa khả dụng." }, { status: 503 });

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!settings || settings.shippingFee === null) return NextResponse.json({ error: "Chính sách phí vận chuyển chưa được cấu hình." }, { status: 503 });
    const shippingFee = settings.shippingFee;
    if (input.paymentMethod === "BANK_TRANSFER" && (!settings.bankTransferInfo || !settings.bankTransferReservationMinutes || settings.bankTransferReservationMinutes < 5 || settings.bankTransferReservationMinutes > 10080)) return NextResponse.json({ error: "Thông tin hoặc thời hạn chuyển khoản chưa được cấu hình." }, { status: 503 });
    const env = getEnv();
    if (input.paymentMethod === "MOMO" && (!env.MOMO_PARTNER_CODE || !env.MOMO_ACCESS_KEY || !env.MOMO_SECRET_KEY)) return NextResponse.json({ error: "MoMo chưa được cấu hình." }, { status: 503 });

    const variants = await prisma.productVariant.findMany({ where: { id: { in: input.items.map((item) => item.variantId) }, active: true, product: { status: "PUBLISHED", isDemo: false } }, include: { product: true } });
    if (variants.length !== input.items.length) return NextResponse.json({ error: "Một sản phẩm trong giỏ không còn khả dụng." }, { status: 409 });
    const lines = input.items.map((item) => {
      const variant = variants.find((candidate) => candidate.id === item.variantId);
      if (!variant || variant.price === null || variant.price <= 0 || variant.stock < item.quantity) throw new Error("Sản phẩm vừa được cập nhật hoặc hết tồn kho.");
      return { item, variant };
    });
    const subtotal = lines.reduce((sum, line) => sum + (line.variant.price ?? 0) * line.item.quantity, 0);
    const total = subtotal + shippingFee;
    const code = makeOrderCode();
    const reservationExpiresAt = getPaymentExpiry(input.paymentMethod, new Date(), settings.bankTransferReservationMinutes);
    const order = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const updated = await tx.productVariant.updateMany({ where: { id: line.variant.id, stock: { gte: line.item.quantity } }, data: { stock: { decrement: line.item.quantity } } });
        if (updated.count !== 1) throw new Error("Sản phẩm vừa hết tồn kho.");
      }
      return tx.order.create({ data: {
        code, userId: session?.user?.id || null, guestEmail: input.guestEmail || null, customerName: input.customerName, customerPhone: input.customerPhone,
        shippingAddress: input.address, subtotal, shippingFee, total, paymentMethod: input.paymentMethod,
        status: input.paymentMethod === "COD" ? "CONFIRMED" : "PENDING", paymentStatus: "PENDING",
        items: { create: lines.map(({ item, variant }) => ({ variantId: variant.id, productName: variant.product.name, sku: variant.sku, width: variant.width, length: variant.length, thickness: variant.thickness, quantity: item.quantity, unitPrice: variant.price ?? 0 })) },
        payments: { create: { provider: input.paymentMethod, amount: total, expiresAt: reservationExpiresAt, providerOrderId: code } },
        reservations: reservationExpiresAt ? { create: lines.map(({ item, variant }) => ({ variantId: variant.id, quantity: item.quantity, expiresAt: reservationExpiresAt })) } : undefined,
      } });
    });
    return NextResponse.json({ orderCode: order.code, resultToken: order.publicToken, total, nextAction: input.paymentMethod === "COD" ? "cod_result" : input.paymentMethod === "BANK_TRANSFER" ? "bank_pending" : "momo_redirect", paymentPath: input.paymentMethod === "MOMO" ? "/api/payments/momo/create" : undefined });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
    const status = /database server|P1001|Can't reach/i.test(message) ? 503 : 409;
    return NextResponse.json({ error: status === 503 ? "Database hiện chưa khả dụng." : message }, { status });
  }
}
