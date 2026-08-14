import Link from "next/link";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = await searchParams;
  return <main className="success-page"><p className="eyebrow">ĐẶT HÀNG THÀNH CÔNG</p><h1>Cảm ơn bạn đã chọn Thăng Long.</h1><p>Mã đơn hàng của bạn là <strong>{params.code ?? "đang cập nhật"}</strong>. Chúng tôi sẽ liên hệ để xác nhận lịch giao hàng.</p><Link href="/nem/luxury" className="button button-primary">Quay lại Luxury</Link></main>;
}
