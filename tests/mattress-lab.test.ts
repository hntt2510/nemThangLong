import { describe, expect, it } from "vitest";
import { getDemoProduct } from "@/lib/product-data";
import { hasPublishedMattressLab, publishedMattressLabLayers } from "@/lib/mattress-lab";

describe("Mattress Lab publishing guard", () => {
  it("does not expose a demo model as a customer-facing 3D experience", () => {
    expect(hasPublishedMattressLab(getDemoProduct("luxury"))).toBe(false);
  });

  it("requires a configured model and at least two published mapped layers", () => {
    const product = {
      ...getDemoProduct("luxury"),
      isDemo: false,
      mattressLab: true,
      modelUrl: "/models/verified.glb",
      layers: [
        { id: "cover", sortOrder: 1, name: "Vỏ nệm", nodeName: "cover", published: true },
        { id: "core", sortOrder: 2, name: "Lõi nệm", nodeName: "core", published: true },
      ],
    };

    expect(publishedMattressLabLayers(product)).toHaveLength(2);
    expect(hasPublishedMattressLab(product)).toBe(true);
    expect(hasPublishedMattressLab({ ...product, layers: product.layers.slice(0, 1) })).toBe(false);
  });
});
