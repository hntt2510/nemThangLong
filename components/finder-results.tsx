"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { GsapReveal } from "@/components/gsap-reveal";
import { ProductCard } from "@/components/product-card";
import { formatVnd } from "@/lib/format";
import type { FinderCandidate, FinderResults } from "@/lib/finder";

function variantText(candidate: FinderCandidate) {
  return candidate.variants.length
    ? candidate.variants.map((variant) => String(variant.width) + "×" + String(variant.length) + "×" + String(variant.thickness) + " cm").join(" · ")
    : "Thông tin biến thể đang được cập nhật";
}

function compactVariantSummary(candidate: FinderCandidate) {
  const groups = new Map<string, number[]>();

  for (const variant of candidate.variants) {
    const key = `${variant.width} × ${variant.length} cm`;
    groups.set(key, [...(groups.get(key) ?? []), variant.thickness]);
  }

  return [...groups.entries()].slice(0, 2).map(([size, thicknesses]) => {
    const uniqueThicknesses = [...new Set(thicknesses)].sort((a, b) => a - b);
    return `${size} · ${uniqueThicknesses.join("/")} cm`;
  });
}

function PrimaryRecommendationCard({ candidate }: { candidate: FinderCandidate }) {
  const p = candidate.product;
  const pricedVariants = candidate.variants.map((v) => v.price).filter((price): price is number => typeof price === "number" && price > 0);
  const minPrice = pricedVariants.length > 0 ? Math.min(...pricedVariants) : p.minPrice;
  const priceDisplay = minPrice ? "Từ " + formatVnd(minPrice) : "Liên hệ tư vấn";

  return (
    <article className="finder-result finder-result-primary finder-primary-card">
      <div className="finder-primary-media">
        <Link href={("/nem/" + p.slug) as never} aria-label={"Xem " + p.name}>
          <Image
            src={p.image}
            alt={p.imageAlt}
            fill
            sizes="(max-width: 860px) 100vw, 45vw"
            style={{ objectFit: "cover" }}
          />
          {p.imageIsDemo && <span className="demo-badge">Ảnh minh họa</span>}
        </Link>
      </div>
      <div className="finder-primary-content">
        <div className="finder-primary-header">
          <p className="eyebrow finder-primary-eyebrow">GỢI Ý CHÍNH DỰA TRÊN DỮ LIỆU ĐÃ BIẾT</p>
          <h3 className="finder-primary-title">
            <Link href={("/nem/" + p.slug) as never}>{p.name}</Link>
          </h3>
          <p className="finder-primary-desc">{p.description}</p>
        </div>

        <div className="finder-primary-variants">
          <span className="finder-variant-label">Tổ hợp phù hợp:</span>
          <span className="finder-variant-value">{variantText(candidate)}</span>
        </div>

        {candidate.reasons.length > 0 && (
          <div className="finder-primary-reasons">
            <p className="finder-reasons-title">Vì sao phù hợp với bạn:</p>
            <ul className="finder-reasons-list">
              {candidate.reasons.map((reason) => (
                <li key={reason}>
                  <span className="reason-bullet">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.missingData.length > 0 && (
          <p className="muted finder-missing-note">Chưa công bố: {candidate.missingData.join(", ")}.</p>
        )}

        <div className="finder-primary-footer">
          <div className="finder-primary-price">
            <span className="price-label">Giá dự kiến:</span>
            <strong>{priceDisplay}</strong>
          </div>
          <div className="finder-primary-actions">
            <Link href={("/nem/" + p.slug) as never} className="button button-primary finder-primary-btn">
              Xem sản phẩm <span aria-hidden="true">→</span>
            </Link>
            <Link href={("/so-sanh?items=" + encodeURIComponent(p.slug)) as never} className="button button-secondary finder-compare-btn">
              So sánh <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function AlternativeCandidateCard({ candidate }: { candidate: FinderCandidate }) {
  const previewSizes = compactVariantSummary(candidate);
  const remainingGroups = Math.max(0, new Set(candidate.variants.map((variant) => `${variant.width}-${variant.length}`)).size - previewSizes.length);

  return (
    <article className="finder-result overflow-hidden rounded-2xl border border-brand-primary/12 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)]">
      <ProductCard product={candidate.product} className="rounded-none border-0" />
      <div className="border-t border-brand-ink/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-extrabold tracking-[0.12em] text-brand-accent">PHÙ HỢP VỚI LỰA CHỌN</p>
          {candidate.variants.length > 0 ? (
            <span className="shrink-0 rounded-full bg-brand-surface px-2.5 py-1 text-xs font-bold text-brand-primary">
              {candidate.variants.length} tổ hợp
            </span>
          ) : null}
        </div>

        {previewSizes.length > 0 ? (
          <p className="mt-3 text-sm leading-6 text-brand-copy">
            {previewSizes.join(" · ")}
            {remainingGroups > 0 ? ` · +${remainingGroups} kích thước` : ""}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-brand-copy">Biến thể và giá đang được cập nhật.</p>
        )}

        {candidate.reasons.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm leading-5 text-brand-copy">
            {candidate.reasons.slice(0, 2).map((reason) => (
              <li key={reason} className="flex gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-accent" strokeWidth={2} />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {candidate.variants.length > 0 ? (
          <details className="group mt-4 border-t border-brand-ink/10 pt-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-brand-primary marker:hidden">
              Xem các tổ hợp phù hợp
              <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Các tổ hợp phù hợp">
              {candidate.variants.map((variant) => (
                <li key={`${variant.width}-${variant.length}-${variant.thickness}`} className="rounded-full border border-brand-primary/15 bg-brand-canvas px-2.5 py-1 text-xs font-semibold text-brand-copy">
                  {variant.width} × {variant.length} × {variant.thickness} cm
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {candidate.missingData.length > 0 ? (
          <p className="mt-3 text-xs leading-5 text-brand-copy">Chưa công bố: {candidate.missingData.join(", ")}.</p>
        ) : null}

        <Link href={("/so-sanh?items=" + encodeURIComponent(candidate.product.slug)) as never} className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-brand-primary transition-colors duration-200 hover:text-brand-accent">
          So sánh sản phẩm <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>
    </article>
  );
}

export function FinderResultsPanel({ results }: { results: FinderResults }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (window.location.hash === "#results") headingRef.current?.focus();
  }, [results]);
  if (results.empty) {
    return (
      <section id="results" className="finder-results container" aria-live="polite">
        <div className="finder-empty">
          <p className="section-label">KẾT QUẢ</p>
          <h2 ref={headingRef} tabIndex={-1}>Chưa có sản phẩm với dữ liệu đã xác nhận phù hợp các điều kiện này.</h2>
          <div className="finder-result-actions">
            <Link href="/tim-nem#finder-form" className="button button-secondary">
              Điều chỉnh điều kiện
            </Link>
            <Link href="/nem" className="button button-primary">
              Xem tất cả nệm
            </Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <GsapReveal variant="stagger" staggerSelector=".finder-result">
      <section id="results" className="finder-results container" aria-live="polite">
        <div className="finder-results-heading">
          <p className="section-label">KẾT QUẢ GỢI Ý</p>
          <h2 ref={headingRef} tabIndex={-1}>{results.primary ? "Một lựa chọn đáng xem xét." : "Danh sách để bạn khám phá."}</h2>
          <p>
            {results.primary
              ? "Gợi ý này dựa trên các trường dữ liệu và thông số kích thước đã được công bố."
              : "Chưa đủ dữ liệu đã xác nhận để xếp hạng cảm giác; đây là danh sách sản phẩm theo điều kiện bạn chọn."}
          </p>
        </div>

        {results.primary && <PrimaryRecommendationCard candidate={results.primary} />}

        {results.alternatives.length > 0 && (
          <div className="finder-alternatives-section">
            <div className="finder-alternatives-header">
              <p className="section-label">LỰA CHỌN THAM KHẢO</p>
              <h3>Các dòng nệm tương thích khác</h3>
            </div>
            <div className="finder-alternatives">
              {results.alternatives.map((candidate) => (
                <AlternativeCandidateCard key={candidate.product.slug} candidate={candidate} />
              ))}
            </div>
          </div>
        )}
      </section>
    </GsapReveal>
  );
}
