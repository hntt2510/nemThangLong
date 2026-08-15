import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma, PrismaClient } from "@prisma/client";
import { adminProductDocumentSchema, initializeAdminProduct, saveAdminProductDocument } from "@/lib/admin-products";
import { adjustInventory } from "@/lib/inventory-admin";

const integration = process.env.RUN_INTEGRATION === "true" ? describe : describe.skip;
const prisma = new PrismaClient();
const runId = Date.now().toString(36);
let americaId = "";
let luxuryId = "";
let americaVariantId = "";
let historicalVariantId = "";
let mediaId = "";
let layerId = "";
let orderId = "";
let actorId = "";
let initializedAmerica = false;

function documentFor(product: { id: string; slug: string; name: string; updatedAt: Date }, variants: Array<{ id?: string; width: number; length: number; thickness: number; price: number | null; compareAtPrice: number | null; sku: string; active: boolean }>, media: Array<{ id?: string; type: "image"; url: string; alt: string; sortOrder: number; isDemo: boolean }> = []) {
  return adminProductDocumentSchema.parse({ updatedAt: product.updatedAt.toISOString(), general: { name: product.name, eyebrow: null, description: null, status: "DRAFT", isDemo: false, mattressLab: false, modelUrl: null, posterUrl: null, content: null }, variants, media: media.map((item) => ({ ...item, aspect: null, focalX: .5, focalY: .5, fit: "cover" })), layers: [] });
}

