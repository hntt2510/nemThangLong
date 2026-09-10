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

export const sepayWebhookSchema = z.object({
  // Test Mode omits id, accumulated and referenceCode in some callbacks. They
  // are useful metadata, but none are payment-matching requirements.
  id: z.union([z.number().int().positive(), z.string().trim().min(1).max(100)]).optional(),
  gateway: z.string().trim().min(1).max(100),
  transactionDate: z.string().trim().max(50).optional(),
  accountNumber: z.string().trim().min(1).max(100),
  subAccount: z.string().nullable().optional(),
  code: z.string().trim().max(100).nullable().optional(),
  content: z.string().max(1000).nullable().optional(),
  transferType: z.enum(["in", "out"]),
  description: z.string().max(2000).nullable().optional(),
  transferAmount: z.number().int().positive(),
  accumulated: z.number().nonnegative().optional(),
  referenceCode: z.string().max(300).nullable().optional(),
}).passthrough();
