import Link from "next/link";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { listAccountOrders } from "@/lib/account";
import { formatVnd } from "@/lib/format";

export const dynamic = "force-dynamic";

import { isUiShowcaseMode, getShowcaseOrders } from "@/lib/ui-showcase";

export default async function OrdersPage() {
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  const showcaseOrders = showcase ? getShowcaseOrders() : null;

  if (!session?.user?.id && !showcase) {
    return (
      <main className="account-page container">
        <h1>Đăng nhập để xem lịch sử đơn hàng.</h1>
        <Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link>
      </main>
    );
  }
  const prisma = getPrisma();
  const orders = showcaseOrders ?? (prisma && session?.user?.id
    ? await listAccountOrders(prisma, session.user.id).catch(() => null)
    : null);

  if (!orders) {
    return (
      <main className="account-page container">
        <h1>Không thể tải đơn hàng.</h1>
        <p className="muted">Đã xảy ra lỗi khi đọc dữ liệu.</p>
      </main>
    );
  }
  const result = { ok: true as const, orders };
  return (
    <main className="account-page container">
      <Link href="/tai-khoan" className="text-link">← Tài khoản</Link>
      <p className="eyebrow">TÀI KHOẢN / ĐƠN HÀNG</p>
      <h1>Lịch sử đơn hàng.</h1>
      {result.orders.length === 0 ? (
        <div className="account-empty-state">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link href={"/nem" as never} className="button button-secondary">Khám phá các dòng nệm</Link>
        </div>
      ) : (
        <div className="account-order-list">
          {result.orders.map((order) => (
            <Link href={`/tai-khoan/don-hang/${order.id}` as never} className="account-order-card" key={order.id}>
              <div className="account-order-card-header">
                <div>
                  <strong>{order.code}</strong>
                  <small>{order.createdAt.toLocaleDateString("vi-VN")}</small>
                </div>
                <div className="account-order-card-meta">
                  <span className="order-badge">{order.status}</span>
                  <strong>{formatVnd(order.total)}</strong>
                </div>
              </div>
              <ul className="account-order-card-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} · Số lượng: {item.quantity}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
