import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";

const input = z.object({ approved: z.boolean() }).strict();
async function admin() { const session = await auth(); return session?.user?.role === "ADMIN"; }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); try { return NextResponse.json(await prisma.review.update({ where: { id: (await params).id }, data: parsed.data })); } catch { return NextResponse.json({ error: "Không tìm thấy đánh giá." }, { status: 404 }); } }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); try { await prisma.review.delete({ where: { id: (await params).id } }); return new NextResponse(null, { status: 204 }); } catch { return NextResponse.json({ error: "Không tìm thấy đánh giá." }, { status: 404 }); } }
