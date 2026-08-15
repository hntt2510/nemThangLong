import { describe, expect, it } from "vitest";
import { adminProductDocumentSchema, catalogSlugSchema } from "@/lib/admin-products";
import { canTransitionOrderStatus, parseOrderFilters } from "@/lib/admin-orders";
import { inventoryAdjustmentSchema } from "@/lib/inventory-admin";
import { paymentReviewResolutionSchema } from "@/lib/payment-review";
import { normalizeContent, serializeContent } from "@/components/admin-product-editor";
import { buildFinalizedMediaData } from "@/lib/media-upload";

describe("admin operations contracts", () => {
  it("keeps product initialization restricted to the catalog allowlist", () => {
    expect(catalogSlugSchema.safeParse("luxury").success).toBe(true);
    expect(catalogSlugSchema.safeParse("draft-product").success).toBe(false);
  });

  it("rejects stock in CMS documents and validates positive dimensions", () => {
    const document = { updatedAt: new Date().toISOString(), general: { name: "Test", status: "DRAFT", isDemo: true, mattressLab: false }, variants: [{ width: 0, length: 200, thickness: 15, price: null, sku: "SKU", active: false, stock: 0 }], media: [], layers: [] };
    expect(adminProductDocumentSchema.safeParse(document).success).toBe(false);
  });

  it("enforces linear fulfillment transitions", () => {
    expect(canTransitionOrderStatus("CONFIRMED", "PROCESSING")).toBe(true);
    expect(canTransitionOrderStatus("CONFIRMED", "SHIPPED")).toBe(false);
    expect(canTransitionOrderStatus("CANCELLED", "PROCESSING")).toBe(false);
    expect(canTransitionOrderStatus("PROCESSING", "PROCESSING")).toBe(true);
  });

  it("parses safe order filters and rejects zero inventory deltas", () => {
    expect(parseOrderFilters(new URLSearchParams("status=REVIEW_REQUIRED&page=2")).paymentStatus).toBeUndefined();
    expect(inventoryAdjustmentSchema.safeParse({ variantId: "v", delta: 0, reason: "RECEIPT" }).success).toBe(false);
    expect(inventoryAdjustmentSchema.safeParse({ variantId: "v", delta: -2, reason: "DAMAGE" }).success).toBe(true);
  });

  it("requires explicit external-refund confirmation", () => {
    expect(paymentReviewResolutionSchema.safeParse({ action: "MANUAL_REFUND_RECORDED", note: "done" }).success).toBe(false);
    expect(paymentReviewResolutionSchema.safeParse({ action: "MANUAL_REFUND_RECORDED", confirmation: true, note: "Refund ref 123" }).success).toBe(true);
  });

  it("keeps absent CMS content unpublished and does not invent copy", () => {
    const content = normalizeContent(null);
    expect(content.audience).toMatchObject({ published: false, title: "", body: "" });
    expect(serializeContent(content)).toBeUndefined();
    content.audience.title = "Audience draft";
    expect(serializeContent(content)).toBeUndefined();
    content.audience.published = true;
    content.audience.title = "";
    expect(serializeContent(content)).toBeUndefined();
  });

  it("marks newly finalized media as demo until CMS verification", () => {
    expect(buildFinalizedMediaData({ productId: "p", type: "image", url: "/asset.webp", alt: "Asset" }).isDemo).toBe(true);
  });
});
