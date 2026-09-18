-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "docType" TEXT;
ALTER TABLE "Customer" ADD COLUMN "docNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_docType_docNumber_key" ON "Customer"("docType", "docNumber");