import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { afterSalesCreateSchema, createAfterSalesRequest } from "@/lib/after-sales";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = afterSalesCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Yêu cầu chưa hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    await createAfterSalesRequest(prisma, session.user.id, parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy sản phẩm trong đơn hàng của bạn." }, { status: 404 });
    return NextResponse.json({ error: "Không thể tiếp nhận yêu cầu lúc này." }, { status: 503 });
  }
}
