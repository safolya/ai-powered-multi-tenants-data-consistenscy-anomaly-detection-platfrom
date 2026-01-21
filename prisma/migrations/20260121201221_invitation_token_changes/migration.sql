/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `token` on the `invitations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "status" "Status_type" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "token",
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");
