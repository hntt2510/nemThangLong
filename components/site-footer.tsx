import Link from "next/link";

export function SiteFooter({ contactPhone, contactEmail }: { contactPhone?: string | null; contactEmail?: string | null }) {
  return (
    <footer className="home-footer" id="about">
      <div className="container home-footer-grid">
        <div><Link href="/" className="brand"><span>THĂNG LONG</span><small>Sleep, considered.</small></Link><p>Comfortable. Trustworthy. Modern Vietnamese.</p></div>
        <div><p className="footer-heading">Khám phá</p><Link href={"/nem" as never}>Dòng nệm</Link><Link href="/#shop-by-need">Theo nhu cầu</Link><Link href="/nem/luxury">Luxury</Link></div>
        <div><p className="footer-heading">Hỗ trợ</p><Link href={"/tim-nem" as never}>Tìm nệm phù hợp</Link><Link href={"/so-sanh" as never}>So sánh</Link><Link href="/#hotel-project">Khách sạn &amp; dự án</Link></div>
        <div><p className="footer-heading">Liên hệ</p>{contactPhone && <a href={"tel:" + contactPhone}>{contactPhone}</a>}{contactEmail && <a href={"mailto:" + contactEmail}>{contactEmail}</a>}{!contactPhone && !contactEmail && <span>Thông tin đang cập nhật</span>}</div>
      </div>
      <div className="container home-footer-bottom"><span>© Thăng Long</span><span>Hình ảnh minh họa có thể được thay thế từ CMS.</span></div>
    </footer>
  );
}
