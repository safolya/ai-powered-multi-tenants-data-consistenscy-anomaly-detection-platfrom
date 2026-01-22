/*
  Warnings:

  - The primary key for the `Records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tenants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User_Tenants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invitations` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "User_Tenants" DROP CONSTRAINT "User_Tenants_roleId_fkey";

-- DropForeignKey
ALTER TABLE "User_Tenants" DROP CONSTRAINT "User_Tenants_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User_Tenants" DROP CONSTRAINT "User_Tenants_userId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_tenantId_fkey";

-- AlterTable
ALTER TABLE "Records" DROP CONSTRAINT "Records_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Records_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Records_id_seq";

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Role_id_seq";

-- AlterTable
ALTER TABLE "Tenants" DROP CONSTRAINT "Tenants_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tenants_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tenants_id_seq";

-- AlterTable
ALTER TABLE "User_Tenants" DROP CONSTRAINT "User_Tenants_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_Tenants_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_Tenants_id_seq";

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Users_id_seq";

-- AlterTable
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "invitations_id_seq";

-- CreateTable
CREATE TABLE "Change_track" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "newval" INTEGER NOT NULL,
    "oldval" INTEGER NOT NULL,
    "tenantId" TEXT NOT NULL,
    "changeBy" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Change_track_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User_Tenants" ADD CONSTRAINT "User_Tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Tenants" ADD CONSTRAINT "User_Tenants_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Tenants" ADD CONSTRAINT "User_Tenants_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Records" ADD CONSTRAINT "Records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_track" ADD CONSTRAINT "Change_track_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_track" ADD CONSTRAINT "Change_track_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
