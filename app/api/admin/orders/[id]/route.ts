import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { confirmBankTransfer } from "@/lib/payment-lifecycle";
import { authStatus } from "@/lib/admin-auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const status = authStatus(await auth(), ["ADMIN", "EDITOR"]);
  if (status !== 200) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  const body = await request.json().catch(() => null) as { action?: "confirm_paid" | "cancel" } | null;
  if (!body?.action) return NextResponse.json({ error: "Action không hợp lệ." }, { status: 400 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ error: "Database chưa được cấu hình." }, { status: 503 });
  const { id } = await context.params;
  try {
    if (body.action === "confirm_paid") {
      const order = await confirmBankTransfer(prisma, id);
      return NextResponse.json({ id: order.id, status: order.status, paymentStatus: order.paymentStatus });
    }
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, include: { items: true, reservations: true } });
      if (!current) throw new Error("NOT_FOUND");
      if (current.paymentStatus === "PAID" || current.status === "CANCELLED") throw new Error("INVALID_STATE");
      for (const reservation of current.reservations) {
        if (reservation.status === "ACTIVE") {
          const released = await tx.inventoryReservation.updateMany({ where: { id: reservation.id, status: "ACTIVE" }, data: { status: "RELEASED", releasedAt: new Date() } });
          if (released.count === 1) await tx.productVariant.update({ where: { id: reservation.variantId }, data: { stock: { increment: reservation.quantity } } });
        }
      }
      if (!current.reservations.length) for (const item of current.items) await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      await tx.paymentAttempt.updateMany({ where: { orderId: current.id, status: "PENDING" }, data: { status: "FAILED" } });
      return tx.order.update({ where: { id: current.id }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
    });
    return NextResponse.json({ id: order.id, status: order.status, paymentStatus: order.paymentStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    if (message === "EXPIRED" || message === "INVALID_STATE") return NextResponse.json({ error: "Đơn hàng không ở trạng thái có thể cập nhật." }, { status: 409 });
    return NextResponse.json({ error: "Không thể cập nhật đơn hàng." }, { status: 503 });
  }
}
