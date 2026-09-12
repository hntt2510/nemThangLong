"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Activity,
  Moon,
  Sparkles,
  BedDouble,
  ShieldCheck,
  MapPin,
  PhoneCall,
} from "lucide-react";

export interface ErgonomicLevel {
  id: string;
  name: string;
  firmnessScore: number;
  firmnessLabel: string;
  targetAudience: string;
  spineBenefit: string;
  showroomExperience: string;
  recommendedMattress: string;
  image: string;
  imageAlt: string;
  tag: string;
}

export const ERGONOMIC_LEVELS: ErgonomicLevel[] = [
  {
    id: "vung-chai",
    name: "Cấp độ Vững Chãi (Firm)",
    firmnessScore: 8.5,
    firmnessLabel: "8.5 / 10",
    targetAudience: "Người lớn tuổi, người đau dây thần kinh tọa & thoát vị đĩa đệm",
    spineBenefit:
      "Bề mặt phẳng tự nhiên, không xẹp lún, giữ thẳng trục đốt sống suốt đêm. Giúp phân bổ lực cân đối và giảm tối đa áp lực tì đè lên thắt lưng.",
    showroomExperience:
      "Nằm thử độ đàn hồi tự nhiên từ mủ cao su 100% tại xưởng.",
    recommendedMattress: "Nệm Thăng Long Cao Su Thiên Nhiên",
    image: "/images/homepage-natural-latex.webp",
    imageAlt: "Nệm cao su thiên nhiên nâng đỡ vững chãi cột sống",
    tag: "NÂNG ĐỠ CỘT SỐNG TỐI ĐA",
  },
  {
    id: "can-bang",
    name: "Cấp độ Cân Bằng (Medium Firm)",
    firmnessScore: 7.0,
    firmnessLabel: "7.0 / 10",
    targetAudience: "Vợ chồng có thể trạng khác nhau, thích đàn hồi êm ái",
    spineBenefit:
      "Khử lực chuyển động, trở mình êm ái không ảnh hưởng người bên cạnh. Cân bằng tối ưu giữa độ êm ái bề mặt và độ nảy nâng đỡ cơ thể.",
    showroomExperience:
      "Thử độ êm vùng vai gáy và khả năng cách ly rung động.",
    recommendedMattress: "Nệm Thăng Long Luxury / Classic",
    image: "/images/homepage-hotel.webp",
    imageAlt: "Nệm cân bằng đàn hồi êm ái chuẩn resort",
    tag: "CÂN BẰNG & KHỬ CHUYỂN ĐỘNG",
  },
  {
    id: "em-ai",
    name: "Cấp độ Êm Ái Thư Giãn (Plush)",
    firmnessScore: 6.0,
    firmnessLabel: "6.0 / 10",
    targetAudience: "Người thích cảm giác ôm trọn đường cong cơ thể, hay ngủ nghiêng",
    spineBenefit:
      "Ôm sát và giải tỏa áp lực điểm tì đè tại vai gáy và hông sau ngày làm việc. Thư giãn tối đa các bó cơ, hỗ trợ tuần hoàn máu lưu thông êm ái.",
    showroomExperience:
      "Nằm thử độ êm bồng bềnh tiêu chuẩn phòng Suite khách sạn 5 sao.",
    recommendedMattress: "Nệm Thăng Long Memory Foam / Hoạt Tính",
    image: "/images/homepage-latex.webp",
    imageAlt: "Nệm bề mặt vải êm và memory foam ôm trọn đường cong cơ thể",
    tag: "GIẢI TỎA ÁP LỰC VAI GÁY",
  },
];

// Retain legacy type and alias for backward compatibility
export type ComfortFeelingCard = ErgonomicLevel;
export const DEFAULT_COMFORT_CARDS = ERGONOMIC_LEVELS;

