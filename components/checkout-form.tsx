"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatDimension, formatVnd } from "@/lib/format";

import { isUiShowcaseMode, getShowcaseCartItems, evaluateCheckoutMutationGuard } from "@/lib/ui-showcase";

export function CheckoutForm({ bankTransferEnabled = false }: { bankTransferEnabled?: boolean }) {
  const router = useRouter();
  const { items: realItems, subtotal: realSubtotal, clear } = useCart();
  const isShowcase = isUiShowcaseMode() && realItems.length === 0;
  const items = isShowcase ? getShowcaseCartItems() : realItems;
  const subtotal = isShowcase ? items.reduce((acc, item) => acc + item.price * item.quantity, 0) : realSubtotal;
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const mutationGuard = evaluateCheckoutMutationGuard(isUiShowcaseMode());
    if (!mutationGuard.allowed) {
      setError(mutationGuard.message);
      return;
    }
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      customerName: String(data.get("customerName") ?? ""),
      customerPhone: String(data.get("customerPhone") ?? ""),
      guestEmail: String(data.get("guestEmail") ?? ""),
      address: {
        line1: String(data.get("line1") ?? ""),
        district: String(data.get("district") ?? ""),
        province: String(data.get("province") ?? ""),
      },
      paymentMethod,
    };
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Không thể tạo đơn hàng.");
      setLoading(false);
      return;
    }
    if (result.paymentPath) {
      const paymentResponse = await fetch(result.paymentPath, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: result.resultToken }),
      });
      const payment = await paymentResponse.json();
      if (!paymentResponse.ok || !payment.payUrl) {
        setError(payment.error ?? "Không thể mở thanh toán MoMo.");
        setLoading(false);
        return;
      }
      clear();
      window.location.href = payment.payUrl;
      return;
    }
    clear();
    router.push(`/checkout/result?token=${result.resultToken}` as never);
  }

  if (!items.length) {
    return (
      <div className="empty-state container">
        <p className="eyebrow">CHECKOUT</p>
        <h1>Giỏ hàng đang trống.</h1>
        <p className="muted">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
      </div>
    );
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      {isShowcase && (
        <div className="catalog-demo-note" style={{ marginBottom: 20 }}>
          Chế độ UI Preview: Biểu mẫu được điền sẵn để kiểm tra giao diện và mật độ bố cục. Không tạo đơn hàng thực tế.
        </div>
      )}
      <div className="form-section">
        <p className="eyebrow">01 / THÔNG TIN GIAO HÀNG</p>
        <div className="form-grid">
          <label>
            <span>Họ và tên <b aria-hidden="true">*</b></span>
            <input name="customerName" required autoComplete="name" defaultValue={isShowcase ? "Nguyễn Minh Anh" : ""} placeholder="Nguyễn Văn A" />
          </label>
          <label>
            <span>Số điện thoại <b aria-hidden="true">*</b></span>
            <input name="customerPhone" required autoComplete="tel" inputMode="tel" defaultValue={isShowcase ? "0901 234 567" : ""} placeholder="0901234567" />
          </label>
          <label className="full">
            <span>Email nhận hóa đơn &amp; thông tin đơn hàng <b aria-hidden="true">*</b></span>
            <input name="guestEmail" type="email" required autoComplete="email" defaultValue={isShowcase ? "minhanh@example.test" : ""} placeholder="email@example.com" />
          </label>
          <label className="full">
            <span>Địa chỉ giao hàng <b aria-hidden="true">*</b></span>
            <input name="line1" required autoComplete="street-address" defaultValue={isShowcase ? "123 Đường Minh Họa, Phường Demo" : ""} placeholder="Số nhà, tên đường" />
          </label>
          <label>
            <span>Quận / huyện</span>
            <input name="district" defaultValue={isShowcase ? "Quận 1" : ""} placeholder="Quận / Huyện" />
          </label>
          <label>
            <span>Tỉnh / thành <b aria-hidden="true">*</b></span>
            <input name="province" required autoComplete="address-level1" defaultValue={isShowcase ? "TP. Hồ Chí Minh" : ""} placeholder="Tỉnh / Thành phố" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <p className="eyebrow">02 / PHƯƠNG THỨC THANH TOÁN</p>
        <div className="payment-options">
          {[
            ["COD", "Thanh toán khi nhận hàng (COD)"],
            ...(bankTransferEnabled ? [["BANK_TRANSFER", "Chuyển khoản ngân hàng"]] : []),
            ["MOMO", "Ví MoMo / QR MoMo"],
          ].map(([value, label]) => (
            <label key={value} className={`payment-option ${paymentMethod === value ? "active" : ""}`}>
              <input
                type="radio"
                name="payment"
                value={value}
                checked={paymentMethod === value}
                onChange={() => setPaymentMethod(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section checkout-order-summary">
        <p className="eyebrow">03 / TÓM TẮT ĐƠN HÀNG</p>
        <div className="checkout-items-list">
          {items.map((item) => (
            <div key={item.variantId} className="checkout-item-row">
              <div>
                <strong>{item.productName}</strong>
                <small>{formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm · SL: {item.quantity}</small>
              </div>
              <span>{formatVnd(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="checkout-total">
          <span>Tổng thanh toán</span>
          <strong>{formatVnd(subtotal)}</strong>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button className="button button-primary checkout-submit-btn" disabled={loading}>
        {loading ? "Đang xử lý…" : "Xác nhận đặt hàng"}
      </button>

      <p className="form-note">Bằng việc đặt hàng, bạn đồng ý với chính sách giao hàng và bảo hành của Thăng Long.</p>
    </form>
  );
}
