"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatDimension, formatVnd } from "@/lib/format";

import { isUiShowcaseMode, getShowcaseCartItems } from "@/lib/ui-showcase";

export function CartPage() {
  const { items: realItems, removeItem, subtotal: realSubtotal } = useCart();
  const isShowcase = isUiShowcaseMode() && realItems.length === 0;
  const items = isShowcase ? getShowcaseCartItems() : realItems;
  const subtotal = isShowcase ? items.reduce((acc, item) => acc + item.price * item.quantity, 0) : realSubtotal;

  if (!items.length) {
    return (
      <div className="empty-state container">
        <p className="eyebrow">GIỎ HÀNG</p>
        <h1>Chưa có sản phẩm trong giỏ.</h1>
        <p className="muted">Hãy khám phá các dòng nệm và chọn kích thước phù hợp để bắt đầu.</p>
        <Link href={"/nem" as never} className="button button-primary">
          Khám phá danh mục nệm
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <p className="eyebrow">GIỎ HÀNG</p>
      <h1>Những lựa chọn của bạn.</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article key={item.variantId} className="cart-item">
              <div className="cart-item-media">
                <Image src={item.image} alt={item.productName} width={120} height={150} style={{ objectFit: "cover" }} />
              </div>
              <div className="cart-item-info">
                <h2>{item.productName}</h2>
                <p className="cart-item-dims">
                  {formatDimension(item.width)} × {formatDimension(item.length)} · {item.thickness}cm
                </p>
                <span className="cart-item-price">
                  {item.quantity} × {formatVnd(item.price)}
                </span>
              </div>
              <button
                type="button"
                className="cart-item-remove"
                onClick={() => removeItem(item.variantId)}
                aria-label={"Xóa " + item.productName + " khỏi giỏ hàng"}
              >
                Xóa
              </button>
            </article>
          ))}
        </div>
        <aside className="cart-summary">
          <div className="cart-summary-header">
            <span>Tạm tính</span>
            <strong>{formatVnd(subtotal)}</strong>
          </div>
          <p className="cart-summary-note">Phí vận chuyển và phương thức thanh toán được chọn ở bước thanh toán.</p>
          <Link href="/checkout" className="button button-primary">
            Tiến hành thanh toán
          </Link>
          <Link href={"/nem" as never} className="text-link cart-continue-link">
            ← Tiếp tục xem nệm
          </Link>
        </aside>
      </div>
    </div>
  );
}
