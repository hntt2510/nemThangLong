-- Customer after-sales / warranty review requests.
CREATE TYPE "AfterSalesRequestType" AS ENUM ('WARRANTY_REVIEW', 'PRODUCT_SUPPORT');
CREATE TYPE "AfterSalesStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'RESOLVED', 'CLOSED');

CREATE TABLE "AfterSalesRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "type" "AfterSalesRequestType" NOT NULL,
    "status" "AfterSalesStatus" NOT NULL DEFAULT 'SUBMITTED',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AfterSalesRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AfterSalesRequest_userId_createdAt_idx" ON "AfterSalesRequest"("userId", "createdAt");
CREATE INDEX "AfterSalesRequest_status_type_createdAt_idx" ON "AfterSalesRequest"("status", "type", "createdAt");
CREATE INDEX "AfterSalesRequest_orderId_idx" ON "AfterSalesRequest"("orderId");
CREATE INDEX "AfterSalesRequest_orderItemId_idx" ON "AfterSalesRequest"("orderItemId");

ALTER TABLE "AfterSalesRequest" ADD CONSTRAINT "AfterSalesRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AfterSalesRequest" ADD CONSTRAINT "AfterSalesRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AfterSalesRequest" ADD CONSTRAINT "AfterSalesRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
