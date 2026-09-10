import type { Product } from "@/lib/types";

export function PurchaseReassurance({ product, contactHref }: { product: Product; contactHref: string | null }) {
  const delivery = product.content?.delivery?.published ? product.content.delivery : null;
  const warranty = product.content?.warranty?.published ? product.content.warranty : null;
  if (!delivery && !warranty && !contactHref) return null;
  return <div className="purchase-reassurance" aria-label="Thông tin trước khi đặt hàng">{delivery && <div><strong>{delivery.title ?? "Giao hàng"}</strong><span>{delivery.body}</span></div>}{warranty && <div><strong>{warranty.title ?? "Bảo hành"}</strong><span>{warranty.body}</span></div>}{contactHref && <div><strong>Cần tư vấn?</strong><a href={contactHref}>Trao đổi trước khi đặt hàng →</a></div>}</div>;
}
