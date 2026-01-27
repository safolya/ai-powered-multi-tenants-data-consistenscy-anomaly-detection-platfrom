-- DropForeignKey
ALTER TABLE "Change_track" DROP CONSTRAINT "Change_track_recordId_fkey";

-- AddForeignKey
ALTER TABLE "Change_track" ADD CONSTRAINT "Change_track_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
