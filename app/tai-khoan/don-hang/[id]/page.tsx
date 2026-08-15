import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountOrder } from "@/lib/account";
import { formatVnd } from "@/lib/format";

export const dynamic = "force-dynamic";
export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return <main className="account-page container"><h1>Đăng nhập để xem đơn hàng.</h1><Link href="/dang-nhap">Đăng nhập</Link></main>;
  const prisma = getPrisma(); if (!prisma) return <main className="account-page container"><h1>Không thể tải đơn hàng.</h1><p className="muted">Database chưa sẵn sàng.</p></main>;
  const result = await getAccountOrder(prisma, session.user.id, (await params).id).then((order) => ({ ok: true as const, order })).catch(() => ({ ok: false as const }));
  if (!result.ok) return <main className="account-page container"><h1>Không thể tải đơn hàng.</h1><p className="muted">Đã xảy ra lỗi khi đọc dữ liệu.</p></main>;
  if (!result.order) notFound();
  const order = result.order;
  return <main className="account-page container"><Link href="/tai-khoan/don-hang">← Đơn hàng</Link><p className="eyebrow">ĐƠN HÀNG / {order.code}</p><h1>{order.code}</h1><p className="muted">{order.status} · {order.paymentStatus} · {order.createdAt.toLocaleString("vi-VN")}</p><div className="account-order-detail"><ul>{order.items.map((item) => <li key={item.id}><strong>{item.productName}</strong><span>{item.sku} · {item.width}×{item.length}×{item.thickness}cm · {item.quantity} × {formatVnd(item.unitPrice)} = {formatVnd(item.unitPrice * item.quantity)}</span></li>)}</ul><dl><dt>Tạm tính</dt><dd>{formatVnd(order.subtotal)}</dd><dt>Phí giao hàng</dt><dd>{formatVnd(order.shippingFee)}</dd><dt>Tổng</dt><dd>{formatVnd(order.total)}</dd><dt>Thanh toán</dt><dd>{order.paymentMethod} · {order.paymentStatus}</dd></dl><div><h2>Địa chỉ giao hàng</h2><pre>{JSON.stringify(order.shippingAddress, null, 2)}</pre></div></div></main>;
}
