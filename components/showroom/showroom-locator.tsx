"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  GENERAL_HOTLINE,
  GENERAL_HOURS,
  PROVINCES,
  type ProvinceFilter,
  SHOWROOMS_DATA,
  type ShowroomWithDistance,
  calculateHaversineDistanceKm,
  getGoogleMapsDirectionsUrl,
  sanitizePhoneForTel,
} from "@/lib/showrooms";

interface ShowroomLocatorProps {
  className?: string;
  contactPhone?: string | null;
}

type GeoState = "idle" | "locating" | "located" | "denied" | "unsupported";

export function ShowroomLocator({ className = "", contactPhone }: ShowroomLocatorProps) {
  const [selectedId, setSelectedId] = useState<string>(SHOWROOMS_DATA[0].id);
  const [activeProvince, setActiveProvince] = useState<ProvinceFilter>("Tất cả");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const reduceMotion = useReducedMotion();
  const hotline = contactPhone || GENERAL_HOTLINE;
  const telHref = `tel:${sanitizePhoneForTel(hotline)}`;

  // Handle GPS Request
  const handleRequestLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      setGeoMessage("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setGeoState("locating");
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setGeoState("located");
        setActiveProvince("Tất cả"); // Reset province filter so all sorted by distance
      },
      (error) => {
        setGeoState("denied");
        if (error.code === error.PERMISSION_DENIED) {
          setGeoMessage("Đã từ chối quyền vị trí. Vui lòng chọn theo tỉnh thành bên dưới.");
        } else {
          setGeoMessage("Không thể xác định tọa độ lúc này. Vui lòng chọn theo tỉnh thành.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Compute distances and sort
  const showroomsWithDistance: ShowroomWithDistance[] = useMemo(() => {
    const list: ShowroomWithDistance[] = SHOWROOMS_DATA.map((showroom) => {
      if (!userCoords) return { ...showroom, distanceKm: undefined };
      const dist = calculateHaversineDistanceKm(
        userCoords.lat,
        userCoords.lng,
        showroom.lat,
        showroom.lng
      );
      return {
        ...showroom,
        distanceKm: dist,
      };
    });

    if (userCoords) {
      // Sort ascending by distance
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return list;
  }, [userCoords]);

  // If user coordinates just arrived, auto-select nearest showroom
  const nearestShowroom = userCoords && showroomsWithDistance.length > 0 ? showroomsWithDistance[0] : null;

  // Filter by province
  const filteredShowrooms = useMemo(() => {
    if (activeProvince === "Tất cả") {
      return showroomsWithDistance;
    }
    return showroomsWithDistance.filter((s) => s.province === activeProvince);
  }, [showroomsWithDistance, activeProvince]);

  // Selected showroom object
  const activeShowroom = useMemo(() => {
    return (
      filteredShowrooms.find((s) => s.id === selectedId) ||
      showroomsWithDistance.find((s) => s.id === selectedId) ||
      filteredShowrooms[0] ||
      SHOWROOMS_DATA[0]
    );
  }, [filteredShowrooms, showroomsWithDistance, selectedId]);

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[45fr_55fr] lg:gap-12 items-start">
        {/* Left Column: Editorial & Context */}
        <div className="flex flex-col justify-start">
          <span className="text-[#C89D66] font-bold text-xs uppercase tracking-widest mb-3 block">
            HỆ THỐNG TRẢI NGHIỆM CHÍNH HÃNG
          </span>

          <h2 className="text-slate-900 font-bold tracking-tight text-3xl sm:text-4xl">
            Trải nghiệm 100 đêm thử nệm tại 7 showroom Nệm Thăng Long.
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
            Nệm là sản phẩm gắn bó 8 tiếng mỗi ngày suốt hơn 10 năm. Chúng tôi luôn khuyến khích quý khách đến nằm thử trực tiếp ở mọi tư thế để cảm nhận độ đàn hồi, độ thoáng khí và sự nâng đỡ cột sống tự nhiên.
          </p>

          {/* Value Props Strip */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]/8 text-[#1E3A5F]">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">Tư vấn chuẩn cột sống</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Đội ngũ chuyên viên am hiểu công thái học giấc ngủ.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]/8 text-[#1E3A5F]">
                <Clock className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">Mở cửa 7 ngày/tuần</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  07:30 - 21:00 hàng ngày, có chỗ đậu xe ô tô rộng rãi.
                </p>
              </div>
            </div>
          </div>

          {/* GPS Quick Action Button */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={geoState === "locating"}
                className="inline-flex items-center justify-center gap-2 rounded-xl !bg-[#1E3A5F] bg-[#1E3A5F] hover:!bg-[#152843] hover:bg-[#152843] px-6 py-3.5 text-sm font-semibold !text-white shadow-md transition-all cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
              >
                <Compass className={`size-4 text-white ${geoState === "locating" ? "animate-spin" : ""}`} aria-hidden="true" />
                <span className="!text-white font-semibold text-sm" style={{ color: "#ffffff" }}>
                  {geoState === "locating"
                    ? "Đang tìm vị trí của bạn..."
                    : geoState === "located"
                      ? "Cập nhật lại vị trí GPS"
                      : "Tìm showroom gần tôi nhất (GPS)"}
                </span>
              </button>

              <a
                href={telHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 !bg-white bg-white hover:border-slate-400 hover:!bg-slate-50 px-5 py-3.5 text-sm font-semibold !text-slate-800 shadow-sm transition-all cursor-pointer"
                style={{ backgroundColor: "#ffffff", color: "#1e293b" }}
              >
                <PhoneCall className="size-4 text-[#C89D66]" aria-hidden="true" />
                <span className="!text-slate-800 font-semibold text-sm" style={{ color: "#1e293b" }}>
                  {hotline}
                </span>
              </a>
            </div>

            {/* GPS Feedback Message */}
            {geoMessage ? (
              <p className="mt-2.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-1.5 inline-block">
                {geoMessage}
              </p>
            ) : null}

            {geoState === "located" && nearestShowroom ? (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-lg px-3 py-2">
                <Sparkles className="size-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  Đã tìm thấy chi nhánh gần bạn nhất: <strong>{nearestShowroom.name}</strong>
                  {nearestShowroom.distanceKm !== undefined ? ` (cách ~${nearestShowroom.distanceKm} km)` : ""}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Interactive Locator Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-lg">
          {/* Header & Province Filters */}
          <div className="flex flex-col gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-[#C89D66]" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-900">
                  Hệ thống 7 Chi Nhánh
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredShowrooms.length} địa điểm
              </span>
            </div>

            {/* Province Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROVINCES.map((prov) => {
                const isActive = activeProvince === prov;
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      setActiveProvince(prov);
                      // If current selected is not in filtered list, auto-select first matching
                      const inList =
                        prov === "Tất cả"
                          ? true
                          : SHOWROOMS_DATA.some((s) => s.province === prov && s.id === selectedId);
                      if (!inList) {
                        const firstInProv = SHOWROOMS_DATA.find((s) => s.province === prov);
                        if (firstInProv) setSelectedId(firstInProv.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "!bg-[#1E3A5F] !text-white shadow-sm"
                        : "!bg-slate-100 !text-slate-700 hover:!bg-slate-200"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "#1E3A5F", color: "#ffffff" }
                        : { backgroundColor: "#f1f5f9", color: "#334155" }
                    }
                  >
                    <span style={{ color: isActive ? "#ffffff" : "#334155", fontWeight: 600 }}>
                      {prov}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showroom Horizontal Selection Pills / Scroll Area */}
          <div className="py-4 border-b border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-2.5">
              Chọn chi nhánh để xem chi tiết & chỉ đường:
            </p>
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
              {filteredShowrooms.map((s) => {
                const isSelected = s.id === activeShowroom.id;
                const isNearest = nearestShowroom?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "!border-[#1E3A5F] !bg-[#1E3A5F]/8 text-[#1E3A5F] shadow-xs"
                        : "border-slate-200 !bg-white hover:border-slate-300 text-slate-700"
                    }`}
                    style={{
                      borderColor: isSelected ? "#1E3A5F" : undefined,
                    }}
                  >
                    <span
                      className={`inline-block size-2 rounded-full ${
                        isSelected ? "bg-[#1E3A5F]" : "bg-slate-300"
                      }`}
                    />
                    <span className="font-bold">{s.shortName}</span>
                    {s.distanceKm !== undefined ? (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          isNearest
                            ? "bg-emerald-100 text-emerald-800 font-bold"
                            : "bg-slate-100 text-slate-600 font-medium"
                        }`}
                      >
                        {isNearest ? "Gần nhất · " : ""}
                        {s.distanceKm} km
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Showroom Highlight Card */}
          <motion.div
            key={activeShowroom.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C89D66]">
                  {activeShowroom.province} · Mã: {activeShowroom.code}
                </span>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                  {activeShowroom.name}
                </h4>
              </div>

              {activeShowroom.distanceKm !== undefined ? (
                <span className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-bold text-[#1E3A5F] bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full">
                  <Navigation className="size-3" aria-hidden="true" />
                  Cách bạn {activeShowroom.distanceKm} km
                </span>
              ) : null}
            </div>

            {/* Embedded Google Maps Location Preview */}
            <div className="relative w-full h-[240px] sm:h-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 group">
              <iframe
                title={`Bản đồ chỉ đường ${activeShowroom.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeShowroom.name + " " + activeShowroom.address)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Visual Brand Pin Overlay: Floating Luxury Badge with Pulse Effect */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-xl border border-amber-400/40 ring-1 ring-white/10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <ShieldCheck className="size-3.5 text-amber-400 shrink-0" />
                  <span>📍 Nệm Thăng Long · Chi nhánh {activeShowroom.shortName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-[#C89D66] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed">
                  <strong>Địa chỉ:</strong> {activeShowroom.address}
                  {activeShowroom.landmark ? (
                    <span className="block text-xs text-slate-500 italic mt-0.5">
                      ({activeShowroom.landmark})
                    </span>
                  ) : null}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Giờ mở cửa:</strong> {activeShowroom.hours || GENERAL_HOURS}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <PhoneCall className="size-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Hotline hỗ trợ:</strong>{" "}
                  <a
                    href={telHref}
                    className="font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    {activeShowroom.phone || "0911 251 004"}
                  </a>
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row gap-3">
              {/* Primary: 1-Tap Google Maps Search & Directions */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeShowroom.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl !bg-[#1E3A5F] bg-[#1E3A5F] hover:!bg-[#152843] hover:bg-[#152843] px-5 py-3.5 text-xs sm:text-sm font-bold !text-white shadow-md transition-all cursor-pointer"
                style={{ backgroundColor: "#1E3A5F", color: "#ffffff" }}
              >
                <Navigation className="size-4 text-white shrink-0" aria-hidden="true" />
                <span className="!text-white font-bold text-xs sm:text-sm" style={{ color: "#ffffff" }}>
                  Mở Chỉ đường Google Maps
                </span>
                <ExternalLink className="size-3.5 text-white/70" aria-hidden="true" />
              </a>

              {/* Secondary: Direct Call */}
              <a
                href="tel:0911251004"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-3.5 text-xs sm:text-sm font-bold text-red-700 shadow-xs transition-all cursor-pointer"
              >
                <PhoneCall className="size-4 text-red-600 shrink-0 animate-pulse" />
                <span>Gọi chủ xưởng: 0911 251 004</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Hỗ trợ giao nệm tận phòng ngủ · Đổi trả 100 đêm trải nghiệm · Có chỗ đỗ xe ô tô
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export const ShowroomFinder = ShowroomLocator;
