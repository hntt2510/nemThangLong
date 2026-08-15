import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { adjustInventory, listInventory, parseInventoryFilters, inventoryAdjustmentSchema } from "@/lib/inventory-admin";

async function authorize() { const session = await auth(); if (!session?.user) return { status: 401 as const, session: null }; if (session.user.role !== "ADMIN") return { status: 403 as const, session: null }; return { status: 200 as const, session }; }

export async function GET(request: Request) {
  const access = await authorize(); if (access.status !== 200) return NextResponse.json({ error: access.status === 401 ? "Unauthorized" : "Forbidden" }, { status: access.status });
  const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await listInventory(prisma, parseInventoryFilters(new URL(request.url).searchParams))); } catch { return NextResponse.json({ error: "Không thể tải tồn kho." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const access = await authorize(); if (access.status !== 200) return NextResponse.json({ error: access.status === 401 ? "Unauthorized" : "Forbidden" }, { status: access.status });
  const parsed = inventoryAdjustmentSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Payload điều chỉnh không hợp lệ." }, { status: 400 });
  const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try { return NextResponse.json(await adjustInventory(prisma, access.session.user.id, parsed.data), { status: 201 }); } catch (error) { const code = error instanceof Error ? error.message : ""; if (code === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy variant." }, { status: 404 }); if (code === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 409 }); return NextResponse.json({ error: "Không thể điều chỉnh tồn kho." }, { status: 503 }); }
}
