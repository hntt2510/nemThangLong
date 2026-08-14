import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ released: 0 });
  const expired = await prisma.inventoryReservation.findMany({ where: { releasedAt: null, expiresAt: { lt: new Date() } } });
  for (const reservation of expired) await prisma.$transaction([prisma.productVariant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } }), prisma.inventoryReservation.update({ where: { id: reservation.id }, data: { releasedAt: new Date() } })]);
  return NextResponse.json({ released: expired.length });
}
