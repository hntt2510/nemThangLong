import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getLead, isLeadAdmin, updateLead } from "@/lib/admin-leads";
import { adminLeadUpdateSchema } from "@/lib/lead-validation";

async function authorize() {
  const session = await auth();
  if (!session?.user) return 401;
  return isLeadAdmin(session.user.role) ? 200 : 403;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const { id } = await context.params;
  const lead = await getLead(prisma, id).catch(() => null);
  return lead ? NextResponse.json(lead) : NextResponse.json({ error: "Không tìm thấy yêu cầu." }, { status: 404 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const body = await request.json().catch(() => null);
  const parsed = adminLeadUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 400 });
  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const { id } = await context.params;
    return NextResponse.json(await updateLead(prisma, id, parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy yêu cầu." }, { status: 404 });
    if (message === "STALE") return NextResponse.json({ error: "Yêu cầu đã được cập nhật. Hãy tải lại trước khi lưu." }, { status: 409 });
    if (message === "INVALID_TRANSITION") return NextResponse.json({ error: "Trạng thái không thể chuyển theo quy trình V1." }, { status: 409 });
    return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 400 });
  }
}
