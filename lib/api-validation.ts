import { z } from "zod";

export const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email(), password: z.string().min(8).max(100) }).strict();

export const adminSettingsSchema = z.object({
  shippingFee: z.number().int().min(0).nullable(),
  freeShippingThreshold: z.number().int().min(0).nullable(),
  bankTransferReservationMinutes: z.number().int().min(5).max(10080).nullable(),
  bankTransferInfo: z.record(z.string()).nullable(),
}).strict();

export const uploadPresignSchema = z.object({
  kind: z.enum(["image", "video", "model"]),
  contentType: z.string().min(1),
  fileName: z.string().min(1).max(255),
  size: z.number().int().positive(),
}).strict();

export const uploadFinalizeSchema = z.object({
  intentId: z.string().min(1),
  productId: z.string().min(1),
  alt: z.string().trim().min(1).max(300),
  aspect: z.string().trim().max(100).optional(),
}).strict();

export const momoCreateSchema = z.object({ token: z.string().min(20) }).strict();
