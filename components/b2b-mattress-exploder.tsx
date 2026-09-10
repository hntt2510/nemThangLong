"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const layers = [
  { title: "Áo nệm gấm chần xốp", body: "Kháng cháy chậm, sợi dệt tencel mát dịu, hỗ trợ thêu logo thương hiệu riêng.", position: "top-[15%]", hotspot: "left-[72%] top-[20%]", tone: "bg-[#f5efe6]/85" },
  { title: "Foam hoạt tính giảm áp lực", body: "Phân bổ đều trọng lượng, hỗ trợ giảm áp lực tại các điểm tỳ đè.", position: "top-[31%]", hotspot: "left-[76%] top-[38%]", tone: "bg-[#eee2c8]/85" },
  { title: "Hệ thống lò xo túi độc lập", body: "Thép tôi luyện nhiệt cao tần, hạn chế truyền rung động khi trở mình.", position: "top-[53%]", hotspot: "left-[68%] top-[62%]", tone: "bg-[#d9dce0]/85" },
  { title: "Khung trợ lực PU bọc viền", body: "Tăng diện tích sử dụng và hỗ trợ ổn định khi ngồi ở mép giường.", position: "top-[74%]", hotspot: "left-[62%] top-[78%]", tone: "bg-[#d9c8ad]/85" },
] as const;

export function B2BMattressExploder() {
  const [activeLayer, setActiveLayer] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = layers[activeLayer];

  return <section className="bg-white">
    <div className="mx-auto w-[min(calc(100%-40px),1280px)] py-12 md:w-[min(calc(100%-64px),1280px)] md:py-[72px]">
      <div className="max-w-2xl"><p className="text-xs font-extrabold tracking-[0.15em] text-brand-accent">CẤU TẠO TƯƠNG TÁC</p><h2 className="mt-4 text-balance font-brand-ui text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Khám phá từng lớp nệm dành cho vận hành lưu trú.</h2></div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:gap-16">
        <LayoutGroup>
          <div className="hidden space-y-2 md:block" role="tablist" aria-label="Các lớp cấu tạo nệm">
            {layers.map((layer, index) => <button key={layer.title} role="tab" aria-selected={activeLayer === index} onMouseEnter={() => setActiveLayer(index)} onClick={() => setActiveLayer(index)} className="relative flex w-full items-start gap-4 overflow-hidden rounded-xl px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              {activeLayer === index ? <motion.span layoutId="active-layer-pill" className="absolute inset-0 bg-brand-primary" transition={{ type: "spring", stiffness: 300, damping: 28 }} /> : null}
              <span className={`relative mt-0.5 text-sm font-extrabold ${activeLayer === index ? "text-brand-accent" : "text-brand-copy"}`}>0{index + 1}</span><span className={`relative text-sm font-bold leading-6 ${activeLayer === index ? "text-white" : "text-brand-ink"}`}>{layer.title}</span>
            </button>)}
          </div>
        </LayoutGroup>

        <div className="hidden md:block">
          <div className="relative aspect-[16/10] [perspective:1000px]">
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-brand-surface shadow-xl"><Image src="/images/projects/mattress-cutaway-clean.png" alt="Mô phỏng cấu tạo nệm Thăng Long với các lớp vật liệu" fill sizes="(max-width: 1023px) 100vw, 58vw" className="object-cover" /></div>
            {layers.map((layer, index) => <motion.button key={layer.title} type="button" aria-label={`Xem ${layer.title}`} onClick={() => setActiveLayer(index)} className={`absolute left-[10%] right-[10%] h-[11%] rounded-lg border border-white/65 ${layer.tone} ${layer.position}`} animate={reduceMotion ? undefined : { y: activeLayer === index ? -10 : 0, scale: activeLayer === index ? 1.02 : 1, opacity: activeLayer === index ? 1 : 0.45 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} />)}
            {layers.map((layer, index) => <button key={`${layer.title}-hotspot`} type="button" aria-label={`Chọn ${layer.title}`} onClick={() => setActiveLayer(index)} className={`absolute ${layer.hotspot} z-10 flex size-6 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}><span aria-hidden="true" className="absolute inline-flex size-6 animate-ping rounded-full bg-[#1E3A5F] opacity-40" /><span aria-hidden="true" className="relative inline-flex size-3.5 rounded-full border-2 border-white bg-[#1E3A5F] shadow-md" /></button>)}
            <AnimatePresence mode="wait"><motion.div key={active.title} initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.22 }} className="absolute bottom-4 left-4 z-20 max-w-[70%] rounded-xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"><p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#C89D66]">LỚP 0{activeLayer + 1}</p><h3 className="mb-1.5 block text-base font-semibold text-white">{active.title}</h3><p className="text-xs leading-relaxed text-slate-200">{active.body}</p></motion.div></AnimatePresence>
          </div>
        </div>

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 md:hidden" aria-label="Vuốt để xem từng lớp cấu tạo nệm">
          {layers.map((layer, index) => <button key={layer.title} type="button" onClick={() => setActiveLayer(index)} className={`w-[82vw] shrink-0 snap-center overflow-hidden rounded-2xl border p-5 text-left ${activeLayer === index ? "border-brand-primary bg-brand-primary text-white" : "border-slate-200 bg-brand-surface text-brand-ink"}`}><span className={`text-xs font-extrabold tracking-[0.12em] ${activeLayer === index ? "text-brand-accent" : "text-brand-copy"}`}>LỚP 0{index + 1}</span><h3 className="mt-3 text-lg font-extrabold">{layer.title}</h3><p className={`mt-3 text-sm leading-6 ${activeLayer === index ? "text-white/80" : "text-brand-copy"}`}>{layer.body}</p></button>)}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2 md:hidden" aria-hidden="true">{layers.map((layer, index) => <span key={layer.title} className={`h-1.5 rounded-full transition-all ${activeLayer === index ? "w-6 bg-brand-primary" : "w-1.5 bg-brand-primary/20"}`} />)}</div>
    </div>
  </section>;
}
