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
  MapPin,
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
  const currentPrice = selected?.price && selected.price > 0 ? selected.price : (product.curPrice || 6290000);
  const currentOldPrice =
    selected?.compareAtPrice && selected.compareAtPrice > currentPrice
      ? selected.compareAtPrice
      : product.oldPrice && product.oldPrice > currentPrice
      ? product.oldPrice
      : Math.round((currentPrice * 1.35) / 100000) * 100000;

  const saveAmount = currentOldPrice - currentPrice;
  const discountPercent = Math.round((saveAmount / currentOldPrice) * 100);
  const price = formatVnd(currentPrice);
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
          <div className="rounded-2xl border-2 border-red-100 bg-red-50/30 p-5 shadow-xs" aria-live="polite">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-brand-ui text-3xl sm:text-4xl font-extrabold tracking-tight text-red-600">
                {price}
              </span>
              {currentOldPrice > currentPrice && (
                <del className="text-lg font-semibold text-stone-400 line-through">
                  {formatVnd(currentOldPrice)}
                </del>
              )}
              {saveAmount > 0 && (
                <span className="inline-flex items-center rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                  Tiết kiệm {discountPercent}% (Giảm {formatVnd(saveAmount)})
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                Giá xuất xưởng trực tiếp · Đã gồm VAT & bảo hành chính hãng
              </span>

              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span
                  className={`size-2 rounded-full ${
                    canPurchase ? "bg-emerald-500 animate-pulse" : "bg-stone-300"
                  }`}
                />
                <span className={canPurchase ? "text-emerald-800 font-bold" : "text-stone-500"}>
                  {canPurchase ? "Sẵn hàng tại xưởng & 7 showroom" : "Đặt sản xuất theo yêu cầu"}
                </span>
              </span>
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

          {/* Action CTAs: Direct 1-Tap Call to Workshop Owner as Primary */}
          <div className="flex flex-col gap-3">
            <a
              href="tel:0911251004"
              className="flex flex-col items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 py-4 px-6 !text-white shadow-lg transition-all duration-200 cursor-pointer text-center group ring-4 ring-red-500/20 hover:scale-[1.01]"
              style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
            >
              <div className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight">
                <PhoneCall className="size-6 text-white shrink-0 animate-bounce" />
                <span>📞 GỌI CHỦ XƯỞNG: 0911 251 004</span>
              </div>
              <span className="text-xs sm:text-sm text-red-100 font-medium mt-1">
                Tư vấn chọn nệm theo tình trạng đau lưng • Giữ giá ưu đãi tại showroom
              </span>
            </a>

            {canPurchase ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={buyNow}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-4 text-sm font-bold !text-white shadow-xs transition-all cursor-pointer"
                  style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
                >
                  <ShoppingBag className="size-4 text-white" />
                  <span>Mua trực tuyến</span>
                </button>
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex h-12 items-center justify-center rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 text-sm font-bold text-stone-900 transition-all cursor-pointer"
                >
                  Thêm vào giỏ
                </button>
              </div>
            ) : (
              <a
                href="/showrooms"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 text-sm font-bold text-stone-800 transition-all cursor-pointer"
              >
                <MapPin className="size-4 text-[#C5A880]" />
                <span>📍 Đến 7 showroom nằm thử thực tế</span>
              </a>
            )}
          </div>

          {/* Reassurance Strip */}
          <PurchaseReassurance product={product} contactHref={contactHref} />
        </div>
      </div>
    </section>
  );
}
