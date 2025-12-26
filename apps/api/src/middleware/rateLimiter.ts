import { Request, Response } from 'express';
import rateLimit, { Options } from 'express-rate-limit';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Rate limit configuration
 */
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const authRateLimitMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10);

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent'),
  });

  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: MESSAGES.TOO_MANY_REQUESTS,
    },
  });
};

/**
 * Default rate limiter options
 * Using default keyGenerator to avoid IPv6 issues
 */
const defaultOptions: Partial<Options> = {
  windowMs: rateLimitWindowMs,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path.startsWith('/health/');
  },
  // Disable validation for custom keyGenerator to avoid IPv6 warning
  // We trust express-rate-limit's default IP handling
  validate: {
    xForwardedForHeader: false,
  },
};

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes by default
 */
export const apiRateLimiter = rateLimit({
  ...defaultOptions,
  max: rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Auth rate limiter (stricter)
 * Allows 5 requests per 15 minutes for login/register endpoints
 */
export const authRateLimiter = rateLimit({
  ...defaultOptions,
  max: authRateLimitMax,
  message: 'Too many authentication attempts, please try again later.',
  skipFailedRequests: false, // Count failed requests
});

/**
 * Upload rate limiter
 * Allows 10 uploads per 15 minutes
 */
export const uploadRateLimiter = rateLimit({
  ...defaultOptions,
  max: 10,
  message: 'Too many upload requests, please try again later.',
});

/**
 * Profile/Me endpoint rate limiter (more lenient for authenticated users)
 * Allows 30 requests per 15 minutes
 */
export const profileRateLimiter = rateLimit({
  ...defaultOptions,
  max: 30,
  windowMs: 900000, // 15 minutes
  message: 'Too many profile requests, please try again later.',
});

/**
 * Create custom rate limiter with specific options
 */
export function createRateLimiter(options: Partial<Options>) {
  return rateLimit({
    ...defaultOptions,
    ...options,
  });
}
