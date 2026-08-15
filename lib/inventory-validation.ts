import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  variantId: z.string().min(1),
  delta: z.number().int().refine((value) => value !== 0, "delta must not be zero"),
  reason: z.enum(["RECEIPT", "CORRECTION", "DAMAGE", "OTHER"]),
  note: z.string().trim().max(4000).optional(),
}).strict();

export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;
