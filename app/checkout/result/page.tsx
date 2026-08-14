import { OrderResult } from "@/components/order-result";

export default async function CheckoutResultPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  if (!params.token) return <main className="success-page"><p className="eyebrow">ORDER RESULT</p><h1>Thiếu mã theo dõi đơn hàng.</h1></main>;
  return <OrderResult token={params.token} />;
}
