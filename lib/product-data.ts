import type { Product } from "./types";

const demoModelEnabled = process.env.NODE_ENV !== "production" || (process.env.VERCEL_ENV === "preview" && process.env.ENABLE_DEMO_3D === "true");

export const demoProduct: Product = {
  id: "demo-luxury",
  slug: "luxury",
  name: "Nệm Thăng Long Luxury",
  eyebrow: "THE THĂNG LONG SIGNATURE",
  description: "Thông tin sản phẩm đang được cập nhật từ CMS. Vui lòng liên hệ để được tư vấn.",
  mattressLab: true,
  modelUrl: demoModelEnabled ? "/models/luxury-demo.glb" : null,
  posterUrl: "/images/luxury-hero.webp",
  isDemo: true,
  source: "demo",
  purchasable: false,
  media: [
    { id: "demo-hero", type: "image", url: "/images/luxury-hero.webp", alt: "Hình ảnh minh họa Nệm Thăng Long Luxury", aspect: "4:5", focalX: 0.5, focalY: 0.58, fit: "cover", isDemo: true },
    { id: "demo-detail", type: "image", url: "/images/luxury-detail.webp", alt: "Hình ảnh minh họa chất liệu nệm", aspect: "1:1", focalX: 0.5, focalY: 0.5, fit: "cover", isDemo: true },
    { id: "demo-lifestyle", type: "image", url: "/images/luxury-lifestyle.webp", alt: "Hình ảnh minh họa không gian nghỉ ngơi", aspect: "3:2", focalX: 0.5, focalY: 0.52, fit: "cover", isDemo: true },
  ],
  variants: [
    { id: "demo-160-200-15", width: 160, length: 200, thickness: 15, price: null, compareAtPrice: null, sku: "DEMO-LUX-160-200-15", stock: 0, active: false },
    { id: "demo-180-200-20", width: 180, length: 200, thickness: 20, price: null, compareAtPrice: null, sku: "DEMO-LUX-180-200-20", stock: 0, active: false },
  ],
  layers: demoModelEnabled ? [
    { id: "demo-cover", sortOrder: 1, name: "Demo Cover", material: "Demo only", nodeName: "layer-cover", explodeDistance: 0.35, published: true },
    { id: "demo-comfort", sortOrder: 2, name: "Demo Comfort Layer", material: "Demo only", nodeName: "layer-comfort", explodeDistance: 0.28, published: true },
    { id: "demo-responsive", sortOrder: 3, name: "Demo Responsive Layer", material: "Demo only", nodeName: "layer-responsive", explodeDistance: 0.22, published: true },
    { id: "demo-latex", sortOrder: 4, name: "Demo Natural Layer", material: "Demo only", nodeName: "layer-latex", explodeDistance: 0.16, published: true },
    { id: "demo-support", sortOrder: 5, name: "Demo Support Core", material: "Demo only", nodeName: "layer-support", explodeDistance: 0.1, published: true },
  ] : [],
  reviews: [],
  content: null,
};

export const luxuryProduct = demoProduct;

export const CATALOG_SLUGS = ["america", "classic", "hoat-tinh", "memory-foam", "cao-su-thien-nhien", "luxury"] as const;

const demoCatalogConfig: Record<Exclude<(typeof CATALOG_SLUGS)[number], "luxury">, { name: string; eyebrow: string; image: string }> = {
  america: { name: "Nệm Thăng Long America", eyebrow: "EVERYDAY COMFORT", image: "/images/homepage-range.webp" },
  classic: { name: "Nệm Thăng Long Classic", eyebrow: "THE EVERYDAY STANDARD", image: "/images/homepage-hero.webp" },
  "hoat-tinh": { name: "Nệm Thăng Long Hoạt Tính", eyebrow: "RESPONSIVE COMFORT", image: "/images/homepage-hoat-tinh.webp" },
  "memory-foam": { name: "Nệm Thăng Long Memory Foam", eyebrow: "CONTOURED COMFORT", image: "/images/homepage-memory-foam.webp" },
  "cao-su-thien-nhien": { name: "Nệm Cao Su Thiên Nhiên", eyebrow: "THE NATURAL STANDARD", image: "/images/homepage-natural-latex.webp" },
};

export function getDemoProduct(slug: string): Product {
  if (slug === "luxury") return demoProduct;
  const config = demoCatalogConfig[slug as Exclude<(typeof CATALOG_SLUGS)[number], "luxury">];
  if (!config) return demoProduct;
  return {
    ...demoProduct,
    id: "demo-" + slug,
    slug,
    name: config.name,
    eyebrow: config.eyebrow,
    description: "Thông tin sản phẩm đang được cập nhật từ CMS. Vui lòng liên hệ để được tư vấn.",
    mattressLab: false,
    modelUrl: null,
    posterUrl: config.image,
    media: [{ id: "demo-" + slug + "-hero", type: "image", url: config.image, alt: "Hình ảnh minh họa " + config.name, aspect: "4:5", focalX: 0.5, focalY: 0.5, fit: "cover", isDemo: true }],
    variants: [],
    layers: [],
  };
}

export function getDemoCatalogProducts() {
  return CATALOG_SLUGS.map((slug) => getDemoProduct(slug));
}
