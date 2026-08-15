import "server-only";

import type { PrismaClient, InventoryAdjustmentReason } from "@prisma/client";
import { withSerializable } from "@/lib/transaction";
import { inventoryAdjustmentSchema, type InventoryAdjustmentInput } from "@/lib/inventory-validation";

export { inventoryAdjustmentSchema } from "@/lib/inventory-validation";
export type { InventoryAdjustmentInput } from "@/lib/inventory-validation";

export function parseInventoryFilters(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? "1");
  return { slug: (searchParams.get("slug") ?? "").trim().slice(0, 80), active: searchParams.get("active") === "0" ? false : searchParams.get("active") === "1" ? true : undefined, zeroStock: searchParams.get("zeroStock") === "1", page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000) : 1 };
}

export async function listInventory(prisma: PrismaClient, filters: ReturnType<typeof parseInventoryFilters>) {
  const where = { ...(filters.slug ? { product: { slug: { contains: filters.slug, mode: "insensitive" as const } } } : {}), ...(filters.active === undefined ? {} : { active: filters.active }), ...(filters.zeroStock ? { stock: 0 } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.productVariant.findMany({ where, orderBy: [{ product: { slug: "asc" } }, { width: "asc" }, { length: "asc" }, { thickness: "asc" }], skip: (filters.page - 1) * 50, take: 50, select: { id: true, sku: true, width: true, length: true, thickness: true, stock: true, active: true, product: { select: { slug: true, name: true } }, inventoryAdjustments: { orderBy: { createdAt: "desc" }, take: 1, select: { delta: true, reason: true, resultingStock: true, createdAt: true } } } }),
    prisma.productVariant.count({ where }),
  ]);
  return { items, total, page: filters.page, pageSize: 50 };
}

export async function adjustInventory(prisma: PrismaClient, actorId: string, input: InventoryAdjustmentInput) {
  const parsed = inventoryAdjustmentSchema.parse(input);
  return withSerializable(prisma, async (tx) => {
    const variant = await tx.productVariant.findUnique({ where: { id: parsed.variantId }, select: { id: true, stock: true } });
    if (!variant) throw new Error("NOT_FOUND");
    const updated = parsed.delta < 0
      ? await tx.productVariant.updateMany({ where: { id: parsed.variantId, stock: { gte: Math.abs(parsed.delta) } }, data: { stock: { decrement: Math.abs(parsed.delta) } } })
      : await tx.productVariant.updateMany({ where: { id: parsed.variantId }, data: { stock: { increment: parsed.delta } } });
    if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
    const current = await tx.productVariant.findUniqueOrThrow({ where: { id: parsed.variantId }, select: { stock: true } });
    return tx.inventoryAdjustment.create({ data: { variantId: parsed.variantId, delta: parsed.delta, reason: parsed.reason as InventoryAdjustmentReason, note: parsed.note || null, actorId, resultingStock: current.stock }, select: { id: true, variantId: true, delta: true, reason: true, note: true, resultingStock: true, createdAt: true } });
  });
}
