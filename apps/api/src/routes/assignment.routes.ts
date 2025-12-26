import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * /api/assignments/petugas:
 *   get:
 *     summary: Get list of petugas (admin only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of petugas
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
 *                     $ref: '#/components/schemas/User'
 */
router.get('/petugas', authenticate, authorize('admin'), assignmentController.getPetugasList);

/**
 * @swagger
 * /api/assignments/disaster/{id}:
 *   post:
 *     summary: Assign petugas to disaster report (admin only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Disaster report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petugasId
 *             properties:
 *               petugasId:
 *                 type: string
 *                 description: ID of the petugas to assign
 *     responses:
 *       200:
 *         description: Petugas assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Report or petugas not found
 */
router.post(
  '/disaster/:id',
  authenticate,
  authorize('admin'),
  assignmentController.assignPetugasToDisasterReport
);

/**
 * @swagger
 * /api/assignments/road/{id}:
 *   post:
 *     summary: Assign petugas to road report (admin only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Road report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petugasId
 *             properties:
 *               petugasId:
 *                 type: string
 *                 description: ID of the petugas to assign
 *     responses:
 *       200:
 *         description: Petugas assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Report or petugas not found
 */
router.post(
  '/road/:id',
  authenticate,
  authorize('admin'),
  assignmentController.assignPetugasToRoadReport
);

/**
 * @swagger
 * /api/assignments/my-reports:
 *   get:
 *     summary: Get reports assigned to current petugas (petugas only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [disaster, road]
 *         description: Filter by report type
 *     responses:
 *       200:
 *         description: List of assigned reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     disasterReports:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DisasterReport'
 *                     roadReports:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RoadReport'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - petugas role required
 */
router.get(
  '/my-reports',
  authenticate,
  authorize('petugas'),
  assignmentController.getAssignedReports
);

export default router;




