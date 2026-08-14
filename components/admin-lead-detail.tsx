"use client";

import { useState } from "react";

type LeadDetailProps = { lead: { id: string; status: "NEW" | "IN_PROGRESS" | "CLOSED"; internalNote: string | null; updatedAt: string } };

export function AdminLeadDetail({ lead }: LeadDetailProps) {
  const [status, setStatus] = useState(lead.status);
  const [internalNote, setInternalNote] = useState(lead.internalNote ?? "");
  const [updatedAt, setUpdatedAt] = useState(lead.updatedAt);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setState("saving"); setError("");
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, internalNote, updatedAt }) });
      const body = await response.json().catch(() => null) as { updatedAt?: string; error?: string } | null;
      if (!response.ok) { setState("error"); setError(response.status === 409 ? "Yêu cầu đã được cập nhật ở nơi khác. Hãy tải lại trước khi lưu." : body?.error ?? "Không thể lưu thay đổi."); return; }
      if (body?.updatedAt) setUpdatedAt(body.updatedAt);
      setState("saved");
    } catch { setState("error"); setError("Không thể kết nối tới hệ thống."); }
  }

  return <section className="lead-admin-editor" aria-label="Cập nhật lead"><p className="section-label">ADMIN / CẬP NHẬT</p><label>Trạng thái<select value={status} onChange={(event) => { setStatus(event.target.value as LeadDetailProps["lead"]["status"]); setState("idle"); }}><option value="NEW">Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="CLOSED">Đã đóng</option></select></label><label>Ghi chú nội bộ<textarea value={internalNote} maxLength={4000} rows={8} onChange={(event) => { setInternalNote(event.target.value); setState("idle"); }} /></label>{error && <p className="form-error" role="alert">{error}</p>}{state === "saved" && <p className="lead-success" role="status">Đã lưu thay đổi.</p>}<button className="button button-primary" disabled={state === "saving"} onClick={() => void save()}>{state === "saving" ? "Đang lưu…" : "Lưu thay đổi"}</button></section>;
}
