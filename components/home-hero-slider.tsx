"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { HomeHero } from "@/lib/storefront-cms";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export function HomeHeroSlider({ hero }: { hero: HomeHero | null }) {
  const slides = useMemo<Slide[]>(() => [
    {
      eyebrow: hero?.eyebrow ?? "NỆM THĂNG LONG",
      title: hero?.title ?? "Giấc ngủ tốt hơn\nCuộc sống trọn vẹn hơn",
      body: hero?.body ?? "Hơn 20 năm đồng hành cùng giấc ngủ của người Việt, mang đến những sản phẩm êm chất lượng, an toàn và bền bỉ.",
      imageUrl: hero?.imageUrl ?? "/images/homepage-hero.webp",
      imageAlt: hero?.imageAlt ?? "Nệm Thăng Long trong phòng ngủ ấm áp",
      primary: hero?.primaryCta ?? { label: "Khám phá sản phẩm", href: "/nem" },
      secondary: hero?.secondaryCta ?? { label: "Tư vấn ngay", href: "/lien-he" },
    },
    {
      eyebrow: "ÊM ÁI MỖI ĐÊM",
      title: "Nâng niu cơ thể\ntrong từng giấc ngủ",
      body: "Cảm giác êm dịu, nâng đỡ vừa vặn để cơ thể được nghỉ ngơi trọn vẹn sau một ngày dài.",
      imageUrl: "/images/homepage-memory-foam.webp",
      imageAlt: "Nệm Memory Foam Thăng Long",
      primary: { label: "Khám phá Memory Foam", href: "/nem/memory-foam" },
      secondary: { label: "Tìm nệm phù hợp", href: "/tim-nem" },
    },
    {
      eyebrow: "CHẤT LIỆU TỰ NHIÊN",
      title: "Nâng đỡ cân bằng\ncho mọi gia đình",
      body: "Các dòng nệm được tuyển chọn theo nhu cầu nghỉ ngơi, chất liệu và không gian sống của gia đình Việt.",
      imageUrl: "/images/homepage-latex.webp",
      imageAlt: "Nệm cao su thiên nhiên Thăng Long",
      primary: { label: "Xem bộ sưu tập", href: "/nem" },
      secondary: { label: "Tư vấn ngay", href: "/lien-he" },
    },
  ], [hero]);
  const [active, setActive] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (manualPaused || interactionPaused || reduceMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [interactionPaused, manualPaused, reduceMotion, slides.length]);

  useGSAP(() => {
    if (reduceMotion || !scope.current) return;
    const images = scope.current.querySelectorAll<HTMLElement>(".landing-hero-image");
    const copy = scope.current.querySelectorAll<HTMLElement>(".landing-hero-copy > *");
    gsap.set(images, { autoAlpha: 0 });
    gsap.set(images[active], { autoAlpha: 1 });
    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    timeline.fromTo(images[active], { autoAlpha: 0, scale: 1.015 }, { autoAlpha: 1, scale: 1, duration: .7, overwrite: "auto" }, 0)
      .fromTo(copy, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .08, clearProps: "visibility,opacity,transform" }, .12);
  }, { scope, dependencies: [active, reduceMotion], revertOnUpdate: true });

  const slide = slides[active];

  return (
    <section ref={scope} className="landing-hero" aria-roledescription="carousel" aria-label="Giới thiệu Thăng Long" onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)} onFocusCapture={() => setInteractionPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false); }}>
      <div className="landing-hero-grid">
        <div className="landing-hero-copy">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1>{slide.title.split("\n").map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}</h1>
          <p className="home-hero-lede">{slide.body}</p>
          <div className="home-hero-actions">
            <Link href={slide.primary.href as never} className="button button-primary">{slide.primary.label} <span aria-hidden="true">→</span></Link>
            <Link href={slide.secondary.href as never} className="button button-secondary">{slide.secondary.label}</Link>
          </div>
        </div>
        <div className="landing-hero-media">
          {slides.map((item, index) => <div key={item.imageUrl} className="landing-hero-image" aria-hidden={index !== active}><Image src={item.imageUrl} alt={index === active ? item.imageAlt : ""} fill priority={index === 0} sizes="(max-width: 860px) 100vw, 58vw" /></div>)}
        </div>
        <div className="landing-hero-slider-controls">
          <div className="landing-hero-dots" aria-label="Chọn slide">
            {slides.map((item, index) => <button key={item.imageUrl} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Slide ${index + 1}`} aria-current={index === active} />)}
          </div>
          <button type="button" onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Slide trước">Trước</button>
          <button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Slide sau">Sau</button>
          <button type="button" onClick={() => setManualPaused((paused) => !paused)} aria-pressed={manualPaused}>{manualPaused ? "Tiếp tục" : "Tạm dừng"}</button>
        </div>
      </div>
    </section>
  );
}
