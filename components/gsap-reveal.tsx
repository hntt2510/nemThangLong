"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export type GsapRevealVariant = "fade-up" | "stagger" | "hero" | "editorial";

export function GsapReveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
  staggerSelector,
  parallax = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: GsapRevealVariant;
  staggerSelector?: string;
  parallax?: boolean;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = scope.current;
      if (!container) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
        },
        ({ conditions }) => {
          if (conditions?.reduceMotion) {
            gsap.set(container, { clearProps: "all" });
            return;
          }

          const ease = "power2.out";

          if (variant === "hero") {
            const copyElements = container.querySelectorAll(".home-hero-copy > *");
            const mediaElement = container.querySelector(".home-hero-media");

            const tl = gsap.timeline({ delay });

            if (copyElements.length > 0) {
              tl.from(
                copyElements,
                {
                  opacity: 0.2,
                  y: 16,
                  duration: 0.65,
                  stagger: 0.05,
                  ease,
                  clearProps: "opacity,transform",
                },
                0,
              );
            }

            if (mediaElement) {
              tl.from(
                mediaElement,
                {
                  opacity: 0.4,
                  scale: 1.02,
                  duration: 0.8,
                  ease,
                  clearProps: "opacity,transform",
                },
                0.1,
              );

              if (conditions?.isDesktop && parallax) {
                gsap.to(mediaElement.querySelector("img"), {
                  y: 18,
                  ease: "none",
                  scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1,
                  },
                });
              }
            }
            return;
          }

          if (variant === "editorial") {
            const textSide = container.querySelector(
              ".home-luxury-copy, .home-latex-copy, .home-project-copy, .editorial-copy",
            );
            const mediaSide = container.querySelector(
              ".home-luxury-media, .home-latex-media, .home-project-media, .editorial-image",
            );

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: container,
                start: "top 92%",
                once: true,
              },
              delay,
            });

            if (textSide) {
              tl.from(
                textSide,
                {
                  opacity: 0.2,
                  y: 16,
                  duration: 0.65,
                  ease,
                  clearProps: "opacity,transform",
                },
                0,
              );
            }

            if (mediaSide) {
              tl.from(
                mediaSide,
                {
                  opacity: 0.4,
                  scale: 1.02,
                  duration: 0.75,
                  ease,
                  clearProps: "opacity,transform",
                },
                0.08,
              );

              if (conditions?.isDesktop && parallax) {
                gsap.to(mediaSide.querySelector("img"), {
                  y: 16,
                  ease: "none",
                  scrollTrigger: {
                    trigger: container,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                  },
                });
              }
            }
            return;
          }

          if (variant === "stagger") {
            const targets = staggerSelector
              ? container.querySelectorAll(staggerSelector)
              : container.children;

            if (targets.length > 0) {
              gsap.from(
                targets,
                {
                  opacity: 0.2,
                  y: 16,
                  duration: 0.6,
                  stagger: 0.05,
                  ease,
                  clearProps: "opacity,transform",
                  scrollTrigger: {
                    trigger: container,
                    start: "top 95%",
                    once: true,
                  },
                },
              );
              return;
            }
          }

          // Default fade-up
          gsap.from(
            container,
            {
              opacity: 0.2,
              y: 16,
              duration: 0.65,
              delay,
              ease,
              clearProps: "opacity,transform",
              scrollTrigger: {
                trigger: container,
                start: "top 95%",
                once: true,
              },
            },
          );
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
