import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES, HTTP_STATUS, MESSAGES } from './constants';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public code: string = ERROR_CODES.INTERNAL_ERROR,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors?: any[]
  ) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = MESSAGES.AUTH_UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = MESSAGES.AUTH_FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = MESSAGES.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND_ERROR);
  }
}

// Error handler middleware
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && err.errors && { details: err.errors }),
      },
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: MESSAGES.VALIDATION_REQUIRED,
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Unique constraint violation',
          details: `Field ${err.meta?.target} already exists`,
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND_ERROR,
          message: MESSAGES.NOT_FOUND,
        },
      });
    }
  }

  // Handle multer errors
  if (err.message.includes('Invalid file type') || err.message.includes('File too large')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.FILE_UPLOAD_ERROR,
        message: err.message,
      },
    });
  }

  // Default error response
  const statusCode = err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    process.env.NODE_ENV === 'production'
      ? MESSAGES.INTERNAL_SERVER_ERROR
      : err.message || MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

// Async handler wrapper to catch errors
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND_ERROR,
      message: MESSAGES.NOT_FOUND,
      path: req.path,
    },
  });
}
