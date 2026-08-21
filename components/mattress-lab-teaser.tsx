"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Product } from "@/lib/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MattressLabTeaser({ product }: { product: Product }) {
  const scope = useRef<HTMLElement>(null); const [nearViewport, setNearViewport] = useState(false);
  useEffect(() => { const node = scope.current; if (!node) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNearViewport(true); observer.disconnect(); } }, { rootMargin: "350px" }); observer.observe(node); return () => observer.disconnect(); }, []);
  useGSAP(() => { const mm = gsap.matchMedia(); mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => { if (conditions?.reduceMotion) return; gsap.fromTo(".lab-copy", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, scrollTrigger: { trigger: scope.current, start: "top 75%", once: true } }); gsap.fromTo(".lab-poster", { yPercent: 3, scale: .98 }, { yPercent: 0, scale: 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: scope.current, start: "top 70%", scrub: 1 } }); }); return () => mm.revert(); }, { scope });
  const demo = product.isDemo;
  return <section id="mattress-lab" ref={scope} className="lab-section"><div className="lab-copy"><p className="eyebrow">MATTRESS LAB</p><h2>{demo ? <>3D DEMO<br />VIEWER<br />PREVIEW.</> : <>EXPLORE<br />THE<br />PRODUCT.</>}</h2><p>{demo ? "Mô hình 3D minh họa trực quan trải nghiệm cấu trúc các tầng đệm." : "Khám phá chi tiết cấu tạo các tầng đệm."}</p><Link href="/nem/luxury/lab" className="button button-dark">Khám phá Mattress Lab <span aria-hidden="true">→</span></Link></div><div className="lab-visual"><div className="lab-poster"><img src={product.posterUrl ?? product.media[0]?.url} alt={demo ? "Hình ảnh minh họa Mattress Lab" : "Poster Mattress Lab"} />{nearViewport && <span className="lab-badge">{demo ? "3D DEMO" : "3D READY"}</span>}</div><span className="lab-hint">↻ Drag to rotate</span></div></section>;
}
