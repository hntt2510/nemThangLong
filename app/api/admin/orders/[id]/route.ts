import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { authStatus } from "@/lib/admin-auth";
import { confirmBankTransfer, cancelOrder } from "@/lib/payment-lifecycle";
import { adminOrderActionSchema, getAdminOrder, updateFulfillmentStatus } from "@/lib/admin-orders";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const status = authStatus(await auth(), ["ADMIN", "EDITOR"]); if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const order = await getAdminOrder(prisma, (await context.params).id).catch(() => null); return order ? NextResponse.json(order) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const status = authStatus(await auth(), ["ADMIN", "EDITOR"]); if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const parsed = adminOrderActionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Action không hợp lệ." }, { status: 400 }); const body = parsed.data; const id = (await context.params).id; const prisma = getPrisma(); if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  try {
    if ("action" in body && body.action === "confirm_paid") { const order = await confirmBankTransfer(prisma, id); return NextResponse.json({ id: order.id, status: order.status, paymentStatus: order.paymentStatus }); }
    if ("action" in body && body.action === "cancel") { const order = await cancelOrder(prisma, id); return NextResponse.json({ id: order.id, status: order.status, paymentStatus: order.paymentStatus }); }
    if ("status" in body) return NextResponse.json(await updateFulfillmentStatus(prisma, id, body.status));
    return NextResponse.json({ error: "Action không hợp lệ." }, { status: 400 });
  } catch (error) { const code = error instanceof Error ? error.message : ""; if (code === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 }); if (code === "INVALID_STATE" || code === "INVALID_TRANSITION") return NextResponse.json({ error: "Đơn hàng không ở trạng thái có thể cập nhật." }, { status: 409 }); return NextResponse.json({ error: "Không thể cập nhật đơn hàng." }, { status: 503 }); }
}
