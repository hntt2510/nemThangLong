ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'SEPAY';

ALTER TABLE "PaymentAttempt"
  ADD COLUMN "recipientBank" TEXT,
  ADD COLUMN "recipientAccountNumber" TEXT,
  ADD COLUMN "recipientAccountName" TEXT;

CREATE TABLE "SePayWebhookReceipt" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "orderId" TEXT,
  "outcome" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SePayWebhookReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SePayWebhookReceipt_transactionId_key" ON "SePayWebhookReceipt"("transactionId");
CREATE INDEX "SePayWebhookReceipt_orderId_createdAt_idx" ON "SePayWebhookReceipt"("orderId", "createdAt");
ALTER TABLE "SePayWebhookReceipt"
  ADD CONSTRAINT "SePayWebhookReceipt_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
