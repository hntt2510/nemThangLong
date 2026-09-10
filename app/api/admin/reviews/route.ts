import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
const input = z.object({ productId: z.string().min(1), authorName: z.string().trim().min(1).max(120), rating: z.number().int().min(1).max(5), body: z.string().trim().min(1).max(4000), approved: z.boolean().default(false) }).strict();
async function editor() { const session = await auth(); return session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"; }
export async function GET() { if (!await editor()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); return NextResponse.json(await prisma.review.findMany({ include: { product: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } })); }
export async function POST(request: Request) { const session = await auth(); if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Đánh giá không hợp lệ." }, { status: 400 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); return NextResponse.json(await prisma.review.create({ data: parsed.data }), { status: 201 }); }
