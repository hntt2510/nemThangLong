import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/account-validation";
import { updateAccountProfile } from "@/lib/account";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Thông tin hồ sơ không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const user = await updateAccountProfile(prisma, session.user.id, parsed.data);
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: "Không thể cập nhật hồ sơ." }, { status: 503 }); }
}
