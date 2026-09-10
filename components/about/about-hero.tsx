"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

const springConfig = { stiffness: 260, damping: 20 };

function Hero3DTiltCard({ children }: { children: React.ReactNode }) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const reduceMotion = useReducedMotion();

  // Max 5 deg tilt as specified in requirements
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-5, 5]), springConfig);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [5, -5]), springConfig);

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      className="relative w-full [perspective:1000px]"
      onPointerMove={(event) => {
        if (reduceMotion || (typeof window !== "undefined" && (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches))) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width);
        pointerY.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={reset}
    >
      <motion.div
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-brand-surface shadow-2xl transition-shadow duration-300 hover:shadow-3xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function AboutHero() {
  const reduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
  };

  return (
    <section className="relative overflow-hidden py-10 lg:py-16">
      <div className="mx-auto grid w-[min(calc(100%-40px),1280px)] grid-cols-1 items-center gap-10 md:w-[min(calc(100%-64px),1280px)] lg:grid-cols-[52fr_48fr] lg:gap-14">
        {/* Left Column: Value Proposition & Typography */}
        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          className="flex flex-col justify-center"
        >
          <motion.span variants={itemVariants} className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-3 block">
            VỀ THĂNG LONG
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-slate-900 font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl lg:leading-[1.12]"
          >
            Đồng hành cùng hàng triệu giấc ngủ gia đình Việt suốt 20 năm.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-xl text-slate-600 leading-relaxed text-base sm:text-lg font-normal"
          >
            Khởi đầu từ tâm huyết của những người thợ lành nghề, Nệm Thăng Long mang đến giải pháp giấc ngủ êm ái, nâng đỡ cột sống tự nhiên và an toàn tuyệt đối cho sức khỏe của mọi thế hệ với mức chi phí hợp lý nhất.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/tim-nem"
              className="inline-flex items-center justify-center !bg-[#1E3A5F] bg-[#1E3A5F] hover:bg-[#152843] px-7 py-3.5 rounded-xl shadow-md transition-all cursor-pointer !text-white font-semibold text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
              style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
            >
              <span className="!text-white font-semibold text-sm" style={{ color: "#ffffff" }}>
                Tìm nệm cho gia đình bạn →
              </span>
            </Link>
            <Link
              href="/nem"
              className="inline-flex items-center justify-center border border-slate-300 hover:border-slate-400 !bg-white bg-white hover:bg-slate-50 px-6 py-3.5 rounded-xl shadow-sm transition-all cursor-pointer !text-slate-800 font-semibold text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              style={{ backgroundColor: "#ffffff", color: "#1e293b" }}
            >
              <span className="!text-slate-800 font-semibold text-sm" style={{ color: "#1e293b" }}>
                Khám phá bộ sưu tập
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column: 3D Tilt Card & Floating Tag */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Hero3DTiltCard>
            <Image
              src="/images/benefit-family-comfort.png"
              alt="Không gian phòng ngủ gia đình đầm ấm cùng nệm Thăng Long"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Ambient vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

            {/* Floating Tag */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [-3, 3, -3] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg text-slate-800 text-xs font-semibold border border-white/60 select-none pointer-events-none flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>100% Nguyên liệu an toàn</span>
            </motion.div>
          </Hero3DTiltCard>
        </motion.div>
      </div>
    </section>
  );
}
