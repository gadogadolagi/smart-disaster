import { ReportStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { activityService } from '../services/activity.service';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';

export class ActivityController {
  /**
   * Get activities for a report
   */
  getReportActivities = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const { reportType } = req.query;

    if (!reportType || (reportType !== 'disaster' && reportType !== 'road')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Report type must be "disaster" or "road"',
      });
    }

    const activities = await activityService.getReportActivities(
      id,
      reportType as 'disaster' | 'road'
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activities,
    });
  });

  /**
   * Middleware to handle file upload errors
   */
  handleUploadError = (req: Request, res: Response, next: NextFunction) => {
    // This will be called by multer if there's an error
    // The actual upload handling is done in the route
    next();
  };

  /**
   * Petugas creates activity log (with optional image upload)
   */
  createPetugasActivity = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.AUTH_UNAUTHORIZED,
        });
      }

      const { id } = req.params as { id: string };

      // Handle both JSON and multipart/form-data
      let reportType, description, activityType, metadata, newStatus;

      if (req.body.reportType) {
        // JSON body
        ({ reportType, description, activityType, metadata, newStatus } = req.body);
      } else {
        // Form data (multipart)
        reportType = req.body.reportType;
        description = req.body.description;
        activityType = req.body.activityType;
        newStatus = req.body.newStatus;
        try {
          metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        } catch {
          metadata = {};
        }
      }

      if (!reportType || (reportType !== 'disaster' && reportType !== 'road')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Report type must be "disaster" or "road"',
        });
      }

      if (!description || !activityType) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Description and activity type are required',
        });
      }

      // Process uploaded images
      const imagePaths: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        imagePaths.push(
          ...req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`)
        );
      } else if (req.files && typeof req.files === 'object') {
        // Handle single file or field name array
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        Object.values(files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            imagePaths.push(...fileArray.map((file) => `/uploads/${file.filename}`));
          }
        });
      }

      // If status change, update the report status first
      if (activityType === 'status_changed' && newStatus) {
        const oldStatus =
          reportType === 'disaster'
            ? (await prisma.disasterReport.findUnique({ where: { id } }))?.status
            : (await prisma.roadReport.findUnique({ where: { id } }))?.status;

        if (oldStatus && oldStatus !== newStatus) {
          if (reportType === 'disaster') {
            await prisma.disasterReport.update({
              where: { id },
              data: { status: newStatus as ReportStatus },
            });
          } else {
            await prisma.roadReport.update({
              where: { id },
              data: { status: newStatus as ReportStatus },
            });
          }

          // Create status change activity with images
          const activity = await activityService.createActivity(
            {
              reportId: id,
              reportType: reportType as 'disaster' | 'road',
              activityType: 'status_changed',
              description: `Status berubah dari ${oldStatus} menjadi ${newStatus}${description ? ': ' + description : ''}`,
              images: imagePaths.length > 0 ? imagePaths : undefined,
              metadata: {
                oldStatus,
                newStatus,
                ...metadata,
              },
            },
            req.user.id
          );

          return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Activity created successfully',
            data: activity,
          });
        }
      }

      // Create regular activity with images
      const activity = await activityService.createPetugasActivity(
        id,
        reportType as 'disaster' | 'road',
        description,
        activityType,
        metadata || {},
        req.user.id,
        imagePaths.length > 0 ? imagePaths : undefined
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Activity created successfully',
        data: activity,
      });
    }
  );

  /**
   * Get recent activities across all reports
   */
  getRecentActivities = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await activityService.getRecentActivities(limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activities,
    });
  });
}

export const activityController = new ActivityController();
