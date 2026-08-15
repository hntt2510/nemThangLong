import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { sqltag } from "@prisma/client/runtime/library";
import { getEnv } from "@/lib/env";

export const LEAD_IP_LIMIT = 5;
export const LEAD_IP_WINDOW_MS = 10 * 60 * 1000;
export const LEAD_PHONE_LIMIT = 3;
export const LEAD_PHONE_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_CLEANUP_BATCH_SIZE = 100;
const DEV_RATE_LIMIT_SECRET = "thang-long-lead-rate-limit-dev-only-secret";

export type LeadRateLimitKind = "IP" | "PHONE";
export type LeadRateLimitTransaction = Pick<PrismaClient, "$executeRaw" | "$queryRaw">;

export function getLeadRateLimitSecret() {
  const configured = getEnv().LEAD_RATE_LIMIT_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") return DEV_RATE_LIMIT_SECRET;
  throw new Error("LEAD_RATE_LIMIT_SECRET is required.");
}

export function hashLeadRateLimitKey(kind: LeadRateLimitKind, value: string, secret = getLeadRateLimitSecret()) {
  return createHmac("sha256", secret).update(`${kind}:${value}`).digest("hex");
}

export async function consumeLeadRateLimitBucket(
  tx: LeadRateLimitTransaction,
  kind: LeadRateLimitKind,
  keyHash: string,
  now: Date,
  windowMs: number,
): Promise<number> {
  const expiresAt = new Date(now.getTime() + windowMs);
  const rows = await tx.$queryRaw<Array<{ count: number }>>(sqltag`
    INSERT INTO "LeadRateLimitBucket" ("id", "kind", "keyHash", "windowStart", "count", "expiresAt", "updatedAt")
    VALUES (${randomUUID()}, CAST(${kind} AS "LeadRateLimitKind"), ${keyHash}, ${now}, 1, ${expiresAt}, ${now})
    ON CONFLICT ("kind", "keyHash") DO UPDATE
    SET
      "windowStart" = CASE WHEN "LeadRateLimitBucket"."expiresAt" <= ${now} THEN ${now} ELSE "LeadRateLimitBucket"."windowStart" END,
      "count" = CASE WHEN "LeadRateLimitBucket"."expiresAt" <= ${now} THEN 1 ELSE "LeadRateLimitBucket"."count" + 1 END,
      "expiresAt" = CASE WHEN "LeadRateLimitBucket"."expiresAt" <= ${now} THEN ${expiresAt} ELSE "LeadRateLimitBucket"."expiresAt" END,
      "updatedAt" = ${now}
    RETURNING "count"
  `);
  return rows[0]?.count ?? 0;
}

export async function cleanupExpiredLeadRateLimitBuckets(
  prisma: LeadRateLimitTransaction,
  now = new Date(),
  batchSize = RATE_LIMIT_CLEANUP_BATCH_SIZE,
) {
  const safeBatchSize = Math.max(1, Math.min(Math.floor(batchSize), RATE_LIMIT_CLEANUP_BATCH_SIZE));
  return prisma.$executeRaw(sqltag`
    DELETE FROM "LeadRateLimitBucket"
    WHERE "id" IN (
      SELECT "id"
      FROM "LeadRateLimitBucket"
      WHERE "expiresAt" <= ${now}
      ORDER BY "expiresAt" ASC
      LIMIT ${safeBatchSize}
    )
  `);
}
