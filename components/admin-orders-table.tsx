"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVnd } from "@/lib/format";

type Order = { id: string; code: string; customerName: string; guestEmail: string | null; total: number; status: string; paymentMethod: string; paymentStatus: string; items: Array<{ id: string; productName: string; quantity: number }> };

export function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders); const [error, setError] = useState("");
  async function update(id: string, action: "confirm_paid" | "cancel" | "status", nextStatus?: string) {
    setError(""); const response = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(action === "status" ? { status: nextStatus } : { action }) }); const body = await response.json().catch(() => null) as { status?: string; paymentStatus?: string; error?: string } | null; if (!response.ok) { setError(body?.error ?? "Không thể cập nhật đơn hàng."); return; } setOrders((current) => current.map((order) => order.id === id ? { ...order, status: body?.status ?? order.status, paymentStatus: body?.paymentStatus ?? order.paymentStatus } : order));
  }
  return <div className="admin-orders-table">{error && <p className="form-error" role="alert">{error}</p>}{orders.length === 0 ? <div className="admin-note">Chưa có đơn hàng.</div> : orders.map((order) => <article className="admin-order-card" key={order.id}><div><Link className="text-link" href={`/admin/orders/${order.id}` as never}>{order.code}</Link><span>{order.customerName} · {order.guestEmail ?? "account"}</span><small>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</small></div><div><strong>{formatVnd(order.total)}</strong><span>{order.paymentMethod} · {order.paymentStatus} · {order.status}</span>{order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "PENDING" && <button className="button button-secondary" onClick={() => void update(order.id, "confirm_paid")}>Confirm paid</button>}{order.status === "CONFIRMED" && <button className="button button-secondary" onClick={() => void update(order.id, "status", "PROCESSING")}>Processing</button>}{order.status === "PROCESSING" && <button className="button button-secondary" onClick={() => void update(order.id, "status", "SHIPPED")}>Shipped</button>}{order.status === "SHIPPED" && <button className="button button-secondary" onClick={() => void update(order.id, "status", "COMPLETED")}>Completed</button>}{order.status !== "CANCELLED" && order.paymentStatus !== "PAID" && order.paymentStatus !== "REVIEW_REQUIRED" && <button className="button button-dark" onClick={() => void update(order.id, "cancel")}>Cancel</button>}</div></article>)}</div>;
}
