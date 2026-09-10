import { z } from "zod";

export const cartItemSchema = z.object({
  variantId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(20),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(8).max(20),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
  address: z.object({
    line1: z.string().trim().min(5).max(200),
    district: z.string().trim().max(100).optional(),
    province: z.string().trim().min(2).max(100),
  }).strict(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "SEPAY"]),
}).superRefine((value, context) => {
  const seen = new Set<string>();
  value.items.forEach((item, index) => {
    if (seen.has(item.variantId)) context.addIssue({ code: "custom", path: ["items", index, "variantId"], message: "Mỗi biến thể chỉ được xuất hiện một lần trong giỏ." });
    seen.add(item.variantId);
  });
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
