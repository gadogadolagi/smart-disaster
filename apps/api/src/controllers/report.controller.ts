import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { reportService } from '../services/report.service';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import {
  disasterReportFormSchema,
  roadReportFormSchema,
  updateDisasterReportSchema,
  updateRoadReportSchema,
} from '../utils/validator';

export class ReportController {
  // Disaster Reports
  getDisasterReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await reportService.getDisasterReports(req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_FETCH_SUCCESS,
      ...result,
    });
  });

  getDisasterReportById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const report = await reportService.getDisasterReportById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_FETCH_SUCCESS,
      data: report,
    });
  });

  createDisasterReport = [
    (req: Request, res: Response, next: NextFunction) => {
      upload.array('images', 5)(req, res, (err: any) => {
        if (err) {
          if (err.message.includes('Invalid file type')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                code: 'FILE_UPLOAD_ERROR',
                message: MESSAGES.FILE_INVALID_TYPE,
              },
            });
          }
          if (err.message.includes('File too large') || err.message.includes('LIMIT_FILE_SIZE')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                code: 'FILE_UPLOAD_ERROR',
                message: MESSAGES.FILE_TOO_LARGE,
              },
            });
          }
          if (err.message.includes('LIMIT_FILE_COUNT')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                code: 'FILE_UPLOAD_ERROR',
                message: MESSAGES.FILE_TOO_MANY,
              },
            });
          }
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'FILE_UPLOAD_ERROR',
              message: err.message || MESSAGES.FILE_UPLOAD_FAILED,
            },
          });
        }
        next();
      });
    },
    asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
      const files = ((req as any).files as Express.Multer.File[]) || [];
      const imagePaths: string[] = [];

      if (files && files.length > 0) {
        files.forEach((file) => {
          const imagePath = `/uploads/${file.filename}`;
          imagePaths.push(imagePath);
          logger.info(`File saved: ${file.filename} at ${file.path}`);
        });
      }

      logger.info(`Received ${files.length} file(s) for upload`);

      const formData = {
        ...req.body,
        lat: req.body.lat,
        lng: req.body.lng,
      };

      const validation = disasterReportFormSchema.safeParse(formData);
      if (!validation.success) {
        // Cleanup uploaded files
        files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (cleanupError) {
            logger.error(`Failed to cleanup file ${file.filename}:`, cleanupError);
          }
        });

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: MESSAGES.REPORT_VALIDATION_ERROR,
            details: validation.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }

      const validatedData = validation.data;

      // If reportedById is provided, verify user exists
      if (validatedData.reportedById) {
        const { prisma } = await import('../lib/prisma');
        const user = await prisma.user.findUnique({
          where: { id: validatedData.reportedById },
        });

        if (!user) {
          // Cleanup files
          files.forEach((file) => {
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            } catch {}
          });

          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'User not found',
            },
          });
        }
      }

      const report = await reportService.createDisasterReport(validatedData, imagePaths);

      logger.info(
        `Disaster report created successfully with ID: ${report.id}, Images: ${imagePaths.length}`
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MESSAGES.REPORT_CREATE_SUCCESS,
        data: report,
        uploadedImages: imagePaths.length,
      });
    }),
  ];

  updateDisasterReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const validation = updateDisasterReportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: MESSAGES.REPORT_VALIDATION_ERROR,
          details: validation.error.errors,
        },
      });
    }

    const report = await reportService.updateDisasterReport(id, validation.data);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_UPDATE_SUCCESS,
      data: report,
    });
  });

  deleteDisasterReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    await reportService.deleteDisasterReport(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_DELETE_SUCCESS,
    });
  });

  // Road Reports
  getRoadReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await reportService.getRoadReports(req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_FETCH_SUCCESS,
      ...result,
    });
  });

  getRoadReportById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const report = await reportService.getRoadReportById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_FETCH_SUCCESS,
      data: report,
    });
  });

  createRoadReport = [
    (req: Request, res: Response, next: NextFunction) => {
      upload.array('images', 5)(req, res, (err: any) => {
        if (err) {
          if (err.message.includes('Invalid file type')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                code: 'FILE_UPLOAD_ERROR',
                message: MESSAGES.FILE_INVALID_TYPE,
              },
            });
          }
          if (err.message.includes('File too large') || err.message.includes('LIMIT_FILE_SIZE')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                code: 'FILE_UPLOAD_ERROR',
                message: MESSAGES.FILE_TOO_LARGE,
              },
            });
          }
          if (err.message.includes('LIMIT_FILE_COUNT')) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: {
                code: 'FILE_UPLOAD_ERROR',
                message: MESSAGES.FILE_TOO_MANY,
              },
            });
          }
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'FILE_UPLOAD_ERROR',
              message: err.message || MESSAGES.FILE_UPLOAD_FAILED,
            },
          });
        }
        next();
      });
    },
    asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
      const files = ((req as any).files as Express.Multer.File[]) || [];
      const imagePaths: string[] = [];

      if (files && files.length > 0) {
        files.forEach((file) => {
          const imagePath = `/uploads/${file.filename}`;
          imagePaths.push(imagePath);
          logger.info(`File saved: ${file.filename} at ${file.path}`);
        });
      }

      logger.info(`Received ${files.length} file(s) for upload`);

      const formData = {
        ...req.body,
        lat: req.body.lat,
        lng: req.body.lng,
      };

      const validation = roadReportFormSchema.safeParse(formData);
      if (!validation.success) {
        // Cleanup uploaded files
        files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (cleanupError) {
            logger.error(`Failed to cleanup file ${file.filename}:`, cleanupError);
          }
        });

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: MESSAGES.REPORT_VALIDATION_ERROR,
            details: validation.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }

      const validatedData = validation.data;

      // If reportedById is provided, verify user exists
      if (validatedData.reportedById) {
        const { prisma } = await import('../lib/prisma');
        const user = await prisma.user.findUnique({
          where: { id: validatedData.reportedById },
        });

        if (!user) {
          // Cleanup files
          files.forEach((file) => {
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            } catch {}
          });

          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'User not found',
            },
          });
        }
      }

      const report = await reportService.createRoadReport(validatedData, imagePaths);

      logger.info(
        `Road report created successfully with ID: ${report.id}, Images: ${imagePaths.length}`
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MESSAGES.REPORT_CREATE_SUCCESS,
        data: report,
        uploadedImages: imagePaths.length,
      });
    }),
  ];

  updateRoadReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const validation = updateRoadReportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: MESSAGES.REPORT_VALIDATION_ERROR,
          details: validation.error.errors,
        },
      });
    }

    const report = await reportService.updateRoadReport(id, validation.data);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_UPDATE_SUCCESS,
      data: report,
    });
  });

  deleteRoadReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    await reportService.deleteRoadReport(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_DELETE_SUCCESS,
    });
  });

  getUserReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const result = await reportService.getUserReports(req.user.id, req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_FETCH_SUCCESS,
      data: result,
    });
  });
}

export const reportController = new ReportController();
