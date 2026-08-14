"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Product } from "@/lib/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MattressLabTeaser({ product }: { product: Product }) {
  const scope = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = scope.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNearViewport(true); observer.disconnect(); } }, { rootMargin: "350px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      if (conditions?.reduceMotion) return;
      gsap.fromTo(".lab-copy", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, scrollTrigger: { trigger: scope.current, start: "top 75%", once: true } });
      gsap.fromTo(".lab-poster", { yPercent: 3, scale: .98 }, { yPercent: 0, scale: 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: scope.current, start: "top 70%", scrub: 1 } });
    });
    return () => mm.revert();
  }, { scope });

  return <section id="mattress-lab" ref={scope} className="lab-section">
    <div className="lab-copy"><p className="eyebrow">MATTRESS LAB</p><h2>ENGINEERED<br />FROM THE<br />INSIDE OUT.</h2><p>Không chỉ nhìn chiếc nệm. Khám phá cách từng lớp hoạt động cùng nhau.</p><Link href="/nem/luxury/lab" className="button button-dark">Khám phá cấu tạo <span aria-hidden="true">→</span></Link></div>
    <div className="lab-visual">
      <div className="lab-poster"><img src={product.posterUrl ?? product.media[0].url} alt="Minh họa nệm Luxury trong Mattress Lab" />{nearViewport && <span className="lab-badge">3D READY</span>}</div>
      <span className="lab-hint">↻ Drag to rotate</span>
    </div>
  </section>;
}
