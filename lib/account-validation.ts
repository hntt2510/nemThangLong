import { z } from "zod";
import { normalizePhone } from "@/lib/lead-validation";

const phoneSchema = z.string().trim().min(8).max(32)
  .regex(/^\+?[0-9().\-\s]+$/)
  .transform(normalizePhone)
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 20;
  }, "Số điện thoại không hợp lệ.");

const optionalPhone = z.preprocess((value) => value === "" || value === null ? null : value, phoneSchema.nullable().optional());

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: optionalPhone,
}).strict().refine((value) => value.name !== undefined || value.phone !== undefined, "Không có thông tin cần cập nhật.");

export const addressInputSchema = z.object({
  label: z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(80).optional()),
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  line1: z.string().trim().min(2).max(300),
  province: z.string().trim().min(2).max(120),
  district: z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(120).optional()),
  postalCode: z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(20).optional()),
}).strict();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
