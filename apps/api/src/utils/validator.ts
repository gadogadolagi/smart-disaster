import { z } from 'zod';
import { MESSAGES } from './constants';

// Common validation schemas
export const emailSchema = z.string().email({ message: MESSAGES.VALIDATION_INVALID_EMAIL });

export const passwordSchema = z
  .string()
  .min(6, { message: MESSAGES.AUTH_PASSWORD_TOO_SHORT })
  .max(100);

export const nameSchema = z.string().min(1, { message: MESSAGES.AUTH_NAME_REQUIRED }).max(100);

export const phoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number')
  .optional();

// Auth validation schemas
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: z.enum(['user', 'admin', 'petugas']).optional().default('user'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: MESSAGES.AUTH_PASSWORD_REQUIRED }),
});

// Report validation schemas
export const disasterTypeSchema = z.enum([
  'flood',
  'fire',
  'fallen_tree',
  'landslide',
  'earthquake',
  'other',
]);
export const roadIssueTypeSchema = z.enum([
  'pothole',
  'landslide',
  'bridge_damage',
  'crack',
  'flooding',
]);
export const reportStatusSchema = z.enum(['pending', 'verified', 'in_progress', 'resolved']);
export const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export const dangerLevelSchema = z.enum(['minor', 'moderate', 'severe']);

export const disasterReportFormSchema = z.object({
  type: disasterTypeSchema,
  title: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  description: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  address: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  district: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  reportedById: z.string().optional(),
  reporterName: z.string().optional(),
  reporterPhone: phoneSchema,
  riskLevel: riskLevelSchema.optional().default('medium'),
});

export const roadReportFormSchema = z.object({
  type: roadIssueTypeSchema,
  title: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  description: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  address: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  district: z.string().min(1, { message: MESSAGES.VALIDATION_REQUIRED }),
  reportedById: z.string().optional(),
  reporterName: z.string().optional(),
  reporterPhone: phoneSchema,
  dangerLevel: dangerLevelSchema.optional().default('moderate'),
});

export const updateDisasterReportSchema = z.object({
  status: reportStatusSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
  handledBy: z.string().optional(),
  notes: z.string().optional(),
});

export const updateRoadReportSchema = z.object({
  status: reportStatusSchema.optional(),
  dangerLevel: dangerLevelSchema.optional(),
});

// Validation helper
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
