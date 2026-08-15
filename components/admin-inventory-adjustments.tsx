"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type InventoryItem = {
  id: string;
  sku: string;
  width: number;
  length: number;
  thickness: number;
  stock: number;
  active: boolean;
  product: { slug: string; name: string };
  inventoryAdjustments: Array<{ delta: number; reason: string; note?: string | null; resultingStock: number; createdAt: Date }>;
};

type Draft = { delta: string; reason: "RECEIPT" | "CORRECTION" | "DAMAGE" | "OTHER"; note: string };

const emptyDraft: Draft = { delta: "", reason: "RECEIPT", note: "" };

export function AdminInventoryAdjustments({ initialItems }: { initialItems: InventoryItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function draftFor(id: string) { return drafts[id] ?? emptyDraft; }
  function updateDraft(id: string, patch: Partial<Draft>) { setDrafts((current) => ({ ...current, [id]: { ...draftFor(id), ...patch } })); }

  async function submit(id: string) {
    const draft = draftFor(id);
    const delta = Number(draft.delta);
    if (!Number.isSafeInteger(delta) || delta === 0) { setErrors((current) => ({ ...current, [id]: "Delta phải là số nguyên khác 0." })); return; }
    setPending(id); setErrors((current) => ({ ...current, [id]: "" }));
    try {
      const response = await fetch("/api/admin/inventory", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantId: id, delta, reason: draft.reason, note: draft.note || undefined }) });
      const body = await response.json().catch(() => null) as { resultingStock?: number; error?: string } | null;
      if (!response.ok) { setErrors((current) => ({ ...current, [id]: body?.error === "INSUFFICIENT_STOCK" ? "Không đủ tồn kho để giảm số lượng này." : body?.error ?? "Không thể điều chỉnh tồn kho." })); return; }
      if (typeof body?.resultingStock === "number") setItems((current) => current.map((item) => item.id === id ? { ...item, stock: body.resultingStock! } : item));
      setDrafts((current) => ({ ...current, [id]: emptyDraft }));
      router.refresh();
    } catch {
      setErrors((current) => ({ ...current, [id]: "Không thể kết nối để điều chỉnh tồn kho." }));
    } finally { setPending(null); }
  }

  return <div className="admin-inventory-list">{items.length === 0 ? <p className="admin-note">Chưa có variant.</p> : items.map((item) => { const draft = draftFor(item.id); const last = item.inventoryAdjustments[0]; return <article className="admin-inventory-card" key={item.id}><div className="admin-inventory-summary"><div><p className="eyebrow">{item.product.slug}</p><h2>{item.product.name}</h2><strong>{item.sku}</strong><span>{item.width} × {item.length} × {item.thickness} cm · {item.active ? "Active" : "Inactive"}</span></div><div><small>Tồn hiện tại</small><strong>{item.stock}</strong>{last && <small>Điều chỉnh gần nhất: {last.delta > 0 ? "+" : ""}{last.delta} · {last.reason} · còn {last.resultingStock}</small>}</div></div><form className="admin-inventory-form" onSubmit={(event) => { event.preventDefault(); void submit(item.id); }}><label>Delta<input type="number" step="1" value={draft.delta} onChange={(event) => updateDraft(item.id, { delta: event.target.value })} placeholder="+10 hoặc -3" /></label><label>Reason<select value={draft.reason} onChange={(event) => updateDraft(item.id, { reason: event.target.value as Draft["reason"] })}><option value="RECEIPT">RECEIPT</option><option value="CORRECTION">CORRECTION</option><option value="DAMAGE">DAMAGE</option><option value="OTHER">OTHER</option></select></label><label>Note <span>(optional)</span><input value={draft.note} maxLength={4000} onChange={(event) => updateDraft(item.id, { note: event.target.value })} /></label><button className="button button-secondary" disabled={pending !== null} type="submit">{pending === item.id ? "Đang lưu…" : "Lưu điều chỉnh"}</button></form>{errors[item.id] && <p className="form-error" role="alert">{errors[item.id]}</p>}</article>; })}</div>;
}
