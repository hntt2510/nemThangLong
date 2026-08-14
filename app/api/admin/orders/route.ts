import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";

async function isEditor() {
  const session = await auth();
  return Boolean(session?.user?.role && ["ADMIN", "EDITOR"].includes(session.user.role));
}

export async function GET() {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
    return NextResponse.json(orders);
  } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}
