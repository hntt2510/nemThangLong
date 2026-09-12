"use client";

import { useRef, useState } from "react";

type LeadFormProps = {
  type: "CONSULTATION" | "B2B_PROJECT";
  productSlug?: string;
};

export function LeadForm({ type, productSlug }: LeadFormProps) {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const b2b = type === "B2B_PROJECT";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const estimatedQuantity = String(form.get("estimatedQuantity") ?? "").trim();
    const projectNeed = String(form.get("projectNeed") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const body = {
      type,
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      message: projectNeed ? `Nhu cầu dự án: ${projectNeed}${message ? `\n${message}` : ""}` : message,
      ...(productSlug ? { productSlug } : {}),
      ...(b2b ? {
        organization: String(form.get("organization") ?? ""),
        projectLocation: String(form.get("projectLocation") ?? ""),
        ...(estimatedQuantity ? { estimatedQuantity: Number(estimatedQuantity) } : {}),
      } : {}),
      website: String(form.get("website") ?? ""),
    };
    setPending(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !result?.ok) {
        setError(result?.error ?? "Không thể gửi yêu cầu lúc này.");
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Không thể kết nối tới hệ thống. Vui lòng thử lại sau.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  if (submitted) return <p className="lead-success" role="status">Cảm ơn bạn. Thông tin đã được tiếp nhận để đội ngũ trao đổi thêm.</p>;

  return <form className="lead-form" onSubmit={(event) => void submit(event)}>
    <div className="form-grid">
      <label><span>{b2b ? "Tên người liên hệ" : "Họ và tên"} <b aria-hidden="true">*</b></span><input name="fullName" required maxLength={120} autoComplete="name" /></label>
      <label><span>{b2b ? "Số điện thoại / Zalo" : "Số điện thoại"} <b aria-hidden="true">*</b></span><input name="phone" required maxLength={32} autoComplete="tel" inputMode="tel" /></label>
      <label><span>Email (Không bắt buộc)</span><input name="email" type="email" maxLength={254} autoComplete="email" placeholder="Không bắt buộc" /></label>
      {b2b && <label><span>Tên dự án / khách sạn</span><input name="organization" maxLength={160} autoComplete="organization" /> </label>}
      {b2b && <label><span>Địa điểm dự án</span><input name="projectLocation" maxLength={200} autoComplete="street-address" /></label>}
      {b2b && <label><span>Số lượng phòng dự kiến</span><input name="estimatedQuantity" type="number" min={1} step={1} inputMode="numeric" /></label>}
      {b2b && <label><span>Nhu cầu</span><select name="projectNeed" defaultValue=""><option value="">Chọn nhu cầu</option><option value="Trang bị mới">Trang bị mới</option><option value="Thay thế nệm hiện tại">Thay thế nệm hiện tại</option></select></label>}
      <label className="full"><span>Nội dung cần tư vấn</span><textarea name="message" maxLength={2000} rows={4} placeholder="Ví dụ: Cần tư vấn nệm nằm êm cho người lớn tuổi hay đau lưng, kích thước 1m6 x 2m..." /></label>
      <label className="lead-honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
    {error && <p ref={errorRef} className="form-error" role="alert" tabIndex={-1}>{error}</p>}
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
      <button className={`button button-primary${b2b ? " b2b-lead-submit" : ""}`} type="submit" disabled={pending}>{pending ? "Đang gửi…" : b2b ? "Gửi yêu cầu dự án" : "Gửi yêu cầu tư vấn"}</button>
      <a href="tel:0911251004" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 py-3 px-4 text-xs sm:text-sm font-bold text-red-700 transition-colors text-center">
        <span>📞 Hoặc gọi ngay: 0911 251 004</span>
      </a>
    </div>
  </form>;
}
