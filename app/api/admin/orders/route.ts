import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { authStatus } from "@/lib/admin-auth";

export async function GET() {
  const status = authStatus(await auth(), ["ADMIN", "EDITOR"]);
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, code: true, customerName: true, guestEmail: true, total: true, status: true, paymentMethod: true, paymentStatus: true, items: { select: { id: true, productName: true, quantity: true } }, payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, expiresAt: true, provider: true } } } });
    return NextResponse.json(orders);
  } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}
