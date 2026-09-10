"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Layers, Eye, Sliders, ChevronRight, ShieldCheck, Check } from "lucide-react";
import { getProductAnatomy, type MattressLayer, type ProductAnatomy } from "@/lib/product-anatomy";

interface MattressLayerExploderProps {
  className?: string;
  productSlug?: string;
  title?: string;
  subtitle?: string;
}

export function MattressLayerExploder({
  className = "",
  productSlug = "america",
  title,
  subtitle,
}: MattressLayerExploderProps) {
  const anatomy: ProductAnatomy = getProductAnatomy(productSlug);
  const layers: MattressLayer[] = anatomy.layers;

  const [activeLayerIndex, setActiveLayerIndex] = useState(1);
  const [explodeLevel, setExplodeLevel] = useState(65); // 0 = closed, 100 = fully exploded
  const [viewMode, setViewMode] = useState<"3d" | "cutaway">("3d");
  const reduceMotion = useReducedMotion();

  const activeLayer = layers[activeLayerIndex] ?? layers[0];

  const sectionTitle = title ?? `Bóc Tách Cấu Trúc Kỹ Thuật Đa Tầng: ${anatomy.name}`;
  const sectionSubtitle =
    subtitle ?? `Khám phá các tầng vật liệu sinh học và cơ chế nâng đỡ đa vùng trên dòng ${anatomy.name}`;

  // Calculate vertical separation offsets based on explodeLevel
  const getSeparationOffset = (index: number) => {
    if (reduceMotion) return 0;
    const factor = explodeLevel / 100;
    if (index === 0) return -95 * factor;
    if (index === 1) return 0;
    if (index === 2) return 95 * factor;
    return 0;
  };

  const getSeparationZ = (index: number) => {
    if (reduceMotion) return 0;
    const factor = explodeLevel / 100;
    if (index === 0) return 85 * factor;
    if (index === 1) return 0;
    if (index === 2) return -85 * factor;
    return 0;
  };

  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 ${className}`}>
      <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-[#FAF9F6] p-6 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
        {/* Editorial Section Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-stone-200/80 pb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-[#C8A27A] uppercase tracking-widest">
                <Layers className="size-3.5" /> Giải phẫu học vật liệu
              </span>
              <span className="text-xs font-semibold text-stone-500">
                · {layers.length} Tầng nâng đỡ chuyên sâu
              </span>
              <span className="rounded-full bg-stone-200/70 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                Độ cứng {anatomy.firmnessScore}/10
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1A2530] sm:text-3xl lg:text-4xl font-brand-display">
              {sectionTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* View Mode Switcher (3D vs Real Cutaway) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl bg-stone-200/70 p-1 text-xs font-semibold text-stone-700">
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-white text-stone-900 shadow-xs font-bold"
                    : "hover:text-stone-950"
                }`}
              >
                <Eye className="size-3.5" />
                <span>Góc nhìn 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cutaway")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all cursor-pointer ${
                  viewMode === "cutaway"
                    ? "bg-white text-stone-900 shadow-xs font-bold"
                    : "hover:text-stone-950"
                }`}
              >
                <Layers className="size-3.5" />
                <span>Mặt cắt ảnh thực</span>
              </button>
            </div>
          </div>
        </div>

        {/* 60 / 40 Immersive Layout */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center">
          {/* LEFT: 60% Width 3D Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {viewMode === "3d" ? (
              <div className="relative w-full min-h-[460px] sm:min-h-[520px] aspect-[16/11] flex items-center justify-center [perspective:1200px] overflow-visible select-none py-10">
                {/* Ambient backdrop glow */}
                <div className="absolute inset-x-8 inset-y-12 rounded-full bg-gradient-to-tr from-amber-100/40 via-stone-200/30 to-sky-100/25 blur-3xl pointer-events-none" />

                {/* 3D Isometric Mattress Layer Slabs */}
                <div
                  className="relative w-[84%] h-[60%] transition-transform duration-500 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(52deg) rotateZ(-30deg)",
                  }}
                >
                  {layers.map((layer, index) => {
                    const isActive = activeLayerIndex === index;
                    const yOffset = getSeparationOffset(index);
                    const zOffset = getSeparationZ(index);

                    return (
                      <motion.div
                        key={layer.layerIndex}
                        animate={
                          reduceMotion
                            ? {}
                            : {
                                y: yOffset + (isActive ? -10 : 0),
                                z: zOffset + (isActive ? 20 : 0),
                                scale: isActive ? 1.025 : 1,
                              }
                        }
                        transition={{ type: "spring", stiffness: 220, damping: 22 }}
                        onClick={() => setActiveLayerIndex(index)}
                        className="absolute inset-0 cursor-pointer rounded-2xl transition-shadow duration-300"
                        style={{
                          transformStyle: "preserve-3d",
                          zIndex: 10 - index,
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Xem chi tiết ${layer.name}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setActiveLayerIndex(index);
                          }
                        }}
                      >
                        {/* Slab Top Surface */}
                        <div
                          className={`relative h-full w-full rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isActive
                              ? "border-[#C5A880] ring-2 ring-[#C5A880]/50 shadow-2xl"
                              : "border-stone-300/80 shadow-md hover:border-stone-400"
                          }`}
                          style={{
                            background: layer.visualColor,
                          }}
                        >
                          {/* Subtle material texture motif */}
                          <div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                              backgroundImage:
                                index === 0
                                  ? "radial-gradient(#666 1px, transparent 1px)"
                                  : index === 1
                                  ? "radial-gradient(#9a7536 2px, transparent 2px)"
                                  : "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 10px)",
                              backgroundSize: index === 1 ? "18px 18px" : "14px 14px",
                            }}
                          />

                          {/* Corner Label */}
                          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                            <span
                              className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-extrabold tracking-wide uppercase ${
                                isActive ? "bg-stone-900 text-white" : "bg-stone-800/20 text-stone-800"
                              }`}
                            >
                              LỚP {layer.layerIndex}
                            </span>
                            <span className="text-xs font-bold text-stone-800/90 hidden sm:inline">
                              {layer.thickness}
                            </span>
                          </div>

                          {/* Interactive Hotspot Pin */}
                          <div
                            className="absolute z-30"
                            style={{
                              left: index === 0 ? "40%" : index === 1 ? "60%" : "72%",
                              top: index === 0 ? "45%" : index === 1 ? "52%" : "60%",
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <div className="relative flex items-center justify-center">
                              <span className="absolute inline-flex size-7 animate-ping rounded-full bg-[#1E3A5F] opacity-40" />
                              <span
                                className={`relative inline-flex size-4.5 items-center justify-center rounded-full border-2 border-white shadow-md ${
                                  isActive ? "bg-[#C89D66] ring-2 ring-[#1E3A5F]" : "bg-[#1E3A5F]"
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3D Extruded Slab Edge for Depth */}
                        <div
                          className="absolute inset-x-0 -bottom-3 h-3.5 rounded-b-2xl border-t border-white/20"
                          style={{
                            backgroundColor: layer.edgeColor ?? "#C8BAA5",
                            transform: "translateZ(-10px)",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Floor ambient shadow */}
                <div
                  className="absolute bottom-8 h-14 w-[70%] rounded-full bg-stone-900/10 blur-2xl pointer-events-none transition-all duration-300"
                  style={{
                    opacity: 0.15 + (explodeLevel / 100) * 0.15,
                    transform: `scale(${1 + (explodeLevel / 100) * 0.1})`,
                  }}
                />
              </div>
            ) : (
              /* Real Cutaway Photo View */
              <div className="relative w-full min-h-[460px] sm:min-h-[520px] aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/90 shadow-md bg-stone-100">
                <Image
                  src="/images/projects/mattress-cutaway-clean.png"
                  alt={`Mặt cắt cấu tạo thực tế dòng ${anatomy.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Hotspot buttons on cutaway */}
                {layers.map((layer, index) => {
                  const yPositions = ["22%", "48%", "72%"];
                  const isSelected = activeLayerIndex === index;
                  return (
                    <button
                      key={layer.layerIndex}
                      type="button"
                      onClick={() => setActiveLayerIndex(index)}
                      className={`absolute left-8 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer ${
                        isSelected
                          ? "bg-[#1E3A5F] !text-white ring-2 ring-[#C5A880]"
                          : "bg-white/90 text-stone-800 hover:bg-white"
                      }`}
                      style={{
                        top: yPositions[index],
                        backgroundColor: isSelected ? "#1E3A5F" : undefined,
                        color: isSelected ? "#ffffff" : undefined,
                      }}
                    >
                      <span className="size-2 rounded-full bg-[#C5A880]" />
                      <span>
                        Lớp {layer.layerIndex}: {layer.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Separation Control Slider & Presets */}
            <div className="w-full mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-100/90 rounded-2xl px-5 py-3.5 border border-stone-200/80">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Sliders className="size-4 text-stone-500 shrink-0" />
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider shrink-0">
                  Bóc tách 3D:
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={explodeLevel}
                  onChange={(e) => setExplodeLevel(Number(e.target.value))}
                  className="w-full sm:w-44 h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#1E3A5F]"
                  aria-label="Điều chỉnh độ bóc tách 3D"
                />
                <span className="text-xs font-mono font-bold text-stone-900 w-10 text-right">
                  {explodeLevel}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setExplodeLevel(0)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    explodeLevel === 0
                      ? "bg-stone-900 text-white font-bold"
                      : "bg-white text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Xếp kín (0%)
                </button>
                <button
                  type="button"
                  onClick={() => setExplodeLevel(65)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    explodeLevel === 65
                      ? "bg-stone-900 text-white font-bold"
                      : "bg-white text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Tiêu chuẩn (65%)
                </button>
                <button
                  type="button"
                  onClick={() => setExplodeLevel(100)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    explodeLevel === 100
                      ? "bg-stone-900 text-white font-bold"
                      : "bg-white text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Tối đa (100%)
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: 40% Width Spacious Specification Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Layer Tabs */}
            <div className="flex flex-col gap-2.5" role="tablist" aria-label="Danh sách các tầng vật liệu">
              {layers.map((layer, index) => {
                const isSelected = activeLayerIndex === index;
                return (
                  <button
                    key={layer.layerIndex}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveLayerIndex(index)}
                    className={`relative flex items-center justify-between rounded-2xl p-4 text-left transition-all border cursor-pointer ${
                      isSelected
                        ? "border-stone-900 bg-white shadow-md ring-1 ring-stone-900"
                        : "border-stone-200/80 bg-white/70 hover:bg-white hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex size-8 items-center justify-center rounded-xl text-xs font-bold ${
                          isSelected ? "bg-[#1E3A5F] !text-white" : "bg-stone-100 text-stone-600"
                        }`}
                        style={{
                          backgroundColor: isSelected ? "#1E3A5F" : undefined,
                          color: isSelected ? "#ffffff" : undefined,
                        }}
                      >
                        {layer.layerIndex}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {layer.name}
                        </h4>
                        <span className="text-xs font-mono text-stone-500">
                          Độ dày: {layer.thickness}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`size-4.5 transition-transform ${
                        isSelected ? "rotate-90 text-[#C5A880]" : "text-stone-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Deep-Dive Spec Card with generous breathing room */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer.layerIndex}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs"
              >
                {/* Header Tag Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-[#A67C4A]">
                    <Sparkles className="size-3.5" /> LỚP {activeLayer.layerIndex} / 0{layers.length}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                    <ShieldCheck className="size-3.5" /> {activeLayer.cert ?? "Chuẩn kiểm định Quatest 3"}
                  </span>
                </div>

                {/* Layer Title & Thickness */}
                <div className="mt-4 flex items-start justify-between gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold font-brand-display text-stone-900 leading-snug">
                    {activeLayer.name}
                  </h3>
                  <span className="shrink-0 rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-mono font-bold text-stone-800">
                    {activeLayer.thickness}
                  </span>
                </div>

                {/* Material Specification */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C5A880]">
                    Vật liệu chế tác
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-stone-800">
                    {activeLayer.material}
                  </p>
                </div>

                {/* Features & Ergonomic Highlights */}
                <div className="mt-5 border-t border-stone-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                    Tính năng & Cơ chế nâng đỡ
                  </p>
                  <ul className="space-y-2.5">
                    {activeLayer.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
