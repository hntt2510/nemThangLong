"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import type { CatalogData, CatalogQuery } from "@/lib/catalog";
import {
  X,
  RotateCcw,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown,
  Layers,
} from "lucide-react";

type CatalogSettings = { contactPhone: string | null; contactEmail: string | null } | null;

// Clean unified list ordered strictly per specification
const MATTRESS_LINES = [
  { id: "america", name: "Cao Su America (Giá tốt)" },
  { id: "classic", name: "Classic Truyền Thống" },
  { id: "hoat-tinh", name: "Than Hoạt Tính" },
  { id: "memory-foam", name: "Memory Foam" },
  { id: "cao-su-thien-nhien", name: "Cao Su Thiên Nhiên" },
  { id: "khach-san", name: "Khách Sạn Cao Cấp" },
];

function withoutFilter(
  query: CatalogQuery,
  key: "q" | "line" | "width" | "thickness" | "price" | "stock",
  value?: string | number
) {
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

function toggleLineUrl(query: CatalogQuery, lineId: string) {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);

  const exists = query.lines.includes(lineId);
  const nextLines = exists
    ? query.lines.filter((l) => l !== lineId)
    : [...query.lines, lineId];

  nextLines.forEach((l) => params.append("line", l));
  query.widths.forEach((w) => params.append("width", String(w)));
  query.thicknesses.forEach((t) => params.append("thickness", String(t)));
  if (query.minPrice !== null) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice));
  if (query.inStock) params.set("inStock", "1");
  if (query.sort !== "featured") params.set("sort", query.sort);

  const search = params.toString();
  return ("/nem" + (search ? "?" + search : "")) as never;
}

