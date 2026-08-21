"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDimension, formatVnd } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import type { Product, ProductVariant } from "@/lib/types";
import { GsapReveal } from "./gsap-reveal";
import { MattressLabTeaser } from "./mattress-lab-teaser";

const emptyVariant: ProductVariant = {
  id: "none",
  width: 0,
  length: 0,
  thickness: 0,
  price: null,
  compareAtPrice: null,
  sku: "",
  stock: 0,
  active: false,
};

export function LuxuryPdp({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((variant) => variant.active)?.id ??
      product.variants[0]?.id ??
      "none",
  );
  const [mediaIndex, setMediaIndex] = useState(0);
  const selected =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0] ??
    emptyVariant;
  const media = product.media[mediaIndex] ?? product.media[0];
  const availableVariants = useMemo(
    () => product.variants.filter((variant) => variant.active),
    [product.variants],
  );
  const availableWidths = useMemo(
    () => [...new Set(availableVariants.map((variant) => variant.width))],
    [availableVariants],
  );
  const availableThicknesses = useMemo(
    () => [
      ...new Set(
        availableVariants
          .filter((variant) => variant.width === selected.width)
          .map((variant) => variant.thickness),
      ),
    ],
    [availableVariants, selected.width],
  );
  const canPurchase =
    !product.isDemo &&
    selected.active &&
    selected.price !== null &&
    selected.price > 0 &&
    selected.stock > 0;
  const comfort = product.content?.comfort?.published
    ? product.content.comfort
    : null;
  const audience = product.content?.audience?.published
    ? product.content.audience
    : null;
  const materialStory = product.content?.materialStory?.published
    ? product.content.materialStory
    : null;
  function addToCart() {
    if (!canPurchase || !media) return;
    addItem({
      variantId: selected.id,
      quantity: 1,
      productSlug: product.slug,
      productName: product.name,
      width: selected.width,
      length: selected.length,
      thickness: selected.thickness,
      price: selected.price!,
      sku: selected.sku,
      image: media.url,
    });
  }
  function buyNow() {
    addToCart();
    if (canPurchase) router.push("/checkout");
  }
  return (
    <div className="luxury-page">
      <section className="luxury-hero container">
        <div className="hero-gallery">
          <div className="gallery-tabs">
            <button className="active">Ảnh</button>
            <button disabled>Video</button>
            <button disabled>3D</button>
          </div>
          <div className="gallery-layout">
            <div className="gallery-thumbs">
              {product.media.map((item, index) => (
                <button
                  key={item.id}
                  className={index === mediaIndex ? "active" : ""}
                  onClick={() => setMediaIndex(index)}
                >
                  <Image
                    src={item.url}
                    alt={item.alt}
                    width={90}
                    height={112}
                  />
                </button>
              ))}
            </div>
            <div className="hero-image">
              {media && (
                <Image
                  src={media.url}
                  alt={media.alt}
                  fill
                  priority={mediaIndex === 0}
                  sizes="(max-width: 860px) 100vw, 53vw"
                  style={{
                    objectFit: media.fit ?? "cover",
                    objectPosition: `${(media.focalX ?? 0.5) * 100}% ${(media.focalY ?? 0.5) * 100}%`,
                  }}
                />
              )}
              {media?.isDemo && (
                <span className="demo-badge">Ảnh minh họa</span>
              )}
            </div>
          </div>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">{product.eyebrow}</p>
          <h1>{product.name}</h1>
          <p className="hero-lede">A considered comfort experience.</p>
          <p className="hero-description">{product.description}</p>
          <div className="price-row">
            <strong>
              {canPurchase ? formatVnd(selected.price) : "Liên hệ"}
            </strong>
            {canPurchase && selected.compareAtPrice && (
              <del>{formatVnd(selected.compareAtPrice)}</del>
            )}
          </div>
          {availableVariants.length > 0 ? (
            <div className="variant-block">
              <div className="variant-heading">
                <span>KÍCH THƯỚC</span>
                <small>
                  {formatDimension(selected.width)} ×{" "}
                  {formatDimension(selected.length)}
                </small>
              </div>
              <label>
                Rộng
                <select
                  value={selected.width}
                  onChange={(event) => {
                    const candidate = availableVariants.find(
                      (variant) => variant.width === Number(event.target.value),
                    );
                    if (candidate) setSelectedVariantId(candidate.id);
                  }}
                >
                  {availableWidths.map((width) => (
                    <option key={width} value={width}>
                      {formatDimension(width)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dài
                <span className="static-value">
                  {formatDimension(selected.length)}
                </span>
              </label>
              <label>
                Độ dày
                <div className="thicknesses">
                  {availableThicknesses.map((thickness) => {
                    const variant = availableVariants.find(
                      (item) =>
                        item.width === selected.width &&
                        item.thickness === thickness,
                    );
                    return (
                      <button
                        type="button"
                        key={thickness}
                        className={variant?.id === selected.id ? "active" : ""}
                        onClick={() =>
                          variant && setSelectedVariantId(variant.id)
                        }
                      >
                        {thickness}
                      </button>
                    );
                  })}
                </div>
              </label>
            </div>
          ) : (
            <div className="variant-placeholder">
              Kích thước và tổ hợp bán đang được cập nhật từ CMS.
            </div>
          )}
          {canPurchase ? (
            <div className="hero-ctas">
              <button className="button button-primary" onClick={buyNow}>
                Mua ngay
              </button>
              <button className="button button-secondary" onClick={addToCart}>
                Thêm vào giỏ
              </button>
            </div>
          ) : (
            <button
              className="button button-primary contact-button"
              onClick={() =>
                router.push("/lien-he?product=luxury")
              }
            >
              Liên hệ tư vấn
            </button>
          )}
          <div id="trust" className="trust-list">
            <span>✓ Chính sách bảo hành được cập nhật từ CMS</span>
            <span>✓ Thông tin giao hàng theo cấu hình CMS</span>
            <span>✓ Phương thức thanh toán theo cấu hình CMS</span>
          </div>
          <div className="hero-actions">
            <button aria-label="Thêm vào yêu thích">♡ Yêu thích</button>
            <button
              onClick={() =>
                document
                  .getElementById("compare")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              ⇄ So sánh
            </button>
          </div>
        </div>
      </section>
      {comfort && (
        <GsapReveal>
          <section id="comfort" className="comfort-section container">
            <div>
              <p className="section-label">BUILT FOR COMFORT</p>
              <h2>Cảm giác được cân bằng.</h2>
              <p className="muted">Dữ liệu này đã được xác nhận trong CMS.</p>
            </div>
            <div className="comfort-grid">
              <div className="comfort-meter">
                <span>Êm</span>
                <div className="meter-line">
                  <i
                    style={{
                      width: `${Math.min(100, Math.max(0, (comfort.firmnessScore ?? 0) * 20))}%`,
                    }}
                  />
                  <b
                    style={{
                      left: `${Math.min(100, Math.max(0, (comfort.firmnessScore ?? 0) * 20))}%`,
                    }}
                  />
                </div>
                <span>Cứng</span>
                <strong>{comfort.firmnessLabel ?? "Đang cập nhật"}</strong>
              </div>
              {[
                ["Nâng đỡ", comfort.support],
                ["Thoáng khí", comfort.breathability],
                ["Giảm truyền động", comfort.motionIsolation],
              ]
                .filter(
                  (entry): entry is [string, number] =>
                    typeof entry[1] === "number",
                )
                .map(([label, value]) => (
                  <div className="comfort-stat" key={label}>
                    <span>{label}</span>
                    <div aria-label={`${label}: ${value} trên 5`}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <i key={dot} className={dot <= value ? "filled" : ""} />
                      ))}
                    </div>
                    <small>{value}/5</small>
                  </div>
                ))}
            </div>
          </section>
        </GsapReveal>
      )}
      {audience && (
        <section className="editorial-section container">
          <div className="editorial-image">
            {product.media[2] && (
              <Image
                src={product.media[2].url}
                alt={product.media[2].alt}
                fill
                sizes="(max-width: 860px) 100vw, 62vw"
              />
            )}
          </div>
          <div className="editorial-copy">
            <p className="section-label">PHÙ HỢP VỚI</p>
            <h2>{audience.title}</h2>
            <p>{audience.body}</p>
            <Link href="#compare" className="text-link">
              Tìm hiểu thêm →
            </Link>
          </div>
        </section>
      )}
      <MattressLabTeaser product={product} />
      {materialStory && (
        <section id="natural-latex" className="latex-section container">
          <div className="latex-copy">
            <p className="eyebrow">MATERIAL STORY</p>
            <h2>{materialStory.title}</h2>
            <p>{materialStory.body}</p>
          </div>
          <div className="latex-image">
            {product.media[1] && (
              <Image
                src={product.media[1].url}
                alt={product.media[1].alt}
                fill
                sizes="(max-width: 860px) 100vw, 48vw"
              />
            )}
          </div>
        </section>
      )}
      <section id="compare" className="compare-section container">
        <div>
          <p className="section-label">SO SÁNH</p>
          <h2>Đặt cạnh những lựa chọn khác.</h2>
        </div>
        <div className="compare-options">
          {["01", "02", "03"].map((number) => (
            <div key={number}>
              <span>{number}</span>
              <strong>Lựa chọn đang cập nhật</strong>
              <small>Dữ liệu so sánh chỉ hiển thị sau khi CMS xác nhận.</small>
            </div>
          ))}
        </div>
      </section>
      <section className="info-grid container">
        <article>
          <p className="section-label">GIAO HÀNG</p>
          <h3>Thông tin đang cập nhật.</h3>
          <p>Phí vận chuyển được quản lý trong Site settings.</p>
          <Link href={"/lien-he?product=luxury" as never} className="text-link">
            Xem chính sách →
          </Link>
        </article>
        <article>
          <p className="section-label">BẢO HÀNH</p>
          <h3>Thông tin đang cập nhật.</h3>
          <p>Chính sách bảo hành chỉ hiển thị sau khi CMS xác nhận.</p>
          <Link href={"/lien-he?product=luxury" as never} className="text-link">
            Xem chính sách →
          </Link>
        </article>
        <article id="about">
          <p className="section-label">VỀ THĂNG LONG</p>
          <h3>Modern Vietnamese comfort.</h3>
          <p>Nội dung thương hiệu được quản lý trong CMS.</p>
        </article>
      </section>
      <section id="contact" className="contact-section">
        <div className="container">
          <p className="eyebrow">TƯ VẤN LỰA CHỌN</p>
          <h2>Hãy bắt đầu từ một giấc ngủ phù hợp.</h2>
          <Link className="button button-dark" href={"/lien-he?product=luxury" as never}>
            Liên hệ Thăng Long →
          </Link>
        </div>
      </section>
      <div className="mobile-sticky-cta">
        <div>
          <span>Luxury</span>
          <strong>{canPurchase ? formatVnd(selected.price) : "Liên hệ"}</strong>
        </div>
        <button
          onClick={
            canPurchase
              ? buyNow
              : () =>
                    router.push("/lien-he?product=luxury")
          }
        >
          {canPurchase ? "Mua ngay" : "Liên hệ"}
        </button>
      </div>
    </div>
  );
}
