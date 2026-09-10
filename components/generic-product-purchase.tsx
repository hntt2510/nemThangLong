"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDimension, formatVnd } from "@/lib/format";
import {
  activeVariants,
  dimensionOptions,
  initialSelection,
  resolveVariant,
  selectVariant,
  selectionFromVariant,
  type VariantDimension,
} from "@/lib/variant-selection";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { isDemoMedia, mediaAlt } from "@/lib/product-media";
import { resolvePdpCta } from "@/lib/product-cta";
import { ProductRating } from "@/components/product-rating";
import { PurchaseReassurance } from "@/components/purchase-reassurance";
import { FirmnessScale } from "@/components/firmness-scale";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  PhoneCall,
} from "lucide-react";

export function GenericProductPurchase({
  product,
  contactHref,
}: {
  product: Product;
  contactHref: string | null;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const variants = useMemo(() => activeVariants(product.variants), [product.variants]);
  const [selection, setSelection] = useState(() => initialSelection(variants));
  const [mediaIndex, setMediaIndex] = useState(0);

  const selected = resolveVariant(variants, selection);
  const media = product.media[mediaIndex] ?? product.media[0];
  const canPurchase = Boolean(
    product.purchasable && selected && selected.price !== null && selected.price > 0 && selected.stock > 0
  );
  const price = selected?.price && selected.price > 0 ? formatVnd(selected.price) : "Liên hệ";
  const cta = resolvePdpCta(canPurchase, contactHref, {
    purchase: "Mua ngay",
    contact: "Tư vấn",
    disabled: "Liên hệ",
  });

  const widthOpts = useMemo(() => dimensionOptions(variants, "width", selected), [variants, selected]);
  const lengthOpts = useMemo(() => dimensionOptions(variants, "length", selected), [variants, selected]);
  const thicknessOpts = useMemo(() => dimensionOptions(variants, "thickness", selected), [variants, selected]);

  function change(dimension: VariantDimension, value: number) {
    const candidate = selectVariant(variants, selected, dimension, value);
    if (candidate) setSelection(selectionFromVariant(candidate));
  }

  function addToCart() {
    if (!canPurchase || !selected || !media) return;
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

  const discountPercent =
    selected?.compareAtPrice && selected.price && selected.compareAtPrice > selected.price
      ? Math.round(((selected.compareAtPrice - selected.price) / selected.compareAtPrice) * 100)
      : null;

  return (
    <section className="mx-auto w-[min(calc(100%-40px),1280px)] py-6 md:w-[min(calc(100%-64px),1280px)] md:py-10">
      {/* 12-Column Grid: Pure Lifestyle Photo Gallery (7 Cols) + Sticky Configurator (5 Cols) */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* LEFT: 7 Columns Main Lifestyle Photo Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            {/* Thumbnail Rail */}
            {product.media.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] pb-2 sm:pb-0 scrollbar-none shrink-0">
                {product.media.map((item, index) => {
                  const isActive = index === mediaIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMediaIndex(index)}
                      className={`relative size-16 sm:size-20 overflow-hidden rounded-xl border transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "border-stone-900 ring-2 ring-stone-900 shadow-sm"
                          : "border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300"
                      }`}
                      aria-label={`Xem ảnh ${index + 1}`}
                    >
                      <Image
                        src={item.url}
                        alt={mediaAlt(product, item)}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                      {isDemoMedia(product, item) && (
                        <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 py-0.5 text-[9px] font-bold text-white text-center">
                          Minh họa
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Hero Gallery Image */}
            <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full flex-1 overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-100 shadow-sm">
              {media && (
                <Image
                  src={media.url}
                  alt={mediaAlt(product, media)}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  style={{
                    objectFit: media.fit ?? "cover",
                    objectPosition: `${(media.focalX ?? 0.5) * 100}% ${(media.focalY ?? 0.5) * 100}%`,
                  }}
                />
              )}

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {media && isDemoMedia(product, media) && (
                  <span className="rounded-lg bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                    Hình ảnh minh họa
                  </span>
                )}
                {discountPercent && (
                  <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    Tiết kiệm {discountPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Value proposition badges under media */}
          <div className="mt-2 grid grid-cols-3 gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="size-5 text-[#C5A880]" />
              <span className="text-xs font-bold text-stone-900">Bảo hành 15 năm</span>
              <span className="text-[11px] text-stone-500 hidden sm:inline">Chính hãng tại nhà</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 border-x border-stone-200/80">
              <RotateCcw className="size-5 text-[#C5A880]" />
              <span className="text-xs font-bold text-stone-900">100 Đêm ngủ thử</span>
              <span className="text-[11px] text-stone-500 hidden sm:inline">Đổi trả thuận tiện</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="size-5 text-[#C5A880]" />
              <span className="text-xs font-bold text-stone-900">Giao tận giường</span>
              <span className="text-[11px] text-stone-500 hidden sm:inline">Miễn phí nội thành</span>
            </div>
          </div>
        </div>

        {/* RIGHT: 5 Columns Sticky Purchase Configurator */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-20">
          {/* Header info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
              {product.eyebrow}
            </p>
            <h1 className="mt-2 font-brand-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 leading-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {product.description}
            </p>

            {/* Ratings */}
            <div className="mt-3 flex items-center gap-3">
              <ProductRating reviews={product.reviews} compact />
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs font-semibold text-stone-600">
                Chứng nhận chất lượng Quatest 3
              </span>
            </div>
          </div>

          {/* Real-time Dynamic Price Display */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs" aria-live="polite">
            <div className="flex items-baseline gap-3">
              <span className="font-brand-ui text-3xl font-bold tracking-tight text-stone-900">
                {price}
              </span>
              {selected?.compareAtPrice && (
                <del className="text-base font-semibold text-stone-400 line-through">
                  {formatVnd(selected.compareAtPrice)}
                </del>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              {selected?.priceStatus === "PLACEHOLDER" ? (
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                  Giá tham khảo thử nghiệm
                </span>
              ) : (
                <span className="text-stone-500">Đã bao gồm VAT & phiếu bảo hành điện tử</span>
              )}

              {selected && (
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span
                    className={`size-2 rounded-full ${
                      selected.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-stone-300"
                    }`}
                  />
                  <span className={selected.stock > 0 ? "text-emerald-800" : "text-stone-500"}>
                    {selected.stock > 0 ? "Còn hàng" : "Đặt trước"}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Embedded Firmness Scale Indicator */}
          <FirmnessScale slug={product.slug} />

          {/* Variant Selectors: Dimension & Thickness as Luxury Swatches */}
          {variants.length > 0 ? (
            <div className="space-y-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Cấu hình kích thước
                </span>
                <span className="text-xs font-semibold font-mono text-stone-500">
                  {selected
                    ? `${formatDimension(selected.width)} × ${formatDimension(selected.length)} · ${selected.thickness}cm`
                    : "Chọn kích thước"}
                </span>
              </div>

              {/* Width Swatches */}
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-2 block">
                  Chiều rộng nệm (cm)
                </label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Chiều rộng nệm">
                  {widthOpts.map((value) => {
                    const isChecked = selected?.width === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isChecked}
                        onClick={() => change("width", value)}
                        className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? "border-stone-900 bg-stone-900 !text-white shadow-sm ring-1 ring-stone-900"
                            : "border-stone-200 bg-stone-50/80 text-stone-800 hover:bg-stone-100 hover:border-stone-300"
                        }`}
                        style={{
                          backgroundColor: isChecked ? "#1c1917" : undefined,
                          color: isChecked ? "#ffffff" : undefined,
                        }}
                      >
                        {formatDimension(value)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Length Swatches (if multiple) */}
              {lengthOpts.length > 1 && (
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-2 block">
                    Chiều dài nệm (cm)
                  </label>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Chiều dài nệm">
                    {lengthOpts.map((value) => {
                      const isChecked = selected?.length === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={isChecked}
                          onClick={() => change("length", value)}
                          className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                            isChecked
                              ? "border-stone-900 bg-stone-900 !text-white shadow-sm ring-1 ring-stone-900"
                              : "border-stone-200 bg-stone-50/80 text-stone-800 hover:bg-stone-100 hover:border-stone-300"
                          }`}
                          style={{
                            backgroundColor: isChecked ? "#1c1917" : undefined,
                            color: isChecked ? "#ffffff" : undefined,
                          }}
                        >
                          {formatDimension(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Thickness Swatches (if multiple) */}
              {thicknessOpts.length > 1 && (
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-2 block">
                    Độ dày nệm
                  </label>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Độ dày nệm">
                    {thicknessOpts.map((value) => {
                      const isChecked = selected?.thickness === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={isChecked}
                          onClick={() => change("thickness", value)}
                          className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                            isChecked
                              ? "border-stone-900 bg-stone-900 !text-white shadow-sm ring-1 ring-stone-900"
                              : "border-stone-200 bg-stone-50/80 text-stone-800 hover:bg-stone-100 hover:border-stone-300"
                          }`}
                          style={{
                            backgroundColor: isChecked ? "#1c1917" : undefined,
                            color: isChecked ? "#ffffff" : undefined,
                          }}
                        >
                          Dày {value}cm
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-center text-xs text-stone-500">
              Thông tin kích thước và giá bán đang được đồng bộ trực tiếp từ nhà máy.
            </div>
          )}

          {/* Action CTAs: High Contrast, h-14 buttons */}
          {cta.type === "purchase" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={buyNow}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-6 text-base font-bold !text-white shadow-md transition-all cursor-pointer"
                style={{
                  backgroundColor: "#1E3A5F",
                  color: "#ffffff",
                }}
              >
                <ShoppingBag className="size-5 text-white" />
                <span>Mua ngay</span>
              </button>

              <button
                type="button"
                onClick={addToCart}
                className="flex h-14 w-full items-center justify-center rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-6 text-sm font-bold text-stone-900 transition-all shadow-2xs cursor-pointer"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          ) : cta.type === "contact" ? (
            <a
              href={cta.href}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-6 text-base font-bold !text-white shadow-md transition-all cursor-pointer"
              style={{
                backgroundColor: "#1E3A5F",
                color: "#ffffff",
              }}
            >
              <PhoneCall className="size-5 text-white" />
              <span>Liên hệ tư vấn kích thước đặt riêng</span>
            </a>
          ) : (
            <div className="rounded-xl bg-stone-100 p-4 text-center text-sm text-stone-500">
              Thông tin tư vấn đang được cập nhật.
            </div>
          )}

          {/* Reassurance Strip */}
          <PurchaseReassurance product={product} contactHref={contactHref} />
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 line-clamp-1">{product.name}</span>
            <span className="text-lg font-bold text-stone-900">{price}</span>
          </div>

          {cta.type === "purchase" ? (
            <button
              type="button"
              onClick={buyNow}
              className="flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-6 text-sm font-bold !text-white shadow-md cursor-pointer shrink-0"
              style={{
                backgroundColor: "#1E3A5F",
                color: "#ffffff",
              }}
            >
              <span>Mua ngay</span>
            </button>
          ) : cta.type === "contact" ? (
            <a
              href={cta.href}
              className="flex h-12 items-center justify-center rounded-xl bg-[#1E3A5F] px-5 text-sm font-bold !text-white shadow-md cursor-pointer shrink-0"
              style={{
                backgroundColor: "#1E3A5F",
                color: "#ffffff",
              }}
            >
              <span>Tư vấn</span>
            </a>
          ) : (
            <button type="button" disabled className="rounded-xl bg-stone-200 px-5 py-2.5 text-sm font-bold text-stone-400">
              Liên hệ
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
