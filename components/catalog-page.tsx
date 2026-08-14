import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { CatalogData } from "@/lib/catalog";

type CatalogSettings = { contactPhone: string | null; contactEmail: string | null } | null;

function checked(values: number[], value: number) {
  return values.includes(value);
}

export function CatalogPage({ data, settings }: { data: CatalogData; settings: CatalogSettings }) {
  const contactHref = settings?.contactPhone
    ? "tel:" + settings.contactPhone
    : settings?.contactEmail
      ? "mailto:" + settings.contactEmail
      : null;

  return (
    <div className="catalog-page">
      <main>
        <section className="catalog-intro container">
          <p className="eyebrow">THĂNG LONG / NỆM</p>
          <h1>Chọn cảm giác<br />phù hợp.</h1>
          <p className="catalog-lede">Khám phá các dòng nệm Thăng Long theo nhu cầu, kích thước và thông tin đã được xác nhận.</p>
        </section>
        <section className="catalog-toolbar container" aria-label="Bộ lọc sản phẩm">
          <div className="catalog-toolbar-top"><p className="section-label">COLLECTION</p><span>{data.total} lựa chọn</span></div>
          <form method="get" className="catalog-filter-form">
            <fieldset><legend>Tìm kiếm</legend><label className="catalog-search"><span className="sr-only">Tìm theo tên hoặc SKU</span><input type="search" name="q" value={data.query.search} placeholder="Tên sản phẩm hoặc SKU" /></label></fieldset>
            <fieldset><legend>Dòng nệm</legend><div className="catalog-check-list">{[["america", "America"], ["classic", "Classic"], ["hoat-tinh", "Hoạt Tính"], ["memory-foam", "Memory Foam"], ["cao-su-thien-nhien", "Cao Su Thiên Nhiên"], ["luxury", "Luxury"]].map(([value, label]) => <label key={value}><input type="checkbox" name="line" value={value} checked={data.query.lines.includes(value)} readOnly /> <span>{label}</span></label>)}</div></fieldset>
            {data.facets.hasVerifiedPrices && <fieldset><legend>Khoảng giá (VND)</legend><div className="catalog-price-inputs"><label><span className="sr-only">Giá từ</span><input type="number" name="minPrice" min={data.facets.minPrice ?? undefined} value={data.query.minPrice ?? ""} placeholder="Từ" /></label><label><span className="sr-only">Giá đến</span><input type="number" name="maxPrice" max={data.facets.maxPrice ?? undefined} value={data.query.maxPrice ?? ""} placeholder="Đến" /></label></div></fieldset>}
            {data.facets.widths.length > 0 && <fieldset><legend>Chiều rộng</legend><div className="catalog-check-list catalog-check-list-inline">{data.facets.widths.map((width) => <label key={width}><input type="checkbox" name="width" value={width} checked={checked(data.query.widths, width)} readOnly /> <span>{width}cm</span></label>)}</div></fieldset>}
            {data.facets.thicknesses.length > 0 && <fieldset><legend>Độ dày</legend><div className="catalog-check-list catalog-check-list-inline">{data.facets.thicknesses.map((thickness) => <label key={thickness}><input type="checkbox" name="thickness" value={thickness} checked={checked(data.query.thicknesses, thickness)} readOnly /> <span>{thickness}cm</span></label>)}</div></fieldset>}
            <fieldset><legend>Sắp xếp</legend><label className="catalog-sort"><span className="sr-only">Sắp xếp sản phẩm</span><select name="sort" defaultValue={data.query.sort}><option value="featured">Nổi bật</option>{data.facets.hasVerifiedPrices && <><option value="price-asc">Giá thấp → cao</option><option value="price-desc">Giá cao → thấp</option></>}<option value="name-asc">Tên A–Z</option></select></label><label className="catalog-stock"><input type="checkbox" name="inStock" value="1" checked={data.query.inStock} readOnly /> <span>Còn hàng</span></label></fieldset>
            <div className="catalog-filter-actions"><button type="submit" className="button button-primary">Áp dụng</button><Link href={"/nem" as never} className="text-link">Xóa bộ lọc</Link></div>
          </form>
        </section>
        {!data.databaseAvailable && <p className="catalog-demo-note container">Danh mục minh họa · Giá, tồn kho và khả năng mua sẽ hiển thị sau khi dữ liệu CMS được cấu hình.</p>}
        <section className="catalog-results container" aria-live="polite">
          <div className="catalog-results-heading"><h2>{data.total > 0 ? "Các dòng nệm" : "Chưa có lựa chọn phù hợp"}</h2><span>{data.total} sản phẩm</span></div>
          {data.total > 0 ? <div className="catalog-grid">{data.products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} className="catalog-card" />)}</div> : <div className="catalog-empty"><p>Hãy thử bỏ bớt bộ lọc hoặc tìm kiếm khác.</p><Link href={"/nem" as never} className="button button-secondary">Xem toàn bộ danh mục</Link></div>}
        </section>
        <section className="catalog-discovery container"><div><p className="section-label">DISCOVER</p><h2>Chọn theo điều bạn cần mỗi đêm.</h2></div><div><p>Trả lời vài câu hỏi trong Finder để bắt đầu từ kích thước và cảm giác bạn tìm kiếm.</p><Link href={"/tim-nem" as never} className="text-link">Tìm nệm phù hợp <span aria-hidden="true">→</span></Link></div></section>
        <section className="catalog-consultation"><div className="container"><p className="eyebrow">TƯ VẤN LỰA CHỌN</p><h2>Chưa chắc dòng nào hợp với bạn?</h2>{contactHref ? <a href={contactHref} className="button button-dark">Liên hệ Thăng Long <span aria-hidden="true">→</span></a> : <p>Thông tin liên hệ đang được cập nhật.</p>}</div></section>
      </main>
    </div>
  );
}
