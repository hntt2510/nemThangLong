import type { Product, ProductMedia } from "@/lib/types";

export function isDemoMedia(product: Pick<Product, "isDemo">, media?: Pick<ProductMedia, "isDemo"> | null) {
  return Boolean(product.isDemo || media?.isDemo);
}

export function mediaAlt(product: Pick<Product, "isDemo">, media: ProductMedia) {
  const alt = media.alt.trim() || "Hình ảnh sản phẩm";
  const cleaned = alt.replace(/^hình ảnh minh họa\s*[—:-]?\s*/i, "").trim() || "sản phẩm";
  if (isDemoMedia(product, media)) return "Hình ảnh minh họa — " + cleaned;
  return /^hình ảnh minh họa/i.test(alt) ? "Hình ảnh sản phẩm — " + cleaned : alt;
}
