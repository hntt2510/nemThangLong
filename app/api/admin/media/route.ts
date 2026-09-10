import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
export async function GET() { const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 }); return NextResponse.json(await prisma.mediaAsset.findMany({ include: { _count: { select: { productLinks: true, pageSectionLinks: true } } }, orderBy: { updatedAt: "desc" }, take: 100 })); }
