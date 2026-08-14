import type { Product } from "./types";

const demoModelEnabled = process.env.NODE_ENV !== "production" || (process.env.VERCEL_ENV === "preview" && process.env.ENABLE_DEMO_3D === "true");

export const demoProduct: Product = {
  id: "demo-luxury", slug: "luxury", name: "Nệm Thăng Long Luxury", eyebrow: "THE THĂNG LONG SIGNATURE",
  description: "Thông tin sản phẩm đang được cập nhật từ CMS. Vui lòng liên hệ để được tư vấn.", mattressLab: true,
  modelUrl: demoModelEnabled ? "/models/luxury-demo.glb" : null, posterUrl: "/images/luxury-hero.png", isDemo: true, source: "demo", purchasable: false,
  media: [
    { id: "demo-hero", type: "image", url: "/images/luxury-hero.png", alt: "Hình ảnh minh họa Nệm Thăng Long Luxury", aspect: "4:5", focalX: .5, focalY: .58, fit: "cover", isDemo: true },
    { id: "demo-detail", type: "image", url: "/images/luxury-detail.png", alt: "Hình ảnh minh họa chất liệu nệm", aspect: "1:1", focalX: .5, focalY: .5, fit: "cover", isDemo: true },
    { id: "demo-lifestyle", type: "image", url: "/images/luxury-lifestyle.png", alt: "Hình ảnh minh họa không gian nghỉ ngơi", aspect: "3:2", focalX: .5, focalY: .52, fit: "cover", isDemo: true },
  ],
  variants: [
    { id: "demo-160-200-15", width: 160, length: 200, thickness: 15, price: null, compareAtPrice: null, sku: "DEMO-LUX-160-200-15", stock: 0, active: false },
    { id: "demo-180-200-20", width: 180, length: 200, thickness: 20, price: null, compareAtPrice: null, sku: "DEMO-LUX-180-200-20", stock: 0, active: false },
  ],
  layers: demoModelEnabled ? [
    { id: "demo-cover", sortOrder: 1, name: "Demo Cover", material: "Demo only", nodeName: "layer-cover", explodeDistance: .35, published: true },
    { id: "demo-comfort", sortOrder: 2, name: "Demo Comfort Layer", material: "Demo only", nodeName: "layer-comfort", explodeDistance: .28, published: true },
    { id: "demo-responsive", sortOrder: 3, name: "Demo Responsive Layer", material: "Demo only", nodeName: "layer-responsive", explodeDistance: .22, published: true },
    { id: "demo-latex", sortOrder: 4, name: "Demo Natural Layer", material: "Demo only", nodeName: "layer-latex", explodeDistance: .16, published: true },
    { id: "demo-support", sortOrder: 5, name: "Demo Support Core", material: "Demo only", nodeName: "layer-support", explodeDistance: .1, published: true },
  ] : [],
  reviews: [], content: null,
};

export const luxuryProduct = demoProduct;
