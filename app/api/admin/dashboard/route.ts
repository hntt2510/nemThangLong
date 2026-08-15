import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminDashboard, parseDashboardRange } from "@/lib/admin-dashboard";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await getAdminDashboard(prisma, parseDashboardRange(new URL(request.url).searchParams.get("range")))); }
  catch { return NextResponse.json({ error: "Không thể tải dashboard." }, { status: 503 }); }
}
