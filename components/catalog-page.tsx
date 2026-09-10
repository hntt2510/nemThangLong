"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { CatalogData, CatalogQuery } from "@/lib/catalog";

type CatalogSettings = { contactPhone: string | null; contactEmail: string | null } | null;

function checked(values: number[], value: number) {
  return values.includes(value);
}

function withoutFilter(query: CatalogQuery, key: "q" | "line" | "width" | "thickness" | "price" | "stock", value?: string | number) {
  const params = new URLSearchParams();
  if (key !== "q" && query.search) params.set("q", query.search);
  query.lines.filter((item) => key !== "line" || item !== value).forEach((item) => params.append("line", item));
  query.widths.filter((item) => key !== "width" || item !== value).forEach((item) => params.append("width", String(item)));
  query.thicknesses.filter((item) => key !== "thickness" || item !== value).forEach((item) => params.append("thickness", String(item)));
  if (key !== "price" && query.minPrice !== null) params.set("minPrice", String(query.minPrice));
  if (key !== "price" && query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice));
  if (key !== "stock" && query.inStock) params.set("inStock", "1");
  if (query.sort !== "featured") params.set("sort", query.sort);
  const search = params.toString();
  return ("/nem" + (search ? "?" + search : "")) as never;
}

export function CatalogPage({ data, settings }: { data: CatalogData; settings: CatalogSettings }) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const contactHref = settings?.contactPhone
    ? "tel:" + settings.contactPhone
    : settings?.contactEmail
      ? "mailto:" + settings.contactEmail
      : null;

  const activeFilterCount =
    (data.query.search ? 1 : 0) +
    data.query.lines.length +
    (data.query.minPrice !== null ? 1 : 0) +
    (data.query.maxPrice !== null ? 1 : 0) +
    data.query.widths.length +
    data.query.thicknesses.length +
    (data.query.inStock ? 1 : 0);

  return (
    <div className="catalog-page bg-brand-canvas text-brand-ink">
      <main>
        <div className="mx-auto flex w-[min(calc(100%-40px),1280px)] items-center gap-2 pt-6 text-sm text-brand-copy md:w-[min(calc(100%-64px),1280px)]">
          <Link href="/" className="hover:text-brand-accent">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span>Bộ sưu tập nệm</span>
        </div>

        <section className="mx-auto mt-6 grid min-h-0 w-[min(calc(100%-40px),1280px)] overflow-hidden rounded-brand bg-brand-surface md:w-[min(calc(100%-64px),1280px)] lg:grid-cols-[42fr_58fr]">
          <div className="flex min-h-75 max-w-xl flex-col justify-center px-6 py-10 sm:px-10 lg:min-h-95 lg:px-14 lg:py-12">
            <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-brand-accent"><span className="h-px w-9 bg-brand-accent/70" />BỘ SƯU TẬP NỆM</p>
            <h1 className="max-w-[10ch] font-brand-display text-5xl leading-[1.06] font-semibold tracking-[-0.025em] sm:text-6xl">Tất cả sản phẩm</h1>
            <p className="mt-5 max-w-md text-base leading-[1.7] text-brand-copy">
              Khám phá bộ sưu tập nệm Thăng Long với đa dạng chất liệu, thiết kế và mức giá phù hợp nhu cầu nghỉ ngơi của gia đình Việt.
            </p>
          </div>
          <div className="relative min-h-65 bg-[#ded3c3] sm:min-h-80 lg:min-h-95" aria-hidden="true">
            <Image src="/images/homepage-hero.webp" alt="" fill sizes="(max-width: 1023px) 100vw, 58vw" priority className="object-cover" />
          </div>
        </section>

        <div className="catalog-mobile-controls container">
          <button
            type="button"
            className={"catalog-mobile-toggle-btn " + (mobileFilterOpen ? "is-active" : "")}
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            aria-expanded={mobileFilterOpen}
          >
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
          </button>
          <div className="catalog-mobile-sort-wrap">
            <span className="catalog-mobile-sort-label">Sắp xếp:</span>
            <select
              name="mobile-sort"
              defaultValue={data.query.sort}
              onChange={(e) => {
                const form = document.querySelector(".catalog-filter-form") as HTMLFormElement;
                if (form) {
                  const sortSelect = form.querySelector('select[name="sort"]') as HTMLSelectElement;
                  if (sortSelect) sortSelect.value = e.target.value;
                  form.submit();
                }
              }}
              className="catalog-mobile-sort-select"
            >
              <option value="featured">Nổi bật</option>
              {data.facets.hasVerifiedPrices && (
                <>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </>
              )}
              <option value="name-asc">Tên A–Z</option>
            </select>
          </div>
        </div>

        <div className="catalog-layout container">
          <aside className={"catalog-sidebar " + (mobileFilterOpen ? "is-open" : "is-collapsed")} aria-label="Bộ lọc sản phẩm">
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
                      ["khach-san", "Cao Su Khách Sạn"],
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
            {activeFilterCount > 0 && <div className="catalog-active-filters" aria-label="Bộ lọc đang chọn"><span>Đang lọc:</span>{data.query.search && <Link href={withoutFilter(data.query, "q")}>“{data.query.search}” <b aria-hidden="true">×</b></Link>}{data.query.lines.map((line) => <Link key={line} href={withoutFilter(data.query, "line", line)}>{line.replaceAll("-", " ")} <b aria-hidden="true">×</b></Link>)}{data.query.widths.map((width) => <Link key={width} href={withoutFilter(data.query, "width", width)}>{width} cm <b aria-hidden="true">×</b></Link>)}{data.query.thicknesses.map((thickness) => <Link key={thickness} href={withoutFilter(data.query, "thickness", thickness)}>{thickness} cm <b aria-hidden="true">×</b></Link>)}{(data.query.minPrice !== null || data.query.maxPrice !== null) && <Link href={withoutFilter(data.query, "price")}>Khoảng giá <b aria-hidden="true">×</b></Link>}{data.query.inStock && <Link href={withoutFilter(data.query, "stock")}>Còn hàng <b aria-hidden="true">×</b></Link>}<Link href="/nem" className="catalog-clear-filters">Xóa tất cả</Link></div>}
            {data.products.some((product) => product.hasPlaceholderPrices) && (
              <p className="catalog-demo-note">Giá và tồn kho trong UI Preview là dữ liệu thử nghiệm; giá chính thức được xác nhận khi tư vấn.</p>
            )}

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
