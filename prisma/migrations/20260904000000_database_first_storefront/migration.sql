-- Database-first storefront and hybrid CMS. Legacy Product.isDemo and
-- MediaAsset.productId remain temporarily so existing records can be backfilled
-- without a destructive reset.

CREATE TYPE "ProductPresentation" AS ENUM ('STANDARD', 'LUXURY');
CREATE TYPE "SaleStatus" AS ENUM ('HIDDEN', 'CONTACT_ONLY', 'ACTIVE');
CREATE TYPE "VerificationStatus" AS ENUM ('PLACEHOLDER', 'VERIFIED');
CREATE TYPE "ProductContentBlockType" AS ENUM ('AUDIENCE', 'MATERIAL_STORY', 'DELIVERY', 'WARRANTY');
CREATE TYPE "MediaSourceType" AS ENUM ('AI_GENERATED', 'UPLOAD', 'EXTERNAL');
CREATE TYPE "MediaReviewStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductProfile" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "firmnessLabel" TEXT,
    "firmnessScore" INTEGER,
    "support" INTEGER,
    "breathability" INTEGER,
    "motionIsolation" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductContentBlock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "ProductContentBlockType" NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductContentBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductMedia" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'gallery',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "fit" TEXT NOT NULL DEFAULT 'cover',
    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageSectionMedia" (
    "id" TEXT NOT NULL,
    "pageSectionId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'primary',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "fit" TEXT NOT NULL DEFAULT 'cover',
    CONSTRAINT "PageSectionMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "parentId" TEXT,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Product"
    ADD COLUMN "categoryId" TEXT,
    ADD COLUMN "presentation" "ProductPresentation" NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN "saleStatus" "SaleStatus" NOT NULL DEFAULT 'CONTACT_ONLY',
    ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PLACEHOLDER',
    ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "seoTitle" TEXT,
    ADD COLUMN "seoDescription" TEXT;

ALTER TABLE "MediaAsset"
    ALTER COLUMN "productId" DROP NOT NULL,
    ADD COLUMN "storageKey" TEXT,
    ADD COLUMN "mimeType" TEXT,
    ADD COLUMN "width" INTEGER,
    ADD COLUMN "height" INTEGER,
    ADD COLUMN "checksum" TEXT,
    ADD COLUMN "sourceType" "MediaSourceType" NOT NULL DEFAULT 'UPLOAD',
    ADD COLUMN "reviewStatus" "MediaReviewStatus" NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

INSERT INTO "ProductMedia" ("id", "productId", "mediaAssetId", "role", "sortOrder", "focalX", "focalY", "fit")
SELECT 'legacy-' || "id", "productId", "id", "type", "sortOrder", "focalX", "focalY", "fit"
FROM "MediaAsset"
WHERE "productId" IS NOT NULL;

CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");
CREATE UNIQUE INDEX "ProductProfile_productId_key" ON "ProductProfile"("productId");
CREATE UNIQUE INDEX "ProductContentBlock_productId_type_key" ON "ProductContentBlock"("productId", "type");
CREATE UNIQUE INDEX "ProductMedia_productId_mediaAssetId_key" ON "ProductMedia"("productId", "mediaAssetId");
CREATE INDEX "ProductMedia_productId_sortOrder_idx" ON "ProductMedia"("productId", "sortOrder");
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE UNIQUE INDEX "PageSection_pageId_key_key" ON "PageSection"("pageId", "key");
CREATE INDEX "PageSection_pageId_sortOrder_idx" ON "PageSection"("pageId", "sortOrder");
CREATE UNIQUE INDEX "PageSectionMedia_pageSectionId_mediaAssetId_key" ON "PageSectionMedia"("pageSectionId", "mediaAssetId");
CREATE UNIQUE INDEX "Menu_key_key" ON "Menu"("key");
CREATE INDEX "MenuItem_menuId_parentId_sortOrder_idx" ON "MenuItem"("menuId", "parentId", "sortOrder");
CREATE INDEX "Product_categoryId_status_sortOrder_idx" ON "Product"("categoryId", "status", "sortOrder");
CREATE INDEX "MediaAsset_reviewStatus_sourceType_idx" ON "MediaAsset"("reviewStatus", "sourceType");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductProfile" ADD CONSTRAINT "ProductProfile_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductContentBlock" ADD CONSTRAINT "ProductContentBlock_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_mediaAssetId_fkey"
    FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageSectionMedia" ADD CONSTRAINT "PageSectionMedia_pageSectionId_fkey"
    FOREIGN KEY ("pageSectionId") REFERENCES "PageSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageSectionMedia" ADD CONSTRAINT "PageSectionMedia_mediaAssetId_fkey"
    FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey"
    FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
