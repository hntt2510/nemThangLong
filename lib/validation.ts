import { z } from "zod";

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(20),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(20),
  guestEmail: z.string().email().optional().or(z.literal("")),
  address: z.object({
    line1: z.string().min(5).max(200),
    district: z.string().max(100).optional(),
    province: z.string().min(2).max(100),
  }),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "MOMO"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
