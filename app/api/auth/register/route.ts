import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPrisma } from "@/lib/db";

const schema = z.object({ name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thông tin đăng ký chưa hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Tài khoản cần database được cấu hình." }, { status: 503 });
  const email = parsed.data.email.toLowerCase();
  try {
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email này đã được sử dụng." }, { status: 409 });
    await prisma.user.create({ data: { name: parsed.data.name, email, passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: /database server|P1001|Can't reach/i.test(message) ? "Database hiện chưa khả dụng." : "Không thể tạo tài khoản." }, { status: 503 });
  }
}
