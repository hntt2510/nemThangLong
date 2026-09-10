"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const spring = { stiffness: 260, damping: 20 };

function MagneticLink({ children, className }: { children: ReactNode; className: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  return <motion.div style={reduceMotion ? undefined : { x: useSpring(x, spring), y: useSpring(y, spring) }} whileHover={reduceMotion ? undefined : { y: -2, boxShadow: "0 10px 25px -5px rgba(30, 58, 95, 0.25)" }} whileTap={{ scale: 0.98 }} onPointerMove={(event) => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.08);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.08);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}>
    <Link href="#project-inquiry" className={className}>{children}</Link>
  </motion.div>;
}

function TiltCard({ children }: { children: ReactNode }) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-6, 6]), spring);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [6, -6]), spring);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${spotlightX}px ${spotlightY}px, rgba(255,255,255,0.18), transparent 80%)`;

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return <motion.div className="relative [perspective:1000px]" onPointerMove={(event) => {
    if (reduceMotion || window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
    spotlightX.set(event.clientX - rect.left);
    spotlightY.set(event.clientY - rect.top);
  }} onPointerLeave={reset}>
    <motion.div style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200/60 bg-brand-surface shadow-xl md:aspect-[16/9]">
      {children}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={reduceMotion ? undefined : { background: spotlight }} />
    </motion.div>
  </motion.div>;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function B2BHeroMotion() {
  const reduceMotion = useReducedMotion();

  return <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] gap-8 py-12 md:w-[min(calc(100%-64px),1280px)] lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-14 lg:py-[72px]">
    <motion.div className="max-w-2xl" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }} initial={reduceMotion ? false : "hidden"} animate={reduceMotion ? undefined : "visible"}>
      <motion.p variants={item} className="text-xs font-extrabold tracking-[0.15em] text-brand-accent">GIẢI PHÁP NỆM DỰ ÁN TOÀN DIỆN</motion.p>
      <motion.h1 variants={item} className="mt-5 text-balance font-brand-ui text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.06]">Nâng tầm trải nghiệm nghỉ dưỡng với chuẩn nệm khách sạn cao cấp.</motion.h1>
      <motion.p variants={item} className="mt-6 max-w-xl text-base leading-7 text-brand-copy">Cùng đề xuất cấu hình theo cường độ vận hành, trải nghiệm lưu trú và yêu cầu hồ sơ kỹ thuật của từng dự án.</motion.p>
      <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <MagneticLink className="b2b-primary-cta inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1E3A5F] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#152843] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]">Yêu cầu báo giá & hồ sơ năng lực <ArrowRight aria-hidden="true" className="ml-2 size-4 text-white" /></MagneticLink>
        <Link href="#project-inquiry" className="inline-flex min-h-11 items-center justify-center rounded-brand border border-brand-primary/30 px-5 py-3 text-sm font-bold text-brand-primary transition-colors duration-200 hover:border-brand-primary hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">Đăng ký nhận nệm mẫu</Link>
      </motion.div>
    </motion.div>
    <TiltCard>
      <Image src="/images/projects/hero-master-suite.jpg" alt="Không gian phòng nghỉ khách sạn trang bị nệm Thăng Long cao cấp" fill priority sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover" />
      <motion.span animate={reduceMotion ? undefined : { y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute left-4 top-4 rounded-lg border border-white/35 bg-slate-950/45 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">Chuẩn kháng cháy quốc tế BS 7177</motion.span>
      <motion.span animate={reduceMotion ? undefined : { y: [5, -5, 5] }} transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-4 right-4 rounded-lg border border-white/35 bg-slate-950/45 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">Lò xo túi 7 vùng công thái học</motion.span>
    </TiltCard>
  </div>;
}
