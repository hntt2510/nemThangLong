import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { addressInputSchema } from "@/lib/account-validation";
import { deleteAccountAddress, updateAccountAddress } from "@/lib/account";

async function owner() { const session = await auth(); return session?.user?.id ?? null; }

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await owner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = addressInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Địa chỉ không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    return NextResponse.json(await updateAccountAddress(prisma, userId, (await context.params).id, parsed.data));
  } catch (error) { if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy địa chỉ." }, { status: 404 }); return NextResponse.json({ error: "Không thể cập nhật địa chỉ." }, { status: 503 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await owner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    await deleteAccountAddress(prisma, userId, (await context.params).id);
    return NextResponse.json({ ok: true });
  } catch (error) { if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy địa chỉ." }, { status: 404 }); return NextResponse.json({ error: "Không thể xóa địa chỉ đang được tham chiếu." }, { status: 409 }); }
}
