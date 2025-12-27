import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { createPaginationResponse, parsePaginationParams } from '../utils/pagination';
import { aiPredictionService } from './ai-prediction.service';
import { emailService } from './email.service';

/**
 * Helper function to convert urgencyPercentage to riskLevel
 * @param urgencyPercentage 0-100 or null
 * @param defaultLevel Default level if urgencyPercentage is null
 * @returns RiskLevel: low, medium, high, critical
 */
function urgencyToRiskLevel(
  urgencyPercentage: number | null,
  defaultLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): 'low' | 'medium' | 'high' | 'critical' {
  if (urgencyPercentage === null || urgencyPercentage === undefined) {
    return defaultLevel;
  }

  if (urgencyPercentage >= 76) {
    return 'critical';
  } else if (urgencyPercentage >= 51) {
    return 'high';
  } else if (urgencyPercentage >= 26) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Helper function to convert urgencyPercentage to dangerLevel
 * @param urgencyPercentage 0-100 or null
 * @param defaultLevel Default level if urgencyPercentage is null
 * @returns DangerLevel: minor, moderate, severe
 */
function urgencyToDangerLevel(
  urgencyPercentage: number | null,
  defaultLevel: 'minor' | 'moderate' | 'severe' = 'moderate'
): 'minor' | 'moderate' | 'severe' {
  if (urgencyPercentage === null || urgencyPercentage === undefined) {
    return defaultLevel;
  }

  if (urgencyPercentage >= 61) {
    return 'severe';
  } else if (urgencyPercentage >= 31) {
    return 'moderate';
  } else {
    return 'minor';
  }
}

export class ReportService {
  async getDisasterReports(query: any) {
    const { page, limit, skip } = parsePaginationParams(query);
    const { status, riskLevel, district, type } = query;

    const where: Prisma.DisasterReportWhereInput = {};
    if (status) where.status = status as any;
    if (riskLevel) where.riskLevel = riskLevel as any;
    if (type) where.type = type as any;
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
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
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
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Determine riskLevel from urgencyPercentage if not provided
    // Priority: 1) data.riskLevel (from frontend), 2) calculated from urgencyPercentage, 3) default 'medium'
    const calculatedRiskLevel = urgencyToRiskLevel(urgencyPercentage, 'medium');
    const finalRiskLevel = data.riskLevel || calculatedRiskLevel;

    logger.info('Disaster report risk level determination', {
      type: data.type,
      providedRiskLevel: data.riskLevel,
      urgencyPercentage,
      calculatedRiskLevel,
      finalRiskLevel,
    });

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
        riskLevel: finalRiskLevel,
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
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
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
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
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
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Determine dangerLevel from urgencyPercentage if not provided
    // Priority: 1) data.dangerLevel (from frontend), 2) calculated from urgencyPercentage, 3) default 'moderate'
    const calculatedDangerLevel = urgencyToDangerLevel(urgencyPercentage, 'moderate');
    const finalDangerLevel = data.dangerLevel || calculatedDangerLevel;

    logger.info('Road report danger level determination', {
      type: data.type,
      providedDangerLevel: data.dangerLevel,
      urgencyPercentage,
      calculatedDangerLevel,
      finalDangerLevel,
    });

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
        dangerLevel: finalDangerLevel,
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
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
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

  async getRecentReports(limit: number = 6) {
    // Get recent disaster reports with images
    const disasterReports = await prisma.disasterReport.findMany({
      where: {
        images: {
          isEmpty: false,
        },
      },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get recent road reports with images
    const roadReports = await prisma.roadReport.findMany({
      where: {
        images: {
          isEmpty: false,
        },
      },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        district: true,
        images: true,
        status: true,
        dangerLevel: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Combine and sort by createdAt, then take the most recent ones
    const allReports = [
      ...disasterReports.map((r) => ({ ...r, reportType: 'disaster' as const })),
      ...roadReports.map((r) => ({ ...r, reportType: 'road' as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return allReports;
  }

  /**
   * Get reports with coordinates for map preview
   * Includes filter by disaster type
   */
  async getReportsForMap(query: any) {
    const { type, limit = 50 } = query;

    const whereDisaster: Prisma.DisasterReportWhereInput = {};
    const whereRoad: Prisma.RoadReportWhereInput = {};

    // Filter by type if provided
    if (type && type !== 'all') {
      if (type === 'disaster') {
        // Only get disaster reports
        const reports = await prisma.disasterReport.findMany({
          where: whereDisaster,
          take: parseInt(limit as string),
          select: {
            id: true,
            type: true,
            title: true,
            lat: true,
            lng: true,
            address: true,
            district: true,
            status: true,
            riskLevel: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return reports.map((r) => ({ ...r, reportType: 'disaster' as const }));
      } else if (type === 'road') {
        // Only get road reports
        const reports = await prisma.roadReport.findMany({
          where: whereRoad,
          take: parseInt(limit as string),
          select: {
            id: true,
            type: true,
            title: true,
            lat: true,
            lng: true,
            address: true,
            district: true,
            status: true,
            dangerLevel: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return reports.map((r) => ({ ...r, reportType: 'road' as const }));
      } else {
        // Filter by specific disaster type
        whereDisaster.type = type as any;
        const reports = await prisma.disasterReport.findMany({
          where: whereDisaster,
          take: parseInt(limit as string),
          select: {
            id: true,
            type: true,
            title: true,
            lat: true,
            lng: true,
            address: true,
            district: true,
            status: true,
            riskLevel: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return reports.map((r) => ({ ...r, reportType: 'disaster' as const }));
      }
    }

    // Get both types if no filter
    const [disasterReports, roadReports] = await Promise.all([
      prisma.disasterReport.findMany({
        where: whereDisaster,
        take: parseInt(limit as string),
        select: {
          id: true,
          type: true,
          title: true,
          lat: true,
          lng: true,
          address: true,
          district: true,
          status: true,
          riskLevel: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.roadReport.findMany({
        where: whereRoad,
        take: parseInt(limit as string),
        select: {
          id: true,
          type: true,
          title: true,
          lat: true,
          lng: true,
          address: true,
          district: true,
          status: true,
          dangerLevel: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const allReports = [
      ...disasterReports.map((r) => ({ ...r, reportType: 'disaster' as const })),
      ...roadReports.map((r) => ({ ...r, reportType: 'road' as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, parseInt(limit as string));

    return allReports;
  }
}

export const reportService = new ReportService();