integration.sequential("catalog CMS integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
    const america = await prisma.product.create({ data: { slug: "america", name: `QA America ${runId}`, status: "DRAFT", isDemo: false } }); americaId = america.id;
    const luxury = await prisma.product.create({ data: { slug: "luxury", name: `QA Luxury ${runId}`, status: "DRAFT", isDemo: false } }); luxuryId = luxury.id;
    const first = await prisma.productVariant.create({ data: { productId: americaId, width: 160, length: 200, thickness: 15, price: 100, sku: `QA-CMS-A-${runId}`, stock: 7, active: true } }); americaVariantId = first.id;
    const historical = await prisma.productVariant.create({ data: { productId: americaId, width: 180, length: 200, thickness: 20, price: 120, sku: `QA-CMS-H-${runId}`, stock: 4, active: true } }); historicalVariantId = historical.id;
    mediaId = (await prisma.mediaAsset.create({ data: { productId: americaId, type: "image", url: `/qa-cms-${runId}.webp`, alt: "QA", isDemo: true } })).id;
    layerId = (await prisma.productLayer.create({ data: { productId: americaId, sortOrder: 0, name: "QA layer", published: false } })).id;
    const foreignVariant = await prisma.productVariant.create({ data: { productId: luxuryId, width: 160, length: 200, thickness: 15, price: 100, sku: `QA-CMS-L-${runId}`, stock: 1, active: true } });
    await prisma.mediaAsset.create({ data: { productId: luxuryId, type: "image", url: `/qa-cms-luxury-${runId}.webp`, alt: "QA", isDemo: true } });
    await prisma.productLayer.create({ data: { productId: luxuryId, sortOrder: 0, name: "QA layer", published: false } });
    const order = await prisma.order.create({ data: { code: `QA-CMS-ORDER-${runId}`, customerName: "QA", customerPhone: "0900000000", shippingAddress: { line1: "QA", province: "Hanoi" } as Prisma.InputJsonValue, subtotal: 100, shippingFee: 0, total: 100, paymentMethod: "COD", paymentStatus: "PENDING", items: { create: { variantId: historicalVariantId, productName: "QA America", sku: `QA-CMS-H-${runId}`, width: 180, length: 200, thickness: 20, quantity: 1, unitPrice: 120 } } } }); orderId = order.id;
    actorId = (await prisma.user.create({ data: { email: `qa-cms-${runId}@example.com`, role: "ADMIN" } })).id;
    void foreignVariant;
  });

  afterAll(async () => { if (orderId) await prisma.order.delete({ where: { id: orderId } }); if (americaVariantId) await prisma.inventoryAdjustment.deleteMany({ where: { variantId: americaVariantId } }); if (americaId) await prisma.mediaAsset.deleteMany({ where: { productId: americaId } }); if (americaId) await prisma.productLayer.deleteMany({ where: { productId: americaId } }); if (americaId) await prisma.product.delete({ where: { id: americaId } }); if (luxuryId) await prisma.product.delete({ where: { id: luxuryId } }); if (initializedAmerica) await prisma.product.deleteMany({ where: { slug: "classic" } }); if (actorId) await prisma.user.delete({ where: { id: actorId } }); await prisma.$disconnect(); });

  it("rejects cross-product IDs and protects stock", async () => {
    const america = await prisma.product.findUniqueOrThrow({ where: { id: americaId } }); const luxury = await prisma.product.findUniqueOrThrow({ where: { id: luxuryId }, include: { variants: true, media: true, layers: true } }); const currentAmerica = await prisma.product.findUniqueOrThrow({ where: { id: americaId }, include: { variants: true, media: true } });
    const malicious = documentFor(america, [{ id: luxury.variants[0].id, width: 160, length: 200, thickness: 15, price: 100, compareAtPrice: null, sku: luxury.variants[0].sku, active: true }], [{ id: luxury.media[0].id, type: "image", url: luxury.media[0].url, alt: "QA", sortOrder: 0, isDemo: true }]);
    await expect(saveAdminProductDocument(prisma, "america", malicious)).rejects.toThrow("OWNERSHIP");
    await saveAdminProductDocument(prisma, "america", documentFor(america, currentAmerica.variants.map((variant) => ({ id: variant.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice, sku: variant.sku, active: variant.active }))));
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: americaVariantId } })).stock).toBe(7);
  });

  it("inactivates omitted history without deleting referenced variants", async () => {
    const america = await prisma.product.findUniqueOrThrow({ where: { id: americaId }, include: { variants: true } }); const keep = america.variants.find((variant) => variant.id === americaVariantId)!;
    await saveAdminProductDocument(prisma, "america", documentFor(america, [{ id: keep.id, width: keep.width, length: keep.length, thickness: keep.thickness, price: keep.price, compareAtPrice: keep.compareAtPrice, sku: keep.sku, active: true }]));
    const historical = await prisma.productVariant.findUniqueOrThrow({ where: { id: historicalVariantId } }); expect(historical.active).toBe(false); expect(await prisma.orderItem.findFirst({ where: { variantId: historicalVariantId } })).not.toBeNull();
  });

  it("rejects a stale CMS document", async () => {
    const america = await prisma.product.findUniqueOrThrow({ where: { id: americaId }, include: { variants: true } }); const document = documentFor(america, america.variants.filter((variant) => variant.id === americaVariantId).map((variant) => ({ id: variant.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice, sku: variant.sku, active: variant.active })));
    await saveAdminProductDocument(prisma, "america", document);
    await expect(saveAdminProductDocument(prisma, "america", document)).rejects.toThrow("OPTIMISTIC_CONFLICT");
  });

  it("rejects duplicate SKU and dimensions, then safely initializes a missing catalog product", async () => {
    const america = await prisma.product.findUniqueOrThrow({ where: { id: americaId }, include: { variants: true } }); const base = documentFor(america, [{ id: america.variants[0].id, width: 160, length: 200, thickness: 15, price: 100, compareAtPrice: null, sku: america.variants[0].sku, active: true }]);
    await expect(saveAdminProductDocument(prisma, "america", { ...base, variants: [{ ...base.variants[0], width: 160, length: 200, thickness: 15 }, { width: 160, length: 200, thickness: 15, price: 120, compareAtPrice: null, sku: `QA-CMS-DUP-${runId}`, active: true }] })).rejects.toThrow("DUPLICATE_DIMENSIONS");
    const luxury = await prisma.product.findUniqueOrThrow({ where: { id: luxuryId }, include: { variants: true } }); await expect(saveAdminProductDocument(prisma, "america", { ...base, variants: [{ ...base.variants[0], sku: luxury.variants[0].sku }] })).rejects.toThrow("DUPLICATE_SKU");
    const created = await initializeAdminProduct(prisma, "classic"); initializedAmerica = created.slug === "classic"; expect(created.status).toBe("DRAFT"); expect(created.isDemo).toBe(true); expect(await prisma.productVariant.count({ where: { productId: created.id } })).toBe(0); expect(await prisma.mediaAsset.count({ where: { productId: created.id } })).toBe(0);
  });

  it("preserves stock when a CMS save races an inventory adjustment", async () => {
    const america = await prisma.product.findUniqueOrThrow({ where: { id: americaId }, include: { variants: true } });
    const variant = america.variants.find((item) => item.id === americaVariantId)!;
    const beforeStock = variant.stock;
    const document = documentFor(america, [{ id: variant.id, width: variant.width, length: variant.length, thickness: variant.thickness, price: variant.price, compareAtPrice: variant.compareAtPrice, sku: variant.sku, active: variant.active }]);
    await Promise.all([
      saveAdminProductDocument(prisma, "america", document),
      adjustInventory(prisma, actorId, { variantId: americaVariantId, delta: 5, reason: "RECEIPT" }),
    ]);
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: americaVariantId } })).stock).toBe(beforeStock + 5);
  });
});
