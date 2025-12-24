import { Router } from 'express';
import { potholeController } from '../controllers/pothole.controller';
// import { authenticate } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { upload } from '../middleware/upload';

const router: Router = Router();

/**
 * @swagger
 * /api/pothole/predict:
 *   post:
 *     summary: Predict pothole category from image
 *     tags: [Pothole]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file of pothole (JPEG, PNG, WebP, GIF)
 *     responses:
 *       200:
 *         description: Prediction successful
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
 *                     category:
 *                       type: string
 *                       enum: [kecil, sedang, besar, sangat_besar]
 *                       description: Predicted pothole category
 *                     confidence:
 *                       type: number
 *                       description: Confidence score (0-1)
 *                     allPredictions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           confidence:
 *                             type: number
 *       400:
 *         description: Bad request (missing image file)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/predict',
  // authenticate,
  uploadRateLimiter,
  upload.single('image'),
  potholeController.predictPothole
);

export default router;
