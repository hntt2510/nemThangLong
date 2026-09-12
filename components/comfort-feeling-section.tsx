"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble } from "lucide-react";

export interface ComfortFeelingCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  firmnessScore: string;
  description: string;
  suggestedMattress: string;
  href: string;
  priceHint: string;
  image: string;
  imageAlt: string;
}

export const DEFAULT_COMFORT_CARDS: ComfortFeelingCard[] = [
  {
    id: "cao-su-thien-nhien",
    title: "Cao su thiên nhiên",
    subtitle: "Nâng đỡ vững chãi, chống đau lưng",
    badge: "Độ cứng 8/10 · Thích hợp người lớn tuổi & thoát vị đĩa đệm",
    firmnessScore: "8/10",
    description:
      "Chất liệu 75% cao su thiên nhiên đàn hồi dẻo dai, giữ cột sống thẳng tự nhiên suốt đêm dài và không lo xẹp lún.",
    suggestedMattress: "Nệm Thăng Long Cao Su Thiên Nhiên",
    href: "/nem/cao-su-thien-nhien",
    priceHint: "Từ 12.900.000 đ",
    image: "/images/homepage-natural-latex.webp",
    imageAlt: "Nệm cao su thiên nhiên Thăng Long nâng đỡ vững chãi cột sống",
  },
  {
    id: "memory-foam",
    title: "Bề mặt vải êm & Memory Foam",
    subtitle: "Êm ái, giảm áp lực vai gáy",
    badge: "Độ cứng 6/10 · Êm sâu, ngủ nghiêng thoải mái",
    firmnessScore: "6/10",
    description:
      "Lõi foam tỷ trọng cao kết hợp than hoạt tính ôm sát đường cong cơ thể, giải tỏa triệt để áp lực điểm tì đè khi nằm nghiêng.",
    suggestedMattress: "Nệm Thăng Long Memory Foam / Hoạt Tính",
    href: "/nem/memory-foam",
    priceHint: "Từ 8.900.000 đ",
    image: "/images/homepage-latex.webp",
    imageAlt: "Nệm bề mặt vải êm và memory foam giảm áp lực vai gáy",
  },
  {
    id: "khach-san",
    title: "Khách sạn & Không gian nghỉ ngơi",
    subtitle: "Tiêu chuẩn resort 5 sao",
    badge: "Độ cứng 7/10 · Đàn hồi cân bằng, chuẩn resort",
    firmnessScore: "7/10",
    description:
      "Lớp vỏ gấm dệt hoa văn sang trọng cùng độ nảy cân bằng hoàn hảo, mang đến trải nghiệm thư giãn đẳng cấp như tại khu nghỉ dưỡng.",
    suggestedMattress: "Nệm Thăng Long Luxury / Classic",
    href: "/nem/khach-san",
    priceHint: "Từ 6.290.000 đ",
    image: "/images/homepage-hotel.webp",
    imageAlt: "Nệm khách sạn và không gian nghỉ dưỡng sang trọng",
  },
];

export function ComfortFeelingSection({
  cards = DEFAULT_COMFORT_CARDS,
}: {
  cards?: ComfortFeelingCard[];
}) {
  const displayCards = cards && cards.length > 0 ? cards : DEFAULT_COMFORT_CARDS;

  return (
    <section className="w-full py-12 lg:py-20 bg-stone-50/40" id="shop-by-need">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C89D66] mb-3">
            GIẤC NGỦ VÀ SỰ THOẢI MÁI
          </p>
          <h2 className="font-brand-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Chọn theo cảm giác nằm bạn cần.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Mỗi người có thói quen và tình trạng cột sống riêng. Hãy chọn cảm giác nằm phù hợp để cơ thể được tái tạo năng lượng trọn vẹn mỗi đêm.
          </p>
        </div>

        {/* 3-Card Responsive Full-width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
          {displayCards.map((card) => (
            <article
              key={card.id}
              className="group flex flex-col w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 ease-out hover:border-slate-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Card Image Container (aspect-16/10 on mobile, aspect-4/3 on desktop) */}
              <Link
                href={card.href as never}
                className="relative block aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100"
                aria-label={`Xem chi tiết ${card.title}`}
              >
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Floating Firmness Badge on Image */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start pointer-events-none z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-md border border-amber-400/30">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>{card.badge}</span>
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                {/* Subtitle / Key Benefit */}
                <span className="text-xs font-bold uppercase tracking-wider text-[#C89D66]">
                  {card.subtitle}
                </span>

                {/* Title */}
                <h3 className="mt-2 font-brand-display text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-[#1E3A5F]">
                  <Link href={card.href as never}>
                    {card.title}
                  </Link>
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-slate-600 flex-1">
                  {card.description}
                </p>

                {/* Mattress Recommendation Pill Box */}
                <div className="mt-5 rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 transition-colors group-hover:border-amber-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <BedDouble className="size-4 text-amber-700 shrink-0" />
                    <span>Gợi ý dòng nệm phù hợp:</span>
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {card.suggestedMattress}
                  </p>
                </div>

                {/* Bottom Bar: Price Hint & Action CTA */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-400 font-medium">Giá trực tiếp xưởng</span>
                    <span className="font-brand-ui text-base sm:text-lg font-extrabold text-red-600">
                      {card.priceHint}
                    </span>
                  </div>

                  <Link
                    href={card.href as never}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A5F] group-hover:bg-[#152843] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
                  >
                    <span>Xem dòng nệm này</span>
                    <ArrowRight className="size-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
