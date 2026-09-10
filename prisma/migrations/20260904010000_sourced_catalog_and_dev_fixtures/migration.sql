CREATE TYPE "DataStatus" AS ENUM ('PLACEHOLDER', 'VERIFIED', 'SOURCE_CONFLICT');
CREATE TYPE "SourceReferenceType" AS ENUM ('OFFICIAL_WEBSITE', 'FACEBOOK', 'OWNER_DOCUMENT', 'INTERNAL_FIXTURE');

CREATE TABLE "SourceReference" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "publisher" TEXT,
  "sourceType" "SourceReferenceType" NOT NULL,
  "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SourceReference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductFact" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sourceReferenceId" TEXT,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "dataStatus" "DataStatus" NOT NULL DEFAULT 'PLACEHOLDER',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductFact_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductProfile" ADD COLUMN "dataStatus" "DataStatus" NOT NULL DEFAULT 'PLACEHOLDER';
ALTER TABLE "ProductContentBlock" ADD COLUMN "dataStatus" "DataStatus" NOT NULL DEFAULT 'PLACEHOLDER', ADD COLUMN "sourceReferenceId" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "priceStatus" "DataStatus" NOT NULL DEFAULT 'PLACEHOLDER', ADD COLUMN "stockStatus" "DataStatus" NOT NULL DEFAULT 'PLACEHOLDER', ADD COLUMN "sourceReferenceId" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN "sourceReferenceId" TEXT;
ALTER TABLE "Review" ADD COLUMN "isFixture" BOOLEAN NOT NULL DEFAULT false;

-- The old local Luxury fixture becomes the official hotel line. Updating the
-- existing row keeps any order items and legacy media relations attached.
UPDATE "Product"
SET "slug" = 'khach-san', "name" = 'Nệm Cao Su Cho Khách Sạn', "presentation" = 'STANDARD'
WHERE "slug" = 'luxury'
  AND NOT EXISTS (SELECT 1 FROM "Product" AS p WHERE p."slug" = 'khach-san');
UPDATE "MenuItem" SET "href" = '/nem/khach-san', "label" = 'Khách sạn'
WHERE "href" = '/nem/luxury';

CREATE UNIQUE INDEX "SourceReference_url_key" ON "SourceReference"("url");
CREATE UNIQUE INDEX "ProductFact_productId_key_key" ON "ProductFact"("productId", "key");
CREATE INDEX "ProductFact_productId_sortOrder_idx" ON "ProductFact"("productId", "sortOrder");
CREATE INDEX "ProductFact_sourceReferenceId_idx" ON "ProductFact"("sourceReferenceId");
CREATE INDEX "ProductVariant_priceStatus_stockStatus_idx" ON "ProductVariant"("priceStatus", "stockStatus");

ALTER TABLE "ProductFact" ADD CONSTRAINT "ProductFact_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductFact" ADD CONSTRAINT "ProductFact_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductContentBlock" ADD CONSTRAINT "ProductContentBlock_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_sourceReferenceId_fkey" FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
