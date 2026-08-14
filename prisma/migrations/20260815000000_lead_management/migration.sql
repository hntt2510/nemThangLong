-- G03/G04: neutral hotel/project and consultation lead management.
CREATE TYPE "LeadType" AS ENUM ('CONSULTATION', 'B2B_PROJECT');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED');
CREATE TYPE "LeadSource" AS ENUM ('CONTACT_PAGE', 'B2B_PAGE');

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "organization" TEXT,
    "projectLocation" TEXT,
    "estimatedQuantity" INTEGER,
    "productSlug" TEXT,
    "message" TEXT,
    "source" "LeadSource" NOT NULL,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_status_type_createdAt_idx" ON "Lead"("status", "type", "createdAt");
CREATE INDEX "Lead_phone_createdAt_idx" ON "Lead"("phone", "createdAt");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
