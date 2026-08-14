import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { formatVnd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN / ĐƠN HÀNG</p><h1>Lịch sử đơn hàng.</h1><p className="muted">Vui lòng <Link href="/dang-nhap" className="text-link">đăng nhập</Link> để xem lịch sử.</p></main>;
  const prisma = getPrisma();
  if (!prisma) return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN / ĐƠN HÀNG</p><h1>Lịch sử đơn hàng.</h1><p className="muted">Database chưa sẵn sàng.</p></main>;
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }).catch(() => []);
  return <main className="account-page container"><p className="eyebrow">TÀI KHOẢN / ĐƠN HÀNG</p><h1>Lịch sử đơn hàng.</h1>{orders.length === 0 ? <div className="admin-note">Bạn chưa có đơn hàng nào.</div> : <div className="account-order-list">{orders.map((order) => <article className="account-order-card" key={order.id}><div><strong>{order.code}</strong><small>{order.createdAt.toLocaleDateString("vi-VN")}</small></div><div><span>{order.status} · {order.paymentStatus}</span><strong>{formatVnd(order.total)}</strong></div><ul>{order.items.map((item) => <li key={item.id}>{item.productName} · {item.quantity}</li>)}</ul></article>)}</div>}</main>;
}
