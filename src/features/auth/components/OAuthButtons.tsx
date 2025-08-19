import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import type { OAuthProvider } from '@/features/auth/types/auth.types';
import { authService } from '@/features/auth/services/authService';
import { config } from '@/lib/constants/config';
import { toast } from 'sonner';

interface OAuthButtonsProps {
  onOAuthLogin?: (provider: OAuthProvider) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Telegram icon component as SVG since lucide-react doesn't have it
 */
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
    role='img'
    aria-label='Telegram'
  >
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z' />
  </svg>
);

/**
 * Google icon component as SVG for brand accuracy
 */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
    role='img'
    aria-label='Google'
  >
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
  </svg>
);

/**
 * OAuthButtons component for social authentication
 * Provides login buttons for Google, GitHub, and Telegram OAuth providers
 */
export function OAuthButtons({
  onOAuthLogin,
  onError,
  isLoading = false,
  className,
}: OAuthButtonsProps) {
  const { t } = useTranslation('auth');

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      if (onOAuthLogin) {
        onOAuthLogin(provider);
      } else {
        // Default behavior: Get OAuth URL from backend and redirect
        toast.info(
          t('oauth.redirecting', {
            provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          }),
        );

        // Call backend to get the OAuth authorization URL
        const authUrl = await authService.getOAuthUrl(provider);

        // Redirect to OAuth provider
        window.location.href = authUrl;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('oauth.error.failedToInitiate', {
              provider: provider.charAt(0).toUpperCase() + provider.slice(1),
            });
      onError?.(errorMessage);
    }
  };

  const allProviders = [
    {
      provider: 'google' as OAuthProvider,
      name: 'Google',
      icon: GoogleIcon,
      bgColor: 'bg-white hover:bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      enabled: config.oauth.google.enabled,
    },
    {
      provider: 'github' as OAuthProvider,
      name: 'GitHub',
      icon: Github,
      bgColor: 'bg-gray-900 hover:bg-gray-800',
      textColor: 'text-white',
      borderColor: 'border-gray-900',
      enabled: config.oauth.github.enabled,
    },
    {
      provider: 'telegram' as OAuthProvider,
      name: 'Telegram',
      icon: TelegramIcon,
      bgColor: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      borderColor: 'border-blue-500',
      enabled: config.oauth.telegram.enabled,
    },
  ];

  // Filter out disabled providers
  const oauthProviders = allProviders.filter(provider => provider.enabled);

  return (
    <div className={className}>
      <div className='space-y-3'>
        {oauthProviders.length > 0 ? (
          oauthProviders.map(
            ({
              provider,
              name,
              icon: Icon,
              bgColor,
              textColor,
              borderColor,
            }) => (
              <Button
                key={provider}
                type='button'
                variant='outline'
                size='default'
                className={`w-full ${bgColor} ${textColor} ${borderColor} border transition-colors duration-200`}
                onClick={() => handleOAuthLogin(provider)}
                disabled={isLoading}
              >
                <Icon className='size-4' />
                {t('oauth.continueWith', { provider: name })}
              </Button>
            ),
          )
        ) : (
          <p className='text-center text-sm text-gray-500'>
            {t('oauth.noProvidersEnabled')}
          </p>
        )}
      </div>
    </div>
  );
}
