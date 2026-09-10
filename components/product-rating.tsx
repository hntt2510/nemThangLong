import type { Product } from "@/lib/types";

export function productRatingSummary(reviews: Product["reviews"]) {
  if (reviews.length === 0) return null;
  return { count: reviews.length, average: reviews.reduce((total, review) => total + review.rating, 0) / reviews.length };
}

export function ProductRating({ reviews, compact = false }: { reviews: Product["reviews"]; compact?: boolean }) {
  const summary = productRatingSummary(reviews);
  if (!summary) return null;
  return <p className={compact ? "product-rating product-rating-compact" : "product-rating"} aria-label={`${summary.average.toFixed(1)} trên 5 từ ${summary.count} đánh giá`}><span aria-hidden="true">★</span> {summary.average.toFixed(1)} <small>({summary.count} đánh giá)</small></p>;
}

export function ProductReviews({ reviews }: { reviews: Product["reviews"] }) {
  const summary = productRatingSummary(reviews);
  if (!summary) return null;
  const fixtureOnly = reviews.every((review) => review.isFixture);
  return <section className="product-reviews container" aria-labelledby="product-reviews-title"><div><p className="section-label">{fixtureOnly ? "ĐÁNH GIÁ MẪU" : "ĐÁNH GIÁ ĐÃ DUYỆT"}</p><h2 id="product-reviews-title">{fixtureOnly ? "Dữ liệu để kiểm thử giao diện." : "Trải nghiệm từ khách hàng."}</h2><ProductRating reviews={reviews} /></div><div className="product-review-list">{reviews.map((review) => <article key={`${review.authorName}-${review.createdAt}`}><div><strong>{review.authorName}</strong><span aria-label={`${review.rating} trên 5`}>{"★".repeat(review.rating)}<i>{"★".repeat(5 - review.rating)}</i></span></div>{review.isFixture && <small>Đánh giá mẫu</small>}<p>{review.body}</p><time dateTime={review.createdAt}>{new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date(review.createdAt))}</time></article>)}</div></section>;
}
