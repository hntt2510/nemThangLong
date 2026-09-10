-- A checkout key is claimed in the same serializable transaction that creates
-- its order.  The key and normalized request are hashed before persistence.
CREATE TABLE "CheckoutRequest" (
  "id" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CheckoutRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CheckoutRequest_keyHash_key" ON "CheckoutRequest"("keyHash");
CREATE UNIQUE INDEX "CheckoutRequest_orderId_key" ON "CheckoutRequest"("orderId");

ALTER TABLE "CheckoutRequest"
  ADD CONSTRAINT "CheckoutRequest_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
