/*
  Warnings:

  - A unique constraint covering the columns `[domain]` on the table `Tenants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domain` to the `Tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tenants` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status_type" AS ENUM ('PENDING', 'ACCEPT', 'EXPIRE');

-- CreateEnum
CREATE TYPE "Tenant_status" AS ENUM ('PENDING', 'ACCEPT', 'REJECTED');

-- AlterTable
ALTER TABLE "Tenants" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "status" "Tenant_status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "invitations" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "token" "Status_type" NOT NULL DEFAULT 'PENDING',
    "role" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenants_domain_key" ON "Tenants"("domain");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