export function ComfortFeelingSection() {
  const [activeLevelId, setActiveLevelId] = useState<string>(ERGONOMIC_LEVELS[0].id);

  const handleScrollToShowrooms = (e: React.MouseEvent) => {
    e.preventDefault();
    const showroomSection = document.getElementById("showrooms");
    if (showroomSection) {
      showroomSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-12 lg:py-20 bg-stone-50/50" id="shop-by-need">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1E3A5F]/8 px-3.5 py-1.5 text-xs font-bold text-[#1E3A5F] mb-3 border border-[#1E3A5F]/15">
            <Activity className="size-3.5 text-[#1E3A5F]" aria-hidden="true" />
            <span>CÔNG THÁI HỌC GIẤC NGỦ &amp; NÂNG ĐỠ CỘT SỐNG</span>
          </div>

          <h2 className="font-brand-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Thanh đo công thái học 3 cấp độ nâng đỡ cột sống.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Không có tấm nệm hoàn hảo cho tất cả mọi người. Chọn đúng độ cứng nâng đỡ tương thích với cấu trúc đốt sống lưng là chìa khóa để thức dậy tràn đầy sinh lực.
          </p>
        </div>

        {/* 3-Card Responsive Ergonomic Barometer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
          {ERGONOMIC_LEVELS.map((level, idx) => {
            const isSelected = activeLevelId === level.id;
            return (
              <article
                key={level.id}
                onClick={() => setActiveLevelId(level.id)}
                className={`group flex flex-col w-full overflow-hidden rounded-3xl border transition-all duration-300 ease-out cursor-pointer ${
                  isSelected
                    ? "border-[#1E3A5F] bg-white shadow-xl ring-2 ring-[#1E3A5F]/20 -translate-y-1"
                    : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {/* Visual Image & Firmness Gauge Banner */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={level.image}
                    alt={level.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Top Badge: Category Tag */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-amber-300 shadow-md border border-amber-400/30">
                      <Sparkles className="size-3 text-amber-300" />
                      <span>{level.tag}</span>
                    </span>

                    <span className="text-[11px] font-bold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      Cấp {idx + 1}/3
                    </span>
                  </div>

                  {/* Bottom Bar on Image: Interactive Firmness Meter */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 z-10 text-white">
                    <div className="flex items-end justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200">
                        Độ vững chãi cột sống
                      </span>
                      <span className="text-base font-extrabold text-amber-300 font-mono">
                        {level.firmnessLabel}
                      </span>
                    </div>

                    {/* Progress Barometer Track */}
                    <div className="w-full h-2 rounded-full bg-white/20 backdrop-blur-xs overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500"
                        style={{ width: `${level.firmnessScore * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body: Ergonomic & Health Breakdown */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Card Title */}
                  <div className="flex items-center gap-2 mb-2">
                    {idx === 0 && <ShieldCheck className="size-5 text-[#C89D66] shrink-0" />}
                    {idx === 1 && <Moon className="size-5 text-[#1E3A5F] shrink-0" />}
                    {idx === 2 && <BedDouble className="size-5 text-emerald-600 shrink-0" />}
                    <h3 className="font-brand-display text-xl font-bold text-slate-900 tracking-tight">
                      {level.name}
                    </h3>
                  </div>

                  {/* Target Sleeper Badge */}
                  <div className="mt-1 mb-3 rounded-lg bg-slate-100/90 px-3 py-2 text-xs font-medium text-slate-700 leading-snug">
                    <strong className="text-slate-900">Phù hợp:</strong> {level.targetAudience}
                  </div>

                  {/* Spine Benefit / Mechanism */}
                  <p className="text-sm leading-relaxed text-slate-600 flex-1">
                    {level.spineBenefit}
                  </p>

                  {/* Real Showroom Experience Box */}
                  <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 transition-colors">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                      <span className="text-sm">📍</span>
                      <span>Trải nghiệm thực tế tại Showroom:</span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
                      &ldquo;{level.showroomExperience}&rdquo;
                    </p>
                  </div>

                  {/* Representative Mattress Hint */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Dòng nệm tiêu biểu:</span>
                    <span className="font-bold text-[#1E3A5F]">
                      {level.recommendedMattress}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Quiet Luxury Brand Commitment Banner */}
        <div className="mt-12 lg:mt-16 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-slate-900 via-[#1E3A5F] to-slate-900 p-8 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Subtle gold accent lighting */}
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-[#C89D66]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-amber-300 border border-amber-400/30 mb-5">
              <Sparkles className="size-3.5 text-amber-300" />
              <span>CAM KẾT THỰC NGHIỆM CHUẨN CÔNG THÁI HỌC</span>
            </span>

            <h3 className="font-brand-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
              &ldquo;Mỗi cơ thể có một cấu trúc cột sống riêng.
              <span className="block text-amber-200 mt-1">Đừng mua nệm chỉ qua hình ảnh.&rdquo;</span>
            </h3>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Độ cứng mềm trên ảnh hay thông số chỉ mang tính tham khảo. Chúng tôi áp dụng chính sách <strong>100 đêm trải nghiệm tại nhà</strong> và khuyến khích bạn ghé nằm thử trực tiếp ở mọi tư thế tại hệ thống 7 showroom xưởng Thăng Long.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <a
                href="#showrooms"
                onClick={handleScrollToShowrooms}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl !bg-[#C89D66] hover:!bg-[#b58b56] px-7 py-4 text-sm font-bold !text-slate-950 shadow-lg transition-all cursor-pointer hover:shadow-amber-500/20"
                style={{ backgroundColor: "#C89D66", color: "#0f172a" }}
              >
                <MapPin className="size-4 text-slate-950 shrink-0" />
                <span className="!text-slate-950 font-bold" style={{ color: "#0f172a" }}>
                  Trải nghiệm nằm thử miễn phí tại 7 Showroom
                </span>
              </a>

              <a
                href="tel:0911251004"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-4 text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <PhoneCall className="size-4 text-amber-300 shrink-0 animate-pulse" />
                <span>Gọi trực tiếp chủ xưởng tư vấn dáng nằm: 0911 251 004</span>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Kỹ thuật viên xưởng hỗ trợ kiểm tra độ lún cột sống & đổi độ dày/độ cứng miễn phí trong 100 đêm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
