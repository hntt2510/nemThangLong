import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  mattressLab: z.boolean().optional(),
  modelUrl: z.string().url().nullable().optional(),
  posterUrl: z.string().url().nullable().optional(),
});

async function requireEditor() {
  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR";
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await requireEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const { slug } = await context.params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { variants: true, media: { orderBy: { sortOrder: "asc" } }, layers: { orderBy: { sortOrder: "asc" } }, reviews: true } });
  return product ? NextResponse.json(product) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await requireEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const { slug } = await context.params;
  const product = await prisma.product.update({ where: { slug }, data: parsed.data });
  return NextResponse.json(product);
}
