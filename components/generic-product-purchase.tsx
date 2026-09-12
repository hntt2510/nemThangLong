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

type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  label: string;
  category: "hero" | "delivery" | "material" | "certification" | "bedroom";
};

const STANDARD_GALLERIES: Record<string, GalleryItem[]> = {
  classic: [
    { id: "hero", url: "/images/products/classic/catalog-v2.png", alt: "Nệm Thăng Long Classic - Góc chụp studio chính hãng", label: "Ảnh nệm chính diện", category: "hero" },
    { id: "delivery", url: "/images/products/classic/02.webp", alt: "Hình ảnh thực tế giao nệm Thăng Long Classic tận giường cho khách hàng", label: "Giao tận giường", category: "delivery" },
    { id: "material", url: "/images/products/classic/03.webp", alt: "Cận cảnh bề mặt vải nệm thoáng khí và kết cấu nâng đỡ", label: "Chất liệu nệm", category: "material" },
    { id: "cert", url: "/images/products/classic/04.webp", alt: "Tem chứng nhận Quatest 3 và phiếu bảo hành chính hãng 15 năm", label: "Chứng nhận Quatest 3", category: "certification" },
    { id: "bedroom", url: "/images/products/classic/01.webp", alt: "Phòng ngủ thực tế lắp đặt nệm Thăng Long Classic", label: "Thực tế tại nhà", category: "bedroom" },
  ],
  "cao-su-thien-nhien": [
    { id: "hero", url: "/images/products/cao-su-thien-nhien/catalog-v2.png", alt: "Nệm cao su thiên nhiên Thăng Long 3/4 - Nâng đỡ êm ái", label: "Ảnh nệm chính diện", category: "hero" },
    { id: "delivery", url: "/images/products/cao-su-thien-nhien/02.webp", alt: "Hình ảnh thực tế nhân viên xưởng giao nệm cao su tận phòng cho khách", label: "Giao tận giường", category: "delivery" },
    { id: "material", url: "/images/products/cao-su-thien-nhien/03.webp", alt: "Cận cảnh hai mặt lỗ thông khí kép và lớp áo lưới 4D tản nhiệt", label: "75% Cao su tự nhiên", category: "material" },
    { id: "cert", url: "/images/products/cao-su-thien-nhien/04.webp", alt: "Tem kiểm định Quatest 3 đạt chuẩn an toàn không kích ứng", label: "Chứng nhận Quatest 3", category: "certification" },
    { id: "bedroom", url: "/images/products/cao-su-thien-nhien/01.webp", alt: "Không gian phòng ngủ thực tế dùng nệm cao su Thăng Long", label: "Thực tế tại nhà", category: "bedroom" },
  ],
  "hoat-tinh": [
    { id: "hero", url: "/images/products/hoat-tinh/catalog-v2.png", alt: "Nệm Thăng Long Hoạt Tính - Khử mùi kháng khuẩn", label: "Ảnh nệm chính diện", category: "hero" },
    { id: "delivery", url: "/images/products/hoat-tinh/02.webp", alt: "Hình ảnh thực tế xe xưởng giao nệm than hoạt tính tận nhà cho khách", label: "Giao tận giường", category: "delivery" },
    { id: "material", url: "/images/products/hoat-tinh/03.webp", alt: "Cận cảnh lõi than hoạt tính kháng khuẩn và nâng đỡ đa vùng cột sống", label: "Than hoạt tính", category: "material" },
    { id: "cert", url: "/images/products/hoat-tinh/04.webp", alt: "Tem chứng nhận kiểm định chất lượng Quatest 3 và bảo hành 15 năm", label: "Chứng nhận Quatest 3", category: "certification" },
    { id: "bedroom", url: "/images/products/hoat-tinh/01.webp", alt: "Trải nghiệm nệm Thăng Long Hoạt Tính tại phòng ngủ", label: "Thực tế tại nhà", category: "bedroom" },
  ],
  "memory-foam": [
    { id: "hero", url: "/images/products/memory-foam/catalog-v2.png", alt: "Nệm Thăng Long Memory Foam - Chống đau mỏi lưng", label: "Ảnh nệm chính diện", category: "hero" },
    { id: "delivery", url: "/images/products/memory-foam/02.webp", alt: "Hình ảnh thực tế giao nệm Memory Foam tận phòng ngủ cho khách hàng", label: "Giao tận giường", category: "delivery" },
    { id: "material", url: "/images/products/memory-foam/03.webp", alt: "Cận cảnh lõi Memory Foam chậm đàn hồi ôm sát đường cong cột sống", label: "Lõi Memory Foam", category: "material" },
    { id: "cert", url: "/images/products/memory-foam/04.webp", alt: "Tem kiểm định Quatest 3 về độ bền chịu lực đàn hồi", label: "Chứng nhận Quatest 3", category: "certification" },
    { id: "bedroom", url: "/images/products/memory-foam/01.webp", alt: "Không gian sang trọng với Nệm Memory Foam", label: "Thực tế tại nhà", category: "bedroom" },
  ],
  "khach-san": [
    { id: "hero", url: "/images/products/khach-san/catalog-v2.png", alt: "Nệm Cao Su Cho Khách Sạn - Chuẩn phòng suite 5 sao", label: "Ảnh nệm chính diện", category: "hero" },
    { id: "delivery", url: "/images/products/khach-san/02.webp", alt: "Hình ảnh thực tế bàn giao nệm khách sạn cho dự án khu nghỉ dưỡng", label: "Giao dự án tận nơi", category: "delivery" },
    { id: "material", url: "/images/products/khach-san/03.webp", alt: "Cận cảnh vải gấm dệt hoa văn chần bông êm ái đạt chuẩn khách sạn 5 sao", label: "Vải gấm 5 sao", category: "material" },
    { id: "cert", url: "/images/products/khach-san/04.webp", alt: "Chứng nhận kiểm định tiêu chuẩn độ bền nén ép 100.000 chu kỳ", label: "Độ bền 5 sao", category: "certification" },
    { id: "bedroom", url: "/images/products/khach-san/01.webp", alt: "Phòng nghỉ khách sạn cao cấp trang bị Nệm Thăng Long", label: "Không gian resort", category: "bedroom" },
  ],
  america: [
    { id: "hero", url: "/images/products/america/catalog-v2.png", alt: "Nệm Cao Su Thăng Long America - Đàn hồi tối đa", label: "Ảnh nệm chính diện", category: "hero" },
    { id: "delivery", url: "/images/products/america/02.webp", alt: "Hình ảnh thực tế giao nệm America bọc nilon 2 lớp tận phòng khách hàng", label: "Giao tận giường", category: "delivery" },
    { id: "material", url: "/images/products/america/03.webp", alt: "Cận cảnh lõi nệm cao su chịu lực vững chãi chống xẹp lún", label: "Nâng đỡ đàn hồi", category: "material" },
    { id: "cert", url: "/images/products/america/04.webp", alt: "Tem kiểm định Quatest 3 và phiếu bảo hành chính hãng", label: "Bảo hành 15 năm", category: "certification" },
    { id: "bedroom", url: "/images/products/america/01.webp", alt: "Phòng ngủ hiện đại lắp đặt nệm Thăng Long America", label: "Thực tế tại nhà", category: "bedroom" },
  ],
};

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

  const galleryItems = useMemo<GalleryItem[]>(() => {
    const fromConfig = STANDARD_GALLERIES[product.slug];
    if (fromConfig && fromConfig.length > 0) return fromConfig;

    if (product.media && product.media.length > 0) {
      return product.media.map((m, idx) => ({
        id: m.id || `media-${idx}`,
        url: m.url,
        alt: mediaAlt(product, m),
        label:
          idx === 0
            ? "Ảnh nệm chính diện"
            : idx === 1
            ? "Giao tận giường"
            : idx === 2
            ? "Chất liệu nệm"
            : idx === 3
            ? "Chứng nhận chất lượng"
            : "Thực tế tại nhà",
        category:
          idx === 0
            ? "hero"
            : idx === 1
            ? "delivery"
            : idx === 2
            ? "material"
            : idx === 3
            ? "certification"
            : "bedroom",
      }));
    }

    return [
      { id: "hero", url: product.posterUrl || "/images/luxury-hero.webp", alt: product.name, label: "Ảnh nệm chính diện", category: "hero" },
      { id: "delivery", url: "/images/luxury-lifestyle.webp", alt: "Hình ảnh thực tế giao nệm cho khách hàng", label: "Giao tận giường", category: "delivery" },
      { id: "material", url: "/images/luxury-detail.webp", alt: "Cận cảnh chất liệu nệm", label: "Chất liệu nệm", category: "material" },
      { id: "cert", url: "/images/landing-quality-v2.png", alt: "Chứng nhận chất lượng Quatest 3 và bảo hành", label: "Chứng nhận chất lượng", category: "certification" },
    ];
  }, [product]);

  const activeImage = galleryItems[mediaIndex] ?? galleryItems[0];
  const selected = resolveVariant(variants, selection);
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
    if (!canPurchase || !selected) return;
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
      image: activeImage.url,
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
          {/* Main Hero Gallery Image */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-100 shadow-sm">
            {activeImage && (
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 55vw"
                className="object-cover transition-all duration-300 hover:scale-105"
              />
            )}

            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900/85 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeImage.label}
              </span>
              {discountPercent > 0 && (
                <span className="rounded-lg bg-[#DC2626] px-3 py-1 text-xs font-bold text-white shadow-md">
                  Tiết kiệm {discountPercent}%
                </span>
              )}
            </div>

            {/* Counter badge in top right */}
            <div className="absolute top-4 right-4 pointer-events-none">
              <span className="rounded-full bg-stone-900/70 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                {mediaIndex + 1} / {galleryItems.length}
              </span>
            </div>
          </div>

          {/* Interactive Thumbnail Row below Main Image */}
          <div
            className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-5"
            role="tablist"
            aria-label="Bộ sưu tập ảnh sản phẩm và giao hàng thực tế"
          >
            {galleryItems.map((item, index) => {
              const isActive = index === mediaIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setMediaIndex(index)}
                  className={`group relative h-20 w-24 sm:h-22 sm:w-auto overflow-hidden rounded-xl border-2 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "border-[#DC2626] ring-2 ring-[#DC2626]/30 shadow-md scale-[1.02]"
                      : "border-stone-200 opacity-75 hover:opacity-100 hover:border-stone-400"
                  }`}
                  aria-label={`Xem ảnh ${index + 1}: ${item.label}`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <span
                    className={`absolute bottom-0 inset-x-0 py-0.5 text-[9px] font-bold text-center truncate px-1 transition-colors ${
                      isActive
                        ? "bg-[#DC2626] text-white"
                        : "bg-stone-900/75 text-white group-hover:bg-stone-900"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Trust Banner directly under images */}
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50/90 border border-amber-200/90 px-4 py-3 text-center text-xs sm:text-sm font-bold text-amber-950 shadow-xs">
            <Truck className="size-4 text-amber-700 shrink-0 animate-bounce" />
            <span>🚚 Hình ảnh thực tế giao tận giường cho khách hàng · Miễn phí đổi trả 100 đêm</span>
          </div>

          {/* Value proposition badges under media */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="size-5 text-[#C5A880]" />
              <span className="text-xs font-bold text-stone-900">Bảo hành 15 năm</span>
              <span className="text-[11px] text-stone-500 hidden sm:inline">Chính hãng tại xưởng</span>
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
