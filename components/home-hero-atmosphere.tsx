"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HomeHeroAtmosphereScene = dynamic(
  () => import("./home-hero-atmosphere-scene").then((module) => module.HomeHeroAtmosphereScene),
  { ssr: false },
);

export function HomeHeroAtmosphere() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncEligibility = () => setIsEligible(desktopQuery.matches && !motionQuery.matches);
    const syncDocumentVisibility = () => setIsDocumentVisible(!document.hidden);

    syncEligibility();
    syncDocumentVisibility();
    desktopQuery.addEventListener("change", syncEligibility);
    motionQuery.addEventListener("change", syncEligibility);
    document.addEventListener("visibilitychange", syncDocumentVisibility);

    return () => {
      desktopQuery.removeEventListener("change", syncEligibility);
      motionQuery.removeEventListener("change", syncEligibility);
      document.removeEventListener("visibilitychange", syncDocumentVisibility);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !isEligible) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(host);
    return () => observer.disconnect();
  }, [isEligible]);

  return (
    <div ref={hostRef} className="home-hero-atmosphere" aria-hidden="true">
      {isEligible && <HomeHeroAtmosphereScene active={isVisible && isDocumentVisible} />}
    </div>
  );
}
