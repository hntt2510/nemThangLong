import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";

const input = z.object({ slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), name: z.string().trim().min(1).max(160), description: z.string().trim().max(5000).nullable().optional(), status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"), sortOrder: z.number().int().min(0).default(0) }).strict();
async function editor() { const session = await auth(); return session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"; }
export async function GET() { if (!await editor()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); return NextResponse.json(await prisma.productCategory.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })); }
export async function POST(request: Request) { if (!await editor()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Dữ liệu loại sản phẩm không hợp lệ." }, { status: 400 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); try { return NextResponse.json(await prisma.productCategory.create({ data: parsed.data }), { status: 201 }); } catch { return NextResponse.json({ error: "Slug đã tồn tại." }, { status: 409 }); } }
