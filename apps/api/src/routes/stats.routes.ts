import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics summary (admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReports:
 *                       type: number
 *                     totalDisasterReports:
 *                       type: number
 *                     totalRoadReports:
 *                       type: number
 *                     pendingReports:
 *                       type: number
 *                     verifiedReports:
 *                       type: number
 *                     inProgressReports:
 *                       type: number
 *                     resolvedReports:
 *                       type: number
 *                     rejectedReports:
 *                       type: number
 *                     disasterByType:
 *                       type: object
 *                     reportsByDistrict:
 *                       type: object
 *                     reportsByStatus:
 *                       type: object
 *                     recentReports:
 *                       type: number
 *                     averageResolutionTime:
 *                       type: number
 *                     resolutionRate:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.get('/dashboard', authenticate, authorize('admin'), statsController.getDashboardStats);

export default router;
