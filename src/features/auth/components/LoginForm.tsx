import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  getValidationSchemas,
  type I18nLoginFormData,
} from '@/lib/utils/i18nValidation';
import { authServiceUtils } from '@/features/auth/services/authService';
import type { LoginCredentials } from '@/features/auth/types/auth.types';

interface LoginFormProps {
  onSuccess?: (user: any, tokens: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function LoginForm({ onSuccess, onError, className }: LoginFormProps) {
  const { t } = useTranslation('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get i18n-enabled validation schemas
  const { loginSchema } = getValidationSchemas(t);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: I18nLoginFormData) => {
    setIsSubmitting(true);

    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      };

      const response = await authServiceUtils.login(credentials);

      onSuccess?.(response.user, response.tokens);
    } catch (error: any) {
      const errorMessage = error.message || t('login.messages.generalError');
      onError?.(errorMessage);

      // Set form-level error for invalid credentials
      if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) {
        form.setError('root', {
          type: 'manual',
          message: t('login.messages.invalidCredentials'),
        });
      } else {
        form.setError('root', {
          type: 'manual',
          message: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Email Field */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.email.label')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='email'
                    placeholder={t('form.fields.email.placeholder')}
                    autoComplete='email'
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.password.label')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('form.fields.password.placeholder')}
                      autoComplete='current-password'
                      disabled={isSubmitting}
                      className='pr-10'
                    />
                    <button
                      type='button'
                      onClick={togglePasswordVisibility}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className='size-4' />
                      ) : (
                        <Eye className='size-4' />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me Checkbox */}
          <FormField
            control={form.control}
            name='rememberMe'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center space-x-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormLabel className='text-sm font-normal cursor-pointer'>
                    {t('form.fields.rememberMe')}
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form-level Error Message */}
          {form.formState.errors.root && (
            <div className='text-sm text-destructive'>
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Submit Button */}
          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                {t('form.submit.loading')}
              </>
            ) : (
              t('form.submit.button')
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
