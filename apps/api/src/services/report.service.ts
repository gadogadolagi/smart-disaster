import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errorHandler';
import { parsePaginationParams, createPaginationResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

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
        reportedById: data.reportedById || null,
        reporterName: data.reportedById ? null : data.reporterName || null,
        reporterPhone: data.reportedById ? null : data.reporterPhone || null,
        aiDetectedIssues: [],
        aiConfidence: null,
        aiRecommendedAction: null,
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
