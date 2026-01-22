-- CreateEnum
CREATE TYPE "Record_type" AS ENUM ('INVENTORY', 'CONFIG', 'PRICES', 'LIMIT');

-- AlterEnum
ALTER TYPE "Role_type" ADD VALUE 'MANAGER';

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Records" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "type" "Record_type" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Records_pkey" PRIMARY KEY ("id")
);