export function CatalogPage({ data, settings }: { data: CatalogData; settings: CatalogSettings }) {
  const router = useRouter();

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

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams();
    if (data.query.search) params.set("q", data.query.search);
    data.query.lines.forEach((item) => params.append("line", item));
    data.query.widths.forEach((item) => params.append("width", String(item)));
    data.query.thicknesses.forEach((item) => params.append("thickness", String(item)));
    if (data.query.minPrice !== null) params.set("minPrice", String(data.query.minPrice));
    if (data.query.maxPrice !== null) params.set("maxPrice", String(data.query.maxPrice));
    if (data.query.inStock) params.set("inStock", "1");
    if (newSort !== "featured") params.set("sort", newSort);
    const search = params.toString();
    router.push(("/nem" + (search ? "?" + search : "")) as never);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-stone-900">
      <main className="pb-24">
        {/* Breadcrumb navigation */}
        <div className="mx-auto flex w-[min(calc(100%-40px),1280px)] items-center gap-2 pt-6 text-xs sm:text-sm text-stone-500 md:w-[min(calc(100%-64px),1280px)]">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Trang chủ
          </Link>
          <span aria-hidden="true" className="text-stone-300">/</span>
          <span className="font-semibold text-stone-900">Bộ sưu tập nệm</span>
        </div>

        {/* Quiet Luxury Hero Header */}
        <section className="mx-auto mt-6 grid min-h-0 w-[min(calc(100%-40px),1280px)] overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs md:w-[min(calc(100%-64px),1280px)] lg:grid-cols-[45fr_55fr]">
          <div className="flex min-h-72 max-w-xl flex-col justify-center px-6 py-10 sm:px-10 lg:min-h-96 lg:px-14 lg:py-12">
            <p className="mb-4 flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-[#C5A880] uppercase">
              <span className="h-px w-8 bg-[#C5A880]/70" />
              BỘ SƯU TẬP CHÍNH HÃNG
            </p>
            <h1 className="font-brand-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 leading-[1.08]">
              Nệm Thăng Long
            </h1>
            <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-stone-600">
              Tuyển tập các dòng nệm công thái học cao cấp được chế tác riêng cho thể trạng và thói quen ngủ của người Việt, với bảo hành chính hãng tới 15 năm.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-500">
              <span className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle2 className="size-4 text-emerald-600" /> 100% Nguyên liệu kiểm định Quatest 3
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle2 className="size-4 text-emerald-600" /> Miễn phí vận chuyển tận giường
              </span>
            </div>
          </div>

          <div className="relative min-h-64 bg-[#ded3c3] sm:min-h-80 lg:min-h-96" aria-hidden="true">
            <Image
              src="/images/homepage-hero.webp"
              alt="Bộ sưu tập nệm Thăng Long trong không gian phòng ngủ thanh lịch"
              fill
              sizes="(max-width: 1023px) 100vw, 55vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />
          </div>
        </section>

        {/* Clean, Unified Horizontal Filter & Sort Bar (Zero Duplicate Clutter) */}
        <section className="sticky top-16 z-20 mx-auto mt-8 w-[min(calc(100%-40px),1280px)] border-y border-stone-200/90 bg-[#FBFBF9]/95 py-3.5 backdrop-blur-md md:w-[min(calc(100%-64px),1280px)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Horizontal Line Pills */}
            <div className="-mx-2 flex items-center gap-1.5 overflow-x-auto px-2 pb-1 lg:pb-0 scrollbar-none">
              {/* All button */}
              <Link
                href="/nem"
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  data.query.lines.length === 0
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-white text-stone-700 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-100"
                }`}
              >
                Tất cả ({data.total})
              </Link>

              {/* Dòng Nệm Pills */}
              {MATTRESS_LINES.map((line) => {
                const isActive = data.query.lines.includes(line.id);
                return (
                  <Link
                    key={line.id}
                    href={toggleLineUrl(data.query, line.id)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#1E3A5F] !text-white shadow-xs font-bold ring-1 ring-[#1E3A5F]"
                        : "bg-white text-stone-700 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-100"
                    }`}
                    style={{
                      backgroundColor: isActive ? "#1E3A5F" : undefined,
                      color: isActive ? "#ffffff" : undefined,
                    }}
                  >
                    {line.name}
                  </Link>
                );
              })}
            </div>

            {/* Right-Aligned Quick Sort Dropdown */}
            <div className="flex items-center justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-200/60">
              <div className="relative inline-flex items-center">
                <span className="sr-only">Sắp xếp danh mục</span>
                <select
                  value={data.query.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-xl border border-stone-300/90 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 shadow-2xs focus:border-stone-900 focus:outline-none cursor-pointer pr-8"
                  aria-label="Sắp xếp sản phẩm"
                >
                  <option value="featured">Bán chạy nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A → Z</option>
                </select>
                <ArrowUpDown className="pointer-events-none absolute right-2.5 size-3.5 text-stone-400" />
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-stone-200/60">
              <span className="text-stone-500 font-medium">Đang lọc:</span>

              {data.query.search && (
                <Link
                  href={withoutFilter(data.query, "q")}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-200/80 px-2 py-0.5 font-semibold text-stone-800 hover:bg-stone-300"
                >
                  “{data.query.search}” <X className="size-3" />
                </Link>
              )}

              {data.query.lines.map((line) => {
                const matched = MATTRESS_LINES.find((m) => m.id === line);
                return (
                  <Link
                    key={line}
                    href={withoutFilter(data.query, "line", line)}
                    className="inline-flex items-center gap-1 rounded-md bg-stone-200/80 px-2 py-0.5 font-semibold text-stone-800 hover:bg-stone-300"
                  >
                    {matched ? matched.name : line.replaceAll("-", " ")} <X className="size-3" />
                  </Link>
                );
              })}

              {data.query.widths.map((w) => (
                <Link
                  key={w}
                  href={withoutFilter(data.query, "width", w)}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-200/80 px-2 py-0.5 font-semibold text-stone-800 hover:bg-stone-300"
                >
                  Rộng {w}cm <X className="size-3" />
                </Link>
              ))}

              {data.query.thicknesses.map((t) => (
                <Link
                  key={t}
                  href={withoutFilter(data.query, "thickness", t)}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-200/80 px-2 py-0.5 font-semibold text-stone-800 hover:bg-stone-300"
                >
                  Dày {t}cm <X className="size-3" />
                </Link>
              ))}

              <Link
                href="/nem"
                className="inline-flex items-center gap-1 font-bold text-[#C5A880] hover:underline ml-2"
              >
                <RotateCcw className="size-3" /> Xóa tất cả bộ lọc
              </Link>
            </div>
          )}
        </section>

        {/* Product Grid Area */}
        <section className="mx-auto mt-8 w-[min(calc(100%-40px),1280px)] md:w-[min(calc(100%-64px),1280px)]">
          {data.total > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {data.products.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-16 px-6 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <Search className="size-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-stone-900 font-brand-display">
                Không tìm thấy nệm phù hợp
              </h3>
              <p className="mt-2 max-w-md text-sm text-stone-500">
                Hãy thử chọn dòng nệm khác hoặc xóa bộ lọc để xem toàn bộ danh mục.
              </p>
              <Link
                href={"/nem" as never}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold !text-white hover:bg-stone-800 transition-all shadow-xs"
                style={{ backgroundColor: "#1c1917", color: "#ffffff" }}
              >
                Xem toàn bộ sản phẩm
              </Link>
            </div>
          )}
        </section>

        {/* Mattress Finder Teaser Section */}
        <section className="mx-auto mt-16 w-[min(calc(100%-40px),1280px)] overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-r from-stone-900 to-[#1E3A5F] p-8 text-white shadow-lg md:w-[min(calc(100%-64px),1280px)] md:p-12">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#C5A880] uppercase tracking-widest backdrop-blur-xs">
                <Layers className="size-3.5" /> Sleep Ergonomics Finder
              </span>
              <h2 className="mt-3 font-brand-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                Chưa chắc dòng nệm nào phù hợp nhất với bạn?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300 md:text-base">
                Chỉ mất 60 giây trả lời 4 câu hỏi về tư thế nằm, thói quen sinh hoạt và kích thước giường để nhận ngay gợi ý nệm chuyên biệt cùng thang đo công thái học chính xác.
              </p>
            </div>
            <div className="flex md:col-span-4 md:justify-end">
              <Link
                href={"/tim-nem" as never}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C5A880] hover:bg-[#b0936b] px-6 py-4 text-sm font-bold text-stone-950 shadow-md transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                <span>Bắt đầu tìm nệm ngay</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Direct Consultation Strip */}
        <section className="mx-auto mt-12 w-[min(calc(100%-40px),1280px)] rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-xs md:w-[min(calc(100%-64px),1280px)]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
            TƯ VẤN TRỰC TIẾP TỪ CHUYÊN GIA
          </p>
          <h2 className="mt-2 text-2xl font-bold text-stone-900 md:text-3xl font-brand-display">
            Cần trao đổi trực tiếp với kỹ sư nệm Thăng Long?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">
            Đội ngũ tư vấn giàu kinh nghiệm luôn sẵn sàng giải đáp về vật liệu, độ cứng và chế độ bảo hành tại nhà.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {contactHref ? (
              <a
                href={contactHref}
                className="inline-flex items-center justify-center rounded-xl bg-[#1E3A5F] hover:bg-[#152843] px-6 py-3 text-sm font-bold !text-white shadow-xs transition-all cursor-pointer"
                style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
              >
                Gọi tư vấn miễn phí
              </a>
            ) : null}
            <Link
              href={"/showrooms" as never}
              className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-6 py-3 text-sm font-bold text-stone-800 transition-all shadow-xs"
            >
              Xem hệ thống 7 showroom
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
