"use client";

import { getProductTechSpec, type ProductTechSpec } from "@/lib/product-specs";
import {
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Layers,
  Wind,
  Check,
} from "lucide-react";

interface ProductSpecGridProps {
  productSlug?: string;
  className?: string;
}

export function ProductSpecGrid({ productSlug, className = "" }: ProductSpecGridProps) {
  const spec: ProductTechSpec = getProductTechSpec(productSlug);

  return (
    <section
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 ${className}`}
      aria-labelledby="master-spec-heading"
    >
      {/* Section Header */}
      <div className="border-b border-stone-200 pb-6 mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#C8A27A]">
          TIÊU CHUẨN KỸ THUẬT & CHẾ TÁC
        </p>
        <h2
          id="master-spec-heading"
          className="mt-2 font-brand-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1A2530]"
        >
          Thông Số Kỹ Thuật & Tiêu Chuẩn Chế Tác
        </h2>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600 leading-relaxed">
          Minh bạch 100% về nguồn gốc xuất xứ, thông số giải phẫu vật liệu và hệ thống chứng nhận kiểm định chất lượng chính thức từ Nệm Thăng Long.
        </p>
      </div>

      {/* Luxury Specification Bento Grid: 40% Editorial Craft Story | 60% Luxury Spec Sheet */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* LEFT COLUMN: 40% Width (5 Cols) - Editorial Craft Story Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-br from-[#FAF9F6] to-[#F3EDE2] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#C8A27A] shadow-xs">
                <Sparkles className="size-3.5" /> Chuẩn Mực Chế Tác
              </span>
              <span className="text-xs font-semibold text-stone-500">
                Xuất xứ: {spec.origin}
              </span>
            </div>

            {/* Brand & Manufacturer Intro */}
            <div className="mt-5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                DÒNG SẢN PHẨM CHÍNH HÃNG
              </span>
              <h3 className="mt-1 font-brand-display text-2xl font-bold text-[#1A2530]">
                {spec.brand}
              </h3>
              <p className="mt-1 text-xs text-stone-600">
                Sản xuất và phân phối bởi {spec.manufacturer}
              </p>
            </div>

            {/* Core Pillars */}
            <div className="mt-6 space-y-4 border-t border-stone-200/70 pt-6">
              {/* Pillar 1: Spine Support */}
              <div className="flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1A2530] shadow-xs">
                  <Layers className="size-4.5 text-[#C8A27A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A2530]">
                    Nâng Đỡ Cột Sống Y Khoa
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {spec.spineSupportRating}. Phân bổ áp lực đồng đều, ngăn chặn cong vẹo và thoái hóa cột sống thắt lưng.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Breathability */}
              <div className="flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1A2530] shadow-xs">
                  <Wind className="size-4.5 text-[#C8A27A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A2530]">
                    Hệ Thống Thoáng Khí Đa Chiều
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {spec.ventilationTech}.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Warranty */}
              <div className="flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1A2530] shadow-xs">
                  <ShieldCheck className="size-4.5 text-[#C8A27A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A2530]">
                    Bảo Hành Chính Hãng {spec.warrantyYears} Năm
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Cam kết bảo hành xẹp lún và lỗi kết cấu tại nhà trên toàn quốc theo phiếu bảo hành điện tử chính thức.
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications Strip */}
            <div className="mt-6 border-t border-stone-200/70 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                Chứng nhận kiểm định chất lượng
              </p>
              <div className="flex flex-wrap gap-2">
                {spec.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-2xs"
                  >
                    <Award className="size-3.5 text-[#C8A27A]" />
                    <span>{cert}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Ideal For Highlight */}
            <div className="mt-6 rounded-2xl bg-white/70 p-4 border border-stone-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A2530]">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Khuyến nghị người dùng</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-stone-700 font-medium">
                {spec.idealFor}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 60% Width (7 Cols) - Structured Luxury Spec Sheet */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="border-b border-stone-200 bg-[#FAF9F6] px-6 py-4.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                BẢNG THÔNG SỐ CHI TIẾT
              </span>
              <span className="rounded-md bg-stone-200/80 px-2.5 py-1 text-xs font-mono font-bold text-stone-800">
                Mã dòng: {spec.brand}
              </span>
            </div>

            <dl className="divide-y divide-stone-150">
              {/* Row 1: Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Thương hiệu
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-bold text-[#1A2530] sm:col-span-8">
                  {spec.brand}
                </dd>
              </div>

              {/* Row 2: Manufacturer */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70 bg-[#FAF9F6]/40">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Đơn vị sản xuất
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-800 sm:col-span-8">
                  {spec.manufacturer}
                </dd>
              </div>

              {/* Row 3: Core Material */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Cấu trúc lõi nâng đỡ
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-bold text-[#1A2530] sm:col-span-8 leading-relaxed">
                  {spec.coreMaterial}
                </dd>
              </div>

              {/* Row 4: Cover Material */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70 bg-[#FAF9F6]/40">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Chất liệu áo nệm
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-800 sm:col-span-8 leading-relaxed">
                  {spec.coverMaterial}
                </dd>
              </div>

              {/* Row 5: Firmness Index */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Độ cứng công thái học
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-bold text-[#1A2530] sm:col-span-8">
                  <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-[#1A2530] border border-stone-200">
                    {spec.firmnessIndex}
                  </span>
                </dd>
              </div>

              {/* Row 6: Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70 bg-[#FAF9F6]/40">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Kích thước tiêu chuẩn
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-mono font-semibold text-stone-800 sm:col-span-8">
                  {spec.dimensions}
                </dd>
              </div>

              {/* Row 7: Thickness Options */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Độ dày khả dụng
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-bold text-[#1A2530] sm:col-span-8">
                  {spec.thicknessOptions}
                </dd>
              </div>

              {/* Row 8: Ventilation */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70 bg-[#FAF9F6]/40">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Công nghệ thoáng khí
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-800 sm:col-span-8 leading-relaxed">
                  {spec.ventilationTech}
                </dd>
              </div>

              {/* Row 9: Spine Support Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Bảo vệ cột sống
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-800 sm:col-span-8 leading-relaxed">
                  {spec.spineSupportRating}
                </dd>
              </div>

              {/* Row 10: Washable Cover */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70 bg-[#FAF9F6]/40">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Khóa kéo & Vệ sinh
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-semibold sm:col-span-8 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="size-3.5 stroke-[3]" />
                  </span>
                  <span className="text-stone-800">
                    {spec.washableCover
                      ? "Khóa kéo viền tháo rời vỏ giặt vệ sinh định kỳ tiện lợi"
                      : "Áo nệm chần đa tầng kiên cố, khuyến nghị dùng ga bảo vệ chống thấm"}
                  </span>
                </dd>
              </div>

              {/* Row 11: Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Thời gian bảo hành
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-bold text-emerald-800 sm:col-span-8">
                  {spec.warrantyYears} năm chính hãng tại nhà
                </dd>
              </div>

              {/* Row 12: Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 transition-colors hover:bg-stone-50/70 bg-[#FAF9F6]/40">
                <dt className="text-xs sm:text-sm font-semibold text-stone-500 sm:col-span-4">
                  Tiêu chuẩn kiểm định
                </dt>
                <dd className="mt-1 sm:mt-0 text-xs sm:text-sm font-semibold text-stone-800 sm:col-span-8">
                  {spec.certifications.join(" • ")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
