import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Creates internationalized Zod schemas with dynamic error messages
 * @param t - Translation function from useTranslation
 * @returns Object containing i18n-enabled schemas
 */
export function createI18nValidationSchemas(t: TFunction) {
  /**
   * Internationalized email schema
   */
  const emailSchema = z
    .string()
    .min(1, t('validation.email.required'))
    .email(t('validation.email.invalid'))
    .max(255, t('validation.email.tooLong'))
    .toLowerCase()
    .trim();

  /**
   * Internationalized password schema
   */
  const passwordSchema = z
    .string()
    .min(1, t('validation.password.required'))
    .min(8, t('validation.password.minLength', { min: 8 }))
    .max(128, t('validation.password.tooLong'));

  /**
   * Internationalized strong password schema with complexity requirements
   */
  const strongPasswordSchema = passwordSchema.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    t('validation.password.complexity')
  );

  /**
   * Internationalized login form schema
   */
  const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: z.boolean().default(false),
  });

  /**
   * Internationalized user schema
   */
  const userSchema = z.object({
    id: z
      .string()
      .min(1, t('validation.user.idRequired'))
      .uuid(t('validation.user.idInvalid')),
    email: emailSchema,
    username: z
      .string()
      .min(1, t('validation.user.usernameRequired'))
      .min(3, t('validation.user.usernameMinLength', { min: 3 }))
      .max(50, t('validation.user.usernameTooLong'))
      .regex(/^[a-zA-Z0-9_-]+$/, t('validation.user.usernameInvalid'))
      .trim(),
    avatar: z
      .string()
      .url(t('validation.user.avatarInvalid'))
      .optional()
      .nullable(),
    provider: z
      .enum(['local', 'google', 'github', 'telegram'])
      .optional()
      .nullable(),
    createdAt: z
      .date()
      .or(z.string().pipe(z.coerce.date()))
      .refine(
        date => date <= new Date(),
        t('validation.user.createdAtInvalid')
      ),
  });

  /**
   * Internationalized auth tokens schema
   */
  const authTokensSchema = z.object({
    accessToken: z
      .string()
      .min(1, t('validation.tokens.accessTokenRequired'))
      .regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
        t('validation.tokens.invalidFormat')
      ),
    refreshToken: z
      .string()
      .min(1, t('validation.tokens.refreshTokenRequired'))
      .regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
        t('validation.tokens.invalidFormat')
      ),
    expiresIn: z
      .number()
      .int(t('validation.tokens.expiresInInteger'))
      .positive(t('validation.tokens.expiresInPositive'))
      .max(86400 * 365, t('validation.tokens.expiresInTooLong')),
  });

  return {
    emailSchema,
    passwordSchema,
    strongPasswordSchema,
    loginSchema,
    userSchema,
    authTokensSchema,
  };
}

/**
 * Type inference helpers for i18n schemas
 */
export type I18nLoginFormData = z.infer<
  ReturnType<typeof createI18nValidationSchemas>['loginSchema']
>;
export type I18nUserData = z.infer<
  ReturnType<typeof createI18nValidationSchemas>['userSchema']
>;
export type I18nAuthTokensData = z.infer<
  ReturnType<typeof createI18nValidationSchemas>['authTokensSchema']
>;

/**
 * Default validation schemas (fallback for when i18n is not available)
 */
export const defaultValidationSchemas = {
  emailSchema: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),

  passwordSchema: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),

  loginSchema: z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().default(false),
  }),
};

/**
 * Utility function to safely get validation schemas with i18n fallback
 * @param t - Translation function (optional)
 * @returns Validation schemas object
 */
export function getValidationSchemas(t?: TFunction) {
  if (t) {
    return createI18nValidationSchemas(t);
  }
  return defaultValidationSchemas;
}
