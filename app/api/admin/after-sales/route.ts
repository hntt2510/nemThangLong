import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { listAdminAfterSales, parseAfterSalesFilters } from "@/lib/after-sales";
import { maskEmail, maskPhone } from "@/lib/leads";

async function authorize() {
  const session = await auth();
  if (!session?.user) return 401 as const;
  return isAdmin(session) ? 200 as const : 403 as const;
}

export async function GET(request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const result = await listAdminAfterSales(prisma, parseAfterSalesFilters(new URL(request.url).searchParams));
    return NextResponse.json({ ...result, items: result.items.map((item) => ({ ...item, user: { name: item.user.name, phone: maskPhone(item.user.phone ?? ""), email: maskEmail(item.user.email) } })) });
  } catch { return NextResponse.json({ error: "Không thể tải danh sách yêu cầu." }, { status: 503 }); }
}
