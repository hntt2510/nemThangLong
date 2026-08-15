import "server-only";

import type { Prisma } from "@prisma/client";

export type CheckoutStockLine = { variantId: string; quantity: number };

export async function decrementCheckoutStock(tx: Prisma.TransactionClient, lines: CheckoutStockLine[]) {
  for (const line of lines) {
    const updated = await tx.productVariant.updateMany({ where: { id: line.variantId, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
    if (updated.count !== 1) throw new Error("Sản phẩm vừa hết tồn kho.");
  }
}
