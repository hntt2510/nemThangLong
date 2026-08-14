import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());

const envSchema = z.object({
  DATABASE_URL: optionalUrl,
  DIRECT_URL: optionalUrl,
  AUTH_SECRET: optionalString,
  AUTH_URL: optionalUrl,
  RESEND_API_KEY: optionalString,
  MAIL_FROM: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: optionalString,
  R2_PUBLIC_URL: optionalUrl,
  MOMO_PARTNER_CODE: optionalString,
  MOMO_ACCESS_KEY: optionalString,
  MOMO_SECRET_KEY: optionalString,
  MOMO_ENDPOINT: z.string().url().default("https://test-payment.momo.vn/v2/gateway/api/create"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export function getEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid environment configuration: ${fields}`);
  }
  return parsed.data;
}
