import type { Product, ProductLayer } from "@/lib/types";

export function publishedMattressLabLayers(product: Product): ProductLayer[] {
  return product.layers.filter((layer) => Boolean(layer.published && layer.nodeName));
}

export function hasPublishedMattressLab(product: Product) {
  return Boolean(
    !product.isDemo &&
      product.mattressLab &&
      product.modelUrl &&
      publishedMattressLabLayers(product).length >= 2,
  );
}
