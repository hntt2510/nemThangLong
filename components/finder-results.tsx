"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { GsapReveal } from "@/components/gsap-reveal";
import { ProductCard } from "@/components/product-card";
import { formatVnd } from "@/lib/format";
import type { FinderCandidate, FinderResults } from "@/lib/finder";

function variantText(candidate: FinderCandidate) {
  return candidate.variants.length
    ? candidate.variants.map((variant) => String(variant.width) + "×" + String(variant.length) + "×" + String(variant.thickness) + " cm").join(" · ")
    : "Thông tin biến thể đang được cập nhật";
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
  return (
    <article className="finder-result finder-alternative-card">
      <ProductCard product={candidate.product} />
      <div className="finder-result-detail">
        <p className="eyebrow">LỰA CHỌN THAM KHẢO</p>
        <strong className="finder-alt-variant">
          {candidate.variants.length > 0 ? "Tổ hợp: " + variantText(candidate) : "Biến thể và giá đang được cập nhật."}
        </strong>
        {candidate.reasons.length > 0 && (
          <ul className="finder-alt-reasons">
            {candidate.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
        {candidate.missingData.length > 0 && (
          <p className="muted finder-missing-note">Chưa công bố: {candidate.missingData.join(", ")}.</p>
        )}
        <div className="finder-result-actions">
          <Link href={("/nem/" + candidate.product.slug) as never} className="text-link">
            Xem sản phẩm <span aria-hidden="true">→</span>
          </Link>
          <Link href={("/so-sanh?items=" + encodeURIComponent(candidate.product.slug)) as never} className="text-link">
            So sánh <span aria-hidden="true">→</span>
          </Link>
        </div>
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
