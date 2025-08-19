/**
 * Welcome card component
 *
 * Displays a personalized greeting with the user's name
 * and current date/time information.
 */

import { Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCurrentUser } from '@/features/auth/stores/authStore';
import { useDashboardData } from '../hooks/useDashboardData';

/**
 * Props for WelcomeCard component
 */
interface WelcomeCardProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * WelcomeCard component
 *
 * Features:
 * - Personalized greeting with user's name
 * - Current date and time display
 * - Clean, friendly design
 * - Responsive layout
 */
export function WelcomeCard({ className }: WelcomeCardProps) {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const authUser = useCurrentUser();
  const {
    user: apiUser,
    subscription,
    stats: _stats,
    isLoading,
    error,
  } = useDashboardData();

  // Get current date and time with localization
  const now = new Date();
  const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';

  const currentDate = now.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine greeting based on time of day
  const hour = now.getHours();
  let greeting = t('common:time.greeting.hello');

  if (hour < 12) {
    greeting = t('common:time.greeting.morning');
  } else if (hour < 17) {
    greeting = t('common:time.greeting.afternoon');
  } else {
    greeting = t('common:time.greeting.evening');
  }

  // Get display name (prefer auth user as it's more reliable, then API user, then fallback)
  const displayName =
    authUser?.username ||
    authUser?.email?.split('@')[0] ||
    apiUser?.username ||
    apiUser?.name ||
    t('common:user.fallbackName');

  // Get service status message based on subscription data
  const getServiceStatusMessage = () => {
    if (isLoading) {
      return t('dashboard:welcome.serviceStatus'); // Default message while loading
    }

    if (error) {
      if (error.includes('not authenticated')) {
        return t('dashboard:subscription.messages.loginToView');
      }
      // Show partial error but still try to show subscription status if available
      if (subscription.subscription) {
        const sub = subscription.subscription;
        const planName =
          sub.subscription_plan?.name || t('dashboard:service.activePlan');
        return `${t('common:user.fallbackName')} ${planName} ${t('dashboard:subscription.messages.statusAvailable')} (${t('dashboard:subscription.messages.unavailable')}).`;
      }
      return t('dashboard:subscription.messages.statusUnavailable');
    }

    if (!subscription.subscription) {
      return t('dashboard:subscription.messages.noSubscription');
    }

    const sub = subscription.subscription;
    const isActive = sub.status === 'active' && !sub.is_expired;

    if (isActive) {
      const planName =
        sub.subscription_plan?.name || t('dashboard:service.activePlan');
      return `${t('common:user.fallbackName')} ${planName} ${t('dashboard:subscription.messages.planActive')}.`;
    } else if (sub.is_expired) {
      return t('dashboard:subscription.messages.expired');
    } else if (sub.status === 'paused') {
      return t('dashboard:subscription.messages.paused');
    } else {
      return t('dashboard:subscription.messages.notActive');
    }
  };

  return (
    <Card
      className={`bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 ${className || ''}`}
    >
      <CardHeader className='pb-4'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold text-foreground'>
            {greeting}, {displayName}!
          </h2>
          <div className='flex items-center space-x-2'>
            {isLoading && (
              <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
            )}
            {error && <AlertCircle className='h-4 w-4 text-orange-500' />}
            <p className='text-muted-foreground'>{getServiceStatusMessage()}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='flex flex-col sm:flex-row gap-4 text-sm'>
          {/* Date */}
          <div className='flex items-center space-x-2 text-muted-foreground'>
            <Calendar className='h-4 w-4' />
            <span>{currentDate}</span>
          </div>

          {/* Time */}
          <div className='flex items-center space-x-2 text-muted-foreground'>
            <Clock className='h-4 w-4' />
            <span>{currentTime}</span>
          </div>

          {/* Subscription Status Indicator */}
          {subscription.subscription && (
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <div
                className={`h-2 w-2 rounded-full ${
                  subscription.subscription.status === 'active' &&
                  !subscription.subscription.is_expired
                    ? 'bg-green-500'
                    : subscription.subscription.status === 'paused'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <span className='capitalize'>
                {subscription.subscription.status}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Default export
 */
export default WelcomeCard;
