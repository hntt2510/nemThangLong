import { z } from "zod";

export const afterSalesCreateSchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  type: z.enum(["WARRANTY_REVIEW", "PRODUCT_SUPPORT"]),
  subject: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(4000),
}).strict();

export const afterSalesAdminUpdateSchema = z.object({
  status: z.enum(["SUBMITTED", "REVIEWING", "RESOLVED", "CLOSED"]),
  internalNote: z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(4000).optional()),
  updatedAt: z.string().datetime(),
}).strict();

export type AfterSalesCreateInput = z.infer<typeof afterSalesCreateSchema>;
export type AfterSalesAdminUpdateInput = z.infer<typeof afterSalesAdminUpdateSchema>;
