-- Admin catalog, inventory audit and payment review operations.
CREATE TYPE "InventoryAdjustmentReason" AS ENUM ('RECEIPT', 'CORRECTION', 'DAMAGE', 'OTHER');
CREATE TYPE "PaymentReviewAction" AS ENUM ('FULFILL', 'MANUAL_REFUND_RECORDED');

CREATE TABLE "InventoryAdjustment" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "reason" "InventoryAdjustmentReason" NOT NULL,
  "note" TEXT,
  "actorId" TEXT NOT NULL,
  "resultingStock" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentReviewResolution" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "paymentAttemptId" TEXT NOT NULL,
  "action" "PaymentReviewAction" NOT NULL,
  "actorId" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentReviewResolution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentReviewResolution_orderId_key" ON "PaymentReviewResolution"("orderId");
CREATE UNIQUE INDEX "PaymentReviewResolution_paymentAttemptId_key" ON "PaymentReviewResolution"("paymentAttemptId");
CREATE INDEX "InventoryAdjustment_variantId_createdAt_idx" ON "InventoryAdjustment"("variantId", "createdAt");
CREATE INDEX "InventoryAdjustment_actorId_createdAt_idx" ON "InventoryAdjustment"("actorId", "createdAt");
CREATE INDEX "PaymentReviewResolution_action_createdAt_idx" ON "PaymentReviewResolution"("action", "createdAt");

ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentReviewResolution" ADD CONSTRAINT "PaymentReviewResolution_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentReviewResolution" ADD CONSTRAINT "PaymentReviewResolution_paymentAttemptId_fkey" FOREIGN KEY ("paymentAttemptId") REFERENCES "PaymentAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentReviewResolution" ADD CONSTRAINT "PaymentReviewResolution_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stock_nonnegative" CHECK ("stock" >= 0);
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_resultingStock_nonnegative" CHECK ("resultingStock" >= 0);
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_delta_nonzero" CHECK ("delta" <> 0);
