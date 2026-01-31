-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "severity" "AnomalySeverity" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Anomaly_tenantId_idx" ON "Anomaly"("tenantId");

-- CreateIndex
CREATE INDEX "Anomaly_recordId_idx" ON "Anomaly"("recordId");

-- CreateIndex
CREATE INDEX "Anomaly_createdAt_idx" ON "Anomaly"("createdAt");

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Change_track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
