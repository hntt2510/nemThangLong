import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { listAdminAfterSales, parseAfterSalesFilters } from "@/lib/after-sales";
import { maskEmail, maskPhone } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function AdminAfterSalesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth();
  if (!session) return <main className="admin-placeholder"><p className="eyebrow">ADMIN / AFTER-SALES</p><h1>Đăng nhập để tiếp tục.</h1><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  if (!isAdmin(session)) return <main className="admin-placeholder"><p className="eyebrow">ADMIN / AFTER-SALES</p><h1>Không có quyền truy cập.</h1><p>Inbox sau mua chỉ dành cho tài khoản ADMIN.</p><Link href="/admin">Quay lại admin</Link></main>;
  const raw = await searchParams; const query = new URLSearchParams(); for (const [key, value] of Object.entries(raw)) for (const item of Array.isArray(value) ? value : value ? [value] : []) query.append(key, item);
  const filters = parseAfterSalesFilters(query); const prisma = getPrisma();
  if (!prisma) return <main className="admin-placeholder"><Link href="/admin">← Product editor</Link><h1>Database chưa sẵn sàng.</h1></main>;
  const result = await listAdminAfterSales(prisma, filters).catch(() => null);
  if (!result) return <main className="admin-placeholder"><h1>Không thể tải yêu cầu.</h1></main>;
  return <main className="admin-placeholder admin-leads-page"><div className="admin-leads-heading"><div><Link href="/admin">← Product editor</Link><p className="eyebrow">ADMIN / AFTER-SALES</p><h1>Yêu cầu sau mua</h1><p>{result.total} yêu cầu · mới nhất trước</p></div></div><form className="lead-inbox-filters" method="get"><label>Tìm kiếm<input name="q" defaultValue={filters.q} placeholder="Tên, đơn hàng, sản phẩm, SKU" /></label><label>Loại<select name="type" defaultValue={filters.type ?? ""}><option value="">Tất cả</option><option value="WARRANTY_REVIEW">Kiểm tra bảo hành</option><option value="PRODUCT_SUPPORT">Hỗ trợ sản phẩm</option></select></label><label>Trạng thái<select name="status" defaultValue={filters.status ?? ""}><option value="">Tất cả</option><option value="SUBMITTED">Đã tiếp nhận</option><option value="REVIEWING">Đang kiểm tra</option><option value="RESOLVED">Đã xử lý</option><option value="CLOSED">Đã đóng</option></select></label><button className="button button-secondary" type="submit">Lọc</button></form><div className="lead-inbox-table" role="table" aria-label="Danh sách yêu cầu sau mua"><div className="lead-inbox-row lead-inbox-head" role="row"><span>Khách hàng</span><span>Loại</span><span>Trạng thái</span><span>Sản phẩm</span><span>Thời gian</span></div>{result.items.length === 0 ? <p className="admin-note">Chưa có yêu cầu phù hợp.</p> : result.items.map((item) => <Link className="lead-inbox-row" role="row" href={`/admin/after-sales/${item.id}` as never} key={item.id}><span><strong>{item.user.name ?? "Khách hàng"}</strong><small>{maskPhone(item.user.phone ?? "")}{item.user.email ? ` · ${maskEmail(item.user.email)}` : ""} · {item.order.code}</small></span><span>{item.type === "WARRANTY_REVIEW" ? "Kiểm tra bảo hành" : "Hỗ trợ sản phẩm"}</span><span><b className={`lead-status lead-status-${item.status.toLowerCase()}`}>{item.status}</b></span><span>{item.orderItem.productName} · {item.orderItem.sku}</span><time dateTime={item.createdAt.toISOString()}>{item.createdAt.toLocaleString("vi-VN")}</time></Link>)}</div></main>;
}
