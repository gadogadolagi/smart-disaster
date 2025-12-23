import { Router } from 'express';
import {
  healthCheck,
  detailedHealthCheck,
  readinessCheck,
  livenessCheck,
} from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/', healthCheck);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with database and memory status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 *       503:
 *         description: Service is unhealthy
 */
router.get('/detailed', detailedHealthCheck);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check for container orchestrators
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', readinessCheck);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check for container orchestrators
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', livenessCheck);

export default router;

