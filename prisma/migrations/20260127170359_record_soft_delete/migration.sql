-- DropForeignKey
ALTER TABLE "Records" DROP CONSTRAINT "Records_tenantId_fkey";

-- AlterTable
ALTER TABLE "Records" ADD COLUMN     "deleteAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Records" ADD CONSTRAINT "Records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
