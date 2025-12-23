import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger';

// Load environment variables from .env file
// This must be called before any validation
dotenv.config();

/**
 * Environment variables schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS configuration
  ALLOWED_ORIGINS: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  AUTH_RATE_LIMIT_MAX: z.string().default('5'),

  // File upload
  MAX_FILE_SIZE: z.string().default('5242880'), // 5MB
  MAX_FILES: z.string().default('5'),
  UPLOAD_DIR: z.string().default('uploads'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    logger.info('Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      logger.error('Environment validation failed:', { errors: missingVars });
      console.error('\n❌ Environment validation failed:');
      missingVars.forEach((v) => console.error(`   - ${v}`));
      console.error('\nPlease check your .env file and ensure all required variables are set.\n');
    }
    process.exit(1);
  }
}

export const env = validateEnv();

/**
 * Helper to get parsed numeric environment values
 */
export const envConfig = {
  port: parseInt(env.PORT, 10),
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  rateLimitWindowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  rateLimitMaxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  authRateLimitMax: parseInt(env.AUTH_RATE_LIMIT_MAX, 10),

  maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
  maxFiles: parseInt(env.MAX_FILES, 10),

  allowedOrigins: env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) || [],
};
