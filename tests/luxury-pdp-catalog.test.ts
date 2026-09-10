import { describe, expect, it } from "vitest";
import { MattressLayerExploder } from "@/components/mattress-layer-exploder";
import { FirmnessScale } from "@/components/firmness-scale";
import { ProductCard, type ProductCardProduct } from "@/components/product-card";
import { ProductSpecGrid } from "@/components/product-spec-grid";
import { getProductAnatomy, PRODUCT_ANATOMIES } from "@/lib/product-anatomy";
import { getProductTechSpec, PRODUCT_SPECS_DATABASE } from "@/lib/product-specs";

describe("Quiet Luxury PDP & Catalog Enhancements", () => {
  describe("Product Anatomy Configuration", () => {
    const requiredSlugs = [
      "america",
      "classic",
      "hoat-tinh",
      "memory-foam",
      "cao-su-thien-nhien",
      "khach-san",
    ];

    it("defines complete anatomies for all 6 mattress tiers", () => {
      requiredSlugs.forEach((slug) => {
        const anatomy = PRODUCT_ANATOMIES[slug];
        expect(anatomy).toBeDefined();
        expect(anatomy.slug).toBe(slug);
        expect(anatomy.name).toBeTruthy();
        expect(anatomy.firmnessScore).toBeGreaterThanOrEqual(1);
        expect(anatomy.firmnessScore).toBeLessThanOrEqual(10);
        expect(anatomy.firmnessLabel).toBeTruthy();
        expect(anatomy.priceTier).toBeGreaterThanOrEqual(1);
        expect(anatomy.layers.length).toBe(3);

        anatomy.layers.forEach((layer) => {
          expect(layer.layerIndex).toBeTruthy();
          expect(layer.name).toBeTruthy();
          expect(layer.thickness).toBeTruthy();
          expect(layer.material).toBeTruthy();
          expect(layer.features.length).toBeGreaterThan(0);
          expect(layer.visualColor).toBeTruthy();
        });
      });
    });

    it("resolves default anatomy safely if unknown slug is requested", () => {
      const fallback = getProductAnatomy("unknown-slug");
      expect(fallback).toBeDefined();
      expect(fallback.slug).toBe("america");
    });
  });

  describe("Product Technical Specs Database", () => {
    const requiredKeys = [
      "nem-cao-su-america",
      "nem-thang-long-classic",
      "nem-than-hoat-tinh",
      "nem-memory-foam",
      "nem-cao-su-thien-nhien",
      "nem-khach-san-du-an",
    ];

    it("defines complete production tech specs for all 6 tiers", () => {
      requiredKeys.forEach((key) => {
        const spec = PRODUCT_SPECS_DATABASE[key];
        expect(spec).toBeDefined();
        expect(spec.brand).toBeTruthy();
        expect(spec.manufacturer).toBeTruthy();
        expect(spec.origin).toBeTruthy();
        expect(spec.coreMaterial).toBeTruthy();
        expect(spec.coverMaterial).toBeTruthy();
        expect(spec.firmnessIndex).toBeTruthy();
        expect(spec.dimensions).toBeTruthy();
        expect(spec.thicknessOptions).toBeTruthy();
        expect(spec.ventilationTech).toBeTruthy();
        expect(spec.certifications.length).toBeGreaterThan(0);
        expect(spec.warrantyYears).toBeGreaterThan(0);
        expect(spec.spineSupportRating).toBeTruthy();
        expect(spec.idealFor).toBeTruthy();
        expect(typeof spec.washableCover).toBe("boolean");
      });
    });

    it("resolves tech specs by short slug or full key correctly", () => {
      const shortSpec = getProductTechSpec("classic");
      const fullSpec = getProductTechSpec("nem-thang-long-classic");
      expect(shortSpec.brand).toBe("Thăng Long Classic");
      expect(fullSpec.brand).toBe("Thăng Long Classic");
      expect(shortSpec.warrantyYears).toBe(12);

      const fallback = getProductTechSpec("non-existent-product");
      expect(fallback.brand).toBe("Thăng Long America");
    });
  });

  describe("ProductSpecGrid component", () => {
    it("exports ProductSpecGrid component function", () => {
      expect(typeof ProductSpecGrid).toBe("function");
    });
  });

  describe("FirmnessScale component", () => {
    it("exports FirmnessScale component function", () => {
      expect(typeof FirmnessScale).toBe("function");
    });
  });

  describe("MattressLayerExploder component", () => {
    it("exports MattressLayerExploder component function", () => {
      expect(typeof MattressLayerExploder).toBe("function");
    });
  });

  describe("ProductCard component", () => {
    it("exports ProductCard component function", () => {
      expect(typeof ProductCard).toBe("function");
    });

    it("accepts valid ProductCardProduct props structure", () => {
      const mockProduct: ProductCardProduct = {
        slug: "cao-su-thien-nhien",
        name: "Nệm Cao Su Thiên Nhiên Thăng Long",
        eyebrow: "100% LATEX THIÊN NHIÊN",
        description: "Dòng nệm cao su thiên nhiên êm ái nâng đỡ cơ thể trọn vẹn.",
        image: "/images/homepage-latex.webp",
        imageAlt: "Nệm cao su thiên nhiên",
        isDemo: false,
        imageIsDemo: false,
        minPrice: 8500000,
        inStock: true,
        widths: [120, 140, 160, 180],
        ratingAverage: 4.9,
        ratingCount: 38,
      };

      expect(mockProduct.slug).toBe("cao-su-thien-nhien");
      expect(mockProduct.minPrice).toBe(8500000);
      expect(mockProduct.widths).toHaveLength(4);
    });
  });
});
