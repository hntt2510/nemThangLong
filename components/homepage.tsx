import Image from "next/image";
import Link from "next/link";
import { GsapReveal } from "@/components/gsap-reveal";
import { MattressLabTeaser } from "@/components/mattress-lab-teaser";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { getContactHref } from "@/lib/homepage";
import type { HomepageProductSummary } from "@/lib/homepage";
import type { Product } from "@/lib/types";

type HomepageSettings = {
  shippingFee: number | null;
  contactPhone: string | null;
  contactEmail: string | null;
  navigation: unknown;
};

export function Homepage({ products, luxuryProduct, settings }: { products: HomepageProductSummary[]; luxuryProduct: Product; settings: HomepageSettings | null }) {
  const luxury = products.find((product) => product.slug === "luxury") ?? products[products.length - 1];
  const latex = products.find((product) => product.slug === "cao-su-thien-nhien") ?? products[0];
  const deliveryConfigured = settings?.shippingFee !== null && settings?.shippingFee !== undefined;
  const contactHref = getContactHref(settings);

  return (
    <div className="homepage">
      <main>
        <GsapReveal variant="hero" parallax>
          <section className="home-hero">
            <div className="container home-hero-grid">
              <div className="home-hero-copy">
                <p className="eyebrow">THĂNG LONG / SLEEP, CONSIDERED.</p>
                <h1>Ngủ ngon hơn,<br />mỗi ngày.</h1>
                <p className="home-hero-lede">Những lựa chọn nệm được sắp xếp để bạn dễ tìm thấy cảm giác phù hợp.</p>
                <div className="home-hero-actions">
                  <Link href={"/tim-nem" as never} className="button button-primary">Tìm nệm phù hợp</Link>
                  <Link href="#product-range" className="button button-secondary">Khám phá sản phẩm</Link>
                </div>
                <p className="home-demo-note">Ảnh minh họa · Thông tin sản phẩm đang được cập nhật.</p>
              </div>
              <div className="home-hero-media">
                <Image src="/images/homepage-hero.webp" alt="Hình ảnh minh họa phòng ngủ với nệm Thăng Long" fill priority sizes="(max-width: 860px) 100vw, 58vw" />
                <span className="demo-badge">Ảnh minh họa</span>
              </div>
            </div>
          </section>
        </GsapReveal>

        <section className="trust-strip" aria-label="Thông tin mua sắm">
          <div className="container trust-strip-grid">
            <span><b>01</b> Chọn theo nhu cầu</span>
            <span><b>02</b> Tư vấn trước khi chọn</span>
            <span><b>03</b> {deliveryConfigured ? "Giao hàng — xem chính sách áp dụng" : "Chính sách giao hàng đang cập nhật"}</span>
            <span><b>04</b> Giá hoặc trạng thái liên hệ hiển thị theo từng sản phẩm</span>
          </div>
        </section>

        <GsapReveal variant="stagger" staggerSelector=".home-product-card">
          <section id="product-range" className="home-range container">
            <div className="home-section-heading">
              <div>
                <p className="section-label">PRODUCT RANGE</p>
                <h2>Một dòng nệm cho mỗi cách ngủ.</h2>
              </div>
              <p>Giá bán hoặc hướng dẫn liên hệ tư vấn được hiển thị theo từng sản phẩm và kích thước.</p>
            </div>
            <div className="home-product-grid">
              {products.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} className={`home-product-card-${index + 1}`} />
              ))}
            </div>
          </section>
        </GsapReveal>

        <GsapReveal>
          <section id="find-mattress" className="home-find container">
            <div className="home-find-intro">
              <p className="section-label">HOW TO CHOOSE</p>
              <h2>Không cần thử hết mọi tấm nệm.</h2>
              <p>Chỉ cần hiểu tư thế nằm, thói quen và cảm giác bạn muốn khi thức dậy.</p>
              <Link href={"/tim-nem" as never} className="text-link">Bắt đầu chọn nệm <span aria-hidden="true">→</span></Link>
            </div>
            <div className="home-find-steps">
              <div>
                <span>01</span>
                <strong>Tìm cảm giác bạn muốn mỗi đêm</strong>
                <p>Nhận diện cảm giác bạn tìm kiếm trước khi xem thông số.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Ngủ một mình hay cùng người thân?</strong>
                <p>Chọn hướng khám phá phù hợp với không gian và thói quen ngủ.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Cần tư vấn thêm?</strong>
                <p>Để lại câu hỏi, chúng tôi sẽ cùng bạn thu hẹp lựa chọn.</p>
              </div>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal variant="editorial" parallax>
          <section className="home-luxury-editorial">
            <div className="container home-luxury-grid">
              <div className="home-luxury-media">
                <Image src={luxury.image} alt={luxury.imageAlt} fill sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: "cover" }} />
                {luxury.imageIsDemo && <span className="demo-badge">Ảnh minh họa</span>}
              </div>
              <div className="home-luxury-copy">
                <p className="eyebrow">THE THĂNG LONG SIGNATURE</p>
                <h2>Luxury, được cân nhắc từ trải nghiệm nằm.</h2>
                <p>{luxury.description}</p>
                <Link href="/nem/luxury" className="button button-dark">Khám phá Luxury <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </section>
        </GsapReveal>

        <MattressLabTeaser product={luxuryProduct} />

        <GsapReveal variant="editorial" parallax>
          <section id="natural-latex" className="home-latex container">
            <div className="home-latex-copy">
              <p className="section-label">NATURAL LATEX</p>
              <h2>Một câu chuyện về cảm giác tự nhiên.</h2>
              <p>{latex.materialStory?.body ?? "Thông tin chi tiết về dòng Cao Su Thiên Nhiên đang được cập nhật. Hình ảnh mang tính chất minh họa trải nghiệm."}</p>
              <Link href="/nem/cao-su-thien-nhien" className="text-link">Xem dòng Cao Su Thiên Nhiên <span aria-hidden="true">→</span></Link>
            </div>
            <div className="home-latex-media">
              <Image src="/images/homepage-natural-latex.webp" alt="Hình ảnh minh họa nguồn cao su tự nhiên" fill sizes="(max-width: 860px) 100vw, 58vw" />
              <span className="demo-badge">Ảnh minh họa</span>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal>
          <section id="shop-by-need" className="home-needs container">
            <div className="home-needs-intro">
              <p className="section-label">SHOP BY NEED</p>
              <h2>Chọn theo điều bạn cần mỗi đêm.</h2>
              <p>Những gợi ý ban đầu để bạn bắt đầu với Finder. Mọi trường dữ liệu chưa được xác nhận sẽ được ghi rõ.</p>
              <Link href={"/tim-nem" as never} className="text-link">Tìm nệm theo nhu cầu <span aria-hidden="true">→</span></Link>
            </div>
            <div className="home-needs-list">
              {[
                ["01", "Êm ái", "Cho cảm giác mềm mại, thư giãn."],
                ["02", "Nâng đỡ", "Cho lựa chọn cân bằng và vững vàng."],
                ["03", "Ngủ mát", "Cho không gian nghỉ ngơi thoáng đãng."],
                ["04", "Cặp đôi & gia đình", "Cho những nhu cầu ngủ cùng nhau."],
              ].map(([number, title, body]) => (
                <Link key={number} href={"/tim-nem" as never}>
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <small>{body}</small>
                  <b aria-hidden="true">↗</b>
                </Link>
              ))}
            </div>
          </section>
        </GsapReveal>

        <GsapReveal>
          <section id="compare" className="home-compare container">
            <div>
              <p className="section-label">COMPARE</p>
              <h2>Chưa chắc lựa chọn nào hợp với bạn?</h2>
              <p>Đặt cạnh các dòng nệm bằng dữ liệu đã được công bố.</p>
              <Link href={"/so-sanh" as never} className="button button-secondary">Mở trang so sánh</Link>
            </div>
            <div className="home-compare-lines">
              <span>Luxury</span>
              <span>Memory Foam</span>
              <span>Cao Su Thiên Nhiên</span>
              <span>America</span>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal variant="editorial">
          <section id="hotel-project" className="home-project container">
            <div className="home-project-media">
              <Image src="/images/homepage-hotel.webp" alt="Hình ảnh minh họa phòng ngủ khách sạn" fill sizes="(max-width: 860px) 100vw, 58vw" />
              <span className="demo-badge">Ảnh minh họa</span>
            </div>
            <div className="home-project-copy">
              <p className="section-label">HOTEL &amp; PROJECT</p>
              <h2>Giấc ngủ tốt, ở mọi quy mô.</h2>
              <p>Thông tin dành cho khách sạn và dự án đang được chuẩn bị. Hãy trao đổi nhu cầu thực tế với đội ngũ Thăng Long.</p>
              <Link href={"/khach-san-du-an" as never} className="text-link">Khám phá khách sạn &amp; dự án <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal variant="stagger" staggerSelector=".home-trust-copy > div">
          <section className="home-trust container">
            <div>
              <p className="section-label">DELIVERY &amp; WARRANTY</p>
              <h2>An tâm từ lúc chọn đến lúc nhận.</h2>
            </div>
            <div className="home-trust-copy">
              <div>
                <strong>{deliveryConfigured ? "Giao hàng" : "Giao hàng đang cập nhật"}</strong>
                <p>{deliveryConfigured ? "Thông tin phí vận chuyển hiển thị theo cấu hình áp dụng." : "Chính sách giao hàng sẽ hiển thị khi được công bố."}</p>
              </div>
              <div>
                <strong>Bảo hành</strong>
                <p>Thông tin bảo hành sẽ hiển thị khi có dữ liệu chính thức theo từng dòng sản phẩm.</p>
              </div>
              <div>
                <strong>Hỏi trước khi mua</strong>
                <p>Liên hệ để nhận tư vấn phù hợp với nhu cầu và không gian của bạn.</p>
              </div>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal>
          <section className="home-journal container">
            <div>
              <p className="section-label">SLEEP JOURNAL</p>
              <h2>Những điều nhỏ làm nên một đêm ngon.</h2>
            </div>
            <div className="home-journal-empty">
              <p>Nội dung đang được chuẩn bị.</p>
              <span>Các bài viết chia sẻ về giấc ngủ sẽ sớm được cập nhật.</span>
            </div>
          </section>
        </GsapReveal>

        <section id="contact" className="home-consultation">
          <div className="container">
            <p className="eyebrow">TƯ VẤN LỰA CHỌN</p>
            <h2>Bắt đầu bằng một câu hỏi đơn giản.</h2>
            <p>Chúng tôi sẽ lắng nghe cách bạn ngủ trước khi gợi ý một lựa chọn.</p>
            <div className="home-consultation-actions">
              <Link className="button button-dark" href={"/lien-he" as never}>Liên hệ tư vấn <span aria-hidden="true">→</span></Link>
              {contactHref && <a className="home-direct-contact text-link" href={contactHref}>Hoặc liên hệ trực tiếp</a>}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </div>
  );
}
