import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db";
import { getAccountOrder } from "@/lib/account";
import { formatDimension, formatVnd } from "@/lib/format";

export const dynamic = "force-dynamic";

import { isUiShowcaseMode, getShowcaseOrder } from "@/lib/ui-showcase";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const showcase = isUiShowcaseMode() && !session?.user?.id;
  const showcaseOrder = showcase ? getShowcaseOrder(id) : null;

  if (!session?.user?.id && !showcase) {
    return (
      <main className="account-page container">
        <h1>Đăng nhập để xem đơn hàng.</h1>
        <Link href="/dang-nhap" className="button button-primary">Đăng nhập</Link>
      </main>
    );
  }
  const prisma = getPrisma();
  const order = (showcaseOrder ?? (prisma && session?.user?.id
    ? await getAccountOrder(prisma, session.user.id, id).catch(() => null)
    : null)) as any;

  if (!order) notFound();
  const address = typeof order.shippingAddress === "object" && order.shippingAddress !== null
    ? (order.shippingAddress as Record<string, string | undefined>)
    : null;

  return (
    <main className="account-page container">
      <Link href="/tai-khoan/don-hang" className="text-link">← Danh sách đơn hàng</Link>
      <p className="eyebrow">CHI TIẾT ĐƠN HÀNG</p>
      <h1>{order.code}</h1>
      <p className="muted">
        Trạng thái: <strong>{order.status}</strong> · Thanh toán: <strong>{order.paymentStatus}</strong> ({order.paymentMethod}) · Ngày đặt: {order.createdAt.toLocaleString("vi-VN")}
      </p>
      <div className="account-order-detail">
        <ul className="account-order-items-list">
          {order.items.map((item: any) => (
            <li key={item.id}>
              <div>
                <strong>{item.productName}</strong>
                <small>{item.sku} · {formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm</small>
              </div>
              <div className="account-item-pricing">
                <span>{item.quantity} × {formatVnd(item.unitPrice)}</span>
                <strong>{formatVnd(item.unitPrice * item.quantity)}</strong>
              </div>
            </li>
          ))}
        </ul>
        <dl className="account-order-summary-dl">
          <dt>Tạm tính</dt>
          <dd>{formatVnd(order.subtotal)}</dd>
          <dt>Phí giao hàng</dt>
          <dd>{formatVnd(order.shippingFee)}</dd>
          <dt className="total-label">Tổng cộng</dt>
          <dd className="total-value">{formatVnd(order.total)}</dd>
          <dt>Phương thức thanh toán</dt>
          <dd>{order.paymentMethod} ({order.paymentStatus})</dd>
        </dl>
        <div className="account-shipping-info">
          <h2>Địa chỉ nhận hàng</h2>
          {address ? (
            <div className="account-address-card">
              {address.customerName && <p><strong>{address.customerName}</strong></p>}
              {address.customerPhone && <p>{address.customerPhone}</p>}
              {address.guestEmail && <p>{address.guestEmail}</p>}
              <p>{[address.line1, address.district, address.province].filter(Boolean).join(", ")}</p>
            </div>
          ) : (
            <pre className="bank-transfer-info">{JSON.stringify(order.shippingAddress, null, 2)}</pre>
          )}
        </div>
      </div>
    </main>
  );
}
