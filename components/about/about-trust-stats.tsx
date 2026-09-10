"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface StatItem {
  target: number;
  decimals?: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { target: 20, suffix: "+", label: "Năm đồng hành cùng giấc ngủ Việt" },
  { target: 1, suffix: "M+", label: "Gia đình tin dùng sản phẩm Thăng Long" },
  { target: 100, suffix: "+", label: "Điểm tư vấn & đại lý trên toàn quốc" },
  { target: 4.9, decimals: 1, suffix: "/5", label: "Mức đánh giá hài lòng từ khách hàng" },
];

function AnimatedNumber({
  target,
  decimals = 0,
  suffix = "",
}: {
  target: number;
  decimals?: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState<string>(
    decimals > 0 ? (0).toFixed(decimals) : "0"
  );
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(decimals > 0 ? target.toFixed(decimals) : target.toString());
      return;
    }
    if (!inView) return;

    let startTime: number | null = null;
    const duration = 1600; // ms
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out expo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easedProgress * target;

      setDisplayValue(decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString());

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(decimals > 0 ? target.toFixed(decimals) : target.toString());
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inView, target, decimals, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
}

export function AboutTrustStats() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
        <div className="bg-gradient-to-b from-slate-900 to-[#16273e] text-white py-12 px-6 sm:px-10 rounded-2xl shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {stats.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col items-center sm:items-start text-center sm:text-left ${
                  idx > 0 ? "pt-6 sm:pt-0 sm:pl-6 lg:pl-8" : ""
                }`}
              >
                <div className="text-3xl md:text-5xl font-extrabold text-[#D4A373] mb-2 tracking-tight">
                  <AnimatedNumber target={item.target} decimals={item.decimals} suffix={item.suffix} />
                </div>
                <p className="text-slate-300 text-xs md:text-sm font-normal leading-relaxed max-w-[22ch]">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
