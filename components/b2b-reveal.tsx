"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function B2BReveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return <motion.div initial={reduceMotion ? false : { opacity: 0, y: 30 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}
