"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ShowroomLocator } from "@/components/showroom/showroom-locator";

interface AboutShowroomCTAProps {
  contactPhone?: string | null;
  contactHref?: string;
}

export function AboutShowroomCTA({ contactPhone }: AboutShowroomCTAProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
        {/* Showroom Visual Banner */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[260px] sm:h-[360px] lg:h-[420px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-brand-surface shadow-xl mb-12"
        >
          <Image
            src="/images/landing-showroom-v2.png"
            alt="Không gian trải nghiệm nệm thực tế tại hệ thống Showroom Nệm Thăng Long"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10">
            <span className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-2">
              HỆ THỐNG TRẢI NGHIỆM TRỰC TIẾP
            </span>
            <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight max-w-xl">
              Không gian thử nệm thư thái, không áp lực mua hàng.
            </p>
          </div>
        </motion.div>

        {/* Real 7 Showrooms Locator with Client-Side GPS & Directions */}
        <ShowroomLocator contactPhone={contactPhone} />
      </div>
    </section>
  );
}
