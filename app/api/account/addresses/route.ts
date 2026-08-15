import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { addressInputSchema } from "@/lib/account-validation";
import { createAccountAddress, listAccountAddresses } from "@/lib/account";

async function currentUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await listAccountAddresses(prisma, userId)); }
  catch { return NextResponse.json({ error: "Không thể tải địa chỉ." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = addressInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Địa chỉ không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await createAccountAddress(prisma, userId, parsed.data), { status: 201 }); }
  catch { return NextResponse.json({ error: "Không thể lưu địa chỉ." }, { status: 503 }); }
}
