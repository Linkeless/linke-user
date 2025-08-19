/**
 * Traffic Usage Card Component
 *
 * Displays traffic usage statistics with progress bars,
 * usage breakdown, and reset information
 */

import {
  Activity,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrafficStats } from '../types/subscription.types';
import { userSubscriptionService } from '../services/userSubscriptionService';

/**
 * Props for TrafficUsageCard component
 */
interface TrafficUsageCardProps {
  trafficStats: TrafficStats | null;
  subscriptionId?: number;
  showDetails?: boolean;
  compact?: boolean;
}

/**
 * Progress bar with custom styling based on usage percentage
 */
function UsageProgressBar({
  used,
  total,
  showPercentage = true,
}: {
  used: number;
  total: number;
  showPercentage?: boolean;
}) {
  const { t } = useTranslation('subscription');
  const isUnlimited = userSubscriptionService.isUnlimitedData({
    total_bytes: total,
    used_bytes: used,
    remaining_bytes: total - used,
    usage_percent: 0,
    subscription_id: 0,
    period: 'monthly',
    status: 'active',
    reset_date: '',
    last_updated: '',
  });

  const percentage = isUnlimited ? 0 : Math.min((used / total) * 100, 100);

  const getProgressColor = () => {
    if (isUnlimited) {
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
    if (percentage >= 95) {
      return 'bg-gradient-to-r from-red-400 to-red-600';
    }
    if (percentage >= 80) {
      return 'bg-gradient-to-r from-orange-400 to-orange-600';
    }
    if (percentage >= 60) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    }
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };

  const getBackgroundColor = () => {
    if (percentage >= 95) {
      return 'bg-red-50';
    }
    if (percentage >= 80) {
      return 'bg-orange-50';
    }
    return 'bg-gray-100';
  };

  return (
    <div className='space-y-2'>
      <div className={`w-full h-3 rounded-full ${getBackgroundColor()}`}>
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{
            width: isUnlimited ? '100%' : `${Math.max(percentage, 2)}%`,
          }}
        />
      </div>
      {showPercentage && !isUnlimited && (
        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>
            {t('labels.usagePercent', { percent: percentage.toFixed(1) })}
          </span>
          <span>
            {(100 - percentage).toFixed(1)}% {t('usage.remaining')}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Usage warning component
 */
function UsageWarning({ percentage }: { percentage: number }) {
  const { t } = useTranslation('subscription');

  if (percentage < 80) {
    return null;
  }

  const isOverage = percentage >= 100;
  const isCritical = percentage >= 95;
  const isHigh = percentage >= 80;

  const getWarningConfig = () => {
    if (isOverage) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        icon: <AlertTriangle className='w-4 h-4 text-red-600' />,
        message: t('warnings.dataLimitExceeded'),
      };
    }
    if (isCritical) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        icon: <AlertTriangle className='w-4 h-4 text-red-600' />,
        message: t('warnings.criticalDataRemaining'),
      };
    }
    if (isHigh) {
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-50 border-orange-200',
        icon: <AlertTriangle className='w-4 h-4 text-orange-600' />,
        message: t('warnings.warningHighUsage'),
      };
    }
  };

  const config = getWarningConfig();
  if (!config) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border ${config.bg}`}
    >
      {config.icon}
      <span className={`text-sm ${config.color}`}>{config.message}</span>
    </div>
  );
}

/**
 * TrafficUsageCard component
 */
export function TrafficUsageCard({
  trafficStats,
  subscriptionId: _subscriptionId,
  showDetails = true,
  compact = false,
}: TrafficUsageCardProps) {
  const { t, i18n } = useTranslation('subscription');

  // No data state
  if (!trafficStats) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Activity className='w-5 h-5' />
            {t('labels.trafficStats')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Activity className='w-8 h-8 mx-auto mb-3 opacity-50' />
            <p className='text-sm'>{t('usage.noUsageData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUnlimited = userSubscriptionService.isUnlimitedData(trafficStats);
  const usedFormatted = userSubscriptionService.formatBytes(
    trafficStats.used_bytes,
  );
  const totalFormatted = isUnlimited
    ? t('usage.unlimited')
    : userSubscriptionService.formatBytes(trafficStats.total_bytes);
  const remainingFormatted = isUnlimited
    ? t('usage.unlimited')
    : userSubscriptionService.formatBytes(trafficStats.remaining_bytes);

  const percentage = trafficStats.usage_percent;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={compact ? 'p-3' : ''}>
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Activity className='w-5 h-5' />
            {t('labels.trafficStats')}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('usage.currentPeriod')}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Usage Overview */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>{t('usage.used')}</span>
            <span className='text-lg font-bold'>{usedFormatted}</span>
          </div>

          {!isUnlimited && (
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-sm'>{t('usage.total')}</span>
              <span className='text-sm'>{totalFormatted}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <UsageProgressBar
          used={trafficStats.used_bytes}
          total={trafficStats.total_bytes}
          showPercentage={!isUnlimited}
        />

        {/* Warning */}
        {!isUnlimited && <UsageWarning percentage={percentage} />}

        {/* Detailed Stats */}
        {showDetails && !compact && (
          <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Download className='w-4 h-4' />
                {t('usage.remaining')}
              </div>
              <div className='text-lg font-semibold'>{remainingFormatted}</div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <TrendingUp className='w-4 h-4' />
                {t('labels.usage')}
              </div>
              <div className='text-lg font-semibold'>
                {isUnlimited ? '∞' : `${percentage.toFixed(1)}%`}
              </div>
            </div>
          </div>
        )}

        {/* Reset Information */}
        <div className='flex items-center justify-between pt-3 border-t text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <RefreshCw className='w-4 h-4' />
            <span>{t('labels.resetsOn')}</span>
          </div>
          <span className='font-medium'>
            {formatDate(trafficStats.reset_date)}
          </span>
        </div>

        {/* Last Updated */}
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-3 h-3' />
            <span>{t('labels.lastUpdated')}</span>
          </div>
          <span>{formatDate(trafficStats.last_updated)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrafficUsageCard;
