import { z } from "zod";

const optionalString = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
const optionalSecret = z.preprocess((value) => value === "" ? undefined : value, z.string().min(32, "must be at least 32 characters").optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());

const envSchema = z.object({
  DATABASE_URL: optionalUrl,
  DIRECT_URL: optionalUrl,
  AUTH_SECRET: optionalSecret,
  CRON_SECRET: optionalSecret,
  LEAD_RATE_LIMIT_SECRET: optionalSecret,
  AUTH_URL: optionalUrl,
  RESEND_API_KEY: optionalString,
  MAIL_FROM: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: optionalString,
  R2_PUBLIC_URL: optionalUrl,
  SEPAY_TEST_MODE: z.enum(["true", "false"]).default("false"),
  SEPAY_WEBHOOK_SECRET: optionalSecret,
  SEPAY_TEST_BANK: optionalString,
  SEPAY_TEST_ACCOUNT_NUMBER: optionalString,
  SEPAY_TEST_ACCOUNT_NAME: optionalString,
  SEPAY_PUBLIC_BASE_URL: optionalUrl,
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
}).superRefine((value, context) => {
  if (context) {
    const optionalGroups = [
      { label: "SePay Test Mode", fields: ["SEPAY_WEBHOOK_SECRET", "SEPAY_TEST_BANK", "SEPAY_TEST_ACCOUNT_NUMBER", "SEPAY_TEST_ACCOUNT_NAME", "SEPAY_PUBLIC_BASE_URL"] as const, signal: ["SEPAY_WEBHOOK_SECRET", "SEPAY_TEST_BANK", "SEPAY_TEST_ACCOUNT_NUMBER", "SEPAY_TEST_ACCOUNT_NAME", "SEPAY_PUBLIC_BASE_URL"] as const },
      { label: "R2", fields: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"] as const, signal: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_URL"] as const },
    ];
    for (const group of optionalGroups) {
      const present = group.signal.some((field) => Boolean(value[field]));
      if (present) for (const field of group.fields) if (!value[field]) context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${group.label} configuration is incomplete` });
    }
  }
});

function configurationError(parsed: { success: false; error: z.ZodError }) {
  const fields = parsed.error.issues.map((issue) => issue.path.join(".")).filter(Boolean).join(", ");
  return new Error(`Invalid environment configuration: ${fields || "unknown"}`);
}

function resolveDefaultRuntime(source: Record<string, string | undefined>): string {
  if (source.SEPAY_TEST_MODE === "true" && !process.env.VERCEL) return "development";
  if (process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production") return "production";
  return process.env.NODE_ENV ?? "development";
}

export function validateEnvironment(
  source: Record<string, string | undefined> = process.env,
  runtime: "development" | "production" | string = resolveDefaultRuntime(source)
) {
  const parsed = envSchema.superRefine((value, context) => {
    if (runtime === "production") {
      if (!value.AUTH_SECRET) context.addIssue({ code: z.ZodIssueCode.custom, path: ["AUTH_SECRET"], message: "required in production" });
      if (!value.CRON_SECRET) context.addIssue({ code: z.ZodIssueCode.custom, path: ["CRON_SECRET"], message: "required in production" });
      if (!value.LEAD_RATE_LIMIT_SECRET) context.addIssue({ code: z.ZodIssueCode.custom, path: ["LEAD_RATE_LIMIT_SECRET"], message: "required in production" });

      if (!source.NEXT_PUBLIC_SITE_URL) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["NEXT_PUBLIC_SITE_URL"], message: "must be explicitly configured in production" });
      } else {
        try {
          const siteUrl = new URL(source.NEXT_PUBLIC_SITE_URL);
          const host = siteUrl.hostname.replace(/^\[|\]$/g, "");
          if (siteUrl.protocol !== "https:") {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["NEXT_PUBLIC_SITE_URL"], message: "must use HTTPS in production" });
          }
          if (["localhost", "127.0.0.1", "::1"].includes(host)) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: ["NEXT_PUBLIC_SITE_URL"], message: "cannot use localhost in production" });
          }
        } catch {
          // malformed url handled by zod base schema
        }
      }

      if (value.SEPAY_TEST_MODE === "true" || value.SEPAY_WEBHOOK_SECRET || value.SEPAY_TEST_BANK || value.SEPAY_TEST_ACCOUNT_NUMBER || value.SEPAY_TEST_ACCOUNT_NAME || value.SEPAY_PUBLIC_BASE_URL) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["SEPAY_TEST_MODE"], message: "SePay Test Mode cannot be enabled in production" });
      }
    }
  }).safeParse(source);
  return parsed;
}

export function getEnv(
  source: Record<string, string | undefined> = process.env,
  runtime: string = resolveDefaultRuntime(source)
) {
  const parsed = validateEnvironment(source, runtime);
  if (!parsed.success) {
    throw configurationError(parsed);
  }
  return parsed.data;
}

export function getProductionEnv(source: Record<string, string | undefined> = process.env) {
  const parsed = validateEnvironment(source, "production");
  if (!parsed.success) throw configurationError(parsed);
  if (!parsed.data.DATABASE_URL) throw new Error("Invalid environment configuration: DATABASE_URL, DIRECT_URL");
  if (!parsed.data.DIRECT_URL) throw new Error("Invalid environment configuration: DIRECT_URL");
  return parsed.data;
}
