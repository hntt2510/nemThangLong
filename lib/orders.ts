import "server-only";

import { getPrisma } from "@/lib/db";
import { getSePayQrUrl } from "@/lib/sepay";

export class OrderResultUnavailableError extends Error {}

function publicBankTransferInfo(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const key of ["bankName", "accountNumber", "accountHolder", "branch"]) {
    if (typeof source[key] === "string" && source[key].trim()) result[key] = source[key].trim();
  }
  return Object.keys(result).length ? result : null;
}

export async function getOrderResult(publicToken: string) {
  const prisma = getPrisma();
  if (!prisma) throw new OrderResultUnavailableError();
  try {
    const order = await prisma.order.findUnique({ where: { publicToken }, include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
    if (!order) return null;
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const payment = order.payments[0] ?? null;
    const sepay = order.paymentMethod === "SEPAY" && process.env.NODE_ENV === "development" && payment?.providerOrderId && payment.recipientBank && payment.recipientAccountNumber && payment.recipientAccountName
      ? {
        paymentCode: payment.providerOrderId,
        bank: payment.recipientBank,
        accountNumber: payment.recipientAccountNumber,
        accountName: payment.recipientAccountName,
        qrUrl: getSePayQrUrl({ bank: payment.recipientBank, accountNumber: payment.recipientAccountNumber, accountName: payment.recipientAccountName, amount: order.total, paymentCode: payment.providerOrderId }),
      }
      : null;
    return {
      code: order.code,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentExpiresAt: payment?.expiresAt?.toISOString() ?? null,
      paymentConfirmedAt: payment?.status === "PAID" ? payment.updatedAt.toISOString() : null,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      items: order.items.map((item) => ({ name: item.productName, sku: item.sku, quantity: item.quantity, width: item.width, length: item.length, thickness: item.thickness, unitPrice: item.unitPrice, lineTotal: item.unitPrice * item.quantity })),
      customerSummary: { name: order.customerName, maskedPhone: order.customerPhone.length > 4 ? `${"*".repeat(Math.max(0, order.customerPhone.length - 4))}${order.customerPhone.slice(-4)}` : "****" },
      shippingSummary: { district: typeof (order.shippingAddress as Record<string, unknown>)?.district === "string" ? (order.shippingAddress as Record<string, unknown>).district : null, province: typeof (order.shippingAddress as Record<string, unknown>)?.province === "string" ? (order.shippingAddress as Record<string, unknown>).province : null },
      bankTransferInfo: order.paymentMethod === "BANK_TRANSFER" ? publicBankTransferInfo(settings?.bankTransferInfo) : null,
      sepay,
      createdAt: order.createdAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof OrderResultUnavailableError) throw error;
    throw new OrderResultUnavailableError();
  }
}
