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

export function LuxuryPdp({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [mediaIndex, setMediaIndex] = useState(0);
  const selected = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const media = product.media[mediaIndex] ?? product.media[0];
  const availableWidths = useMemo(() => [...new Set(product.variants.filter((variant) => variant.active).map((variant) => variant.width))], [product.variants]);
  const availableThicknesses = useMemo(() => [...new Set(product.variants.filter((variant) => variant.active && variant.width === selected.width).map((variant) => variant.thickness))], [product.variants, selected.width]);

  function chooseWidth(width: number) {
    const candidate = product.variants.find((variant) => variant.active && variant.width === width) ?? selected;
    setSelectedVariantId(candidate.id);
  }

  function addToCart() {
    if (!selected.price || !selected.active || selected.stock < 1) return;
    addItem({ variantId: selected.id, quantity: 1, productSlug: product.slug, productName: product.name, width: selected.width, length: selected.length, thickness: selected.thickness, price: selected.price, sku: selected.sku, image: product.media[0].url });
  }

  function buyNow() {
    addToCart();
    if (selected.price && selected.stock > 0) router.push("/checkout");
  }

  return <div className="luxury-page">
    <section className="luxury-hero container">
      <div className="hero-gallery">
        <div className="gallery-tabs"><button className="active">Ảnh</button><button>Video</button><button>3D</button></div>
        <div className="gallery-layout"><div className="gallery-thumbs">{product.media.map((item, index) => <button key={item.id} className={index === mediaIndex ? "active" : ""} onClick={() => setMediaIndex(index)}><Image src={item.url} alt={item.alt} width={90} height={112} /></button>)}</div><div className="hero-image"><Image src={media.url} alt={media.alt} fill priority={mediaIndex === 0} sizes="(max-width: 860px) 100vw, 53vw" style={{ objectFit: media.fit ?? "cover", objectPosition: `${(media.focalX ?? .5) * 100}% ${(media.focalY ?? .5) * 100}%` }} />{media.isDemo && <span className="demo-badge">Hình ảnh minh họa</span>}</div></div>
      </div>
      <div className="hero-copy"><p className="eyebrow">{product.eyebrow}</p><h1>{product.name}</h1><p className="hero-lede">Signature multi-layer comfort mattress.</p><p className="hero-description">{product.description}</p><div className="price-row"><strong>{formatVnd(selected.price)}</strong>{selected.compareAtPrice && <del>{formatVnd(selected.compareAtPrice)}</del>}</div>
        <div className="variant-block"><div className="variant-heading"><span>KÍCH THƯỚC</span><small>{formatDimension(selected.width)} × {formatDimension(selected.length)}</small></div><label>Rộng<select value={selected.width} onChange={(event) => chooseWidth(Number(event.target.value))}>{availableWidths.map((width) => <option key={width} value={width}>{formatDimension(width)}</option>)}</select></label><label>Dài<span className="static-value">{formatDimension(selected.length)}</span></label><label>Độ dày<div className="thicknesses">{availableThicknesses.map((thickness) => { const variant = product.variants.find((item) => item.width === selected.width && item.thickness === thickness); return <button key={thickness} className={variant?.id === selected.id ? "active" : ""} onClick={() => variant && setSelectedVariantId(variant.id)}>{thickness}</button>; })}</div></label></div>
        {selected.price && selected.stock > 0 ? <div className="hero-ctas"><button className="button button-primary" onClick={buyNow}>Mua ngay</button><button className="button button-secondary" onClick={addToCart}>Thêm vào giỏ</button></div> : <button className="button button-primary contact-button" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Liên hệ tư vấn</button>}
        <div id="trust" className="trust-list"><span>✓ Bảo hành theo chính sách Thăng Long</span><span>✓ Giao hàng toàn quốc</span><span>✓ COD / Chuyển khoản / MoMo</span></div><div className="hero-actions"><button aria-label="Thêm vào yêu thích">♡ Yêu thích</button><button onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}>⇄ So sánh</button></div>
      </div>
    </section>

    <GsapReveal><section id="comfort" className="comfort-section container"><div><p className="section-label">BUILT FOR COMFORT</p><h2>Cảm giác được cân bằng.</h2><p className="muted">Các điểm số dưới đây sẽ được cập nhật từ dữ liệu sản phẩm đã xác nhận.</p></div><div className="comfort-grid"><div className="comfort-meter"><span>Êm</span><div className="meter-line"><i /><b /></div><span>Cứng</span><strong>Medium</strong></div>{[["Nâng đỡ", 4], ["Thoáng khí", 4], ["Giảm truyền động", 4]].map(([label, value]) => <div className="comfort-stat" key={label as string}><span>{label}</span><div aria-label={`${label}: ${value} trên 5`}>{[1,2,3,4,5].map((dot) => <i key={dot} className={dot <= (value as number) ? "filled" : ""} />)}</div><small>{value}/5</small></div>)}</div></section></GsapReveal>

    <section className="editorial-section container"><div className="editorial-image"><Image src="/images/luxury-lifestyle.png" alt="Không gian nghỉ ngơi ấm áp với nệm Luxury" fill sizes="(max-width: 860px) 100vw, 62vw" /></div><div className="editorial-copy"><p className="section-label">PHÙ HỢP VỚI</p><h2>Những người tìm sự cân bằng.</h2><h3>Cặp đôi</h3><p>Người thường xuyên đổi tư thế ngủ. Người muốn cảm giác cân bằng giữa độ êm và khả năng nâng đỡ.</p><Link href="#compare" className="text-link">Tìm hiểu thêm <span>→</span></Link></div></section>

    <MattressLabTeaser product={product} />

    <section id="natural-latex" className="latex-section container"><div className="latex-copy"><p className="eyebrow">MATERIAL STORY</p><h2>A TOUCH OF<br />NATURAL RESPONSE.</h2><p>Cao su thiên nhiên được sử dụng như một phần của trải nghiệm nâng đỡ và đàn hồi. Tỷ lệ cụ thể sẽ được cập nhật khi có xác nhận từ xưởng.</p></div><div className="latex-image"><Image src="/images/luxury-detail.png" alt="Cận cảnh chất liệu và đường may tự nhiên" fill sizes="(max-width: 860px) 100vw, 48vw" /></div></section>

    <section id="compare" className="compare-section container"><div><p className="section-label">KHÔNG CHẮC LUXURY CÓ PHÙ HỢP?</p><h2>Đặt cạnh những lựa chọn khác.</h2></div><div className="compare-options"><div><span>01</span><strong>Memory Foam</strong><small>Ôm cơ thể · giảm áp lực</small></div><div><span>02</span><strong>Cao Su Thiên Nhiên</strong><small>Đàn hồi · vật liệu tự nhiên</small></div><div><span>03</span><strong>America</strong><small>Thực tế · dễ tiếp cận</small></div></div></section>

    <section className="info-grid container"><article><p className="section-label">GIAO HÀNG</p><h3>Giao hàng toàn quốc.</h3><p>Phí vận chuyển được hỗ trợ theo chính sách hiện hành.</p><Link href="#contact" className="text-link">Xem chính sách →</Link></article><article><p className="section-label">BẢO HÀNH</p><h3>An tâm sau khi mua.</h3><p>Thông tin bảo hành đầy đủ được cập nhật từ CMS.</p><Link href="#contact" className="text-link">Xem chính sách bảo hành →</Link></article><article id="about"><p className="section-label">VỀ THĂNG LONG</p><h3>Modern Vietnamese comfort.</h3><p>Thiết kế cho những đêm nghỉ ngơi dễ chịu, đáng tin và vừa vặn với đời sống hôm nay.</p></article></section>
    <section id="contact" className="contact-section"><div className="container"><p className="eyebrow">TƯ VẤN LỰA CHỌN</p><h2>Hãy bắt đầu từ một giấc ngủ phù hợp.</h2><a className="button button-dark" href="mailto:hello@nemthanglong.vn">Liên hệ Thăng Long →</a></div></section>
    <div className="mobile-sticky-cta"><div><span>Luxury</span><strong>{formatVnd(selected.price)}</strong></div>{selected.price && selected.stock > 0 ? <button onClick={buyNow}>Mua ngay</button> : <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Liên hệ</button>}</div>
  </div>;
}
