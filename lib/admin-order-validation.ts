import { z } from "zod";

export const orderStatusSchema = z.enum(["CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"]);
export const orderFiltersSchema = z.object({ status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]).optional(), paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REVIEW_REQUIRED", "REFUNDED"]).optional(), paymentMethod: z.enum(["COD", "BANK_TRANSFER", "MOMO"]).optional(), q: z.string().trim().max(100).optional(), page: z.number().int().positive().max(1000).default(1) }).strict();
export const fulfillmentSchema = z.object({ status: orderStatusSchema }).strict();
export const adminOrderActionSchema = z.union([
  z.object({ action: z.enum(["confirm_paid", "cancel"]) }).strict(),
  fulfillmentSchema,
]);
