import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    latency?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  requestId?: string;
}

/**
 * Basic health check endpoint
 * Returns simple status for load balancers and monitoring tools
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Detailed health check endpoint
 * Returns comprehensive health information including database status and memory usage
 */
export async function detailedHealthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  let dbLatency: number | undefined;

  // Check database connection
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStartTime;
    dbStatus = 'connected';
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    dbStatus = 'disconnected';
  }

  // Get memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  // Determine overall health status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (dbStatus === 'disconnected') {
    overallStatus = 'unhealthy';
  } else if (memoryPercentage > 90 || (dbLatency && dbLatency > 1000)) {
    overallStatus = 'degraded';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      latency: dbLatency,
    },
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: memoryPercentage,
    },
    requestId: req.requestId,
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  res.status(statusCode).json({
    success: overallStatus !== 'unhealthy',
    data: healthStatus,
    responseTime: Date.now() - startTime,
  });
}

/**
 * Readiness check endpoint
 * Used by Kubernetes/container orchestrators to check if the service is ready to receive traffic
 */
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    // Check if database is ready
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(503).json({
      success: false,
      status: 'not_ready',
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Liveness check endpoint
 * Used by Kubernetes/container orchestrators to check if the service is alive
 */
export function livenessCheck(req: Request, res: Response): void {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}
