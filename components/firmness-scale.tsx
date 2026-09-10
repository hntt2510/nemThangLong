"use client";

import { useMemo } from "react";
import { PRODUCT_ANATOMIES } from "@/lib/product-anatomy";

interface FirmnessScaleProps {
  slug?: string;
  score?: number; // 1 to 10
  className?: string;
}

const FIRMNESS_PRESETS: Record<string, { score: number; label: string; suit: string }> = {
  classic: {
    score: 7.0,
    label: "Cứng vừa (Medium Firm)",
    suit: "Tối ưu cho người quen nằm phẳng, hỗ trợ phục hồi thắt lưng.",
  },
  "cao-su-thien-nhien": {
    score: 6.0,
    label: "Vừa vặn êm ái (Medium Comfort)",
    suit: "Đàn hồi tự nhiên ôm sát đường cong, phù hợp nằm nghiêng và ngửa.",
  },
  "hoat-tinh": {
    score: 8.0,
    label: "Nâng đỡ chỉnh hình (Firm Orthopedic)",
    suit: "Định hình cột sống thẳng, khử ẩm mốc, khuyên dùng cho người lớn tuổi.",
  },
  "memory-foam": {
    score: 5.5,
    label: "Êm ái giải tỏa áp lực (Contoured Comfort)",
    suit: "Phân tán điểm tỳ đè tại bả vai và hông, cách ly chuyển động hoàn hảo.",
  },
  america: {
    score: 6.5,
    label: "Cân bằng tiêu chuẩn (Balanced Support)",
    suit: "Độ cứng hài hòa cho mọi thành viên trong gia đình.",
  },
  "khach-san": {
    score: 7.2,
    label: "Chuẩn lưu trú 5 sao (Hotel Luxury Firm)",
    suit: "Vững chãi, êm sâu, nâng niu giấc ngủ nghỉ dưỡng đẳng cấp.",
  },
};

export function FirmnessScale({ slug, score: customScore, className = "" }: FirmnessScaleProps) {
  const info = useMemo(() => {
    if (customScore !== undefined) {
      const clamped = Math.max(1, Math.min(10, customScore));
      let label = "Cân bằng tiêu chuẩn";
      if (clamped <= 4) label = "Mềm (Plush)";
      else if (clamped <= 6) label = "Vừa vặn (Medium Comfort)";
      else if (clamped <= 7.5) label = "Cứng vừa (Medium Firm)";
      else label = "Nâng đỡ chỉnh hình (Firm Orthopedic)";

      return {
        score: clamped,
        label,
        suit: "Độ nâng đỡ công thái học phù hợp thể trạng người Việt.",
      };
    }

    if (slug && PRODUCT_ANATOMIES[slug]) {
      const anat = PRODUCT_ANATOMIES[slug];
      const preset = FIRMNESS_PRESETS[slug];
      return {
        score: anat.firmnessScore,
        label: anat.firmnessLabel,
        suit: preset ? preset.suit : "Độ nâng đỡ công thái học phù hợp thể trạng người Việt.",
      };
    }

    if (slug && FIRMNESS_PRESETS[slug]) {
      return FIRMNESS_PRESETS[slug];
    }

    return {
      score: 6.5,
      label: "Cân bằng nâng đỡ (Balanced 6.5/10)",
      suit: "Độ phẳng và độ đàn hồi hài hòa, bảo vệ đường cong sinh lý cột sống.",
    };
  }, [slug, customScore]);

  // Map 1-10 score to percentage (0% to 100%)
  const percentage = Math.max(5, Math.min(95, ((info.score - 1) / 9) * 100));

  return (
    <div className={`firmness-scale-component rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 uppercase tracking-wider font-bold">Thang đo độ cứng</span>
        <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
          {info.score}/10 · {info.label}
        </span>
      </div>

      {/* Visual Track */}
      <div className="relative mt-3 pt-2 pb-1">
        {/* Gradient bar from soft cream to deep slate */}
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#EAE4DC] via-[#C8A27A] to-[#1E3A5F] shadow-inner" />

        {/* Pin Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none"
          style={{ left: `${percentage}%` }}
        >
          <div className="size-4.5 rounded-full border-2 border-white bg-slate-950 shadow-md ring-2 ring-[#C8A27A]" />
        </div>
      </div>

      {/* Labels below track */}
      <div className="mt-1 flex justify-between text-[11px] text-slate-400 font-medium">
        <span>Mềm (3-4)</span>
        <span>Vừa vặn (5-6)</span>
        <span className="font-semibold text-slate-700">Cứng vừa (7)</span>
        <span>Chỉnh hình (8-9)</span>
      </div>

      {/* Description Suitability */}
      <p className="mt-2.5 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-2 flex items-start gap-1.5">
        <span className="text-[#C8A27A] font-bold">●</span>
        <span>{info.suit}</span>
      </p>
    </div>
  );
}
