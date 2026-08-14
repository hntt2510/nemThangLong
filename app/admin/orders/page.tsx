import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { AdminOrdersTable } from "@/components/admin-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "EDITOR"].includes(session.user.role)) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>;
  const prisma = getPrisma();
  const orders = prisma ? await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { items: true } }).catch(() => []) : [];
  return <main className="admin-placeholder"><Link href="/admin">← Product editor</Link><p className="eyebrow">ADMIN / ORDERS</p><h1>Orders</h1><AdminOrdersTable initialOrders={orders.map((order) => ({ id: order.id, code: order.code, customerName: order.customerName, guestEmail: order.guestEmail, total: order.total, status: order.status, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, items: order.items.map((item) => ({ id: item.id, productName: item.productName, quantity: item.quantity })) }))} /></main>;
}
