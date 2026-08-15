import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { afterSalesAdminUpdateSchema, getAdminAfterSales, updateAfterSalesRequest } from "@/lib/after-sales";

async function authorize() {
  const session = await auth();
  if (!session?.user) return 401 as const;
  return isAdmin(session) ? 200 as const : 403 as const;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const requestId = (await context.params).id;
  try {
    const item = await getAdminAfterSales(prisma, requestId);
    return item ? NextResponse.json(item) : NextResponse.json({ error: "Không tìm thấy yêu cầu." }, { status: 404 });
  } catch { return NextResponse.json({ error: "Không thể tải yêu cầu." }, { status: 503 }); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const parsed = afterSalesAdminUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    return NextResponse.json(await updateAfterSalesRequest(prisma, (await context.params).id, parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy yêu cầu." }, { status: 404 });
    if (message === "STALE") return NextResponse.json({ error: "Yêu cầu đã được cập nhật ở nơi khác." }, { status: 409 });
    if (message === "INVALID_TRANSITION") return NextResponse.json({ error: "Trạng thái không thể chuyển theo quy trình V1." }, { status: 409 });
    return NextResponse.json({ error: "Không thể cập nhật yêu cầu." }, { status: 400 });
  }
}
