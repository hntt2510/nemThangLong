"use client";

import { useState } from "react";

type Status = "SUBMITTED" | "REVIEWING" | "RESOLVED" | "CLOSED";

export function AdminAfterSalesDetail({ request }: { request: { id: string; status: Status; internalNote: string | null; updatedAt: string } }) {
  const [status, setStatus] = useState<Status>(request.status);
  const [note, setNote] = useState(request.internalNote ?? "");
  const [updatedAt, setUpdatedAt] = useState(request.updatedAt);
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  async function save() {
    setState("saving"); setError("");
    try {
      const response = await fetch(`/api/admin/after-sales/${request.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, internalNote: note, updatedAt }) });
      const body = await response.json().catch(() => null) as { updatedAt?: string; error?: string } | null;
      if (!response.ok) { setState("error"); setError(body?.error ?? "Không thể lưu thay đổi."); return; }
      if (body?.updatedAt) setUpdatedAt(body.updatedAt);
      setState("saved");
    } catch { setState("error"); setError("Không thể kết nối tới hệ thống."); }
  }
  return <section className="lead-admin-editor" aria-label="Cập nhật yêu cầu sau mua"><p className="section-label">ADMIN / CẬP NHẬT</p><label>Trạng thái<select value={status} onChange={(event) => { setStatus(event.target.value as Status); setState("idle"); }}><option value="SUBMITTED">Đã tiếp nhận</option><option value="REVIEWING">Đang kiểm tra</option><option value="RESOLVED">Đã xử lý</option><option value="CLOSED">Đã đóng</option></select></label><label>Ghi chú nội bộ<textarea value={note} maxLength={4000} rows={8} onChange={(event) => { setNote(event.target.value); setState("idle"); }} /></label>{error && <p className="form-error" role="alert">{error}</p>}{state === "saved" && <p className="lead-success" role="status">Đã lưu thay đổi.</p>}<button className="button button-primary" disabled={state === "saving"} onClick={() => void save()}>{state === "saving" ? "Đang lưu…" : "Lưu thay đổi"}</button></section>;
}
