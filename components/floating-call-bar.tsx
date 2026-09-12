"use client";

import { PhoneCall, MapPin } from "lucide-react";

interface FloatingCallBarProps {
  phone?: string;
}

export function FloatingCallBar({ phone = "0911 251 004" }: FloatingCallBarProps) {
  const telNumber = phone.replace(/\s+/g, "");

  return (
    <aside
      aria-label="Thanh liên hệ nhanh"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 backdrop-blur-md lg:hidden shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.15)]"
    >
      <div className="mx-auto flex max-w-md items-center gap-2">
        {/* Button 1: Call Owner Now */}
        <a
          href={`tel:${telNumber}`}
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 !text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer text-center px-2 transition-transform active:scale-[0.98]"
          style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
        >
          <PhoneCall className="size-4 text-white shrink-0 animate-pulse" aria-hidden="true" />
          <span className="truncate">📞 Gọi ngay ({phone})</span>
        </a>

        {/* Button 2: Find Nearest Showroom */}
        <a
          href="/showrooms"
          className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl bg-[#1E3A5F] hover:bg-[#152843] active:bg-[#0f1d31] !text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer text-center px-2 transition-transform active:scale-[0.98]"
          style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
        >
          <MapPin className="size-4 text-white shrink-0" aria-hidden="true" />
          <span className="truncate">📍 Tìm showroom gần nhất</span>
        </a>
      </div>
    </aside>
  );
}
