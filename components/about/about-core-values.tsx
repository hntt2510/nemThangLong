"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, HeartHandshake, ShieldCheck } from "lucide-react";

const corePillars = [
  {
    icon: HeartHandshake,
    title: "Chất lượng từ tâm xưởng",
    body: "Bông ép nano kháng khuẩn, mủ cao su tự nhiên không mùi hắc. Từng lớp đệm được kiểm định khắt khe, an toàn tuyệt đối cho làn da nhạy cảm và hệ hô hấp của trẻ nhỏ.",
    badge: "Nguyên liệu tuyển chọn",
  },
  {
    icon: Activity,
    title: "Nâng đỡ công thái học",
    body: "Thiết kế phân bổ trọng lượng cơ thể người Việt, cân bằng độ phẳng tự nhiên nhằm bảo vệ đường cong sinh lý cột sống cho người lớn tuổi và hỗ trợ phát triển khung xương trẻ em.",
    badge: "Chuẩn cột sống Việt",
  },
  {
    icon: ShieldCheck,
    title: "Đồng hành trọn vòng đời",
    body: "Bảo hành 10 - 15 năm, chính sách đổi trả minh bạch và hỗ trợ giao tận phòng ngủ. Đội ngũ kỹ thuật sẵn sàng hỗ trợ chăm sóc, hướng dẫn bảo quản nệm định kỳ tại nhà.",
    badge: "Bảo hành đến 15 năm",
  },
];

export function AboutCoreValues() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
        {/* Header Section */}
        <div className="max-w-2xl">
          <span className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-3 block">
            GIÁ TRỊ CỐT LÕI
          </span>
          <h2 className="text-slate-900 font-bold tracking-tight text-3xl sm:text-4xl">
            Tâm huyết trong từng chi tiết giấc ngủ.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
            Mỗi chiếc nệm Thăng Long xuất xưởng là sự kết tinh giữa sự tận tụy của bàn tay người thợ lành nghề, công nghệ định hình công thái học và cam kết phục vụ dài hạn.
          </p>
        </div>

        {/* Interactive Hover Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.title}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-sm transition-all duration-300 hover:border-[#C89D66]/60 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-[#1E3A5F]/8 text-[#1E3A5F] transition-colors duration-300 group-hover:bg-[#1E3A5F] group-hover:text-white">
                      <Icon className="size-7" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider text-[#C89D66] bg-amber-50 border border-[#C89D66]/20 px-2.5 py-1 rounded-full uppercase">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight transition-colors group-hover:text-[#1E3A5F]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {pillar.body}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-400 group-hover:text-[#1E3A5F] transition-colors">
                  <span>Tiêu chuẩn Nệm Thăng Long</span>
                  <span className="ml-auto transition-transform group-hover:translate-x-1 duration-200">→</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
