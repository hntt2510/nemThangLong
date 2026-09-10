"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatDimension, formatVnd } from "@/lib/format";
import { shippingFeeForSubtotal, type ShippingPolicy } from "@/lib/shipping";

type Address = { id: string; label: string | null; fullName: string; phone: string; line1: string; district: string | null; province: string };
type Profile = { name: string | null; email: string; phone: string | null } | null;
type CheckoutIntent = { key: string; fingerprint: string };
const checkoutIntentKey = "thang-long-checkout-intent-v1";

function fingerprint(payload: Record<string, unknown>) { return JSON.stringify(payload); }
function readIntent(nextFingerprint: string) {
  try {
    const saved = window.sessionStorage.getItem(checkoutIntentKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as CheckoutIntent;
    return parsed.key && parsed.fingerprint === nextFingerprint ? parsed : null;
  } catch { return null; }
}
function persistIntent(intent: CheckoutIntent) { try { window.sessionStorage.setItem(checkoutIntentKey, JSON.stringify(intent)); } catch { /* optional */ } }
function clearIntent() { try { window.sessionStorage.removeItem(checkoutIntentKey); } catch { /* optional */ } }

export function CheckoutForm({ bankTransferEnabled = false, sepayEnabled, sepayUnavailableReason, profile, addresses, shippingPolicy }: {
  bankTransferEnabled?: boolean;
  sepayEnabled: boolean;
  sepayUnavailableReason?: string;
  profile: Profile;
  addresses: Address[];
  shippingPolicy: ShippingPolicy;
}) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const shippingFee = shippingFeeForSubtotal(subtotal, shippingPolicy);
  const estimatedTotal = shippingFee === null ? null : subtotal + shippingFee;
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [addressId, setAddressId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedAddress = useMemo(() => addresses.find((address) => address.id === addressId) ?? null, [addressId, addresses]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = new FormData(event.currentTarget);
      const payload = {
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        customerName: String(data.get("customerName") ?? "").trim(),
        customerPhone: String(data.get("customerPhone") ?? "").trim(),
        guestEmail: String(data.get("guestEmail") ?? "").trim(),
        address: { line1: String(data.get("line1") ?? "").trim(), district: String(data.get("district") ?? "").trim(), province: String(data.get("province") ?? "").trim() },
        paymentMethod,
      };
      const nextFingerprint = fingerprint(payload);
      const intent = readIntent(nextFingerprint) ?? { key: window.crypto.randomUUID(), fingerprint: nextFingerprint };
      persistIntent(intent);
      const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json", "Idempotency-Key": intent.key }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Không thể tạo đơn hàng."); return; }
      clear();
      clearIntent();
      router.push(`/checkout/result?token=${result.resultToken}` as never);
    } catch {
      setError("Không thể kết nối hệ thống. Vui lòng thử lại; đơn hàng sẽ không bị tạo trùng.");
    } finally { setLoading(false); }
  }

  if (!items.length) return <div className="empty-state container"><p className="eyebrow">CHECKOUT</p><h1>Giỏ hàng đang trống.</h1><p className="muted">Vui lòng chọn sản phẩm trước khi thanh toán.</p></div>;

  return <form className="checkout-form" onSubmit={submit}>
    <div className="checkout-form-main">
      <div className="form-section">
        <p className="eyebrow">01 / THÔNG TIN GIAO HÀNG</p>
        {addresses.length > 0 && <label className="full"><span>Địa chỉ đã lưu</span><select value={addressId} onChange={(event) => setAddressId(event.target.value)}><option value="">Nhập địa chỉ mới</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address.label || address.line1} · {address.province}</option>)}</select></label>}
        <div className="form-grid">
          <label><span>Họ và tên <b aria-hidden="true">*</b></span><input key={`name-${addressId}`} name="customerName" required autoComplete="name" defaultValue={selectedAddress?.fullName ?? profile?.name ?? ""} placeholder="Nguyễn Văn A" /></label>
          <label><span>Số điện thoại <b aria-hidden="true">*</b></span><input key={`phone-${addressId}`} name="customerPhone" required autoComplete="tel" inputMode="tel" defaultValue={selectedAddress?.phone ?? profile?.phone ?? ""} placeholder="0901234567" /></label>
          <label className="full"><span>Email nhận thông tin đơn hàng {!profile && <b aria-hidden="true">*</b>}</span><input name="guestEmail" type="email" required={!profile} autoComplete="email" defaultValue={profile?.email ?? ""} placeholder="email@example.com" /></label>
          <label className="full"><span>Địa chỉ giao hàng <b aria-hidden="true">*</b></span><input key={`line1-${addressId}`} name="line1" required autoComplete="street-address" defaultValue={selectedAddress?.line1 ?? ""} placeholder="Số nhà, tên đường" /></label>
          <label><span>Quận / huyện</span><input key={`district-${addressId}`} name="district" defaultValue={selectedAddress?.district ?? ""} placeholder="Quận / Huyện" /></label>
          <label><span>Tỉnh / thành <b aria-hidden="true">*</b></span><input key={`province-${addressId}`} name="province" required autoComplete="address-level1" defaultValue={selectedAddress?.province ?? ""} placeholder="Tỉnh / Thành phố" /></label>
        </div>
      </div>
      <div className="form-section">
        <p className="eyebrow">02 / PHƯƠNG THỨC THANH TOÁN</p>
        <div className="payment-options">
          {["COD", ...(sepayEnabled ? ["SEPAY"] : []), ...(bankTransferEnabled ? ["BANK_TRANSFER"] : [])].map((value) => {
            const labels: Record<string, string> = { COD: "Thanh toán khi nhận hàng (COD)", SEPAY: "Chuyển khoản QR (SePay thử nghiệm)", BANK_TRANSFER: "Chuyển khoản ngân hàng" };
            return <label key={value} className={`payment-option ${paymentMethod === value ? "active" : ""}`}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><span>{labels[value]}</span></label>;
          })}
          {!sepayEnabled && <p className="form-note">SePay Test Mode: {sepayUnavailableReason ?? "chưa được cấu hình"}.</p>}
        </div>
      </div>
    </div>
    <aside className="form-section checkout-order-summary">
      <p className="eyebrow">03 / TÓM TẮT ĐƠN HÀNG</p>
      <div className="checkout-items-list">{items.map((item) => <div key={item.variantId} className="checkout-item-row"><div><strong>{item.productName}</strong><small>{formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm · SL: {item.quantity}</small></div><span>{formatVnd(item.price * item.quantity)}</span></div>)}</div>
      <dl className="order-cost-summary"><div><dt>Tạm tính</dt><dd>{formatVnd(subtotal)}</dd></div><div><dt>Phí giao hàng</dt><dd>{shippingFee === null ? "Xác nhận khi tạo đơn" : shippingFee === 0 ? "Miễn phí" : formatVnd(shippingFee)}</dd></div>{shippingPolicy.freeShippingThreshold !== null && shippingPolicy.freeShippingThreshold > 0 && <div className="order-cost-hint">Miễn phí giao hàng từ {formatVnd(shippingPolicy.freeShippingThreshold)}.</div>}<div className="order-cost-total"><dt>Tổng dự kiến</dt><dd>{estimatedTotal === null ? "Đang cập nhật" : formatVnd(estimatedTotal)}</dd></div></dl>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary checkout-submit-btn" disabled={loading}>{loading ? "Đang xử lý…" : "Xác nhận đặt hàng"}</button>
      <p className="form-note">Tổng cuối cùng được xác nhận từ chính sách giao hàng hiện hành khi tạo đơn.</p>
    </aside>
  </form>;
}
