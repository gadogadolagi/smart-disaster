import { ReportStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../utils/errorHandler';

export interface CreateActivityData {
  reportId: string;
  reportType: 'disaster' | 'road';
  activityType:
    | 'assigned'
    | 'status_changed'
    | 'verified'
    | 'in_progress'
    | 'resolved'
    | 'note_added'
    | 'comment_added';
  description: string;
  images?: string[]; // Optional array of image paths
  metadata?: any;
}

export class ActivityService {
  /**
   * Create activity log for a report
   */
  async createActivity(data: CreateActivityData, createdById: string) {
    // Verify report exists
    if (data.reportType === 'disaster') {
      const report = await prisma.disasterReport.findUnique({
        where: { id: data.reportId },
      });
      if (!report) {
        throw new NotFoundError('Disaster report not found');
      }
    } else {
      const report = await prisma.roadReport.findUnique({
        where: { id: data.reportId },
      });
      if (!report) {
        throw new NotFoundError('Road report not found');
      }
    }

    // Create activity
    const activity = await prisma.reportActivity.create({
      data: {
        reportId: data.reportId,
        reportType: data.reportType,
        activityType: data.activityType,
        description: data.description,
        images: data.images || [],
        metadata: data.metadata || {},
        createdById,
        ...(data.reportType === 'disaster'
          ? { disasterReportId: data.reportId }
          : { roadReportId: data.reportId }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return activity;
  }

  /**
   * Create status change activity
   */
  async createStatusChangeActivity(
    reportId: string,
    reportType: 'disaster' | 'road',
    oldStatus: ReportStatus,
    newStatus: ReportStatus,
    createdById: string
  ) {
    return this.createActivity(
      {
        reportId,
        reportType,
        activityType: 'status_changed',
        description: `Status berubah dari ${oldStatus} menjadi ${newStatus}`,
        metadata: {
          oldStatus,
          newStatus,
        },
      },
      createdById
    );
  }

  /**
   * Get all activities for a report
   */
  async getReportActivities(reportId: string, reportType: 'disaster' | 'road') {
    const activities = await prisma.reportActivity.findMany({
      where: {
        reportId,
        reportType,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return activities;
  }

  /**
   * Petugas creates activity log
   */
  async createPetugasActivity(
    reportId: string,
    reportType: 'disaster' | 'road',
    description: string,
    activityType: 'status_changed' | 'verified' | 'in_progress' | 'resolved' | 'note_added',
    metadata: any,
    petugasId: string,
    images?: string[]
  ) {
    // Verify petugas is assigned to this report
    if (reportType === 'disaster') {
      const report = await prisma.disasterReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundError('Disaster report not found');
      }

      if (report.assignedToId !== petugasId) {
        throw new ValidationError('You are not assigned to this report');
      }
    } else {
      const report = await prisma.roadReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundError('Road report not found');
      }

      if (report.assignedToId !== petugasId) {
        throw new ValidationError('You are not assigned to this report');
      }
    }

    return this.createActivity(
      {
        reportId,
        reportType,
        activityType,
        description,
        images,
        metadata,
      },
      petugasId
    );
  }
}

export const activityService = new ActivityService();
