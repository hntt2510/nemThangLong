import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ variantId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const page = Math.max(1, Number(new URL(request.url).searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("pageSize") ?? 20) || 20));
  const variantId = (await context.params).variantId;
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { id: true } });
  if (!variant) return NextResponse.json({ error: "Không tìm thấy variant." }, { status: 404 });
  const [items, total] = await prisma.$transaction([
    prisma.inventoryAdjustment.findMany({ where: { variantId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize, include: { actor: { select: { id: true, name: true, email: true } } } }),
    prisma.inventoryAdjustment.count({ where: { variantId } }),
  ]);
  return NextResponse.json({ items, total, page, pageSize }, { headers: { "Cache-Control": "no-store" } });
}
