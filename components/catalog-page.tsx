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
        <div className="catalog-breadcrumb container">
          <Link href="/">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span>Bộ sưu tập nệm</span>
        </div>

        <section className="catalog-intro container">
          <p className="eyebrow">THĂNG LONG / SLEEP COLLECTION</p>
          <h1>Bộ Sưu Tập Nệm Thăng Long</h1>
          <p className="catalog-lede">
            Được chế tác từ cảm giác nằm và nhu cầu nâng đỡ của người Việt. Mỗi dòng nệm đại diện cho một trải nghiệm nghỉ ngơi trọn vẹn.
          </p>
        </section>

        <div className="catalog-layout container">
          <aside className="catalog-sidebar" aria-label="Bộ lọc sản phẩm">
            <div className="catalog-sidebar-card">
              <div className="catalog-sidebar-heading">
                <h3>BỘ LỌC TÌM KIẾM</h3>
                <span>{data.total} sản phẩm</span>
              </div>

              <form method="get" className="catalog-filter-form">
                <fieldset className="filter-group">
                  <legend className="filter-legend">Tìm theo từ khóa</legend>
                  <label className="catalog-search-input-wrap">
                    <span className="sr-only">Tìm theo tên hoặc SKU</span>
                    <input
                      type="search"
                      name="q"
                      defaultValue={data.query.search}
                      placeholder="Tên sản phẩm hoặc mã..."
                      className="catalog-text-input"
                    />
                  </label>
                </fieldset>

                <fieldset className="filter-group">
                  <legend className="filter-legend">Dòng nệm</legend>
                  <div className="catalog-check-list">
                    {[
                      ["luxury", "Luxury Thượng Hạng"],
                      ["cao-su-thien-nhien", "Cao Su Thiên Nhiên"],
                      ["memory-foam", "Memory Foam"],
                      ["hoat-tinh", "Hoạt Tính"],
                      ["classic", "Classic Truyền Thống"],
                      ["america", "America Tiêu Chuẩn"],
                    ].map(([value, label]) => (
                      <label key={value} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          name="line"
                          value={value}
                          defaultChecked={data.query.lines.includes(value)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {data.facets.hasVerifiedPrices && (
                  <fieldset className="filter-group">
                    <legend className="filter-legend">Khoảng giá (VND)</legend>
                    <div className="catalog-price-inputs">
                      <input
                        type="number"
                        name="minPrice"
                        min={data.facets.minPrice ?? undefined}
                        defaultValue={data.query.minPrice ?? ""}
                        placeholder="Từ..."
                        className="catalog-text-input"
                      />
                      <span className="price-sep">–</span>
                      <input
                        type="number"
                        name="maxPrice"
                        max={data.facets.maxPrice ?? undefined}
                        defaultValue={data.query.maxPrice ?? ""}
                        placeholder="Đến..."
                        className="catalog-text-input"
                      />
                    </div>
                  </fieldset>
                )}

                {data.facets.widths.length > 0 && (
                  <fieldset className="filter-group">
                    <legend className="filter-legend">Chiều rộng (cm)</legend>
                    <div className="catalog-check-pills">
                      {data.facets.widths.map((width) => (
                        <label key={width} className="filter-pill-label">
                          <input
                            type="checkbox"
                            name="width"
                            value={width}
                            defaultChecked={checked(data.query.widths, width)}
                          />
                          <span>{width}cm</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {data.facets.thicknesses.length > 0 && (
                  <fieldset className="filter-group">
                    <legend className="filter-legend">Độ dày (cm)</legend>
                    <div className="catalog-check-pills">
                      {data.facets.thicknesses.map((thickness) => (
                        <label key={thickness} className="filter-pill-label">
                          <input
                            type="checkbox"
                            name="thickness"
                            value={thickness}
                            defaultChecked={checked(data.query.thicknesses, thickness)}
                          />
                          <span>{thickness}cm</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <fieldset className="filter-group">
                  <legend className="filter-legend">Sắp xếp</legend>
                  <select name="sort" defaultValue={data.query.sort} className="catalog-select-input">
                    <option value="featured">Nổi bật nhất</option>
                    {data.facets.hasVerifiedPrices && (
                      <>
                        <option value="price-asc">Giá: Thấp đến Cao</option>
                        <option value="price-desc">Giá: Cao đến Thấp</option>
                      </>
                    )}
                    <option value="name-asc">Tên sản phẩm A–Z</option>
                  </select>
                </fieldset>

                <fieldset className="filter-group">
                  <label className="filter-checkbox-label">
                    <input type="checkbox" name="inStock" value="1" defaultChecked={data.query.inStock} />
                    <span>Chỉ xem sản phẩm còn hàng</span>
                  </label>
                </fieldset>

                <div className="catalog-filter-actions">
                  <button type="submit" className="button button-primary">
                    Áp dụng
                  </button>
                  <Link href={"/nem" as never} className="text-link">
                    Đặt lại
                  </Link>
                </div>
              </form>
            </div>
          </aside>

          <div className="catalog-results-area">
            {!data.databaseAvailable && (
              <p className="catalog-demo-note">
                Ảnh minh họa · Thông tin giá bán và tình trạng còn hàng đang được cập nhật.
              </p>
            )}

            <div className="catalog-results-heading">
              <h2>{data.total > 0 ? "Danh sách sản phẩm" : "Chưa có lựa chọn phù hợp"}</h2>
              <span className="catalog-count">{data.total} dòng nệm</span>
            </div>

            {data.total > 0 ? (
              <div className="catalog-grid">
                {data.products.map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    index={index}
                    className="catalog-card"
                  />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <p>Hãy thử bỏ bớt bộ lọc hoặc sử dụng từ khóa tìm kiếm khác.</p>
                <Link href={"/nem" as never} className="button button-secondary">
                  Xem toàn bộ danh mục
                </Link>
              </div>
            )}
          </div>
        </div>

        <section className="catalog-discovery container">
          <div>
            <p className="section-label">FINDER</p>
            <h2>Chưa chắc nệm nào hợp với bạn?</h2>
          </div>
          <div>
            <p>
              Trả lời vài câu hỏi nhanh trong công cụ Finder để nhận gợi ý theo kích thước và thói quen ngủ thực tế.
            </p>
            <Link href={"/tim-nem" as never} className="button button-primary">
              Mở công cụ tìm nệm <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className="catalog-consultation">
          <div className="container">
            <p className="eyebrow">TƯ VẤN TRỰC TIẾP</p>
            <h2>Cần trao đổi trước khi chọn?</h2>
            <p>Đội ngũ chuyên viên Thăng Long luôn sẵn sàng lắng nghe và giải đáp mọi câu hỏi.</p>
            {contactHref ? (
              <a href={contactHref} className="button button-dark">
                Liên hệ Thăng Long <span aria-hidden="true">→</span>
              </a>
            ) : (
              <p>Thông tin liên hệ đang được cập nhật.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
