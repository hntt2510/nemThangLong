"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

gsap.registerPlugin(useGSAP);

export type LandingCarouselReview = {
  authorName: string;
  body: string;
  rating: number;
  productName: string;
  detail?: string;
};

const desktopVisibleCount = 4;

export function LandingReviewsCarousel({ reviews }: { reviews: LandingCarouselReview[] }) {
  const isLooping = reviews.length > desktopVisibleCount;
  const scope = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const activeIndex = useRef(isLooping ? desktopVisibleCount : 0);
  const paused = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const dragDistance = useRef(0);

  const loopedReviews = isLooping
    ? [...reviews.slice(-desktopVisibleCount), ...reviews, ...reviews.slice(0, desktopVisibleCount)]
    : reviews;

  const step = () => {
    const firstCard = track.current?.querySelector<HTMLElement>("[data-review-card]");
    if (!firstCard || !track.current) return 0;
    const gap = Number.parseFloat(window.getComputedStyle(track.current).columnGap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const setTrackPosition = (index = activeIndex.current, offset = 0) => {
    if (!isLooping) {
      if (track.current) gsap.set(track.current, { x: offset });
      return;
    }
    const distance = step();
    if (!distance || !track.current) return;
    gsap.set(track.current, { x: -(index * distance) + offset });
  };

  const move = (direction: 1 | -1) => {
    if (reviews.length <= desktopVisibleCount || !track.current) return;
    const distance = step();
    if (!distance) return;
    const nextIndex = activeIndex.current + direction;
    gsap.killTweensOf(track.current);
    gsap.to(track.current, {
      x: -(nextIndex * distance),
      duration: 0.55,
      ease: "power3.inOut",
      overwrite: "auto",
      onComplete: () => {
        if (nextIndex >= reviews.length + desktopVisibleCount) {
          activeIndex.current = desktopVisibleCount;
          setTrackPosition();
          return;
        }
        if (nextIndex < desktopVisibleCount) {
          activeIndex.current = reviews.length + desktopVisibleCount - 1;
          setTrackPosition();
          return;
        }
        activeIndex.current = nextIndex;
      },
    });
  };

  useGSAP(
    (_, contextSafe) => {
      const syncPosition = contextSafe ? contextSafe(() => setTrackPosition()) : () => setTrackPosition();
      const advance = contextSafe
        ? contextSafe(() => {
            if (!paused.current) move(1);
          })
        : () => {
            if (!paused.current) move(1);
          };
      const mm = gsap.matchMedia();
      let timer: number | undefined;

      syncPosition();
      window.addEventListener("resize", syncPosition);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        timer = window.setInterval(advance, 5000);
      });

      return () => {
        if (timer) window.clearInterval(timer);
        window.removeEventListener("resize", syncPosition);
        mm.revert();
      };
    },
    { scope, dependencies: [reviews.length] },
  );

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (reviews.length <= desktopVisibleCount) return;
    paused.current = true;
    pointerStartX.current = event.clientX;
    dragDistance.current = 0;
    gsap.killTweensOf(track.current);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const drag = (event: React.PointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null) return;
    dragDistance.current = Math.max(-180, Math.min(180, event.clientX - pointerStartX.current));
    setTrackPosition(activeIndex.current, dragDistance.current);
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null) return;
    pointerStartX.current = null;
    paused.current = false;
    const distance = dragDistance.current;
    dragDistance.current = 0;
    if (Math.abs(distance) >= 44 && isLooping) {
      move(distance < 0 ? 1 : -1);
      return;
    }
    if (track.current) {
      const targetX = isLooping ? -(activeIndex.current * step()) : 0;
      gsap.to(track.current, { x: targetX, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section
      ref={scope}
      className="landing-reviews-carousel"
      aria-roledescription="carousel"
      aria-label="Phản hồi khách hàng"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={() => { paused.current = false; }}
    >
      <div className="overflow-hidden" onPointerDown={startDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={() => { pointerStartX.current = null; dragDistance.current = 0; paused.current = false; setTrackPosition(); }}>
        <div ref={track} className="grid w-max auto-cols-[calc((min(1280px,100vw-40px)-48px)/4)] grid-flow-col gap-4 touch-pan-y select-none md:auto-cols-[calc((min(1280px,100vw-64px)-72px)/4)] md:gap-6 max-md:auto-cols-[calc((min(100vw-40px,1280px)-16px)/2)] max-sm:auto-cols-[85vw]">
          {loopedReviews.map((review, index) => {
            const isClone = reviews.length > desktopVisibleCount && (index < desktopVisibleCount || index >= reviews.length + desktopVisibleCount);
            return (
              <article key={`${review.authorName}-${review.body}-${index}`} data-review-card aria-hidden={isClone || undefined} className="landing-review-card min-w-0">
                <div>
                  <span className="landing-review-stars" aria-label={`${review.rating} trên 5`}>{"★".repeat(review.rating)}</span>
                  <p>“{review.body}”</p>
                </div>
                <footer>
                  <div>
                    <b>{review.authorName}</b>
                    {review.detail ? <span>{review.detail}</span> : null}
                  </div>
                  <span>{review.productName}</span>
                </footer>
              </article>
            );
          })}
        </div>
      </div>

      {reviews.length > desktopVisibleCount ? (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={() => move(-1)} className="inline-flex size-11 items-center justify-center rounded-full border border-brand-primary/20 text-brand-primary transition-colors duration-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white" aria-label="Xem phản hồi trước">
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button type="button" onClick={() => move(1)} className="inline-flex size-11 items-center justify-center rounded-full border border-brand-primary/20 text-brand-primary transition-colors duration-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white" aria-label="Xem phản hồi tiếp theo">
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
