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
import { resolvePdpCta } from "@/lib/product-cta";

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
  const cta = resolvePdpCta(canPurchase, "/lien-he?product=luxury", {
    purchase: "Mua ngay",
    contact: "Liên hệ tư vấn",
    disabled: "Liên hệ",
  });

  const comfort = product.content?.comfort?.published
    ? product.content.comfort
    : null;
  const audience = product.content?.audience?.published
    ? product.content.audience
    : null;
  const materialStory = product.content?.materialStory?.published
    ? product.content.materialStory
    : null;

  function chooseWidth(width: number) {
    const candidate =
      availableVariants.find(
        (variant) =>
          variant.width === width && variant.thickness === selected.thickness,
      ) ?? availableVariants.find((variant) => variant.width === width);
    if (candidate) setSelectedVariantId(candidate.id);
  }

  function chooseThickness(thickness: number) {
    const candidate = availableVariants.find(
      (variant) =>
        variant.width === selected.width && variant.thickness === thickness,
    );
    if (candidate) setSelectedVariantId(candidate.id);
  }

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
      <nav aria-label="Breadcrumb" className="breadcrumb-nav container">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/nem">Bộ sưu tập</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Nệm Luxury Thăng Long</span>
      </nav>
      <section className="luxury-hero container">
        <div className="hero-gallery">
          <div className="gallery-tabs">
            {product.media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === mediaIndex ? "active" : ""}
                onClick={() => setMediaIndex(index)}
              >
                {index === 0
                  ? "Chính diện"
                  : index === 1
                    ? "Chi tiết lớp"
                    : index === 2
                      ? "Không gian"
                      : "Góc khác"}
              </button>
            ))}
          </div>
          <div className="hero-image">
            {media && (
              <Image
                src={media.url}
                alt={media.alt}
                fill
                priority
                sizes="(max-width: 860px) 100vw, 55vw"
                style={{
                  objectFit: media.fit ?? "cover",
                  objectPosition:
                    ((media.focalX ?? 0.5) * 100) +
                    "% " +
                    ((media.focalY ?? 0.5) * 100) +
                    "%",
                }}
              />
            )}
            {product.isDemo && (
              <span className="demo-badge">Ảnh minh họa</span>
            )}
          </div>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">{product.eyebrow}</p>
          <h1>{product.name}</h1>
          <p className="hero-description">{product.description}</p>
          <div className="price-row" aria-live="polite">
            <strong>
              {!product.isDemo && selected.price
                ? formatVnd(selected.price)
                : "Liên hệ tư vấn"}
            </strong>
            {!product.isDemo && selected.compareAtPrice && (
              <del>{formatVnd(selected.compareAtPrice)}</del>
            )}
          </div>
          {availableVariants.length > 0 ? (
            <div className="variant-block">
              <div className="variant-heading">
                <span>KÍCH THƯỚC</span>
                <small>
                  {formatDimension(selected.width)} ×{" "}
                  {formatDimension(selected.length)}cm
                </small>
              </div>
              <label>
                Rộng
                <select
                  value={selected.width}
                  onChange={(event) => chooseWidth(Number(event.target.value))}
                  aria-label="Chiều rộng"
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
                <div className="static-value">
                  {formatDimension(selected.length)}
                </div>
              </label>
              <label>
                Độ dày
                <div className="thicknesses">
                  {availableThicknesses.map((thickness) => {
                    const variantForThickness = availableVariants.find(
                      (item) =>
                        item.width === selected.width &&
                        item.thickness === thickness,
                    );
                    const disabled = !variantForThickness;
                    const active = selected.thickness === thickness;
                    return (
                      <button
                        key={thickness}
                        type="button"
                        className={active ? "active" : ""}
                        disabled={disabled}
                        onClick={() => chooseThickness(thickness)}
                        aria-label={`Độ dày ${thickness}cm${disabled ? " (không khả dụng)" : ""}`}
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
              Kích thước và thông tin sản phẩm đang được cập nhật.
            </div>
          )}
          {cta.type === "purchase" ? (
            <div className="hero-ctas">
              <button className="button button-primary" onClick={buyNow}>
                Mua ngay
              </button>
              <button className="button button-secondary" onClick={addToCart}>
                Thêm vào giỏ
              </button>
            </div>
          ) : cta.type === "contact" ? (
            <Link
              className="button button-primary contact-button"
              href={cta.href as never}
            >
              {cta.label}
            </Link>
          ) : (
            <button
              className="button button-primary contact-button"
              disabled
            >
              {cta.label}
            </button>
          )}
          <div id="trust" className="trust-list">
            <span>✓ Chọn kích thước theo cấu hình hiện có</span>
            <span>✓ Giá hoặc tư vấn hiển thị theo từng lựa chọn</span>
            <span>✓ Có thể liên hệ tư vấn trước khi đặt hàng</span>
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
              <p className="muted">Thông tin cảm giác nằm được hiển thị theo dữ liệu đã công bố.</p>
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
              <small>Thông tin so sánh đang được cập nhật chi tiết.</small>
            </div>
          ))}
        </div>
      </section>
      <section className="info-grid container">
        <article>
          <p className="section-label">GIAO HÀNG</p>
          <h3>Thông tin đang cập nhật.</h3>
          <p>Thông tin giao hàng áp dụng theo cấu hình đơn hàng.</p>
          <Link href={"/lien-he?product=luxury" as never} className="text-link">
            Xem chính sách →
          </Link>
        </article>
        <article>
          <p className="section-label">BẢO HÀNH</p>
          <h3>Thông tin đang cập nhật.</h3>
          <p>Thông tin bảo hành sẽ hiển thị khi có dữ liệu chính thức.</p>
          <Link href={"/lien-he?product=luxury" as never} className="text-link">
            Xem chính sách →
          </Link>
        </article>
        <article id="about">
          <p className="section-label">VỀ THĂNG LONG</p>
          <h3>Modern Vietnamese comfort.</h3>
          <p>Định hướng mang lại trải nghiệm nghỉ ngơi thư thái và phù hợp.</p>
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
        {cta.type === "purchase" ? (
          <button type="button" onClick={buyNow}>
            {cta.label}
          </button>
        ) : cta.type === "contact" ? (
          <Link href={cta.href as never}>
            {cta.label === "Liên hệ tư vấn" ? "Liên hệ" : cta.label}
          </Link>
        ) : (
          <button type="button" disabled>
            {cta.label}
          </button>
        )}
      </div>
    </div>
  );
}
