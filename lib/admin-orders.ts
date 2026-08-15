import "server-only";

import type { OrderStatus, PaymentMethod, PaymentStatus, PrismaClient } from "@prisma/client";
import { withSerializable } from "@/lib/transaction";
import { adminOrderActionSchema, fulfillmentSchema, orderFiltersSchema, orderStatusSchema } from "@/lib/admin-order-validation";

export { adminOrderActionSchema, fulfillmentSchema, orderFiltersSchema, orderStatusSchema } from "@/lib/admin-order-validation";

export function parseOrderFilters(params: URLSearchParams) {
  const page = Number(params.get("page") ?? "1");
  const parsed = orderFiltersSchema.safeParse({ status: params.get("status") || undefined, paymentStatus: params.get("paymentStatus") || undefined, paymentMethod: params.get("paymentMethod") || undefined, q: params.get("q") || undefined, page: Number.isSafeInteger(page) && page > 0 ? page : 1 });
  return parsed.success ? parsed.data : { page: 1 };
}

export async function listAdminOrders(prisma: PrismaClient, filters: ReturnType<typeof parseOrderFilters>) {
  const where = { ...(filters.status ? { status: filters.status } : {}), ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}), ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}), ...(filters.q ? { OR: [{ code: { contains: filters.q, mode: "insensitive" as const } }, { customerName: { contains: filters.q, mode: "insensitive" as const } }, { customerPhone: { contains: filters.q } }, { guestEmail: { contains: filters.q, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (filters.page - 1) * 50, take: 50,
      select: {
        id: true, code: true, customerName: true, customerPhone: true, guestEmail: true,
        total: true, subtotal: true, shippingFee: true, status: true, paymentMethod: true, paymentStatus: true, createdAt: true,
        items: { select: { id: true, productName: true, sku: true, width: true, length: true, thickness: true, quantity: true, unitPrice: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, expiresAt: true, provider: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page: filters.page, pageSize: 50 };
}

export async function getAdminOrder(prisma: PrismaClient, id: string) {
  return prisma.order.findUnique({
    where: { id },
    select: {
      id: true, code: true, customerName: true, customerPhone: true, guestEmail: true, shippingAddress: true,
      subtotal: true, shippingFee: true, total: true, status: true, paymentMethod: true, paymentStatus: true,
      createdAt: true, updatedAt: true,
      items: { select: { id: true, productName: true, sku: true, width: true, length: true, thickness: true, quantity: true, unitPrice: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { provider: true, status: true, amount: true, expiresAt: true, updatedAt: true } },
      reservations: { select: { variantId: true, quantity: true, status: true, expiresAt: true, releasedAt: true } },
    },
  });
}

const transitions: Record<Exclude<OrderStatus, "PENDING" | "CANCELLED">, OrderStatus[]> = { CONFIRMED: ["CONFIRMED", "PROCESSING"], PROCESSING: ["PROCESSING", "SHIPPED"], SHIPPED: ["SHIPPED", "COMPLETED"], COMPLETED: ["COMPLETED"] };
export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) { return (transitions[from as keyof typeof transitions] ?? []).includes(to); }

export async function updateFulfillmentStatus(prisma: PrismaClient, id: string, status: OrderStatus) {
  if (!(status in transitions)) throw new Error("INVALID_TRANSITION");
  return withSerializable(prisma, async (tx) => {
    const current = await tx.order.findUnique({ where: { id }, select: { status: true } }); if (!current) throw new Error("NOT_FOUND");
    if (!canTransitionOrderStatus(current.status, status)) throw new Error("INVALID_TRANSITION");
    if (current.status === status) return tx.order.findUniqueOrThrow({ where: { id }, select: { id: true, status: true, paymentStatus: true } });
    return tx.order.update({ where: { id }, data: { status }, select: { id: true, status: true, paymentStatus: true } });
  });
}
