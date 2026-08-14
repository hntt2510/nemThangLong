import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ released: 0 });
  const expired = await prisma.inventoryReservation.findMany({ where: { status: "ACTIVE", expiresAt: { lt: new Date() } } });
  for (const reservation of expired) await prisma.$transaction(async (tx) => {
    const released = await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE" }, data: { status: "RELEASED", releasedAt: new Date() } });
    if (released.count === 1) {
      await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } });
      await tx.order.updateMany({ where: { id: reservation.orderId, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED", status: "CANCELLED" } });
    }
  });
  return NextResponse.json({ released: expired.length });
}
