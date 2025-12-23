import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extend Express Request type to include requestId
 */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Request ID middleware
 * Generates a unique ID for each request for tracing and debugging
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Use existing X-Request-ID header if provided, otherwise generate new one
  const requestId = (req.get('X-Request-ID') as string) || uuidv4();

  // Attach to request object
  req.requestId = requestId;

  // Set response header for client tracking
  res.setHeader('X-Request-ID', requestId);

  next();
}

/**
 * Get request ID from request object
 * Useful for logging and error tracking
 */
export function getRequestId(req: Request): string {
  return req.requestId || 'unknown';
}

