/**
 * Subscription Card Component
 *
 * Displays subscription information in a card format
 * with status, usage, and action buttons
 */

import {
  Calendar,
  Download,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserSubscription } from '../types/subscription.types';
import { userSubscriptionService } from '../services/userSubscriptionService';

/**
 * Props for SubscriptionCard component
 */
interface SubscriptionCardProps {
  subscription: UserSubscription;
  onViewDetails?: (id: number) => void;
  onDownloadConfig?: (id: number) => void;
  onRenew?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation('subscription');
  const color = userSubscriptionService.getStatusColor(status);

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const icons = {
    active: <CheckCircle className='w-3 h-3' />,
    trial: <Clock className='w-3 h-3' />,
    paused: <PauseCircle className='w-3 h-3' />,
    cancelled: <XCircle className='w-3 h-3' />,
    expired: <XCircle className='w-3 h-3' />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}`}
    >
      {icons[status as keyof typeof icons]}
      {t(`status.${status}`)}
    </span>
  );
}

/**
 * SubscriptionCard component
 */
export function SubscriptionCard({
  subscription,
  onViewDetails,
  onDownloadConfig,
  onRenew,
  showActions = true,
  compact = false,
}: SubscriptionCardProps) {
  const { t, i18n } = useTranslation('subscription');

  const daysRemaining =
    userSubscriptionService.getDaysUntilExpiry(subscription);
  const canRenew = userSubscriptionService.canRenew(subscription);
  const isExpired = subscription.is_expired;
  const isActive = subscription.status === 'active' && !isExpired;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      CNY: '¥',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price.toFixed(2)}`;
  };

  const billingCycleKey = `billing.${subscription.billing_cycle}` as const;

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${compact ? 'p-3' : ''}`}
    >
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className='flex justify-between items-start'>
          <div className='space-y-1'>
            <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
              {subscription.subscription_plan?.name || t('labels.plan')}
            </CardTitle>
            <div className='flex items-center gap-2'>
              <StatusBadge status={subscription.status} />
              {subscription.is_in_trial && (
                <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                  {t('status.trial')}
                </span>
              )}
            </div>
          </div>
          <div className='text-right'>
            <div className='text-sm text-muted-foreground'>
              {formatPrice(subscription.price, subscription.currency)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {t(billingCycleKey)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Usage Information - only show for active subscriptions */}
        {isActive && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Activity className='w-4 h-4' />
              {t('labels.dataUsage')}
            </div>
            {/* This would need traffic stats from parent or a separate hook */}
            <div className='text-xs text-muted-foreground'>
              {t('usage.noUsageData')}
            </div>
          </div>
        )}

        {/* Date Information */}
        <div className='grid grid-cols-1 gap-3 text-sm'>
          {!isExpired && (
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Clock className='w-4 h-4' />
                {t('labels.daysRemaining')}
              </div>
              <span
                className={`font-medium ${daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}
              >
                {daysRemaining}{' '}
                {t(daysRemaining === 1 ? 'labels.day' : 'labels.days')}
              </span>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Calendar className='w-4 h-4' />
              {isExpired ? t('labels.expiryDate') : t('labels.renewalDate')}
            </div>
            <span className='font-medium'>
              {formatDate(subscription.end_date)}
            </span>
          </div>

          {subscription.auto_renew && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {t('labels.autoRenewal')}
              </span>
              <CheckCircle className='w-4 h-4 text-green-600' />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className='flex gap-2 pt-2'>
            {onViewDetails && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onViewDetails(subscription.id)}
                className='flex-1'
              >
                {t('actions.viewDetails')}
              </Button>
            )}

            {isActive && onDownloadConfig && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onDownloadConfig(subscription.id)}
              >
                <Download className='w-4 h-4' />
              </Button>
            )}

            {(isExpired || daysRemaining <= 7) && canRenew && onRenew && (
              <Button
                size='sm'
                onClick={() => onRenew(subscription.id)}
                className='bg-primary hover:bg-primary/90'
              >
                {t('actions.renewNow')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SubscriptionCard;
