import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoadingTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { OAuthProvider } from '@/features/auth/types/auth.types';

/**
 * OAuthCallbackPage component
 *
 * Handles OAuth callback from providers (Google, GitHub, Telegram)
 * Exchanges authorization code for JWT tokens
 * Shows loading state in title during authentication
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setTokens, setAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const { t } = useTranslation('auth');

  // Set loading title during OAuth processing
  useLoadingTitle(t('oauth.callback.authenticating'), isProcessing);

  useEffect(() => {
    const handleCallback = async () => {
      // Get OAuth callback parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth error
      if (error) {
        setIsProcessing(false);
        toast.error(t('oauth.callback.authFailed'), {
          description: errorDescription || error,
        });
        navigate('/login', { replace: true });
        return;
      }

      // Validate required parameters
      if (!code) {
        setIsProcessing(false);
        toast.error(t('oauth.callback.invalidCallback'), {
          description: t('oauth.callback.codeMissing'),
        });
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Extract provider from state parameter or URL path
        // State parameter should contain provider info
        let provider: OAuthProvider = 'google'; // default

        // Try to parse provider from state
        if (state) {
          try {
            const stateData = JSON.parse(atob(state));
            if (stateData.provider) {
              provider = stateData.provider as OAuthProvider;
            }
          } catch {
            // State might be a simple string, try to extract provider
            if (state.includes('google')) {
              provider = 'google';
            } else if (state.includes('github')) {
              provider = 'github';
            } else if (state.includes('telegram')) {
              provider = 'telegram';
            }
          }
        }

        // Exchange authorization code for tokens
        const response = await authService.handleOAuthCallback(
          provider,
          code,
          state || undefined
        );

        // Update auth store
        setUser(response.user);
        setTokens(response.tokens);
        setAuthenticated(true);
        setIsProcessing(false);

        // Show success message
        toast.success(t('oauth.callback.loginSuccess'), {
          description: t('oauth.callback.welcome', {
            name: response.user.username || response.user.email,
          }),
        });

        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        setIsProcessing(false);

        toast.error(t('oauth.callback.authError'), {
          description:
            error instanceof Error
              ? error.message
              : t('oauth.callback.failedComplete'),
        });

        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setTokens, setAuthenticated]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle>{t('oauth.callback.completingAuth')}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
          <p className='text-muted-foreground'>
            {t('oauth.callback.pleaseWait')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default OAuthCallbackPage;
