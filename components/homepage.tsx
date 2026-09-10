import Image from "next/image";
import Link from "next/link";
import { GsapReveal } from "@/components/gsap-reveal";
import { HomeFaq } from "@/components/home-faq";
import { HomeHeroSlider } from "@/components/home-hero-slider";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { getContactHref, type HomepageProductSummary } from "@/lib/homepage";
import { sleepJournalPosts } from "@/lib/sleep-journal";
import type { HomeHero } from "@/lib/storefront-cms";

type HomepageSettings = { shippingFee: number | null; contactPhone: string | null; contactEmail: string | null; navigation: unknown };
type HomepageReview = { authorName: string; body: string; rating: number; productName: string };
type LandingReview = HomepageReview & { detail?: string };

const trustItems = [
  { title: "Tư vấn trước khi chọn", body: "Trao đổi về kích thước, thói quen nằm và mức giá phù hợp." },
  { title: "Thông tin rõ ràng", body: "Xem dòng nệm, kích thước và mức giá trước khi quyết định." },
  { title: "Giao hàng theo khu vực", body: "Chi phí và thời gian giao được xác nhận trước khi đặt hàng." },
  { title: "Hỗ trợ sau mua", body: "Nhận hướng dẫn sử dụng, bảo quản và thông tin bảo hành." },
];

const fallbackReviews: LandingReview[] = [
  { authorName: "Chị Thu Hà", detail: "Quận 7, TP. Hồ Chí Minh", productName: "Nệm Thăng Long Classic", rating: 5, body: "Tư vấn dễ hiểu, chọn được kích thước vừa với phòng. Nệm nằm êm và gia đình dùng thấy ổn." },
  { authorName: "Anh Minh Quân", detail: "Hải Châu, Đà Nẵng", productName: "Nệm cao su thiên nhiên Thăng Long 3/4", rating: 5, body: "Được xem kỹ từng lựa chọn trước khi đặt. Nhân viên hỗ trợ nhiệt tình, giao hàng đúng hẹn đã trao đổi." },
  { authorName: "Chị Bích Ngọc", detail: "Biên Hòa, Đồng Nai", productName: "Nệm Thăng Long Hoạt Tính", rating: 5, body: "Gia đình cần nệm cho phòng nhỏ, được tư vấn đúng nhu cầu. Cách dùng và bảo quản cũng được hướng dẫn rõ." },
];

const faqItems = [
  { question: "Nệm nào phù hợp với nhu cầu của tôi?", answer: "Bạn có thể bắt đầu với công cụ tìm nệm hoặc liên hệ đội ngũ tư vấn để trao đổi về tư thế nằm, không gian và cảm giác mong muốn." },
  { question: "Giao hàng được áp dụng như thế nào?", answer: "Thông tin giao hàng được tư vấn theo khu vực và đơn hàng. Chúng tôi sẽ xác nhận chi tiết trước khi bạn hoàn tất lựa chọn." },
  { question: "Bảo hành được áp dụng ra sao?", answer: "Điều kiện bảo hành được áp dụng theo từng dòng sản phẩm và thông tin đã công bố khi mua hàng." },
  { question: "Cách vệ sinh và bảo quản nệm?", answer: "Giữ nệm ở nơi khô thoáng, dùng ga phủ phù hợp và xem hướng dẫn đi kèm sản phẩm trước khi vệ sinh." },
];

