"use client";

import { useState } from "react";

export function AdminSettingsForm({ initial }: { initial: { shippingFee: number | null; freeShippingThreshold: number | null; bankTransferInfo: Record<string, unknown> | null } | null }) {
  const [shippingFee, setShippingFee] = useState(initial?.shippingFee == null ? "" : String(initial.shippingFee));
  const [threshold, setThreshold] = useState(initial?.freeShippingThreshold == null ? "" : String(initial.freeShippingThreshold));
  const [bank, setBank] = useState(initial?.bankTransferInfo ? JSON.stringify(initial.bankTransferInfo, null, 2) : "");
  const [message, setMessage] = useState("");
  async function save() {
    let bankTransferInfo: Record<string, string> | null = null;
    try { bankTransferInfo = bank.trim() ? JSON.parse(bank) as Record<string, string> : null; } catch { setMessage("JSON không hợp lệ."); return; }
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ shippingFee: shippingFee === "" ? null : Number(shippingFee), freeShippingThreshold: threshold === "" ? null : Number(threshold), bankTransferInfo }) });
    const body = await response.json().catch(() => null) as { error?: string } | null;
    setMessage(response.ok ? "Saved just now" : body?.error ?? "Không thể lưu settings.");
  }
  return <div className="admin-form"><label>Shipping fee (VND)<input type="number" min="0" value={shippingFee} onChange={(event) => setShippingFee(event.target.value)} /></label><label>Free shipping threshold<input type="number" min="0" value={threshold} onChange={(event) => setThreshold(event.target.value)} /></label><label className="full">Bank transfer info (JSON)<textarea rows={8} value={bank} onChange={(event) => setBank(event.target.value)} placeholder={'{"bank":"...","account":"..."}'} /></label>{message && <p className="admin-note">{message}</p>}<button className="button button-primary" onClick={() => void save()}>Save settings</button></div>;
}
