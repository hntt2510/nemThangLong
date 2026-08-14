import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listLeads, parseLeadFilters } from "@/lib/admin-leads";
import { leadStatusLabel, leadTypeLabel, maskEmail, maskPhone } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session) return <main className="admin-placeholder"><p className="eyebrow">ADMIN / LEADS</p><h1>Đăng nhập để tiếp tục.</h1><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  if (role !== "ADMIN") return <main className="admin-placeholder"><p className="eyebrow">ADMIN / LEADS</p><h1>Không có quyền truy cập.</h1><p>Lead Inbox chỉ dành cho tài khoản ADMIN.</p><Link href="/admin" className="text-link">Quay lại admin</Link></main>;

  const raw = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) for (const item of Array.isArray(value) ? value : value ? [value] : []) query.append(key, item);
  const filters = parseLeadFilters(query);
  const prisma = getPrisma();
  if (!prisma) return <main className="admin-placeholder"><Link href="/admin">← Product editor</Link><p className="eyebrow">ADMIN / LEADS</p><h1>Database chưa sẵn sàng.</h1><p>Không thể tải Lead Inbox khi database chưa được cấu hình.</p></main>;
  const result = await listLeads(prisma, filters).catch(() => null);
  if (!result) return <main className="admin-placeholder"><Link href="/admin">← Product editor</Link><p className="eyebrow">ADMIN / LEADS</p><h1>Không thể tải yêu cầu.</h1><p>Hãy thử lại sau.</p></main>;

  return <main className="admin-placeholder admin-leads-page">
    <div className="admin-leads-heading"><div><Link href="/admin">← Product editor</Link><p className="eyebrow">ADMIN / LEADS</p><h1>Lead Inbox</h1><p>{result.total} yêu cầu · mới nhất trước</p></div><Link href={"/khach-san-du-an" as never} className="text-link">Storefront →</Link></div>
    <form className="lead-inbox-filters" method="get">
      <label>Tìm kiếm<input name="q" defaultValue={filters.q} placeholder="Tên, số điện thoại, email, tổ chức" /></label>
      <label>Loại<select name="type" defaultValue={filters.type ?? ""}><option value="">Tất cả</option><option value="CONSULTATION">Tư vấn sản phẩm</option><option value="B2B_PROJECT">Khách sạn & dự án</option></select></label>
      <label>Trạng thái<select name="status" defaultValue={filters.status ?? ""}><option value="">Tất cả</option><option value="NEW">Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="CLOSED">Đã đóng</option></select></label>
      <button className="button button-secondary" type="submit">Lọc</button>
    </form>
    <div className="lead-inbox-table" role="table" aria-label="Danh sách yêu cầu">
      <div className="lead-inbox-row lead-inbox-head" role="row"><span>Người liên hệ</span><span>Loại</span><span>Trạng thái</span><span>Sản phẩm</span><span>Thời gian</span></div>
      {result.items.length === 0 ? <p className="admin-note">Chưa có yêu cầu phù hợp.</p> : result.items.map((lead) => <Link className="lead-inbox-row" role="row" href={`/admin/leads/${lead.id}` as never} key={lead.id}><span><strong>{lead.fullName}</strong><small>{maskPhone(lead.phone)}{lead.email ? ` · ${maskEmail(lead.email)}` : ""}{lead.organization ? ` · ${lead.organization}` : ""}</small></span><span>{leadTypeLabel(lead.type)}</span><span><b className={`lead-status lead-status-${lead.status.toLowerCase()}`}>{leadStatusLabel(lead.status)}</b></span><span>{lead.productSlug ?? "—"}</span><time dateTime={lead.createdAt.toISOString()}>{lead.createdAt.toLocaleString("vi-VN")}</time></Link>)}
    </div>
    {result.total > result.pageSize && <nav className="lead-pagination" aria-label="Phân trang"><span>Trang {result.page}</span>{result.page > 1 && <Link href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(query), page: String(result.page - 1) })}` as never}>← Trước</Link>}{result.page * result.pageSize < result.total && <Link href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(query), page: String(result.page + 1) })}` as never}>Sau →</Link>}</nav>}
  </main>;
}
