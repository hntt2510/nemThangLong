"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDimension, formatVnd } from "@/lib/format";
import { activeVariants, dimensionOptions, initialSelection, resolveVariant, selectVariant, selectionFromVariant, type VariantDimension } from "@/lib/variant-selection";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { isDemoMedia, mediaAlt } from "@/lib/product-media";

export function GenericProductPurchase({ product, contactHref }: { product: Product; contactHref: string | null }) {
  const router = useRouter();
  const { addItem } = useCart();
  const variants = useMemo(() => activeVariants(product.variants), [product.variants]);
  const [selection, setSelection] = useState(() => initialSelection(variants));
  const [mediaIndex, setMediaIndex] = useState(0);
  const selected = resolveVariant(variants, selection);
  const media = product.media[mediaIndex] ?? product.media[0];
  const canPurchase = Boolean(!product.isDemo && selected && selected.price !== null && selected.price > 0 && selected.stock > 0);
  const price = !product.isDemo && selected?.price && selected.price > 0 ? formatVnd(selected.price) : "Liên hệ";

  function change(dimension: VariantDimension, value: number) {
    const candidate = selectVariant(variants, selected, dimension, value);
    if (candidate) setSelection(selectionFromVariant(candidate));
  }

  function addToCart() {
    if (!canPurchase || !selected || !media) return;
    addItem({ variantId: selected.id, quantity: 1, productSlug: product.slug, productName: product.name, width: selected.width, length: selected.length, thickness: selected.thickness, price: selected.price!, sku: selected.sku, image: media.url });
  }

  function buyNow() {
    addToCart();
    if (canPurchase) router.push("/checkout");
  }

  return (
    <section className="generic-product-purchase container">
      <div className="generic-gallery">
        <div className="gallery-layout">
          <div className="gallery-thumbs">
            {product.media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === mediaIndex ? "active" : ""}
                onClick={() => setMediaIndex(index)}
                aria-label={"Xem ảnh " + (index + 1) + (isDemoMedia(product, item) ? ", ảnh minh họa" : "")}
              >
                <Image src={item.url} alt={mediaAlt(product, item)} width={90} height={112} />
                {isDemoMedia(product, item) && <span className="demo-thumb-badge">Minh họa</span>}
              </button>
            ))}
          </div>
          <div className="hero-image">
            {media && (
              <Image
                src={media.url}
                alt={mediaAlt(product, media)}
                fill
                priority
                sizes="(max-width: 860px) 100vw, 53vw"
                style={{
                  objectFit: media.fit ?? "cover",
                  objectPosition: ((media.focalX ?? 0.5) * 100) + "% " + ((media.focalY ?? 0.5) * 100) + "%",
                }}
              />
            )}
            {media && isDemoMedia(product, media) && <span className="demo-badge">Ảnh minh họa</span>}
          </div>
        </div>
      </div>
      <div className="generic-product-copy">
        <p className="eyebrow">{product.eyebrow}</p>
        <h1>{product.name}</h1>
        <p className="hero-description">{product.description}</p>
        <div className="price-row" aria-live="polite">
          <strong>{price}</strong>
        </div>
        {variants.length > 0 ? (
          <div className="variant-block">
            <div className="variant-heading">
              <span>KÍCH THƯỚC</span>
              <small>
                {selected
                  ? formatDimension(selected.width) + " × " + formatDimension(selected.length) + " × " + selected.thickness + "cm"
                  : "Đang cập nhật"}
              </small>
            </div>
            {(["width", "length", "thickness"] as const).map((dimension) => (
              <label key={dimension}>
                {dimension === "width" ? "Rộng" : dimension === "length" ? "Dài" : "Độ dày"}
                <select
                  value={selected?.[dimension] ?? ""}
                  onChange={(event) => change(dimension, Number(event.target.value))}
                  aria-label={dimension === "width" ? "Chiều rộng" : dimension === "length" ? "Chiều dài" : "Độ dày"}
                >
                  {dimensionOptions(variants, dimension, selected).map((value) => (
                    <option key={value} value={value}>
                      {formatDimension(value)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : (
          <div className="variant-placeholder">Kích thước và tổ hợp bán đang được cập nhật từ CMS.</div>
        )}
        {selected && (
          <p className="generic-availability" aria-live="polite">
            {selected.stock > 0 ? "Còn hàng" : "Tạm hết hàng"}
            {selected.price === null || selected.price <= 0 ? " · Giá đang cập nhật" : ""}
          </p>
        )}
        {canPurchase ? (
          <div className="hero-ctas">
            <button className="button button-primary" type="button" onClick={buyNow}>
              Mua ngay
            </button>
            <button className="button button-secondary" type="button" onClick={addToCart}>
              Thêm vào giỏ
            </button>
          </div>
        ) : contactHref ? (
          <a className="button button-primary contact-button" href={contactHref}>
            Liên hệ tư vấn
          </a>
        ) : (
          <p className="generic-contact-pending">Thông tin tư vấn đang được cập nhật.</p>
        )}
        <div className="trust-list">
          <span>✓ Thông tin sản phẩm theo cấu hình CMS</span>
          <span>✓ Không hiển thị tổ hợp chưa được xác nhận</span>
        </div>
      </div>

      <div className="mobile-sticky-cta">
        <div>
          <span>{product.name}</span>
          <strong>{price}</strong>
        </div>
        <button
          type="button"
          onClick={
            canPurchase
              ? buyNow
              : () => {
                  if (contactHref) router.push(contactHref as never);
                }
          }
        >
          {canPurchase ? "Mua ngay" : "Tư vấn"}
        </button>
      </div>
    </section>
  );
}
