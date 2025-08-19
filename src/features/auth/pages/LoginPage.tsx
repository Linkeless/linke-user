import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useStaticTitle } from '@/hooks/useDocumentTitle';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useTheme } from '@/app/hooks/useTheme';
import type { User, AuthTokens } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/features/auth/stores/authStore';

/**
 * LoginPage component
 *
 * Provides a complete login experience with:
 * - Email/password authentication form
 * - OAuth social login options (Google, GitHub, Telegram)
 * - Professional card-based layout
 * - Automatic redirection after successful login
 * - Error handling and user feedback
 * - Static page title
 */
export function LoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { resolvedTheme, toggleTheme } = useTheme();

  // Set static title for login page
  useStaticTitle(t('auth:login.title'));

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setTokens, setAuthenticated } = useAuthStore();

  // Get the intended destination from state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle successful login
  const handleLoginSuccess = (user: User, tokens: AuthTokens) => {
    // Update auth store
    setUser(user);
    setTokens(tokens);
    setAuthenticated(true);

    // Show success message
    toast.success(t('auth:login.success.title'), {
      description: t('auth:login.success.description', { email: user.email }),
    });

    // Navigate to intended destination
    navigate(from, { replace: true });
  };

  // Handle login errors
  const handleLoginError = (error: string) => {
    toast.error(t('auth:login.error.title'), {
      description: error,
    });
  };

  // Handle OAuth errors
  const handleOAuthError = (error: string) => {
    toast.error(t('auth:oauth.error.title'), {
      description: error,
    });
  };

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');

    if (error) {
      handleLoginError(decodeURIComponent(error));
    } else if (success) {
      toast.success(t('auth:oauth.success.title'), {
        description: t('auth:oauth.success.description'),
      });
    }
  }, [location.search]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 relative'>
      {/* Theme and Language Switchers in top-right corner */}
      <div className='absolute top-4 right-4 z-10 flex items-center gap-2'>
        {/* Theme Toggle */}
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleTheme}
          className='h-9 w-9'
          aria-label={t('common:theme.toggle')}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className='h-4 w-4' />
          ) : (
            <Moon className='h-4 w-4' />
          )}
          <span className='sr-only'>{t('common:theme.toggle')}</span>
        </Button>

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>

      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex items-center justify-center mb-4'>
            {/* Logo placeholder - can be replaced with actual logo */}
            <div className='w-12 h-12 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-primary-foreground font-bold text-xl'>
                L
              </span>
            </div>
          </div>
          <CardTitle className='text-2xl font-bold'>
            {t('auth:login.title')}
          </CardTitle>
          <CardDescription className='text-muted-foreground'>
            {t('auth:login.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Email/Password Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            className='space-y-4'
          />

          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <Separator className='w-full' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                {t('auth:login.divider')}
              </span>
            </div>
          </div>

          {/* OAuth Login Buttons */}
          <OAuthButtons onError={handleOAuthError} className='space-y-3' />
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          {/* Additional Links */}
          <div className='text-center space-y-2'>
            <p className='text-sm text-muted-foreground'>
              {t('auth:login.links.noAccount')}{' '}
              <Link
                to='/register'
                className='text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors'
              >
                {t('auth:login.links.signUp')}
              </Link>
            </p>
            <p className='text-sm text-muted-foreground'>
              <Link
                to='/forgot-password'
                className='text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors'
              >
                {t('auth:login.links.forgotPassword')}
              </Link>
            </p>
          </div>

          {/* Footer Note */}
          <div className='text-center'>
            <p className='text-xs text-muted-foreground'>
              {t('auth:login.legal.agreement')}{' '}
              <Link
                to='/terms'
                className='text-primary hover:text-primary/80 underline-offset-4 hover:underline'
              >
                {t('auth:login.legal.terms')}
              </Link>{' '}
              {t('auth:login.legal.and')}{' '}
              <Link
                to='/privacy'
                className='text-primary hover:text-primary/80 underline-offset-4 hover:underline'
              >
                {t('auth:login.legal.privacy')}
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
