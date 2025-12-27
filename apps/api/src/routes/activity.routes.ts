import { Router, Request, Response, NextFunction } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { HTTP_STATUS } from '../utils/constants';

const router: Router = Router();

/**
 * @swagger
 * /api/activities/report/{id}:
 *   get:
 *     summary: Get all activities for a report
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *       - in: query
 *         name: reportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [disaster, road]
 *         description: Type of report
 *     responses:
 *       200:
 *         description: List of activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       reportId:
 *                         type: string
 *                       reportType:
 *                         type: string
 *                       activityType:
 *                         type: string
 *                         enum: [assigned, status_changed, verified, in_progress, resolved, note_added, comment_added]
 *                       description:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Array of image paths
 *                       metadata:
 *                         type: object
 *                       createdBy:
 *                         $ref: '#/components/schemas/User'
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/report/:id', optionalAuthenticate, activityController.getReportActivities);

/**
 * @swagger
 * /api/activities/report/{id}:
 *   post:
 *     summary: Create activity log for a report with optional images (petugas only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - description
 *               - activityType
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [disaster, road]
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *               activityType:
 *                 type: string
 *                 enum: [status_changed, verified, in_progress, resolved, note_added]
 *               metadata:
 *                 type: string
 *                 description: Additional metadata as JSON string
 *               newStatus:
 *                 type: string
 *                 enum: [pending, verified, in_progress, resolved]
 *                 description: New status (required if activityType is status_changed)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional images for activity log (max 5 images, 5MB each)
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - description
 *               - activityType
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [disaster, road]
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *               activityType:
 *                 type: string
 *                 enum: [status_changed, verified, in_progress, resolved, note_added]
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *               newStatus:
 *                 type: string
 *                 enum: [pending, verified, in_progress, resolved]
 *                 description: New status (required if activityType is status_changed)
 *     responses:
 *       201:
 *         description: Activity created successfully
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
 *                     id:
 *                       type: string
 *                     reportId:
 *                       type: string
 *                     reportType:
 *                       type: string
 *                     activityType:
 *                       type: string
 *                     description:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     metadata:
 *                       type: object
 *                     createdBy:
 *                       $ref: '#/components/schemas/User'
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - petugas role required
 *       404:
 *         description: Report not found
 */
router.post(
  '/report/:id',
  uploadRateLimiter,
  authenticate,
  authorize('petugas'),
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('images', 5)(req, res, (err: any) => {
      if (err) {
        if (err.message && err.message.includes('Invalid file type')) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'FILE_UPLOAD_ERROR',
              message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
            },
          });
        }
        if (err.message && (err.message.includes('File too large') || err.message.includes('LIMIT_FILE_SIZE'))) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'FILE_UPLOAD_ERROR',
              message: 'File too large. Maximum file size is 5MB.',
            },
          });
        }
        if (err.message && err.message.includes('LIMIT_FILE_COUNT')) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              code: 'FILE_UPLOAD_ERROR',
              message: 'Too many files. Maximum 5 images allowed.',
            },
          });
        }
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'FILE_UPLOAD_ERROR',
            message: err.message || 'File upload failed',
          },
        });
      }
      next();
    });
  },
  activityController.createPetugasActivity
);

/**
 * @swagger
 * /api/activities/recent:
 *   get:
 *     summary: Get recent activities across all reports
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of activities to return
 *     responses:
 *       200:
 *         description: List of recent activities
 */
router.get('/recent', optionalAuthenticate, activityController.getRecentActivities);

export default router;

