"use client";

import { useState } from "react";

export function AccountProfileForm({ initial }: { initial: { name: string; phone: string } }) {
  const [name, setName] = useState(initial.name); const [phone, setPhone] = useState(initial.phone); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); setMessage(""); const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, phone }) }); const body = await response.json().catch(() => null) as { error?: string } | null; setSaving(false); setMessage(response.ok ? "Đã cập nhật hồ sơ." : body?.error ?? "Không thể cập nhật."); }
  return <form className="account-form" onSubmit={submit} aria-label="Hồ sơ tài khoản"><label>Họ và tên<input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label>Số điện thoại<input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" /></label>{message && <p role="status" aria-live="polite">{message}</p>}<button className="button button-primary" disabled={saving}>{saving ? "Đang lưu…" : "Lưu hồ sơ"}</button></form>;
}
