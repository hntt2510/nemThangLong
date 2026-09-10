"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminDrawer } from "@/components/admin-drawer";
import { formatVnd } from "@/lib/format";

type Order = {
  id: string;
  code: string;
  customerName: string;
  guestEmail: string | null;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: Array<{ id: string; productName: string; quantity: number }>;
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Chờ thanh toán", PAID: "Đã thanh toán", FAILED: "Thanh toán lỗi",
  REVIEW_REQUIRED: "Cần kiểm tra", REFUNDED: "Đã hoàn tiền",
};

const paymentMethodLabels: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng", BANK_TRANSFER: "Chuyển khoản", MOMO: "MoMo (lịch sử)", SEPAY: "Chuyển khoản QR (SePay thử nghiệm)",
};

function labelFor(labels: Record<string, string>, value: string) {
  return labels[value] ?? value;
}

export function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const selected = orders.find((order) => order.id === selectedId) ?? null;

  async function update(id: string, action: "confirm_paid" | "confirm_cod_paid" | "cancel" | "status", nextStatus?: string) {
    setError("");
    setPending(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action === "status" ? { status: nextStatus } : { action }),
      });
      const body = (await response.json().catch(() => null)) as { status?: string; paymentStatus?: string; error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "Không thể cập nhật đơn hàng.");
        return;
      }
      setOrders((current) => current.map((order) => order.id === id
        ? { ...order, status: body?.status ?? order.status, paymentStatus: body?.paymentStatus ?? order.paymentStatus }
        : order));
    } finally {
      setPending(false);
    }
  }

  async function cancelOrder() {
    if (!selected || !window.confirm(`Hủy đơn ${selected.code}? Thao tác này không thể hoàn tác.`)) return;
    await update(selected.id, "cancel");
  }

  return (
    <>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {orders.length === 0 ? <div className="ops-empty-state">Không có đơn hàng phù hợp với bộ lọc.</div> : (
        <div className="ops-table-card ops-orders-table">
          <div className="ops-order-head" aria-hidden="true">
            <span>Đơn hàng</span><span>Khách hàng & sản phẩm</span><span>Thanh toán</span><span>Tiến độ</span><span />
          </div>
          {orders.map((order) => (
            <article className="ops-order-row" key={order.id}>
              <div className="ops-order-identity"><strong>{order.code}</strong><span>{formatVnd(order.total)}</span></div>
              <div className="ops-order-customer">
                <strong>{order.customerName}</strong><span>{order.guestEmail ?? "Khách hàng có tài khoản"}</span>
                <small>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</small>
              </div>
              <div className="ops-order-payment">
                <span>{labelFor(paymentMethodLabels, order.paymentMethod)}</span>
                <span className={`ops-status ops-status-${order.paymentStatus.toLowerCase()}`}>{labelFor(paymentStatusLabels, order.paymentStatus)}</span>
              </div>
              <span className={`ops-status ops-status-${order.status.toLowerCase()}`}>{labelFor(orderStatusLabels, order.status)}</span>
              <button className="ops-row-button" type="button" onClick={() => setSelectedId(order.id)}>Xử lý</button>
            </article>
          ))}
        </div>
      )}

      <AdminDrawer
        open={Boolean(selected)}
        title={selected ? `Đơn ${selected.code}` : "Đơn hàng"}
        onClose={() => { setSelectedId(null); setError(""); }}
      >
        {selected ? (
          <div className="ops-order-drawer">
            <section className="ops-detail-block">
              <div><span>Khách hàng</span><strong>{selected.customerName}</strong></div>
              <div><span>Liên hệ</span><strong>{selected.guestEmail ?? "Khách hàng có tài khoản"}</strong></div>
              <div><span>Tổng đơn</span><strong>{formatVnd(selected.total)}</strong></div>
            </section>
            <section className="ops-detail-block"><h3>Sản phẩm</h3>{selected.items.map((item) => <p key={item.id}>{item.productName} <strong>× {item.quantity}</strong></p>)}</section>
            <section className="ops-detail-block">
              <h3>Trạng thái hiện tại</h3>
              <div className="ops-status-pair"><span>{labelFor(paymentMethodLabels, selected.paymentMethod)}</span><span className={`ops-status ops-status-${selected.paymentStatus.toLowerCase()}`}>{labelFor(paymentStatusLabels, selected.paymentStatus)}</span></div>
              <span className={`ops-status ops-status-${selected.status.toLowerCase()}`}>{labelFor(orderStatusLabels, selected.status)}</span>
            </section>
            <section className="ops-drawer-actions">
              {selected.paymentMethod === "BANK_TRANSFER" && selected.paymentStatus === "PENDING" ? <button className="ops-button ops-button-primary" disabled={pending} onClick={() => void update(selected.id, "confirm_paid")}>Xác nhận đã nhận tiền</button> : null}
              {selected.status === "CONFIRMED" ? <button className="ops-button ops-button-primary" disabled={pending} onClick={() => void update(selected.id, "status", "PROCESSING")}>Bắt đầu xử lý</button> : null}
              {selected.status === "PROCESSING" ? <button className="ops-button ops-button-primary" disabled={pending} onClick={() => void update(selected.id, "status", "SHIPPED")}>Bàn giao vận chuyển</button> : null}
              {selected.paymentMethod === "COD" && selected.status === "SHIPPED" && selected.paymentStatus === "PENDING" ? <button className="ops-button ops-button-primary" disabled={pending} onClick={() => void update(selected.id, "confirm_cod_paid")}>Xác nhận đã thu COD</button> : null}
              {selected.status === "SHIPPED" && selected.paymentStatus === "PAID" ? <button className="ops-button ops-button-primary" disabled={pending} onClick={() => void update(selected.id, "status", "COMPLETED")}>Hoàn tất đơn hàng</button> : null}
              {selected.status !== "CANCELLED" && selected.status !== "SHIPPED" && selected.status !== "COMPLETED" && selected.paymentStatus !== "PAID" && selected.paymentStatus !== "REVIEW_REQUIRED" ? <button className="ops-button ops-button-danger" disabled={pending} onClick={() => void cancelOrder()}>Hủy đơn hàng</button> : null}
              <Link className="ops-button ops-button-secondary" href={`/admin/orders/${selected.id}` as never}>Mở trang chi tiết</Link>
            </section>
          </div>
        ) : null}
      </AdminDrawer>
    </>
  );
}
