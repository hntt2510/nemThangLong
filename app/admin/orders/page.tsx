import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { AdminOrdersTable } from "@/components/admin-orders-table";
import { listAdminOrders, parseOrderFilters } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth(); if (!session?.user) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>; if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return <main className="admin-placeholder"><h1>Không có quyền.</h1></main>;
  const prisma = getPrisma(); if (!prisma) return <main className="admin-placeholder"><h1>Không thể tải Orders.</h1><p>Database chưa sẵn sàng.</p></main>;
  const raw = await searchParams; const params = new URLSearchParams(); if (raw) for (const [key, value] of Object.entries(raw)) if (typeof value === "string") params.set(key, value);
  const result = await listAdminOrders(prisma, parseOrderFilters(params)).catch(() => null); if (!result) return <main className="admin-placeholder"><h1>Không thể tải Orders.</h1><p>Đã xảy ra lỗi khi đọc dữ liệu.</p></main>;
  return <main className="admin-placeholder"><Link href="/admin/products">← Product CMS</Link><p className="eyebrow">ADMIN / ORDERS</p><h1>Orders</h1><AdminOrdersTable initialOrders={result.items.map((order) => ({ id: order.id, code: order.code, customerName: order.customerName, guestEmail: order.guestEmail, total: order.total, status: order.status, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, items: order.items.map((item) => ({ id: item.id, productName: item.productName, quantity: item.quantity })) }))} /></main>;
}
