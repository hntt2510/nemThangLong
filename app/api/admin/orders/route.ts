import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { authStatus } from "@/lib/admin-auth";
import { listAdminOrders, parseOrderFilters } from "@/lib/admin-orders";

export async function GET(request: Request) {
  const status = authStatus(await auth(), ["ADMIN", "EDITOR"]); if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await listAdminOrders(prisma, parseOrderFilters(new URL(request.url).searchParams))); } catch { return NextResponse.json({ error: "Database hiện chưa khả dụng." }, { status: 503 }); }
}
