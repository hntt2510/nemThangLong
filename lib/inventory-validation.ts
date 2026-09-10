import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  variantId: z.string().min(1),
  delta: z.number().int().refine((value) => value !== 0, "delta must not be zero"),
  reason: z.enum(["RECEIPT", "CORRECTION", "DAMAGE", "OTHER"]),
  note: z.string().trim().max(4000).optional(),
}).strict().superRefine((value, context) => {
  if (value.reason === "RECEIPT" && value.delta < 0) context.addIssue({ code: "custom", path: ["delta"], message: "Nhập kho phải tăng tồn." });
  if (value.reason === "DAMAGE" && value.delta > 0) context.addIssue({ code: "custom", path: ["delta"], message: "Hàng hư hỏng phải giảm tồn." });
  if (value.reason === "OTHER" && !value.note) context.addIssue({ code: "custom", path: ["note"], message: "Lý do khác cần ghi chú." });
});

export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;
