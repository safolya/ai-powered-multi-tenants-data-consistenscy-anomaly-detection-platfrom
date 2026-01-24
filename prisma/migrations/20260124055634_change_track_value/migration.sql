/*
  Warnings:

  - Added the required column `action` to the `Change_track` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `newval` on the `Change_track` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `oldval` on the `Change_track` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Action_type" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "Change_track" ADD COLUMN     "action" "Action_type" NOT NULL,
DROP COLUMN "newval",
ADD COLUMN     "newval" JSONB NOT NULL,
DROP COLUMN "oldval",
ADD COLUMN     "oldval" JSONB NOT NULL;
