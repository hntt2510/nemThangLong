-- Payment lifecycle hardening: manual review state and bank-transfer reservation TTL.
ALTER TYPE "PaymentStatus" ADD VALUE 'REVIEW_REQUIRED';

ALTER TABLE "SiteSettings"
ADD COLUMN "bankTransferReservationMinutes" INTEGER;
