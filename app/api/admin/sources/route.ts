import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

const sourceSchema = z.object({ url: z.string().url().max(2000), title: z.string().trim().min(1).max(300), publisher: z.string().trim().max(200).nullable().optional(), sourceType: z.enum(["OFFICIAL_WEBSITE", "FACEBOOK", "OWNER_DOCUMENT", "INTERNAL_FIXTURE"]), notes: z.string().trim().max(5000).nullable().optional() }).strict();
async function allowed() { const session = await auth(); return Boolean(session?.user && isAdmin(session)); }

export async function GET() {
  if (!await allowed()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await prisma.sourceReference.findMany({ orderBy: { updatedAt: "desc" } })); }
  catch { return NextResponse.json({ error: "Không thể đọc nguồn." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!await allowed()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = sourceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nguồn không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await prisma.sourceReference.create({ data: parsed.data }), { status: 201 }); }
  catch { return NextResponse.json({ error: "Không thể tạo nguồn hoặc URL đã tồn tại." }, { status: 409 }); }
}
