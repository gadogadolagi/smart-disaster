-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'petugas');

-- CreateEnum
CREATE TYPE "DisasterType" AS ENUM ('flood', 'fire', 'fallen_tree', 'landslide', 'earthquake', 'other');

-- CreateEnum
CREATE TYPE "RoadIssueType" AS ENUM ('pothole', 'landslide', 'bridge_damage', 'crack', 'flooding');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'verified', 'in_progress', 'resolved');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "DangerLevel" AS ENUM ('minor', 'moderate', 'severe');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disaster_reports" (
    "id" TEXT NOT NULL,
    "type" "DisasterType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "district" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'medium',
    "urgencyPercentage" DOUBLE PRECISION DEFAULT 0,
    "reportedById" TEXT,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "handledBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disaster_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "road_reports" (
    "id" TEXT NOT NULL,
    "type" "RoadIssueType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "district" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "dangerLevel" "DangerLevel" NOT NULL DEFAULT 'moderate',
    "urgencyPercentage" DOUBLE PRECISION DEFAULT 0,
    "reportedById" TEXT,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "aiDetectedIssues" TEXT[],
    "aiConfidence" DOUBLE PRECISION,
    "aiRecommendedAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "road_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disasterReportId" TEXT,
    "roadReportId" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disaster_reports" ADD CONSTRAINT "disaster_reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "road_reports" ADD CONSTRAINT "road_reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_disasterReportId_fkey" FOREIGN KEY ("disasterReportId") REFERENCES "disaster_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_roadReportId_fkey" FOREIGN KEY ("roadReportId") REFERENCES "road_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
