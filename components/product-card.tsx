"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { CatalogProductSummary } from "@/lib/catalog";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";

export type ProductCardProduct = Pick<
  CatalogProductSummary,
  | "slug"
  | "name"
  | "eyebrow"
  | "description"
  | "image"
  | "imageAlt"
  | "isDemo"
  | "imageIsDemo"
  | "minPrice"
  | "inStock"
  | "widths"
  | "ratingAverage"
  | "ratingCount"
> & {
  hasPlaceholderPrices?: boolean;
  isShowcase?: boolean;
  previewPurchasable?: boolean;
  curPrice?: number | null;
  oldPrice?: number | null;
  badge?: "BEST_SELLER" | "HOT_DEAL" | "DOCTOR_RECOMMENDED" | string | null;
};

export function ProductCard({
  product,
  className = "",
  hoverImage,
}: {
  product: ProductCardProduct;
  index?: number;
  className?: string;
  presentation?: "default" | "landing";
  hoverImage?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -y * 6, // Tilt on X axis
      y: x * 6,  // Tilt on Y axis
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const priceLabel = product.minPrice
    ? `Từ ${formatVnd(product.minPrice)}`
    : product.hasPlaceholderPrices
    ? "Có giá thử nghiệm"
    : "Liên hệ tư vấn";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative [perspective:1000px] ${className}`}
    >
      <article
        className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white transition-all duration-300 ease-out hover:border-stone-300 hover:shadow-xl"
        style={{
          transform: !reduceMotion && isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
            : "none",
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(26, 34, 41, 0.08), 0 8px 10px -6px rgba(26, 34, 41, 0.05)"
            : undefined,
        }}
      >
        {/* Product Image Container (4:3 aspect ratio) */}
        <Link
          href={`/nem/${product.slug}` as never}
          aria-label={`Xem chi tiết ${product.name}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100"
        >
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
              className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
            />
          ) : null}

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10 gap-1.5">
            <div className="flex flex-col gap-1 items-start">
              {product.badge === "BEST_SELLER" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                  🔥 Bán chạy nhất
                </span>
              )}
              {product.badge === "HOT_DEAL" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-600/95 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                  🏷️ Giảm giá sốc
                </span>
              )}
              {product.badge === "DOCTOR_RECOMMENDED" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/95 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                  ⭐ Khuyên dùng cho cột sống
                </span>
              )}
              {product.imageIsDemo && (
                <span className="rounded-md bg-stone-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                  Ảnh minh họa
                </span>
              )}
            </div>

            {product.inStock ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50/95 px-2 py-0.5 text-[11px] font-bold text-emerald-800 shadow-xs backdrop-blur-xs border border-emerald-200/60">
                <CheckCircle2 className="size-3 text-emerald-600" /> Còn hàng
              </span>
            ) : (
              <span className="rounded-md bg-stone-100/90 px-2 py-0.5 text-[11px] font-semibold text-stone-600 shadow-xs backdrop-blur-xs">
                Đặt trước
              </span>
            )}
          </div>
        </Link>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Eyebrow */}
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#C5A880] uppercase">
            {product.eyebrow}
          </p>

          {/* Title */}
          <h3 className="mt-2 font-brand-display text-xl font-bold tracking-tight text-stone-900 transition-colors duration-200 group-hover:text-[#1E3A5F]">
            <Link href={`/nem/${product.slug}` as never} className="line-clamp-1">
              {product.name}
            </Link>
          </h3>

          {/* Description - Fixed height to ensure alignment across cards */}
          <p className="mt-2 min-h-[2.8rem] line-clamp-2 text-xs sm:text-sm leading-relaxed text-stone-600">
            {product.description}
          </p>

          {/* Specs & Features Pills - Fixed height row */}
          <div className="mt-3 min-h-[1.75rem] flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
            {product.widths.length > 0 && (
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                Rộng: {product.widths.slice(0, 3).join(", ")}{product.widths.length > 3 ? "..." : ""} cm
              </span>
            )}
            {product.ratingAverage !== null && product.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-amber-900 font-bold">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                {product.ratingAverage.toFixed(1)} ({product.ratingCount})
              </span>
            )}
          </div>

          {/* Bottom Bar: Price and CTA button aligned via mt-auto */}
          <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {product.oldPrice && product.curPrice && product.oldPrice > product.curPrice ? (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <del className="text-xs text-stone-400 font-semibold line-through">
                    {formatVnd(product.oldPrice)}
                  </del>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-1 py-0.2 rounded">
                    -{Math.round(((product.oldPrice - product.curPrice) / product.oldPrice) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-xs text-stone-400 font-medium">Giá trực tiếp xưởng</span>
              )}

              <span className="font-brand-ui text-lg sm:text-xl font-bold text-red-600 tracking-tight">
                {product.curPrice ? formatVnd(product.curPrice) : priceLabel}
              </span>
              {product.hasPlaceholderPrices && (
                <span className="text-[10px] text-amber-700 font-medium">Giá thử nghiệm</span>
              )}
            </div>

            <Link
              href={`/nem/${product.slug}` as never}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-3.5 py-2.5 text-xs sm:text-sm font-semibold !text-white shadow-xs transition-all duration-200 cursor-pointer shrink-0"
              style={{
                backgroundColor: "#1E3A5F",
                color: "#ffffff",
              }}
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="size-3.5 text-white" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
