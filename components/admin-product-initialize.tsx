"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminProductInitialize({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const router = useRouter();
  async function initialize() { setBusy(true); setError(""); const response = await fetch("/api/admin/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) }); if (!response.ok) { const body = await response.json().catch(() => null) as { error?: string } | null; setError(body?.error ?? "Không thể khởi tạo."); setBusy(false); return; } router.push(`/admin/products/${slug}`); }
  return <div><button className="button button-secondary" disabled={busy} onClick={() => void initialize()}>{busy ? "Đang khởi tạo…" : "Khởi tạo document"}</button>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
