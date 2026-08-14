import "server-only";

import { getPrisma } from "@/lib/db";

export async function getOrderResult(publicToken: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const order = await prisma.order.findUnique({ where: { publicToken }, include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
    if (!order) return null;
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return { code: order.code, publicToken: order.publicToken, status: order.status, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, total: order.total, items: order.items.map((item) => ({ name: item.productName, quantity: item.quantity, width: item.width, length: item.length, thickness: item.thickness })), bankTransferInfo: order.paymentMethod === "BANK_TRANSFER" ? settings?.bankTransferInfo ?? null : null, createdAt: order.createdAt.toISOString() };
  } catch { return null; }
}
