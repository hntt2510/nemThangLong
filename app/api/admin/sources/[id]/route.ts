import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";

const sourceSchema = z.object({ url: z.string().url().max(2000).optional(), title: z.string().trim().min(1).max(300).optional(), publisher: z.string().trim().max(200).nullable().optional(), sourceType: z.enum(["OFFICIAL_WEBSITE", "FACEBOOK", "OWNER_DOCUMENT", "INTERNAL_FIXTURE"]).optional(), notes: z.string().trim().max(5000).nullable().optional() }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = sourceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nguồn không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await prisma.sourceReference.update({ where: { id: (await params).id }, data: parsed.data })); }
  catch { return NextResponse.json({ error: "Không thể cập nhật nguồn." }, { status: 404 }); }
}
