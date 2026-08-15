import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { AdminOrdersTable } from "@/components/admin-orders-table";
import { listAdminOrders, parseOrderFilters } from "@/lib/admin-orders";

export const dynamic = "force-dynamic";

function queryValue(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function AdminOrdersPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth(); if (!session?.user) return <main className="admin-placeholder"><Link href="/dang-nhap">Đăng nhập</Link></main>; if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return <main className="admin-placeholder"><h1>Không có quyền.</h1></main>;
  const prisma = getPrisma(); if (!prisma) return <main className="admin-placeholder"><h1>Không thể tải Orders.</h1><p>Database chưa sẵn sàng.</p></main>;
  const raw = await searchParams ?? {}; const params = new URLSearchParams(); for (const [key, value] of Object.entries(raw)) { const item = queryValue(value); if (item) params.set(key, item); }
  const filters = parseOrderFilters(params); const result = await listAdminOrders(prisma, filters).catch(() => null); if (!result) return <main className="admin-placeholder"><h1>Không thể tải Orders.</h1><p>Đã xảy ra lỗi khi đọc dữ liệu.</p></main>;
  const pageLink = (page: number) => { const next = new URLSearchParams(params); next.set("page", String(page)); return `/admin/orders?${next.toString()}` as never; };
  return <main className="admin-placeholder"><Link href="/admin/products">← Product CMS</Link><p className="eyebrow">ADMIN / ORDERS</p><h1>Orders</h1><form className="lead-inbox-filters" method="get"><label>Tìm kiếm<input name="q" defaultValue={filters.q ?? ""} placeholder="Mã đơn, tên, số điện thoại, email" /></label><label>Status<select name="status" defaultValue={filters.status ?? ""}><option value="">Tất cả</option>{["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Payment status<select name="paymentStatus" defaultValue={filters.paymentStatus ?? ""}><option value="">Tất cả</option>{["PENDING", "PAID", "FAILED", "REVIEW_REQUIRED", "REFUNDED"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Payment method<select name="paymentMethod" defaultValue={filters.paymentMethod ?? ""}><option value="">Tất cả</option>{["COD", "BANK_TRANSFER", "MOMO"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><button className="button button-secondary" type="submit">Lọc</button></form><p className="muted">{result.total} đơn · trang {result.page}</p><AdminOrdersTable initialOrders={result.items.map((order) => ({ id: order.id, code: order.code, customerName: order.customerName, guestEmail: order.guestEmail, total: order.total, status: order.status, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, items: order.items.map((item) => ({ id: item.id, productName: item.productName, quantity: item.quantity })) }))} /><nav className="admin-pagination" aria-label="Phân trang Orders">{result.page > 1 && <Link className="button button-secondary" href={pageLink(result.page - 1)}>← Mới hơn</Link>}{result.page * result.pageSize < result.total && <Link className="button button-secondary" href={pageLink(result.page + 1)}>Cũ hơn →</Link>}</nav></main>;
}
