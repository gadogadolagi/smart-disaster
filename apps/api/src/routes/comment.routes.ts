import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a comment on a report
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *               - reportType
 *               - content
 *             properties:
 *               reportId:
 *                 type: string
 *                 description: ID of the report
 *               reportType:
 *                 type: string
 *                 enum: [disaster, road]
 *                 description: Type of report
 *               content:
 *                 type: string
 *                 description: Comment content (max 1000 characters)
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.post('/', authenticate, commentController.createComment);

/**
 * @swagger
 * /api/comments/report/{id}:
 *   get:
 *     summary: Get comments for a report
 *     tags: [Comments]
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
 *     responses:
 *       200:
 *         description: List of comments
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
 *                       content:
 *                         type: string
 *                       author:
 *                         $ref: '#/components/schemas/User'
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/report/:id', optionalAuthenticate, commentController.getReportComments);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment (author only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only update own comments
 *       404:
 *         description: Comment not found
 */
router.put('/:id', authenticate, commentController.updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment (author or admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only delete own comments
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', authenticate, commentController.deleteComment);

export default router;




