"use client";

import Image from "next/image";
import Link from "next/link";
import { GsapReveal } from "@/components/gsap-reveal";
import { MattressLabTeaser } from "@/components/mattress-lab-teaser";
import { formatVnd } from "@/lib/format";
import type { HomepageProductSummary } from "@/lib/homepage";

type HomepageSettings = {
  shippingFee: number | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

export function Homepage({ products, luxuryProduct, settings }: { products: HomepageProductSummary[]; luxuryProduct: Parameters<typeof MattressLabTeaser>[0]["product"]; settings: HomepageSettings | null }) {
  const luxury = products.find((product) => product.slug === "luxury") ?? products[products.length - 1];
  const latex = products.find((product) => product.slug === "cao-su-thien-nhien") ?? products[0];
  const deliveryConfigured = settings?.shippingFee !== null && settings?.shippingFee !== undefined;
  const contactHref = settings?.contactEmail ? `mailto:${settings.contactEmail}` : "#contact";

  return <div className="homepage">
    <main>
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <p className="eyebrow">THĂNG LONG / SLEEP, CONSIDERED.</p>
            <h1>Ngủ ngon hơn,<br />mỗi ngày.</h1>
            <p className="home-hero-lede">Những lựa chọn nệm được sắp xếp để bạn dễ tìm thấy cảm giác phù hợp.</p>
            <div className="home-hero-actions"><Link href="#find-mattress" className="button button-primary">Tìm nệm phù hợp</Link><Link href="#product-range" className="button button-secondary">Khám phá sản phẩm</Link></div>
            <p className="home-demo-note">Hình ảnh minh họa · Thông tin sản phẩm được cập nhật từ CMS.</p>
          </div>
          <div className="home-hero-media"><Image src="/images/homepage-hero.webp" alt="Hình ảnh minh họa phòng ngủ với nệm Thăng Long" fill priority sizes="(max-width: 860px) 100vw, 58vw" /><span className="demo-badge">Hình ảnh minh họa</span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Thông tin mua sắm">
        <div className="container trust-strip-grid"><span><b>01</b> Chọn theo nhu cầu</span><span><b>02</b> Tư vấn trước khi chọn</span><span><b>03</b> {deliveryConfigured ? "Chính sách giao hàng đã cấu hình" : "Chính sách giao hàng đang cập nhật"}</span><span><b>04</b> Thông tin giá từ CMS</span></div>
      </section>

      <GsapReveal><section id="find-mattress" className="home-find container">
        <div className="home-find-intro"><p className="section-label">FIND YOUR MATTRESS</p><h2>Bắt đầu từ cách bạn muốn được nghỉ ngơi.</h2><p>Chưa có công cụ chọn nệm tự động? Hãy bắt đầu bằng nhu cầu ngủ và nói chuyện với đội ngũ tư vấn.</p><Link href="#shop-by-need" className="text-link">Khám phá theo nhu cầu <span aria-hidden="true">→</span></Link></div>
        <div className="home-find-steps"><div><span>01</span><strong>Êm hay vững?</strong><p>Nhận diện cảm giác bạn tìm kiếm trước khi xem thông số.</p></div><div><span>02</span><strong>Ngủ một mình hay cùng người thân?</strong><p>Chọn hướng khám phá phù hợp với không gian và thói quen ngủ.</p></div><div><span>03</span><strong>Cần tư vấn thêm?</strong><p>Để lại câu hỏi, chúng tôi sẽ cùng bạn thu hẹp lựa chọn.</p></div></div>
      </section></GsapReveal>

      <GsapReveal><section id="product-range" className="home-range container">
        <div className="home-section-heading"><div><p className="section-label">PRODUCT RANGE</p><h2>Một dòng nệm cho mỗi cách ngủ.</h2></div><p>Giá và khả năng mua chỉ hiển thị khi đã được cấu hình và xác nhận trong CMS.</p></div>
        <div className="home-product-grid">{products.map((product, index) => <article key={product.slug} className={`home-product-card home-product-card-${index + 1}`}><Link href={product.slug === "luxury" ? "/nem/luxury" : "#contact"} aria-label={`Xem ${product.name}`}><div className="home-product-media"><Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw" style={{ objectFit: "cover" }} /><span className="home-product-index">0{index + 1}</span>{product.isDemo && <span className="demo-badge">Minh họa</span>}</div><div className="home-product-copy"><p className="eyebrow">{product.eyebrow}</p><h3>{product.name}</h3><p>{product.description}</p><div className="home-product-meta"><span>{product.minPrice ? `Từ ${formatVnd(product.minPrice)}` : "Liên hệ"}</span><span>{product.slug === "luxury" ? "Khám phá →" : "Tư vấn →"}</span></div></div></Link></article>)}</div>
      </section></GsapReveal>

      <GsapReveal><section className="home-luxury-editorial"><div className="container home-luxury-grid"><div className="home-luxury-media"><Image src={luxury.image} alt={luxury.imageAlt} fill sizes="(max-width: 860px) 100vw, 55vw" style={{ objectFit: "cover" }} /><span className="demo-badge">{luxury.isDemo ? "Hình ảnh minh họa" : "THE SIGNATURE"}</span></div><div className="home-luxury-copy"><p className="eyebrow">THE THĂNG LONG SIGNATURE</p><h2>Luxury, được cân nhắc từ trải nghiệm nằm.</h2><p>{luxury.description}</p><Link href="/nem/luxury" className="button button-dark">Khám phá Luxury <span aria-hidden="true">→</span></Link></div></div></section></GsapReveal>

      <MattressLabTeaser product={luxuryProduct} />

      <GsapReveal><section id="natural-latex" className="home-latex container"><div className="home-latex-copy"><p className="section-label">NATURAL LATEX</p><h2>Một câu chuyện về cảm giác tự nhiên.</h2><p>{latex.materialStory?.body ?? "Nội dung về chất liệu đang được cập nhật từ CMS. Hình ảnh chỉ mang tính minh họa và không đại diện cho cấu tạo sản phẩm."}</p><Link href="#product-range" className="text-link">Xem dòng Cao Su Thiên Nhiên <span aria-hidden="true">→</span></Link></div><div className="home-latex-media"><Image src="/images/homepage-latex.webp" alt="Hình ảnh minh họa chất liệu vải tự nhiên" fill sizes="(max-width: 860px) 100vw, 58vw" /><span className="demo-badge">Hình ảnh minh họa</span></div></section></GsapReveal>

      <GsapReveal><section id="shop-by-need" className="home-needs container"><div className="home-needs-intro"><p className="section-label">SHOP BY NEED</p><h2>Chọn theo điều bạn cần mỗi đêm.</h2><p>Những gợi ý ban đầu để bạn trò chuyện với đội ngũ tư vấn. Công cụ Finder đầy đủ sẽ được bổ sung sau.</p></div><div className="home-needs-list"><Link href="#contact"><span>01</span><strong>Êm ái</strong><small>Cho cảm giác mềm mại, thư giãn.</small><b aria-hidden="true">↗</b></Link><Link href="#contact"><span>02</span><strong>Nâng đỡ</strong><small>Cho lựa chọn cân bằng và vững vàng.</small><b aria-hidden="true">↗</b></Link><Link href="#contact"><span>03</span><strong>Ngủ mát</strong><small>Cho không gian nghỉ ngơi thoáng đãng.</small><b aria-hidden="true">↗</b></Link><Link href="#contact"><span>04</span><strong>Cặp đôi &amp; gia đình</strong><small>Cho những nhu cầu ngủ cùng nhau.</small><b aria-hidden="true">↗</b></Link></div></section></GsapReveal>

      <GsapReveal><section id="compare" className="home-compare container"><div><p className="section-label">COMPARE</p><h2>Chưa chắc lựa chọn nào hợp với bạn?</h2><p>So sánh đầy đủ sẽ được xây dựng sau. Hiện tại, đội ngũ tư vấn có thể giúp bạn bắt đầu từ nhu cầu thực tế.</p><Link href="#contact" className="button button-secondary">Nhận tư vấn lựa chọn</Link></div><div className="home-compare-lines"><span>Luxury</span><span>Memory Foam</span><span>Cao Su Thiên Nhiên</span><span>America</span></div></section></GsapReveal>

      <GsapReveal><section id="hotel-project" className="home-project container"><div className="home-project-media"><Image src="/images/homepage-hotel.webp" alt="Hình ảnh minh họa phòng ngủ khách sạn" fill sizes="(max-width: 860px) 100vw, 58vw" /><span className="demo-badge">Hình ảnh minh họa</span></div><div className="home-project-copy"><p className="section-label">HOTEL &amp; PROJECT</p><h2>Giấc ngủ tốt, ở mọi quy mô.</h2><p>Thông tin dành cho khách sạn và dự án đang được chuẩn bị. Hãy liên hệ để trao đổi nhu cầu thực tế.</p><a href={contactHref} className="text-link">Trao đổi cùng Thăng Long <span aria-hidden="true">→</span></a></div></section></GsapReveal>

      <GsapReveal><section className="home-trust container"><div><p className="section-label">DELIVERY &amp; WARRANTY</p><h2>An tâm từ lúc chọn đến lúc nhận.</h2></div><div className="home-trust-copy"><div><strong>{deliveryConfigured ? "Giao hàng" : "Giao hàng đang cập nhật"}</strong><p>{deliveryConfigured ? "Thông tin phí vận chuyển được quản lý trong Site settings." : "Chính sách giao hàng sẽ hiển thị khi được cấu hình."}</p></div><div><strong>Bảo hành</strong><p>Chính sách bảo hành chỉ hiển thị sau khi được xác nhận trong CMS.</p></div><div><strong>Hỏi trước khi mua</strong><p>Liên hệ để nhận tư vấn phù hợp với nhu cầu và không gian của bạn.</p></div></div></section></GsapReveal>

      <GsapReveal><section className="home-journal container"><div><p className="section-label">SLEEP JOURNAL</p><h2>Những điều nhỏ làm nên một đêm ngon.</h2></div><div className="home-journal-empty"><p>Nội dung đang được chuẩn bị.</p><span>Journal articles sẽ được quản lý từ CMS khi sẵn sàng.</span></div></section></GsapReveal>

      <section id="contact" className="home-consultation"><div className="container"><p className="eyebrow">TƯ VẤN LỰA CHỌN</p><h2>Bắt đầu bằng một câu hỏi đơn giản.</h2><p>Chúng tôi sẽ lắng nghe cách bạn ngủ trước khi gợi ý một lựa chọn.</p><a className="button button-dark" href={contactHref}>Liên hệ Thăng Long <span aria-hidden="true">→</span></a></div></section>
    </main>

    <footer className="home-footer" id="about"><div className="container home-footer-grid"><div><Link href="/" className="brand"><span>THĂNG LONG</span><small>Sleep, considered.</small></Link><p>Comfortable. Trustworthy. Modern Vietnamese.</p></div><div><p className="footer-heading">Khám phá</p><Link href="#product-range">Dòng nệm</Link><Link href="#shop-by-need">Theo nhu cầu</Link><Link href="/nem/luxury">Luxury</Link></div><div><p className="footer-heading">Hỗ trợ</p><Link href="#find-mattress">Tìm nệm phù hợp</Link><Link href="#compare">So sánh</Link><Link href="#hotel-project">Khách sạn &amp; dự án</Link></div><div><p className="footer-heading">Liên hệ</p>{settings?.contactPhone && <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>}{settings?.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}{!settings?.contactPhone && !settings?.contactEmail && <span>Thông tin đang cập nhật</span>}</div></div><div className="container home-footer-bottom"><span>© Thăng Long</span><span>Hình ảnh minh họa có thể được thay thế từ CMS.</span></div></footer>
  </div>;
}
