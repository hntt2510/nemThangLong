import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listLeads, isLeadAdmin, parseLeadFilters } from "@/lib/admin-leads";
import { maskEmail, maskPhone } from "@/lib/leads";

async function authorize() {
  const session = await auth();
  if (!session?.user) return 401;
  return isLeadAdmin(session.user.role) ? 200 : 403;
}

export async function GET(request: Request) {
  const status = await authorize();
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  let prisma;
  try { prisma = getPrisma(); } catch { prisma = null; }
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    const result = await listLeads(prisma, parseLeadFilters(new URL(request.url).searchParams));
    return NextResponse.json({
      ...result,
      items: result.items.map((lead) => ({ id: lead.id, type: lead.type, status: lead.status, fullName: lead.fullName, phone: maskPhone(lead.phone), email: maskEmail(lead.email), organization: lead.organization, productSlug: lead.productSlug, createdAt: lead.createdAt })),
    });
  } catch { return NextResponse.json({ error: "Không thể tải danh sách yêu cầu." }, { status: 503 }); }
}
