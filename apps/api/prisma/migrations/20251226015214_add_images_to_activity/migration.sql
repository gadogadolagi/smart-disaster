-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('assigned', 'status_changed', 'verified', 'in_progress', 'resolved', 'note_added', 'comment_added');

-- AlterTable
ALTER TABLE "disaster_reports" ADD COLUMN     "assignedToId" TEXT;

-- AlterTable
ALTER TABLE "road_reports" ADD COLUMN     "assignedToId" TEXT;

-- CreateTable
CREATE TABLE "report_activities" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disasterReportId" TEXT,
    "roadReportId" TEXT,

    CONSTRAINT "report_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_activities_reportId_reportType_idx" ON "report_activities"("reportId", "reportType");

-- CreateIndex
CREATE INDEX "report_activities_createdAt_idx" ON "report_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "disaster_reports" ADD CONSTRAINT "disaster_reports_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "road_reports" ADD CONSTRAINT "road_reports_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_activities" ADD CONSTRAINT "report_activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_activities" ADD CONSTRAINT "report_activities_disasterReportId_fkey" FOREIGN KEY ("disasterReportId") REFERENCES "disaster_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_activities" ADD CONSTRAINT "report_activities_roadReportId_fkey" FOREIGN KEY ("roadReportId") REFERENCES "road_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
