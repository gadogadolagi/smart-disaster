import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { createPaginationResponse, parsePaginationParams } from '../utils/pagination';
import { aiPredictionService } from './ai-prediction.service';
import { emailService } from './email.service';

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
    // Hanya prediksi untuk banjir (flood) dari deskripsi
    let urgencyPercentage: number | null = null;
    let aiRecommendedAction: string | null = null;

    // Hanya jalankan prediksi jika type adalah flood
    if (data.type === 'flood') {
      try {
        const aiResult = await aiPredictionService.predictUrgency('disaster', data.type, {
          description: data.description,
          title: data.title,
          images: imagePaths,
        });

        urgencyPercentage = aiResult.urgencyPercentage ?? null;
        aiRecommendedAction = aiResult.recommendedAction ?? null;

        if (urgencyPercentage !== null) {
          logger.info(`AI prediction for flood report: ${urgencyPercentage}%`, {
            type: data.type,
            confidence: aiResult.confidence,
            hasRecommendation: !!aiRecommendedAction,
          });
        } else {
          logger.warn('AI prediction returned null for flood report (service may be down)');
        }
      } catch (error) {
        logger.error('Failed to run AI prediction for flood report', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Set null jika error - tidak akan mengganggu proses pembuatan laporan
        urgencyPercentage = null;
        aiRecommendedAction = null;
      }
    } else {
      logger.info(`Skipping AI prediction for disaster type: ${data.type} (only flood uses AI)`);
    }

    // Build notes dengan recommendation dari AI jika ada
    let notes = data.notes || null;
    if (aiRecommendedAction) {
      notes = notes
        ? `${notes}\n\n[Rekomendasi AI]: ${aiRecommendedAction}`
        : `[Rekomendasi AI]: ${aiRecommendedAction}`;
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
        urgencyPercentage: urgencyPercentage ?? 0, // Default 0 jika null
        reportedById: data.reportedById || null,
        reporterName: data.reportedById ? null : data.reporterName || null,
        reporterPhone: data.reportedById ? null : data.reporterPhone || null,
        notes: notes,
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

    // Send email notification to admins (non-blocking)
    this.sendNewReportEmailNotification(report, 'disaster').catch((error) => {
      logger.error('Failed to send email notification for disaster report', {
        error: error instanceof Error ? error.message : String(error),
        reportId: report.id,
      });
    });

    return report;
  }

  /**
   * Send email notification for new report (helper method)
   */
  private async sendNewReportEmailNotification(
    report: any,
    reportType: 'disaster' | 'road'
  ): Promise<void> {
    try {
      // Get reporter email if available
      let reporterEmail: string | undefined;
      if (report.reportedBy) {
        const reporter = await prisma.user.findUnique({
          where: { id: report.reportedBy.id },
          select: { email: true },
        });
        reporterEmail = reporter?.email;
      }

      const reportUrl = process.env.APP_URL ? `${process.env.APP_URL}/monitoring` : undefined;

      await emailService.sendNewReportNotification({
        reportId: report.id,
        reportType,
        title: report.title,
        description: report.description,
        address: report.address,
        district: report.district,
        type: report.type,
        reporterName: report.reporterName || report.reportedBy?.name,
        reporterEmail,
        reporterPhone: report.reporterPhone || report.reportedBy?.phone,
        urgencyPercentage: report.urgencyPercentage,
        riskLevel: report.riskLevel,
        dangerLevel: report.dangerLevel,
        createdAt: report.createdAt,
        reportUrl,
      });
    } catch (error) {
      // Log but don't throw - email failure shouldn't break report creation
      logger.error('Error in sendNewReportEmailNotification', {
        error: error instanceof Error ? error.message : String(error),
        reportId: report.id,
        reportType,
      });
    }
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
    // Prediksi untuk semua jenis jalan rusak dari gambar
    let urgencyPercentage: number | null = null;
    let aiDetectedIssues: string[] = [];
    let aiConfidence: number | null = null;
    let aiRecommendedAction: string | null = null;

    // Hanya jalankan prediksi jika ada gambar
    if (imagePaths && imagePaths.length > 0) {
      try {
        const aiResult = await aiPredictionService.predictUrgency('road', data.type, {
          description: data.description,
          title: data.title,
          images: imagePaths,
          type: data.type,
        });

        urgencyPercentage = aiResult.urgencyPercentage ?? null;
        aiDetectedIssues = aiResult.detectedIssues || [];
        aiConfidence = aiResult.confidence ? aiResult.confidence * 100 : null; // Convert dari 0-1 ke 0-100
        aiRecommendedAction = aiResult.recommendedAction ?? null;

        if (urgencyPercentage !== null) {
          logger.info(`AI prediction for road report: ${urgencyPercentage}%`, {
            type: data.type,
            confidence: aiConfidence,
            hasRecommendation: !!aiRecommendedAction,
          });
        } else {
          logger.warn('AI prediction returned null for road report (service may be down)');
        }
      } catch (error) {
        logger.error('Failed to run AI prediction for road report', {
          error: error instanceof Error ? error.message : String(error),
        });
        // Set null jika error - tidak akan mengganggu proses pembuatan laporan
        urgencyPercentage = null;
        aiDetectedIssues = [];
        aiConfidence = null;
        aiRecommendedAction = null;
      }
    } else {
      logger.info('Skipping AI prediction for road report (no images provided)');
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
        urgencyPercentage: urgencyPercentage ?? 0, // Default 0 jika null
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

    // Send email notification to admins (non-blocking)
    this.sendNewReportEmailNotification(report, 'road').catch((error) => {
      logger.error('Failed to send email notification for road report', {
        error: error instanceof Error ? error.message : String(error),
        reportId: report.id,
      });
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

  async getUserReports(userId: string, query: any) {
    const { page, limit, skip } = parsePaginationParams(query);
    const { status, type } = query;

    const whereDisaster: Prisma.DisasterReportWhereInput = {
      reportedById: userId,
    };
    if (status) whereDisaster.status = status as any;
    if (type) whereDisaster.type = type as any;

    const whereRoad: Prisma.RoadReportWhereInput = {
      reportedById: userId,
    };
    if (status) whereRoad.status = status as any;
    if (type) whereRoad.type = type as any;

    const [disasterReports, roadReports, disasterTotal, roadTotal] = await Promise.all([
      prisma.disasterReport.findMany({
        where: whereDisaster,
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
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.roadReport.findMany({
        where: whereRoad,
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
          aiDetectedIssues: true,
          aiConfidence: true,
          aiRecommendedAction: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.disasterReport.count({ where: whereDisaster }),
      prisma.roadReport.count({ where: whereRoad }),
    ]);

    return {
      disasterReports,
      roadReports,
      pagination: {
        page,
        limit,
        total: disasterTotal + roadTotal,
        totalPages: Math.ceil((disasterTotal + roadTotal) / limit),
      },
    };
  }
}

export const reportService = new ReportService();
