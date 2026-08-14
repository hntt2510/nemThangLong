"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDimension, formatVnd } from "@/lib/format";

type Result = { code: string; paymentMethod: "COD" | "BANK_TRANSFER" | "MOMO"; paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; status: string; total: number; items: Array<{ name: string; quantity: number; width: number; length: number; thickness: number }>; bankTransferInfo: Record<string, unknown> | null };

function isSuccess(result: Result) { return result.paymentMethod === "COD" && result.status === "CONFIRMED" || result.paymentMethod === "MOMO" && result.paymentStatus === "PAID"; }

export function OrderResult({ token }: { token: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const load = async () => {
      const response = await fetch(`/api/orders/result/${token}`, { cache: "no-store" });
      if (response.ok) { const next = await response.json() as Result; if (!cancelled) setResult(next); if (next.paymentStatus === "PENDING" && attempts < 15) { attempts += 1; window.setTimeout(load, 2000); } }
      else if (!cancelled) setError("Không tìm thấy thông tin đơn hàng.");
    };
    void load();
    return () => { cancelled = true; };
  }, [token]);
  if (error) return <main className="success-page"><p className="eyebrow">ORDER RESULT</p><h1>{error}</h1><Link href="/nem/luxury" className="button button-primary">Quay lại Luxury</Link></main>;
  if (!result) return <main className="success-page"><p className="eyebrow">ORDER RESULT</p><h1>Đang kiểm tra đơn hàng…</h1><p>Chúng tôi đang xác nhận trạng thái từ hệ thống.</p></main>;
  const success = isSuccess(result);
  const failed = result.paymentStatus === "FAILED" || result.status === "CANCELLED";
  return <main className="success-page"><p className="eyebrow">{success ? "ĐẶT HÀNG THÀNH CÔNG" : failed ? "THANH TOÁN CHƯA THÀNH CÔNG" : "ĐƠN HÀNG ĐANG CHỜ XÁC NHẬN"}</p><h1>{success ? "Cảm ơn bạn đã chọn Thăng Long." : failed ? "Giao dịch chưa hoàn tất." : result.paymentMethod === "BANK_TRANSFER" ? "Vui lòng hoàn tất chuyển khoản." : "Đang chờ MoMo xác nhận."}</h1><p>Mã đơn hàng: <strong>{result.code}</strong> · Tổng: <strong>{formatVnd(result.total)}</strong></p>{result.items.map((item) => <p key={`${item.name}-${item.width}-${item.thickness}`} className="order-result-item">{item.name} · {formatDimension(item.width)} × {formatDimension(item.length)} × {item.thickness}cm · {item.quantity}</p>)}{result.paymentMethod === "BANK_TRANSFER" && result.bankTransferInfo && <pre className="bank-transfer-info">{JSON.stringify(result.bankTransferInfo, null, 2)}</pre>}<Link href="/nem/luxury" className="button button-primary">Quay lại Luxury</Link></main>;
}
