"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";

const testimonials = [
  {
    name: "Chị Thanh Hà",
    location: "Quận 7, TP. Hồ Chí Minh",
    quote: "Được nhân viên Thăng Long tư vấn rất kỹ về độ cứng mềm trước khi chọn, nên nệm vừa khít với khung giường và cảm giác nằm của cả hai vợ chồng đều rất ưng ý. Sáng dậy không bị ê mỏi thắt lưng.",
    product: "Nệm Thăng Long Classic",
  },
  {
    name: "Anh Minh Quân",
    location: "Hải Châu, Đà Nẵng",
    quote: "Thông tin tư vấn rõ ràng, giao hàng đúng hẹn và hỗ trợ khiêng lên tận lầu 2. Nhà có bé nhỏ hay nhảy nhót mà nệm cao su đàn hồi êm ru, không rung lắc ảnh hưởng giấc ngủ của người bên cạnh.",
    product: "Cao su thiên nhiên 3/4",
  },
  {
    name: "Chị Bích Ngọc",
    location: "Biên Hòa, Đồng Nai",
    quote: "Nhân viên hỗ trợ nhiệt tình, hướng dẫn chu đáo cách xoay nệm và bảo quản định kỳ. Nệm hoạt tính khử mùi ẩm mốc cực tốt trong mùa mưa, cả nhà tôi rất yên tâm khi sử dụng.",
    product: "Thăng Long Hoạt Tính",
  },
];

export function AboutTestimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-brand-surface/30 py-12 lg:py-20 border-t border-slate-200/60">
      <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
        <div className="max-w-2xl mb-10">
          <span className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-3 block">
            NIỀM TIN TỪ TRẢI NGHIỆM
          </span>
          <h2 className="text-slate-900 font-bold tracking-tight text-3xl sm:text-4xl">
            Lắng nghe chia sẻ từ các gia đình.
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed text-base">
            Hơn 1 triệu gia đình Việt đã gửi gắm giấc ngủ trọn vẹn cùng Nệm Thăng Long.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <motion.article
              key={item.name}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm transition-all hover:shadow-md hover:border-[#C89D66]/40"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4" aria-label="Đánh giá 5 sao">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-semibold text-slate-500">5.0</span>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                  “{item.quote}”
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {item.name}
                    <CheckCircle className="size-3.5 text-emerald-600" aria-label="Đã mua hàng thực tế" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                </div>
                <span className="text-[11px] font-medium text-[#C89D66] bg-amber-50 px-2 py-1 rounded">
                  {item.product}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
