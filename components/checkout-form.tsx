"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatVnd } from "@/lib/format";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      customerName: String(data.get("customerName") ?? ""), customerPhone: String(data.get("customerPhone") ?? ""), guestEmail: String(data.get("guestEmail") ?? ""),
      address: { line1: String(data.get("line1") ?? ""), district: String(data.get("district") ?? ""), province: String(data.get("province") ?? "") }, paymentMethod,
    };
    const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Không thể tạo đơn hàng."); setLoading(false); return; }
    if (result.paymentPath) {
      const paymentResponse = await fetch(result.paymentPath);
      const payment = await paymentResponse.json();
      if (!paymentResponse.ok || !payment.payUrl) { setError(payment.error ?? "Không thể mở thanh toán MoMo."); setLoading(false); return; }
      clear(); window.location.href = payment.payUrl; return;
    }
    clear();
    if (result.payUrl) window.location.href = result.payUrl; else router.push(`/checkout/success?code=${result.code}`);
  }

  if (!items.length) return <div className="empty-state container"><h1>Giỏ hàng đang trống.</h1></div>;
  return <form className="checkout-form" onSubmit={submit}><div className="form-section"><p className="eyebrow">THÔNG TIN GIAO HÀNG</p><div className="form-grid"><label>Họ và tên<input name="customerName" required autoComplete="name" /></label><label>Số điện thoại<input name="customerPhone" required autoComplete="tel" /></label><label className="full">Email (không bắt buộc)<input name="guestEmail" type="email" autoComplete="email" /></label><label className="full">Địa chỉ<input name="line1" required autoComplete="street-address" /></label><label>Quận / huyện<input name="district" /></label><label>Tỉnh / thành<input name="province" required autoComplete="address-level1" /></label></div></div><div className="form-section"><p className="eyebrow">PHƯƠNG THỨC THANH TOÁN</p><div className="payment-options">{[["COD", "Thanh toán khi nhận hàng"], ["BANK_TRANSFER", "Chuyển khoản ngân hàng"], ["MOMO", "MoMo"]].map(([value, label]) => <label key={value}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /> <span>{label}</span></label>)}</div></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? "Đang xử lý…" : "Xác nhận đặt hàng"}</button><p className="form-note">Bằng việc đặt hàng, bạn đồng ý với chính sách giao hàng và bảo hành của Thăng Long.</p><div className="checkout-total"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong></div></form>;
}
