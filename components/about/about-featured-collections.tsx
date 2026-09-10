"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { formatVnd } from "@/lib/format";
import type { CatalogProductSummary } from "@/lib/catalog";

interface FeaturedCollectionsProps {
  products: CatalogProductSummary[];
}

interface CuratedCardConfig {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  badge: string;
  image: string;
  minPrice: number | null;
  widths: number[];
}

const DEFAULT_FEATURED: CuratedCardConfig[] = [
  {
    slug: "classic",
    name: "Nệm Thăng Long Classic",
    eyebrow: "THE EVERYDAY STANDARD",
    description: "Độ phẳng tối ưu nâng đỡ cột sống tự nhiên, lõi bông ép nano công nghệ cao bền bỉ chống xẹp lún.",
    badge: "Bán chạy nhất",
    image: "/images/products/classic/01.webp",
    minPrice: 3900000,
    widths: [120, 140, 160, 180],
  },
  {
    slug: "cao-su-thien-nhien",
    name: "Cao su thiên nhiên 3/4",
    eyebrow: "THE NATURAL STANDARD",
    description: "Mủ cao su nguyên chất êm ái đàn hồi đa tầng, ôm sát đường cong cơ thể và thoáng khí tối đa.",
    badge: "Cao su tự nhiên",
    image: "/images/products/cao-su-thien-nhien/01.webp",
    minPrice: 7500000,
    widths: [160, 180, 200],
  },
  {
    slug: "hoat-tinh",
    name: "Thăng Long Hoạt Tính",
    eyebrow: "RESPONSIVE COMFORT",
    description: "Tích hợp tinh chất than hoạt tính kháng khuẩn, khử mùi ẩm mốc và thanh lọc không khí giấc ngủ.",
    badge: "Kháng khuẩn than hoạt tính",
    image: "/images/products/hoat-tinh/01.webp",
    minPrice: 4900000,
    widths: [140, 160, 180],
  },
];

export function AboutFeaturedCollections({ products }: FeaturedCollectionsProps) {
  const reduceMotion = useReducedMotion();

  // Match existing database / catalog products or fallback to curated defaults
  const items: CuratedCardConfig[] = DEFAULT_FEATURED.map((def) => {
    const found = products.find(
      (p) => p.slug === def.slug || p.name.toLowerCase().includes(def.slug.replace("-", " "))
    );
    if (!found) return def;
    return {
      slug: found.slug,
      name: found.name,
      eyebrow: found.eyebrow || def.eyebrow,
      description: found.description || def.description,
      badge: def.badge,
      image: found.image || def.image,
      minPrice: found.minPrice ?? def.minPrice,
      widths: found.widths.length > 0 ? found.widths : def.widths,
    };
  });

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-10">
          <div>
            <span className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-3 block">
              BỘ SƯU TẬP NỔI BẬT
            </span>
            <h2 className="text-slate-900 font-bold tracking-tight text-3xl sm:text-4xl">
              Những dòng nệm được tin chọn nhiều nhất.
            </h2>
          </div>
          <Link
            href="/nem"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3A5F] hover:text-[#C89D66] transition-colors cursor-pointer"
          >
            Xem tất cả dòng nệm <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* 3 Mattress Cards Grid */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {items.map((card, idx) => {
            const priceText = card.minPrice
              ? `Từ ${formatVnd(card.minPrice)}`
              : "Liên hệ tư vấn";

            return (
              <motion.article
                key={card.slug}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#C89D66]/50 hover:shadow-xl"
              >
                {/* Image Container with 4:3 ratio and hover zoom */}
                <Link
                  href={`/nem/${card.slug}`}
                  aria-label={`Xem chi tiết ${card.name}`}
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-brand-surface cursor-pointer"
                >
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
                  />
                  {/* Visual Badge */}
                  <span className="absolute top-3.5 left-3.5 z-10 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                    {card.badge}
                  </span>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Eyebrow */}
                  <span className="text-[11px] font-bold tracking-[0.12em] text-[#C89D66] uppercase mb-1.5 block">
                    {card.eyebrow}
                  </span>

                  {/* Title: fixed height for up to 2 lines so all cards align */}
                  <div className="min-h-[3.5rem] flex items-start">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-2 transition-colors group-hover:text-[#1E3A5F]">
                      <Link href={`/nem/${card.slug}`} className="cursor-pointer">
                        {card.name}
                      </Link>
                    </h3>
                  </div>

                  {/* Description: fixed height for 2 lines so all cards align */}
                  <div className="mt-2.5 min-h-[2.75rem] flex items-start">
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom section: pushed to bottom with mt-auto, guarantees perfect horizontal alignment */}
                  <div className="mt-auto pt-4">
                    {/* Size & Stock Specs */}
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3.5">
                      <span className="truncate">
                        {card.widths.length > 0 ? `Khổ ${card.widths.join(" · ")} cm` : "Nhiều kích thước"}
                      </span>
                      <span className="text-emerald-700 shrink-0 font-medium">● Còn hàng</span>
                    </div>

                    {/* Price and Actionable Button */}
                    <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        {priceText}
                      </span>
                      <Link
                        href={`/nem/${card.slug}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl !bg-slate-900 bg-slate-900 hover:!bg-[#1E3A5F] hover:bg-[#1E3A5F] !text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
                        style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
                      >
                        <span className="!text-white font-semibold text-xs" style={{ color: "#ffffff" }}>
                          Xem chi tiết →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
