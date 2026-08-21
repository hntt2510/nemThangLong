import Link from "next/link";
import { GsapReveal } from "@/components/gsap-reveal";
import { ProductCard } from "@/components/product-card";
import type { FinderCandidate, FinderResults } from "@/lib/finder";

function variantText(candidate: FinderCandidate) {
  return candidate.variants.length
    ? candidate.variants.map((variant) => String(variant.width) + "×" + String(variant.length) + "×" + String(variant.thickness) + " cm").join(" · ")
    : "Thông tin biến thể đang được cập nhật";
}

function Candidate({ candidate, primary }: { candidate: FinderCandidate; primary?: boolean }) {
  return (
    <article className={"finder-result " + (primary ? "finder-result-primary" : "")}>
      <ProductCard product={candidate.product} />
      <div className="finder-result-detail">
        <p className="eyebrow">{primary ? "GỢI Ý CHÍNH DỰA TRÊN DỮ LIỆU ĐÃ BIẾT" : "LỰA CHỌN THAM KHẢO"}</p>
        <strong>{candidate.variants.length > 0 ? "Tổ hợp phù hợp: " + variantText(candidate) : "Biến thể và giá đang được cập nhật."}</strong>
        {candidate.reasons.length > 0 && <ul>{candidate.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}
        {candidate.missingData.length > 0 && <p className="muted">Chưa công bố: {candidate.missingData.join(", ")}.</p>}
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
  if (results.empty) {
    return (
      <section id="results" className="finder-results container" aria-live="polite">
        <div className="finder-empty">
          <p className="section-label">KẾT QUẢ</p>
          <h2>Chưa có sản phẩm với dữ liệu đã xác nhận phù hợp các điều kiện này.</h2>
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
          <p className="section-label">KẾT QUẢ</p>
          <h2>{results.primary ? "Một lựa chọn đáng xem xét." : "Danh sách để bạn khám phá."}</h2>
          <p>{results.primary ? "Gợi ý này chỉ dựa trên các trường dữ liệu đã được công bố và biến thể thật." : "Chưa đủ dữ liệu đã xác nhận để xếp hạng cảm giác; đây là shortlist theo điều kiện bạn chọn."}</p>
        </div>
        {results.primary && <Candidate candidate={results.primary} primary />}
        <div className="finder-alternatives">
          {results.alternatives.map((candidate) => (
            <Candidate key={candidate.product.slug} candidate={candidate} />
          ))}
        </div>
      </section>
    </GsapReveal>
  );
}
