import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getLead } from "@/lib/admin-leads";
import { AdminLeadDetail } from "@/components/admin-lead-detail";
import { leadStatusLabel, leadTypeLabel } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return <main className="admin-placeholder"><p className="eyebrow">ADMIN / LEADS</p><h1>Đăng nhập để tiếp tục.</h1><Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link></main>;
  if (session.user?.role !== "ADMIN") return <main className="admin-placeholder"><p className="eyebrow">ADMIN / LEADS</p><h1>Không có quyền truy cập.</h1><p>Lead Inbox chỉ dành cho tài khoản ADMIN.</p><Link href="/admin">Quay lại admin</Link></main>;
  const prisma = getPrisma();
  const { id } = await params;
  if (!prisma) return <main className="admin-placeholder"><Link href={"/admin/leads" as never}>← Lead Inbox</Link><h1>Database chưa sẵn sàng.</h1></main>;
  const lead = await getLead(prisma, id).catch(() => null);
  if (!lead) return <main className="admin-placeholder"><Link href={"/admin/leads" as never}>← Lead Inbox</Link><h1>Không tìm thấy yêu cầu.</h1></main>;
  return <main className="admin-placeholder admin-lead-detail-page"><Link href={"/admin/leads" as never}>← Lead Inbox</Link><div className="admin-lead-detail-heading"><div><p className="eyebrow">{leadTypeLabel(lead.type)}</p><h1>{lead.fullName}</h1><p>{leadStatusLabel(lead.status)} · {lead.createdAt.toLocaleString("vi-VN")}</p></div><span className={`lead-status lead-status-${lead.status.toLowerCase()}`}>{lead.status}</span></div><div className="lead-detail-grid"><dl><dt>Họ và tên</dt><dd>{lead.fullName}</dd><dt>Số điện thoại</dt><dd><a href={`tel:${lead.phone}`}>{lead.phone}</a></dd><dt>Email</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</dd><dt>Tổ chức</dt><dd>{lead.organization ?? "—"}</dd><dt>Địa điểm dự án</dt><dd>{lead.projectLocation ?? "—"}</dd><dt>Số lượng dự kiến</dt><dd>{lead.estimatedQuantity ?? "—"}</dd><dt>Sản phẩm quan tâm</dt><dd>{lead.productSlug ?? "—"}</dd><dt>Nguồn</dt><dd>{lead.source}</dd><dt>Nội dung</dt><dd className="lead-detail-message">{lead.message ?? "—"}</dd></dl><AdminLeadDetail lead={{ id: lead.id, status: lead.status, internalNote: lead.internalNote, updatedAt: lead.updatedAt.toISOString() }} /></div></main>;
}
