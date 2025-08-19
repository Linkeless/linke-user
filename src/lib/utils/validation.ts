import { z } from 'zod';

/**
 * Validation schema for login form
 * Validates email/password login credentials with proper security rules
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    ),

  rememberMe: z.boolean().default(false),
});

/**
 * Validation schema for user data
 * Validates user profile information from API responses
 */
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required').uuid('Invalid user ID format'),

  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),

  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores',
    )
    .trim(),

  avatar: z.string().url('Avatar must be a valid URL').optional().nullable(),

  provider: z
    .enum(['local', 'google', 'github', 'telegram'])
    .optional()
    .nullable(),

  createdAt: z
    .date()
    .or(z.string().pipe(z.coerce.date()))
    .refine(
      date => date <= new Date(),
      'Creation date cannot be in the future',
    ),
});

/**
 * Validation schema for authentication tokens
 * Validates JWT tokens and expiration information
 */
export const authTokensSchema = z.object({
  accessToken: z
    .string()
    .min(1, 'Access token is required')
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
      'Invalid JWT token format',
    ),

  refreshToken: z
    .string()
    .min(1, 'Refresh token is required')
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
      'Invalid JWT token format',
    ),

  expiresIn: z
    .number()
    .int('Expiration must be an integer')
    .positive('Expiration must be positive')
    .max(86400 * 365, 'Token expiration too long'), // Max 1 year
});

/**
 * Validation schema for OAuth provider
 * Validates supported OAuth provider names
 */
export const oauthProviderSchema = z.enum(['google', 'github', 'telegram']);

/**
 * Validation schema for email input
 * Reusable schema for standalone email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim();

/**
 * Validation schema for password input
 * Reusable schema for standalone password validation
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

/**
 * Validation schema for strong password
 * Enhanced password validation with complexity requirements
 */
export const strongPasswordSchema = passwordSchema.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
  'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
);

/**
 * Validation schema for password confirmation
 * Used in forms where password confirmation is required
 */
export const passwordConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(
    data => data.password === data.confirmPassword,
    'Passwords do not match',
  );

/**
 * Validation schema for API error responses
 * Validates error structure from backend API
 */
export const apiErrorSchema = z.object({
  message: z.string().min(1, 'Error message is required'),
  code: z.string().min(1, 'Error code is required'),
  status: z.number().int().min(100).max(599),
  details: z.record(z.string(), z.any()).optional(),
});

/**
 * Type inference helpers
 * Export inferred types from validation schemas
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type UserData = z.infer<typeof userSchema>;
export type AuthTokensData = z.infer<typeof authTokensSchema>;
export type OAuthProviderData = z.infer<typeof oauthProviderSchema>;
export type EmailData = z.infer<typeof emailSchema>;
export type PasswordData = z.infer<typeof passwordSchema>;
export type StrongPasswordData = z.infer<typeof strongPasswordSchema>;
export type PasswordConfirmationData = z.infer<
  typeof passwordConfirmationSchema
>;
export type ApiErrorData = z.infer<typeof apiErrorSchema>;

/**
 * Utility function to safely parse and validate data
 * Returns success/error result without throwing exceptions
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Utility function to extract validation error messages
 * Converts Zod errors to user-friendly messages
 */
export function getValidationErrorMessage(error: z.ZodError): string {
  const firstError = error.issues[0];

  if (firstError) {
    return firstError.message;
  }

  return 'Validation failed';
}

/**
 * Utility function to extract field-specific validation errors
 * Returns object mapping field names to error messages
 */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const err of error.issues) {
    const field = err.path.join('.');
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = err.message;
    }
  }

  return fieldErrors;
}

/**
 * Utility function to validate form data with field-specific errors
 * Returns validation result with field-level error mapping
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; fieldErrors: Record<string, string>; message: string } {
  const result = safeValidate(schema, data);

  if (result.success) {
    return result;
  }

  const error = result.error;
  return {
    success: false,
    fieldErrors: getFieldErrors(error),
    message: getValidationErrorMessage(error),
  };
}

/**
 * Preset validation configurations
 * Common validation patterns for different use cases
 */
export const validationPresets = {
  // Strict validation for production environments
  strict: {
    password: strongPasswordSchema,
    email: emailSchema,
  },

  // Relaxed validation for development/testing
  relaxed: {
    password: passwordSchema,
    email: emailSchema,
  },
} as const;
