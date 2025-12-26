import { Request, Response } from 'express';
import { statsService } from '../services/stats.service';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';

export class StatsController {
  /**
   * Get dashboard statistics summary
   */
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await statsService.getDashboardStats();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.REPORT_FETCH_SUCCESS,
      data: stats,
    });
  });
}

export const statsController = new StatsController();