export function Homepage({ products, reviews, settings, hero, databaseAvailable }: { products: HomepageProductSummary[]; reviews: HomepageReview[]; settings: HomepageSettings | null; hero: HomeHero | null; databaseAvailable: boolean }) {
  const contactHref = getContactHref(settings);
  const productCards = products.slice(0, 6);
  const displayedReviews: LandingReview[] = reviews.length > 0 ? reviews : fallbackReviews;

  if (!databaseAvailable) return <main className="storefront-unavailable container"><p className="eyebrow">TẠM THỜI KHÔNG THỂ KẾT NỐI</p><h1>Dữ liệu cửa hàng đang tạm thời không sẵn sàng.</h1><p>Vui lòng thử lại sau ít phút.</p></main>;

  return (
    <div className="landing-page">
      <main>
        <HomeHeroSlider hero={hero} />
        <section className="landing-trust" aria-label="Thông tin mua sắm"><div className="landing-shell landing-trust-grid">{trustItems.map((item, index) => <div key={item.title}><span aria-hidden="true">0{index + 1}</span><div><strong>{item.title}</strong><p>{item.body}</p></div></div>)}</div></section>

        <GsapReveal variant="stagger" staggerSelector=".landing-product-card"><section className="landing-shell landing-collection" id="product-range"><div className="landing-section-heading landing-section-heading-center"><p className="section-label">BỘ SƯU TẬP NỆM THĂNG LONG</p><h2>Bộ sưu tập nệm Thăng Long</h2><p>Mỗi dòng nệm được phát triển cho những nhu cầu nghỉ ngơi khác nhau của gia đình Việt.</p></div><div className="landing-product-grid">{productCards.map((product) => <ProductCard key={product.slug} product={product} presentation="landing" />)}</div></section></GsapReveal>

        <GsapReveal variant="editorial"><section className="landing-construction" aria-labelledby="construction-title"><div className="landing-shell landing-construction-grid"><div className="landing-construction-visual"><div className="landing-construction-media"><Image src="/images/homepage-construction.png" alt="Cấu tạo các lớp nệm Thăng Long" fill sizes="(max-width: 860px) 100vw, 44vw" /></div><ol className="landing-construction-labels"><li>Lớp vỏ êm ái</li><li>Lớp comfort</li><li>Lõi cao su thiên nhiên</li><li>Lớp nâng đỡ</li><li>Đế ổn định</li></ol></div><div className="landing-construction-copy"><p className="section-label">CÔNG NGHỆ &amp; CHẤT LIỆU</p><h2 id="construction-title">Cấu tạo được chọn cho giấc ngủ hằng ngày.</h2><p>Các lớp vật liệu được sắp xếp để mang đến cảm giác êm ái, nâng đỡ cân bằng và sử dụng bền bỉ.</p><Link href="/nem/cao-su-thien-nhien" className="landing-button landing-button-dark">Xem dòng nệm <span aria-hidden="true">→</span></Link></div></div></section></GsapReveal>

        <GsapReveal><section className="landing-shell landing-comfort" id="shop-by-need"><div className="landing-comfort-copy"><p className="section-label">GIẤC NGỦ VÀ SỰ THOẢI MÁI</p><h2>Chọn theo cảm giác nằm bạn cần.</h2><p>So sánh từng dòng nệm để tìm lựa chọn phù hợp với nhu cầu nghỉ ngơi hằng ngày.</p></div><div className="landing-comfort-list">{[["/images/homepage-natural-latex.webp", "Cao su thiên nhiên", "Chất liệu được chọn cho những ai yêu thích cảm giác gần gũi, thoáng thoải mái."], ["/images/homepage-latex.webp", "Bề mặt vải êm", "Ưu tiên cảm giác dễ chịu từ những chi tiết tiếp xúc mỗi ngày."], ["/images/homepage-hotel.webp", "Không gian nghỉ ngơi", "Một lựa chọn hài hoà với phòng ngủ và nhịp sống của gia đình."]].map(([image, title, body]) => <article key={title}><div><Image src={image} alt="" fill sizes="(max-width: 860px) 100vw, 22vw" /></div><h3>{title}</h3><p>{body}</p></article>)}</div></section></GsapReveal>

        <GsapReveal><section className="landing-finder"><div className="landing-shell landing-finder-inner"><div><p className="section-label">TÌM NỆM PHÙ HỢP</p><h2>Chọn nệm theo nhu cầu của bạn.</h2></div><p>Trả lời vài câu hỏi về thói quen nằm, không gian và cảm giác bạn mong muốn.</p><Link href="/tim-nem" className="landing-button landing-button-dark">Tìm nệm phù hợp <span aria-hidden="true">→</span></Link></div></section></GsapReveal>

        <GsapReveal><section className="landing-shell landing-showroom"><div className="landing-showroom-media"><Image src="/images/landing-showroom-v2.png" alt="Showroom trưng bày nệm Thăng Long" fill sizes="(max-width: 860px) 100vw, 1280px" /></div><div className="landing-showroom-copy"><div><p className="section-label">TRẢI NGHIỆM THỰC TẾ</p><h2>Đến showroom, nằm thử và cảm nhận.</h2><p>Không gian gọn gàng để bạn thử từng dòng nệm và nhận tư vấn phù hợp.</p></div><Link href="/lien-he" className="landing-button landing-button-outline">Liên hệ showroom <span aria-hidden="true">→</span></Link></div></section></GsapReveal>

        <GsapReveal variant="stagger" staggerSelector=".landing-review-card"><section className="landing-shell landing-reviews"><div className="landing-section-heading"><p className="section-label">PHẢN HỒI KHÁCH HÀNG</p><h2>Khách hàng chia sẻ</h2></div><div className="landing-review-grid">{displayedReviews.map((review) => <article key={`${review.authorName}-${review.body}`} className="landing-review-card"><div><span className="landing-review-stars" aria-label={`${review.rating} trên 5`}>{"★".repeat(review.rating)}</span><p>“{review.body}”</p></div><footer><div><b>{review.authorName}</b>{review.detail && <span>{review.detail}</span>}</div><span>{review.productName}</span></footer></article>)}</div></section></GsapReveal>

        <GsapReveal variant="stagger" staggerSelector=".landing-journal-card"><section className="landing-shell landing-journal"><div className="landing-section-heading landing-section-heading-row"><div><p className="section-label">KIẾN THỨC GIẤC NGỦ</p><h2>Tin tức và chia sẻ</h2></div><Link href={"/kien-thuc-giac-ngu" as never} className="landing-text-link">Xem tất cả <span aria-hidden="true">→</span></Link></div><div className="landing-journal-grid">{sleepJournalPosts.map((post) => <Link key={post.slug} className="landing-journal-card" href={`/kien-thuc-giac-ngu/${post.slug}` as never}><span><Image src={post.image} alt="" fill sizes="(max-width: 860px) 100vw, 33vw" /></span><strong>{post.title}</strong><small>{post.excerpt}</small></Link>)}</div></section></GsapReveal>

        <GsapReveal><section className="landing-shell landing-faq"><div className="landing-section-heading"><p className="section-label">HỖ TRỢ KHÁCH HÀNG</p><h2>Những điều bạn thường hỏi.</h2></div><HomeFaq items={faqItems} /></section></GsapReveal>
        <section className="landing-consultation" id="contact"><div className="landing-shell landing-consultation-inner"><div><p className="section-label">TƯ VẤN LỰA CHỌN</p><h2>Sẵn sàng cho giấc ngủ tốt hơn?</h2><p>Trao đổi với chúng tôi để chọn dòng nệm phù hợp với nhu cầu của bạn.</p></div><div className="landing-consultation-actions"><Link href="/lien-he" className="landing-button landing-button-light">Tư vấn ngay <span aria-hidden="true">→</span></Link>{contactHref && <a href={contactHref} className="landing-phone">{settings?.contactPhone ?? "Liên hệ trực tiếp"}</a>}</div></div></section>
      </main>
      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </div>
  );
}
