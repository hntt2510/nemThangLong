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
  MOMO_PARTNER_CODE: optionalString,
  MOMO_ACCESS_KEY: optionalString,
  MOMO_SECRET_KEY: optionalString,
  MOMO_ENDPOINT: z.string().url().default("https://test-payment.momo.vn/v2/gateway/api/create"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
}).superRefine((value, context) => {
  if (context) {
    const optionalGroups = [
      { label: "MoMo", fields: ["MOMO_PARTNER_CODE", "MOMO_ACCESS_KEY", "MOMO_SECRET_KEY"] as const, signal: ["MOMO_PARTNER_CODE", "MOMO_ACCESS_KEY", "MOMO_SECRET_KEY"] as const },
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

export function validateEnvironment(source: Record<string, string | undefined> = process.env, runtime: "development" | "production" | string = process.env.NODE_ENV ?? "development") {
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

      const momoEnabled = Boolean(value.MOMO_PARTNER_CODE || value.MOMO_ACCESS_KEY || value.MOMO_SECRET_KEY);
      if (momoEnabled) {
        if (!source.MOMO_ENDPOINT) {
          context.addIssue({ code: z.ZodIssueCode.custom, path: ["MOMO_ENDPOINT"], message: "must be explicitly configured when MoMo is enabled in production" });
        } else {
          try {
            const endpointUrl = new URL(source.MOMO_ENDPOINT);
            const host = endpointUrl.hostname.replace(/^\[|\]$/g, "");
            if (endpointUrl.protocol !== "https:") {
              context.addIssue({ code: z.ZodIssueCode.custom, path: ["MOMO_ENDPOINT"], message: "must use HTTPS in production" });
            }
            if (host === "test-payment.momo.vn" || host.includes("test-payment.momo.vn")) {
              context.addIssue({ code: z.ZodIssueCode.custom, path: ["MOMO_ENDPOINT"], message: "cannot use test-payment.momo.vn in production" });
            }
          } catch {
            // malformed url handled by zod base schema
          }
        }
      }
    }
  }).safeParse(source);
  return parsed;
}

export function getEnv(source: Record<string, string | undefined> = process.env, runtime: string = process.env.NODE_ENV ?? "development") {
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
