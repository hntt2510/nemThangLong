import { z } from "zod";
import { CATALOG_SLUGS } from "@/lib/product-data";

const optionalEmail = z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(254).email().transform((value) => value.toLowerCase()).optional());
const optionalText = (max: number) => z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(max).optional());
const slug = z.enum(CATALOG_SLUGS).optional();

export function normalizePhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return (trimmed.startsWith("+") ? "+" : "") + digits;
}

const phone = z.string().trim().min(8).max(32).regex(/^\+?[0-9().\-\s]+$/).transform(normalizePhone).refine((value) => value.replace(/\D/g, "").length >= 8 && value.replace(/\D/g, "").length <= 20, "Số điện thoại không hợp lệ.");
const fullName = z.string().trim().min(2).max(120);
const message = optionalText(2000);

export const publicLeadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CONSULTATION"),
    fullName,
    phone,
    email: optionalEmail,
    productSlug: slug,
    interestedProduct: slug,
    message,
    website: optionalText(200),
  }).strict(),
  z.object({
    type: z.literal("B2B_PROJECT"),
    fullName,
    phone,
    email: optionalEmail,
    organization: optionalText(160),
    projectLocation: optionalText(200),
    estimatedQuantity: z.number().int().positive().safe().optional(),
    message,
    website: optionalText(200),
  }).strict(),
]);

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
export type LeadTypeValue = PublicLeadInput["type"];

export const adminLeadUpdateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "CLOSED"]),
  internalNote: optionalText(4000),
  updatedAt: z.string().datetime(),
}).strict();

export type AdminLeadUpdateInput = z.infer<typeof adminLeadUpdateSchema>;
