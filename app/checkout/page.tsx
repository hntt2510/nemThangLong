import { SiteHeader } from "@/components/site-header";
import { CheckoutForm } from "@/components/checkout-form";
import { getSiteSettings } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() { const settings = await getSiteSettings(); return <><SiteHeader /><main className="checkout-page container"><div><p className="eyebrow">CHECKOUT</p><h1>Hoàn tất lựa chọn.</h1><p className="muted">Thông tin của bạn chỉ được dùng để xử lý đơn hàng và giao hàng.</p></div><CheckoutForm bankTransferEnabled={Boolean(settings?.bankTransferInfo)} /></main></>; }
