import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminAfterSales } from "@/lib/after-sales";
import { formatVnd } from "@/lib/format";
import { AdminAfterSalesDetail } from "@/components/admin-after-sales-detail";

export const dynamic = "force-dynamic";

export default async function AdminAfterSalesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); const id = (await params).id;
  if (!session) return <main className="admin-placeholder"><h1>Đăng nhập để tiếp tục.</h1><Link href="/dang-nhap">Đăng nhập</Link></main>;
  if (!isAdmin(session)) return <main className="admin-placeholder"><h1>Không có quyền truy cập.</h1><Link href="/admin">Quay lại admin</Link></main>;
  const prisma = getPrisma(); if (!prisma) return <main className="admin-placeholder"><h1>Database chưa sẵn sàng.</h1></main>;
  const item = await getAdminAfterSales(prisma, id).catch(() => null);
  if (!item) return <main className="admin-placeholder"><Link href={"/admin/after-sales" as never}>← After-sales</Link><h1>Không tìm thấy yêu cầu.</h1></main>;
  return <main className="admin-placeholder admin-lead-detail-page"><Link href={"/admin/after-sales" as never}>← After-sales</Link><div className="admin-lead-detail-heading"><div><p className="eyebrow">{item.type === "WARRANTY_REVIEW" ? "KIỂM TRA BẢO HÀNH" : "HỖ TRỢ SẢN PHẨM"}</p><h1>{item.subject}</h1><p>{item.status} · {item.createdAt.toLocaleString("vi-VN")}</p></div></div><div className="lead-detail-grid"><dl><dt>Khách hàng</dt><dd>{item.user.name ?? "—"}</dd><dt>Email</dt><dd>{item.user.email}</dd><dt>Số điện thoại</dt><dd>{item.user.phone}</dd><dt>Đơn hàng</dt><dd>{item.order.code} · {formatVnd(item.order.total)}</dd><dt>Sản phẩm</dt><dd>{item.orderItem.productName} · {item.orderItem.sku} · {item.orderItem.width}×{item.orderItem.length}×{item.orderItem.thickness}cm</dd><dt>Nội dung</dt><dd className="lead-detail-message">{item.description}</dd></dl><AdminAfterSalesDetail request={{ id: item.id, status: item.status, internalNote: item.internalNote, updatedAt: item.updatedAt.toISOString() }} /></div></main>;
}
