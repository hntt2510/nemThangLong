"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const craftsmanshipHighlights = [
  "Cấu trúc đa tầng thoáng khí giúp giải nhiệt lưng hiệu quả trong khí hậu nhiệt đới ẩm.",
  "Bông ép nano kháng khuẩn công nghệ nhiệt kép, định hình phẳng vững chãi, không xẹp lún.",
  "Mủ cao su tự nhiên khử mùi triệt để, kháng khuẩn và nấm mốc tự nhiên, an toàn cho làn da.",
  "Vải bọc gấm chần bông cao cấp mềm mại, tăng cường khả năng nâng đỡ êm ái.",
];

export function AboutCraftStory() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-brand-surface/40 py-12 lg:py-20 border-y border-slate-200/60">
      <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] grid-cols-1 items-center gap-10 md:w-[min(calc(100%-64px),1280px)] lg:grid-cols-[50fr_50fr] lg:gap-14">
        {/* Visual Media: Layer structure / Craftsmanship */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          <Image
            src="/images/homepage-construction.png"
            alt="Mặt cắt cấu trúc kỹ thuật bóc tách đa tầng nệm Thăng Long"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-4 left-4 rounded-lg bg-slate-900/80 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white">
            Bóc tách kết cấu chuẩn công thái học
          </div>
        </motion.div>

        {/* Story Copy */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          <span className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-3 block">
            TÂM HUYẾT NGHỀ NỆM
          </span>

          <h2 className="text-slate-900 font-bold tracking-tight text-3xl sm:text-4xl">
            Bền bỉ từ kết cấu, nâng niu từng giấc say.
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
            Chúng tôi không sản xuất những chiếc nệm hào nhoáng nhất thời. Tại Thăng Long, mỗi sản phẩm được đúc kết từ hàng chục năm nghiên cứu thói quen nằm ngủ, cấu trúc xương và khí hậu vùng miền của người tiêu dùng Việt.
          </p>

          <ul className="mt-6 space-y-3.5">
            {craftsmanshipHighlights.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="size-5 shrink-0 text-[#C89D66] mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base text-slate-700 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/tim-nem"
              className="inline-flex items-center justify-center !bg-[#1E3A5F] bg-[#1E3A5F] hover:bg-[#152843] px-6 py-3 rounded-xl shadow-sm transition-all cursor-pointer !text-white font-semibold text-sm"
              style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
            >
              <span className="!text-white font-semibold text-sm" style={{ color: "#ffffff" }}>
                Chọn cấu hình nệm phù hợp →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
