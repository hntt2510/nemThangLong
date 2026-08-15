"use client";

import { useState } from "react";

export function AdminPaymentReviewActions({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function resolve(action: "FULFILL" | "MANUAL_REFUND_RECORDED") { const note = action === "MANUAL_REFUND_RECORDED" ? window.prompt("Nhập ghi chú hoặc mã tham chiếu hoàn tiền đã thực hiện:") : null; if (action === "MANUAL_REFUND_RECORDED" && !note) return; setBusy(true); setMessage(""); const response = await fetch(`/api/admin/payment-reviews/${orderId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(action === "FULFILL" ? { action } : { action, confirmation: true, note }) }); const body = await response.json().catch(() => null) as { error?: string } | null; setBusy(false); if (!response.ok) { setMessage(body?.error ?? "Không thể xử lý."); return; } setMessage("Đã lưu xử lý."); }
  return <div className="admin-payment-review-actions"><button className="button button-primary" disabled={busy} onClick={() => void resolve("FULFILL")}>Fulfill sau khi kiểm tra tồn kho</button><button className="button button-secondary" disabled={busy} onClick={() => void resolve("MANUAL_REFUND_RECORDED")}>Ghi nhận hoàn tiền ngoài hệ thống</button>{message && <p className="admin-note" role="status">{message}</p>}</div>;
}
