"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDimension, formatVnd } from "@/lib/format";

type Result = {
  code: string;
  paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO" | "SEPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REVIEW_REQUIRED" | "REFUNDED";
  status: string;
  paymentExpiresAt: string | null;
  paymentConfirmedAt: string | null;
  total: number;
  items: Array<{ name: string; quantity: number; width: number; length: number; thickness: number }>;
  bankTransferInfo: Record<string, unknown> | null;
  sepay: { paymentCode: string; bank: string; accountNumber: string; accountName: string; qrUrl: string } | null;
};

const paymentMethodLabels: Record<Result["paymentMethod"], string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "MoMo",
  SEPAY: "SePay",
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Đang chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

function isSePayPending(result: Result) {
  return result.paymentMethod === "SEPAY" && result.paymentStatus === "PENDING";
}

function isSuccess(result: Result) {
  return (result.paymentMethod === "COD" && result.status === "CONFIRMED") || (result.paymentMethod === "SEPAY" && result.paymentStatus === "PAID");
}

function formatRemaining(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatPaymentTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function OrderResult({ token }: { token: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"code" | "amount" | null>(null);
  const [isRechecking, setIsRechecking] = useState(false);
  const [transitioningToSuccess, setTransitioningToSuccess] = useState(false);
  const [liveMessage, setLiveMessage] = useState("Đang kiểm tra trạng thái đơn hàng.");
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const resultRef = useRef<Result | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const applyResult = useCallback((next: Result) => {
    const previous = resultRef.current;
    resultRef.current = next;
    setResult(next);
    setError("");

    if (previous && isSePayPending(previous) && next.paymentMethod === "SEPAY" && next.paymentStatus === "PAID") {
      setTransitioningToSuccess(true);
      setLiveMessage("Đã nhận thanh toán. Đang xác nhận thanh toán…");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      transitionTimerRef.current = window.setTimeout(() => {
        setTransitioningToSuccess(false);
        setLiveMessage("Thanh toán thành công. Đơn hàng đã được xác nhận.");
      }, reducedMotion ? 0 : 600);
      return;
    }

    if (isSePayPending(next)) {
      setLiveMessage("Đang chờ thanh toán. Trạng thái sẽ tự động cập nhật.");
    } else if (next.paymentMethod === "SEPAY" && next.paymentStatus === "PAID") {
      setLiveMessage("Thanh toán thành công. Đơn hàng đã được xác nhận.");
    }
  }, []);

  const loadOrder = useCallback(async () => {
    const response = await fetch("/api/orders/result/" + token, { cache: "no-store" });
    if (!response.ok) throw new Error("Không tìm thấy thông tin đơn hàng.");
    const next = await response.json() as Result;
    applyResult(next);
    return next;
  }, [applyResult, token]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    let attempts = 0;

    const poll = async () => {
      try {
        const next = await loadOrder();
        if (!cancelled && isSePayPending(next) && attempts++ < 47) {
          timer = window.setTimeout(poll, 2500);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Không thể kiểm tra trạng thái đơn hàng.");
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, [loadOrder]);

  useEffect(() => {
    if (!result || !isSePayPending(result) || !result.paymentExpiresAt) {
      setRemainingMs(null);
      return;
    }

    const expiresAt = new Date(result.paymentExpiresAt).getTime();
    const tick = () => setRemainingMs(Math.max(0, expiresAt - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [result]);

  async function copy(value: string, target: "code" | "amount") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Không thể sao chép trên thiết bị này.");
    }
  }

  async function recheckPayment() {
    setIsRechecking(true);
    setError("");
    setLiveMessage("Đang kiểm tra lại trạng thái thanh toán…");
    try {
      await loadOrder();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể kiểm tra trạng thái thanh toán.");
    } finally {
      setIsRechecking(false);
    }
  }

  if (error && !result) {
    return <main className="success-page payment-result-page"><p className="eyebrow">KẾT QUẢ ĐƠN HÀNG</p><h1>{error}</h1><p className="muted">Vui lòng kiểm tra lại liên kết hoặc liên hệ với chúng tôi để được hỗ trợ.</p></main>;
  }

  if (!result) {
    return <main className="success-page payment-result-page"><p className="eyebrow">KẾT QUẢ ĐƠN HÀNG</p><h1>Đang kiểm tra đơn hàng…</h1></main>;
  }

  const success = isSuccess(result);
  const failed = result.paymentStatus === "FAILED" || result.status === "CANCELLED";
  const review = result.paymentStatus === "REVIEW_REQUIRED";
  const sepayPending = isSePayPending(result);
  const paymentTime = formatPaymentTime(result.paymentConfirmedAt);
  const headline = success && result.paymentMethod === "SEPAY"
    ? "Thanh toán thành công"
    : success
      ? "Đơn hàng đã được xác nhận"
      : review
        ? "Thanh toán cần được đối soát"
        : failed
          ? "Phiên thanh toán chưa hoàn tất"
          : sepayPending
            ? "Đang chờ thanh toán"
            : result.paymentMethod === "BANK_TRANSFER"
              ? "Vui lòng hoàn tất chuyển khoản"
              : "Đơn hàng đã được xác nhận";
  const eyebrowText = success ? "THANH TOÁN & ĐẶT HÀNG" : review ? "CẦN ĐỐI SOÁT" : failed ? "THANH TOÁN CHƯA HOÀN TẤT" : sepayPending ? "SEPAY TEST MODE" : "KẾT QUẢ ĐƠN HÀNG";

  return (
    <main className="success-page payment-result-page">
      <header className="payment-result-header">
        <p className="eyebrow">{eyebrowText}</p>
        <div className="payment-live-status" role="status" aria-live="polite" aria-atomic="true">
          {sepayPending && <span className="payment-status-spinner" aria-hidden="true" />}
          <span>{transitioningToSuccess ? "Đang xác nhận thanh toán…" : liveMessage}</span>
        </div>
        <h1>{headline}</h1>
        <p className="payment-result-lede">
          {success
            ? "Đơn hàng đã được xác nhận. Cảm ơn bạn đã chọn Thăng Long."
            : sepayPending
              ? "Sau khi mô phỏng chuyển khoản, trạng thái sẽ tự động cập nhật. Bạn không cần làm thêm bước xác nhận nào trên website."
              : review
                ? "Chúng tôi đã nhận được thông tin thanh toán và đang kiểm tra. Đơn hàng sẽ được cập nhật sau khi đối soát."
                : failed
                  ? "Phiên giữ hàng có thể đã hết hạn hoặc giao dịch chưa khớp. Vui lòng tạo một đơn mới hoặc liên hệ để được hỗ trợ."
                  : "Thông tin đơn hàng của bạn đã được ghi nhận."}
        </p>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {sepayPending && result.paymentExpiresAt && (
        <section className="payment-reservation" aria-label="Thời gian giữ hàng">
          <div>
            <span>Giữ hàng trong</span>
            <strong>{remainingMs === null ? "Đang tải…" : formatRemaining(remainingMs)}</strong>
          </div>
          <p>{remainingMs === 0 ? "Hệ thống đang kiểm tra trạng thái cuối cùng của giao dịch." : "Thanh toán trong thời gian này để đơn hàng được tự động xác nhận."}</p>
        </section>
      )}

      {sepayPending && result.sepay && (
        <section className="order-summary-card payment-transaction-card" aria-labelledby="sepay-payment-heading">
          <div className="sepay-payment-heading">
            <div>
              <p className="order-items-heading">Chuyển khoản QR</p>
              <h2 id="sepay-payment-heading">SePay thử nghiệm</h2>
            </div>
            <span className="payment-method-badge">SePay</span>
          </div>
          <div className="sepay-payment-layout">
            <div className="sepay-qr-wrap">
              <img src={result.sepay.qrUrl} width={280} height={280} alt="Mã QR thanh toán SePay thử nghiệm" />
              <p>Chỉ mô phỏng — không chuyển tiền thật.</p>
            </div>
            <div className="sepay-payment-details">
              <dl className="payment-key-values">
                <div>
                  <dt>Số tiền thanh toán</dt>
                  <dd className="payment-amount">{formatVnd(result.total)}</dd>
                  <button type="button" className="text-action" onClick={() => copy(String(result.total), "amount")} aria-label="Sao chép số tiền thanh toán">
                    {copied === "amount" ? "Đã sao chép ✓" : "Sao chép số tiền"}
                  </button>
                </div>
                <div>
                  <dt>Nội dung chuyển khoản</dt>
                  <dd className="payment-code">{result.sepay.paymentCode}</dd>
                  <button type="button" className="text-action" onClick={() => copy(result.sepay!.paymentCode, "code")} aria-label="Sao chép mã thanh toán">
                    {copied === "code" ? "Đã sao chép ✓" : "Sao chép mã"}
                  </button>
                </div>
              </dl>
              <div className="sepay-bank-details">
                <span>Ngân hàng</span><strong>{result.sepay.bank}</strong>
                <span>Tài khoản thử nghiệm</span><strong>{result.sepay.accountNumber}</strong>
                <span>Chủ tài khoản</span><strong>{result.sepay.accountName}</strong>
              </div>
              <div className="payment-recheck">
                <button type="button" className="button button-secondary" onClick={recheckPayment} disabled={isRechecking}>
                  {isRechecking ? "Đang kiểm tra…" : "Tôi đã chuyển khoản"}
                </button>
                <p>Chỉ kiểm tra lại trạng thái từ hệ thống; thao tác này không tự xác nhận thanh toán.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {success && result.paymentMethod === "SEPAY" && (
        <section className="order-summary-card payment-success-card" aria-label="Thông tin thanh toán thành công">
          <div className="payment-success-details">
            <div><span>Mã đơn hàng</span><strong>{result.code}</strong></div>
            <div><span>Đã thanh toán</span><strong>{formatVnd(result.total)}</strong></div>
            <div><span>Phương thức</span><strong>{paymentMethodLabels.SEPAY}</strong></div>
            <div><span>Trạng thái đơn</span><strong>{orderStatusLabels[result.status] ?? "Đã xác nhận"}</strong></div>
            {paymentTime && <div><span>Thời gian thanh toán</span><strong>{paymentTime}</strong></div>}
          </div>
        </section>
      )}

      <section className="order-summary-card order-items-card">
        {!success && <div className="order-code-row"><span>Mã đơn hàng <strong>{result.code}</strong></span><span>Tổng thanh toán <strong>{formatVnd(result.total)}</strong></span></div>}
        <div className="order-result-items">
          <p className="order-items-heading">Sản phẩm trong đơn</p>
          {result.items.map((item) => (
            <div key={item.name + "-" + item.width + "-" + item.thickness} className="order-result-item">
              <span>{item.name}</span>
              <small>{formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm · Số lượng: {item.quantity}</small>
            </div>
          ))}
        </div>
        {result.paymentMethod === "BANK_TRANSFER" && result.bankTransferInfo && (
          <div className="bank-transfer-details">
            <p className="order-items-heading">Thông tin tài khoản nhận thanh toán</p>
            <pre className="bank-transfer-info">{JSON.stringify(result.bankTransferInfo, null, 2)}</pre>
          </div>
        )}
      </section>

      <div className="order-result-actions">
        {success && result.paymentMethod === "SEPAY" ? (
          <>
            <Link href="/tai-khoan/don-hang" className="button button-primary">Theo dõi đơn hàng</Link>
            <Link href="/nem" className="button button-secondary">Tiếp tục mua sắm</Link>
          </>
        ) : (
          <>
            <Link href="/nem" className="button button-primary">Khám phá danh mục nệm</Link>
            <Link href="/tai-khoan/don-hang" className="button button-secondary">Xem đơn hàng của bạn</Link>
          </>
        )}
      </div>
    </main>
  );
}
