"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDimension, formatVnd } from "@/lib/format";

type Result = {
  code: string;
  paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REVIEW_REQUIRED" | "REFUNDED";
  status: string;
  paymentExpiresAt: string | null;
  total: number;
  items: Array<{ name: string; quantity: number; width: number; length: number; thickness: number }>;
  bankTransferInfo: Record<string, unknown> | null;
};

function isSuccess(result: Result) {
  return (
    (result.paymentMethod === "COD" && result.status === "CONFIRMED") ||
    (result.paymentMethod === "MOMO" && result.paymentStatus === "PAID")
  );
}

export function OrderResult({ token }: { token: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const load = async () => {
      const response = await fetch(`/api/orders/result/${token}`, { cache: "no-store" });
      if (response.ok) {
        const next = (await response.json()) as Result;
        if (!cancelled) setResult(next);
        if (next.paymentStatus === "PENDING" && attempts < 15) {
          attempts += 1;
          window.setTimeout(load, 2000);
        }
      } else if (!cancelled) {
        setError("Không tìm thấy thông tin đơn hàng.");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <main className="success-page">
        <p className="eyebrow">KẾT QUẢ ĐƠN HÀNG</p>
        <h1>{error}</h1>
        <p className="muted">Vui lòng kiểm tra lại liên kết hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
        <div className="order-result-actions">
          <Link href={"/nem" as never} className="button button-primary">
            Khám phá danh mục nệm
          </Link>
          <Link href={"/lien-he" as never} className="button button-secondary">
            Liên hệ hỗ trợ
          </Link>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="success-page">
        <p className="eyebrow">KẾT QUẢ ĐƠN HÀNG</p>
        <h1>Đang kiểm tra đơn hàng…</h1>
        <p className="muted">Chúng tôi đang xác nhận trạng thái từ hệ thống.</p>
      </main>
    );
  }

  const success = isSuccess(result);
  const failed = result.paymentStatus === "FAILED" || result.status === "CANCELLED";
  const review = result.paymentStatus === "REVIEW_REQUIRED";

  const headline = success
    ? "Cảm ơn bạn đã chọn Thăng Long."
    : review
      ? "MoMo đã báo thanh toán nhưng đơn hàng cần được đối soát thủ công."
      : failed
        ? "Giao dịch chưa hoàn tất."
        : result.paymentMethod === "BANK_TRANSFER"
          ? "Vui lòng hoàn tất chuyển khoản."
          : "Đang chờ MoMo xác nhận.";

  const eyebrowText = success
    ? "ĐẶT HÀNG THÀNH CÔNG"
    : review
      ? "CẦN ĐỐI SOÁT THANH TOÁN"
      : failed
        ? "THANH TOÁN CHƯA THÀNH CÔNG"
        : "ĐƠN HÀNG ĐANG CHỜ XÁC NHẬN";

  return (
    <main className="success-page">
      <p className="eyebrow">{eyebrowText}</p>
      <h1>{headline}</h1>
      <div className="order-summary-card">
        <div className="order-code-row">
          <span>Mã đơn hàng: <strong>{result.code}</strong></span>
          <span>Tổng thanh toán: <strong>{formatVnd(result.total)}</strong></span>
        </div>
        {result.paymentMethod === "BANK_TRANSFER" && result.paymentExpiresAt && (
          <p className="order-expiry-note">
            Hạn giữ tồn kho: <strong>{new Date(result.paymentExpiresAt).toLocaleString("vi-VN")}</strong>
          </p>
        )}
        <div className="order-result-items">
          <p className="order-items-heading">Sản phẩm trong đơn:</p>
          {result.items.map((item) => (
            <div key={`${item.name}-${item.width}-${item.thickness}`} className="order-result-item">
              <span>{item.name}</span>
              <small>
                {formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm · Số lượng: {item.quantity}
              </small>
            </div>
          ))}
        </div>
        {result.paymentMethod === "BANK_TRANSFER" && result.bankTransferInfo && (
          <div className="bank-transfer-details">
            <p className="order-items-heading">Thông tin tài khoản nhận thanh toán:</p>
            <pre className="bank-transfer-info">{JSON.stringify(result.bankTransferInfo, null, 2)}</pre>
          </div>
        )}
      </div>
      <div className="order-result-actions">
        <Link href={"/nem" as never} className="button button-primary">
          Khám phá danh mục nệm
        </Link>
        <Link href={"/tai-khoan/don-hang" as never} className="button button-secondary">
          Xem đơn hàng của bạn
        </Link>
      </div>
    </main>
  );
}
