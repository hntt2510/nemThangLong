import { SiteHeader } from "@/components/site-header";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() { return <><SiteHeader /><main className="checkout-page container"><div><p className="eyebrow">CHECKOUT</p><h1>Hoàn tất lựa chọn.</h1><p className="muted">Thông tin của bạn chỉ được dùng để xử lý đơn hàng và giao hàng.</p></div><CheckoutForm /></main></>; }
