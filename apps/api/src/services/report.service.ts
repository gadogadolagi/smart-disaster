import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { createPaginationResponse, parsePaginationParams } from '../utils/pagination';
import { aiPredictionService } from './ai-prediction.service';

export class ReportService {
  async getDisasterReports(query: any) {
    const { page, limit, skip } = parsePaginationParams(query);
    const { status, riskLevel, district } = query;

    const where: Prisma.DisasterReportWhereInput = {};
    if (status) where.status = status as any;
    if (riskLevel) where.riskLevel = riskLevel as any;
    if (district) {
      where.district = {
        contains: district as string,
        mode: 'insensitive',
      };
    }

    const [reports, total] = await Promise.all([
      prisma.disasterReport.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          address: true,
          lat: true,
          lng: true,
          district: true,
          images: true,
          status: true,
          riskLevel: true,
          urgencyPercentage: true,
          reporterName: true,
          reporterPhone: true,
          handledBy: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          reportedBy: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.disasterReport.count({ where }),
    ]);

    return createPaginationResponse(reports, total, page, limit);
  }

  async getDisasterReportById(id: string) {
    const report = await prisma.disasterReport.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        urgencyPercentage: true,
        reporterName: true,
        reporterPhone: true,
        handledBy: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundError('Disaster report not found');
    }

    return report;
  }

  async createDisasterReport(data: any, imagePaths: string[]) {
    // Run AI prediction untuk mendapatkan urgency percentage
    let urgencyPercentage = 0;
    let aiMetadata: any = {};

    try {
      const aiResult = await aiPredictionService.predictUrgency('disaster', data.type, {
        description: data.description,
        title: data.title,
        images: imagePaths,
      });

      urgencyPercentage = aiResult.urgencyPercentage;
      aiMetadata = {
        confidence: aiResult.confidence,
        detectedIssues: aiResult.detectedIssues,
        recommendedAction: aiResult.recommendedAction,
        metadata: aiResult.metadata,
      };

      logger.info(`AI prediction for disaster report: ${urgencyPercentage}%`, {
        type: data.type,
        confidence: aiResult.confidence,
      });
    } catch (error) {
      logger.error('Failed to run AI prediction for disaster report', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Continue dengan default value jika AI prediction gagal
    }

    const report = await prisma.disasterReport.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        district: data.district,
        images: imagePaths,
        riskLevel: data.riskLevel || 'medium',
        urgencyPercentage: urgencyPercentage,
        reportedById: data.reportedById || null,
        reporterName: data.reportedById ? null : data.reporterName || null,
        reporterPhone: data.reportedById ? null : data.reporterPhone || null,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        urgencyPercentage: true,
        reporterName: true,
        reporterPhone: true,
        handledBy: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return report;
  }

  async updateDisasterReport(id: string, data: any) {
    const report = await prisma.disasterReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundError('Disaster report not found');
    }

    const updatedReport = await prisma.disasterReport.update({
      where: { id },
      data,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        urgencyPercentage: true,
        reporterName: true,
        reporterPhone: true,
        handledBy: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return updatedReport;
  }

  async deleteDisasterReport(id: string) {
    const report = await prisma.disasterReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundError('Disaster report not found');
    }

    await prisma.disasterReport.delete({
      where: { id },
    });

    return { message: 'Disaster report deleted successfully' };
  }

  // Road Reports
  async getRoadReports(query: any) {
    const { page, limit, skip } = parsePaginationParams(query);
    const { status, dangerLevel, district } = query;

    const where: Prisma.RoadReportWhereInput = {};
    if (status) where.status = status as any;
    if (dangerLevel) where.dangerLevel = dangerLevel as any;
    if (district) {
      where.district = {
        contains: district as string,
        mode: 'insensitive',
      };
    }

    const [reports, total] = await Promise.all([
      prisma.roadReport.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          address: true,
          lat: true,
          lng: true,
          district: true,
          images: true,
          status: true,
          dangerLevel: true,
          urgencyPercentage: true,
          reporterName: true,
          reporterPhone: true,
          aiDetectedIssues: true,
          aiConfidence: true,
          aiRecommendedAction: true,
          createdAt: true,
          updatedAt: true,
          reportedBy: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.roadReport.count({ where }),
    ]);

    return createPaginationResponse(reports, total, page, limit);
  }

  async getRoadReportById(id: string) {
    const report = await prisma.roadReport.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        dangerLevel: true,
        urgencyPercentage: true,
        reporterName: true,
        reporterPhone: true,
        aiDetectedIssues: true,
        aiConfidence: true,
        aiRecommendedAction: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundError('Road report not found');
    }

    return report;
  }

  async createRoadReport(data: any, imagePaths: string[]) {
    // Run AI prediction untuk mendapatkan urgency percentage
    let urgencyPercentage = 0;
    let aiDetectedIssues: string[] = [];
    let aiConfidence: number | null = null;
    let aiRecommendedAction: string | null = null;

    try {
      const aiResult = await aiPredictionService.predictUrgency('road', data.type, {
        description: data.description,
        title: data.title,
        images: imagePaths,
        type: data.type,
      });

      urgencyPercentage = aiResult.urgencyPercentage;
      aiDetectedIssues = aiResult.detectedIssues || [];
      aiConfidence = aiResult.confidence || null;
      aiRecommendedAction = aiResult.recommendedAction || null;

      logger.info(`AI prediction for road report: ${urgencyPercentage}%`, {
        type: data.type,
        confidence: aiResult.confidence,
      });
    } catch (error) {
      logger.error('Failed to run AI prediction for road report', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Continue dengan default value jika AI prediction gagal
    }

    const report = await prisma.roadReport.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        district: data.district,
        images: imagePaths,
        dangerLevel: data.dangerLevel || 'moderate',
        urgencyPercentage: urgencyPercentage,
        reportedById: data.reportedById || null,
        reporterName: data.reportedById ? null : data.reporterName || null,
        reporterPhone: data.reportedById ? null : data.reporterPhone || null,
        aiDetectedIssues: aiDetectedIssues,
        aiConfidence: aiConfidence,
        aiRecommendedAction: aiRecommendedAction,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        dangerLevel: true,
        urgencyPercentage: true,
        reporterName: true,
        reporterPhone: true,
        aiDetectedIssues: true,
        aiConfidence: true,
        aiRecommendedAction: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return report;
  }

  async updateRoadReport(id: string, data: any) {
    const report = await prisma.roadReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundError('Road report not found');
    }

    const updatedReport = await prisma.roadReport.update({
      where: { id },
      data,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        dangerLevel: true,
        urgencyPercentage: true,
        reporterName: true,
        reporterPhone: true,
        aiDetectedIssues: true,
        aiConfidence: true,
        aiRecommendedAction: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return updatedReport;
  }

  async deleteRoadReport(id: string) {
    const report = await prisma.roadReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundError('Road report not found');
    }

    await prisma.roadReport.delete({
      where: { id },
    });

    return { message: 'Road report deleted successfully' };
  }
}

export const reportService = new ReportService();
