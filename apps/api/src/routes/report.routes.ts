import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// ============ DISASTER REPORTS ============

/**
 * @swagger
 * /api/reports/disaster:
 *   get:
 *     summary: Get all disaster reports
 *     tags: [Reports - Disaster]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, in_progress, resolved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [flood, fire, earthquake, landslide, fallen_tree, other]
 *         description: Filter by disaster type
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *     responses:
 *       200:
 *         description: List of disaster reports
 */
router.get('/disaster', optionalAuthenticate, reportController.getDisasterReports);

/**
 * @swagger
 * /api/reports/disaster/{id}:
 *   get:
 *     summary: Get disaster report by ID
 *     tags: [Reports - Disaster]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Disaster report details
 *       404:
 *         description: Report not found
 */
router.get('/disaster/:id', optionalAuthenticate, reportController.getDisasterReportById);

/**
 * @swagger
 * /api/reports/disaster:
 *   post:
 *     summary: Create a new disaster report
 *     tags: [Reports - Disaster]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - description
 *               - address
 *               - district
 *               - lat
 *               - lng
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [flood, fire, earthquake, landslide, fallen_tree, other]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               district:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               reporterName:
 *                 type: string
 *                 description: Optional reporter name (for anonymous reports)
 *               reporterPhone:
 *                 type: string
 *                 description: Optional reporter phone (for anonymous reports)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 images
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 */
router.post('/disaster', uploadRateLimiter, ...reportController.createDisasterReport);

/**
 * @swagger
 * /api/reports/disaster/{id}:
 *   put:
 *     summary: Update disaster report (admin or petugas only)
 *     tags: [Reports - Disaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, verified, in_progress, resolved, rejected]
 *               riskLevel:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               handledBy:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or petugas role required
 *       404:
 *         description: Report not found
 */
router.put(
  '/disaster/:id',
  authenticate,
  authorize('admin', 'petugas'),
  reportController.updateDisasterReport
);

/**
 * @swagger
 * /api/reports/disaster/{id}:
 *   delete:
 *     summary: Delete disaster report (admin only)
 *     tags: [Reports - Disaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or petugas role required
 *       404:
 *         description: Report not found
 */
router.delete(
  '/disaster/:id',
  authenticate,
  authorize('admin'),
  reportController.deleteDisasterReport
);

// ============ ROAD REPORTS ============

/**
 * @swagger
 * /api/reports/road:
 *   get:
 *     summary: Get all road damage reports
 *     tags: [Reports - Road]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, in_progress, resolved, rejected]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pothole, crack, landslide, flooding, bridge_damage]
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of road damage reports
 */
router.get('/road', optionalAuthenticate, reportController.getRoadReports);

/**
 * @swagger
 * /api/reports/road/{id}:
 *   get:
 *     summary: Get road damage report by ID
 *     tags: [Reports - Road]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Road damage report details
 *       404:
 *         description: Report not found
 */
router.get('/road/:id', optionalAuthenticate, reportController.getRoadReportById);

/**
 * @swagger
 * /api/reports/road:
 *   post:
 *     summary: Create a new road damage report
 *     tags: [Reports - Road]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - description
 *               - address
 *               - district
 *               - lat
 *               - lng
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [pothole, crack, landslide, flooding, bridge_damage]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               district:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               reporterName:
 *                 type: string
 *               reporterPhone:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 */
router.post('/road', uploadRateLimiter, ...reportController.createRoadReport);

/**
 * @swagger
 * /api/reports/road/{id}:
 *   put:
 *     summary: Update road damage report (admin or petugas only)
 *     tags: [Reports - Road]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, verified, in_progress, resolved, rejected]
 *               dangerLevel:
 *                 type: string
 *                 enum: [low, moderate, high, critical]
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Report not found
 */
router.put('/road/:id', authenticate, authorize('government'), reportController.updateRoadReport);

/**
 * @swagger
 * /api/reports/road/{id}:
 *   delete:
 *     summary: Delete road damage report (admin only)
 *     tags: [Reports - Road]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Report not found
 */
router.delete(
  '/road/:id',
  authenticate,
  authorize('admin'),
  reportController.deleteRoadReport
);

export default router;
