import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { potholeService } from '../services/pothole.service';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import * as fs from 'fs';

export class PotholeController {
  /**
   * Predict pothole category dari uploaded image
   */
  predictPothole = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const file = (req as any).file;

    if (!file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Image file is required',
      });
    }

    try {
      // Predict menggunakan service
      const prediction = await potholeService.predictPothole(file.path);

      // Cleanup uploaded file setelah prediction
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        logger.warn(`Failed to cleanup file ${file.filename}:`, cleanupError);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Pothole prediction successful',
        data: {
          category: prediction.category,
          confidence: prediction.confidence,
          allPredictions: prediction.allPredictions,
        },
      });
    } catch (error) {
      // Cleanup file jika ada error
      try {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        logger.warn(`Failed to cleanup file ${file.filename}:`, cleanupError);
      }

      logger.error('Pothole prediction error', {
        error: error instanceof Error ? error.message : String(error),
        file: file?.filename,
      });

      throw error;
    }
  });
}

export const potholeController = new PotholeController();

