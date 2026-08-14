"use client";

import { useState } from "react";

export function AdminSettingsForm({ initial }: { initial: { shippingFee: number | null; freeShippingThreshold: number | null; bankTransferReservationMinutes: number | null; bankTransferInfo: Record<string, unknown> | null } | null }) {
  const [shippingFee, setShippingFee] = useState(initial?.shippingFee == null ? "" : String(initial.shippingFee));
  const [threshold, setThreshold] = useState(initial?.freeShippingThreshold == null ? "" : String(initial.freeShippingThreshold));
  const [bankMinutes, setBankMinutes] = useState(initial?.bankTransferReservationMinutes == null ? "" : String(initial.bankTransferReservationMinutes));
  const [bank, setBank] = useState(initial?.bankTransferInfo ? JSON.stringify(initial.bankTransferInfo, null, 2) : "");
  const [message, setMessage] = useState("");
  async function save() {
    let bankTransferInfo: Record<string, string> | null = null;
    try { bankTransferInfo = bank.trim() ? JSON.parse(bank) as Record<string, string> : null; } catch { setMessage("JSON không hợp lệ."); return; }
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ shippingFee: shippingFee === "" ? null : Number(shippingFee), freeShippingThreshold: threshold === "" ? null : Number(threshold), bankTransferReservationMinutes: bankMinutes === "" ? null : Number(bankMinutes), bankTransferInfo }) });
    const body = await response.json().catch(() => null) as { error?: string } | null;
    setMessage(response.ok ? "Saved just now" : body?.error ?? "Không thể lưu settings.");
  }
  return <div className="admin-form"><label>Shipping fee (VND)<input type="number" min="0" value={shippingFee} onChange={(event) => setShippingFee(event.target.value)} /></label><label>Free shipping threshold<input type="number" min="0" value={threshold} onChange={(event) => setThreshold(event.target.value)} /></label><label>Bank reservation (minutes)<input type="number" min="5" max="10080" value={bankMinutes} onChange={(event) => setBankMinutes(event.target.value)} /><small>Chuyển khoản chỉ mở khi có TTL từ 5 đến 10.080 phút.</small></label><label className="full">Bank transfer info (JSON)<textarea rows={8} value={bank} onChange={(event) => setBank(event.target.value)} placeholder={'{"bank":"...","account":"..."}'} /></label>{message && <p className="admin-note">{message}</p>}<button className="button button-primary" onClick={() => void save()}>Save settings</button></div>;
}
