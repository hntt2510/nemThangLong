import Link from "next/link";
import { AdminOrdersTable } from "@/components/admin-orders-table";
import { listAdminOrders, parseOrderFilters } from "@/lib/admin-orders";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const orderStatuses: Record<string, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy",
};

const paymentStatuses: Record<string, string> = {
  PENDING: "Chờ thanh toán", PAID: "Đã thanh toán", FAILED: "Thanh toán lỗi",
  REVIEW_REQUIRED: "Cần kiểm tra", REFUNDED: "Đã hoàn tiền",
};

const paymentMethods: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng", BANK_TRANSFER: "Chuyển khoản", MOMO: "MoMo (lịch sử)", SEPAY: "Chuyển khoản QR (SePay thử nghiệm)",
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const prisma = getPrisma();
  if (!prisma) return <div className="ops-empty-state"><strong>Không thể tải đơn hàng.</strong><span>Database chưa sẵn sàng.</span></div>;

  const raw = (await searchParams) ?? {};
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const item = queryValue(value);
    if (item) params.set(key, item);
  }

  const filters = parseOrderFilters(params);
  const result = await listAdminOrders(prisma, filters).catch(() => null);
  if (!result) return <div className="ops-empty-state"><strong>Không thể tải đơn hàng.</strong><span>Đã xảy ra lỗi khi đọc dữ liệu.</span></div>;

  const pageLink = (page: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    return `/admin/orders?${next.toString()}` as never;
  };

  return (
    <div className="ops-stack">
      <section className="ops-page-heading">
        <p className="ops-overline">BÁN HÀNG</p>
        <h1>Đơn hàng</h1>
        <p>Theo dõi thanh toán, khách hàng và tiến độ giao hàng.</p>
      </section>

      <form className="ops-filter-form" method="get">
        <label><span>Tìm kiếm</span><input name="q" defaultValue={filters.q ?? ""} placeholder="Mã đơn, tên, điện thoại hoặc email" /></label>
        <label><span>Trạng thái đơn</span><select name="status" defaultValue={filters.status ?? ""}><option value="">Tất cả trạng thái</option>{Object.entries(orderStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Thanh toán</span><select name="paymentStatus" defaultValue={filters.paymentStatus ?? ""}><option value="">Tất cả trạng thái</option>{Object.entries(paymentStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Phương thức</span><select name="paymentMethod" defaultValue={filters.paymentMethod ?? ""}><option value="">Tất cả phương thức</option>{Object.entries(paymentMethods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className="ops-button ops-button-primary" type="submit">Lọc đơn</button>
      </form>

      <div className="ops-list-meta"><strong>{result.total} đơn hàng</strong><span>Trang {result.page}</span></div>
      <AdminOrdersTable initialOrders={result.items.map((order) => ({
        id: order.id, code: order.code, customerName: order.customerName, guestEmail: order.guestEmail,
        total: order.total, status: order.status, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
        items: order.items.map((item) => ({ id: item.id, productName: item.productName, quantity: item.quantity })),
      }))} />
      <nav className="ops-pagination" aria-label="Phân trang đơn hàng">
        {result.page > 1 ? <Link className="ops-button ops-button-secondary" href={pageLink(result.page - 1)}>← Trang trước</Link> : null}
        {result.page * result.pageSize < result.total ? <Link className="ops-button ops-button-secondary" href={pageLink(result.page + 1)}>Trang sau →</Link> : null}
      </nav>
    </div>
  );
}
