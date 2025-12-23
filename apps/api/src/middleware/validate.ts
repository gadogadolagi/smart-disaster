import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Validation target types
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation options
 */
interface ValidationOptions {
  /** Where to validate: body, query, or params */
  target?: ValidationTarget;
  /** Whether to strip unknown properties */
  stripUnknown?: boolean;
}

/**
 * Format Zod errors into a readable structure
 */
function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 *
 * @example
 * // Validate request body
 * router.post('/users', validate(createUserSchema), createUser);
 *
 * @example
 * // Validate query parameters
 * router.get('/users', validate(listUsersQuerySchema, { target: 'query' }), listUsers);
 *
 * @example
 * // Validate route parameters
 * router.get('/users/:id', validate(userIdSchema, { target: 'params' }), getUser);
 */
export function validate(schema: ZodSchema, options: ValidationOptions = {}) {
  const { target = 'body', stripUnknown = true } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];

      // Parse and validate data
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = formatZodErrors(result.error);

        logger.warn('Validation failed', {
          path: req.path,
          method: req.method,
          target,
          errors,
          requestId: req.requestId,
        });

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: MESSAGES.VALIDATION_REQUIRED,
            details: errors,
          },
        });
        return;
      }

      // Replace request data with parsed (and possibly transformed) data
      if (stripUnknown) {
        req[target] = result.data;
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        requestId: req.requestId,
      });
      next(error);
    }
  };
}

/**
 * Validate request body
 * Shorthand for validate(schema, { target: 'body' })
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, { target: 'body' });
}

/**
 * Validate query parameters
 * Shorthand for validate(schema, { target: 'query' })
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, { target: 'query' });
}

/**
 * Validate route parameters
 * Shorthand for validate(schema, { target: 'params' })
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, { target: 'params' });
}

/**
 * Combined validation for multiple targets
 *
 * @example
 * router.put('/users/:id',
 *   validateMultiple({
 *     params: userIdSchema,
 *     body: updateUserSchema
 *   }),
 *   updateUser
 * );
 */
export function validateMultiple(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  const validators: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  if (schemas.params) {
    validators.push(validate(schemas.params, { target: 'params' }));
  }
  if (schemas.query) {
    validators.push(validate(schemas.query, { target: 'query' }));
  }
  if (schemas.body) {
    validators.push(validate(schemas.body, { target: 'body' }));
  }

  return validators;
}

