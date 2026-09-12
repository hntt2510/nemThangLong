"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { CatalogProductSummary } from "@/lib/catalog";

type BadgeFilter = "ALL" | "BEST_SELLER" | "HOT_DEAL" | "DOCTOR_RECOMMENDED";

interface LandingProductCollectionProps {
  products: CatalogProductSummary[];
  hoverImages?: Record<string, string>;
}

export function LandingProductCollection({
  products,
  hoverImages = {},
}: LandingProductCollectionProps) {
  const [activeFilter, setActiveFilter] = useState<BadgeFilter>("ALL");

  const filterTabs: Array<{ id: BadgeFilter; label: string }> = [
    { id: "ALL", label: "Tất cả sản phẩm" },
    { id: "BEST_SELLER", label: "🔥 Bán Chạy Nhất" },
    { id: "HOT_DEAL", label: "🏷️ Giảm Giá Sốc" },
    { id: "DOCTOR_RECOMMENDED", label: "⭐ Khuyên Dùng Cho Cột Sống" },
  ];

  const filteredProducts = useMemo(() => {
    if (activeFilter === "ALL") return products;
    return products.filter((p) => p.badge === activeFilter);
  }, [products, activeFilter]);

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8" role="tablist" aria-label="Bộ lọc nệm">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
                isActive
                  ? "!bg-[#1E3A5F] !text-white shadow-md ring-2 ring-[#1E3A5F]/20 scale-105"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
              style={{
                backgroundColor: isActive ? "#1E3A5F" : undefined,
                color: isActive ? "#ffffff" : undefined,
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="landing-product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            className="landing-product-card"
            presentation="landing"
            hoverImage={hoverImages[product.slug]}
          />
        ))}
      </div>
    </div>
  );
}
