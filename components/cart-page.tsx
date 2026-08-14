"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatDimension, formatVnd } from "@/lib/format";

export function CartPage() {
  const { items, removeItem, subtotal } = useCart();
  if (!items.length) return <div className="empty-state container"><p className="eyebrow">GIỎ HÀNG</p><h1>Chưa có sản phẩm.</h1><p className="muted">Hãy chọn một kích thước phù hợp để bắt đầu.</p><Link href="/nem/luxury" className="button button-primary">Khám phá Luxury</Link></div>;
  return <div className="cart-page container"><p className="eyebrow">GIỎ HÀNG</p><h1>Những lựa chọn của bạn.</h1><div className="cart-layout"><div className="cart-items">{items.map((item) => <article key={item.variantId} className="cart-item"><Image src={item.image} alt="" width={120} height={150} /><div><h2>{item.productName}</h2><p>{formatDimension(item.width)} × {formatDimension(item.length)} · {item.thickness}cm</p><span>{item.quantity} × {formatVnd(item.price)}</span></div><button onClick={() => removeItem(item.variantId)}>Xóa</button></article>)}</div><aside className="cart-summary"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong><p>Phí vận chuyển được tính ở bước checkout.</p><Link href="/checkout" className="button button-primary">Tiến tới checkout</Link></aside></div></div>;
}
