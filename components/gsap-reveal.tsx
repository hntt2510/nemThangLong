"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function GsapReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      gsap.fromTo(scope.current, { autoAlpha: conditions?.reduceMotion ? 1 : 0, y: conditions?.reduceMotion ? 0 : 16 }, { autoAlpha: 1, y: 0, duration: conditions?.reduceMotion ? 0 : 0.7, delay: conditions?.reduceMotion ? 0 : delay, ease: "power2.out", scrollTrigger: { trigger: scope.current, start: "top 88%", once: true } });
    });
    return () => mm.revert();
  }, { scope });
  return <div ref={scope} className={className}>{children}</div>;
}
