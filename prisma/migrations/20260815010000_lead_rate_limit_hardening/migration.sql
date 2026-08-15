-- Atomic per-IP and per-phone lead rate-limit buckets.
CREATE TYPE "LeadRateLimitKind" AS ENUM ('IP', 'PHONE');

CREATE TABLE "LeadRateLimitBucket" (
    "id" TEXT NOT NULL,
    "kind" "LeadRateLimitKind" NOT NULL,
    "keyHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadRateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeadRateLimitBucket_kind_keyHash_key" ON "LeadRateLimitBucket"("kind", "keyHash");
CREATE INDEX "LeadRateLimitBucket_expiresAt_idx" ON "LeadRateLimitBucket"("expiresAt");
