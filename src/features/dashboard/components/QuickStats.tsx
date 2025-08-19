/**
 * Quick stats component
 *
 * Displays a grid of statistical cards showing key metrics
 * and dashboard information at a glance.
 */

import {
  Wifi,
  Clock,
  Server,
  Ticket,
  TrendingUp,
  Activity,
  Shield,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormattedStats } from '../hooks/useDashboardData';

/**
 * Interface for a single stat item
 */
interface StatItem {
  /** Display title for the stat */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional description or subtitle */
  description?: string;
  /** Icon component to display */
  icon: React.ReactNode;
  /** Optional trend indicator */
  trend?: {
    value: string;
    isPositive: boolean;
  };
  /** Optional background color class */
  colorClass?: string;
}

/**
 * Props for QuickStats component
 */
interface QuickStatsProps {
  /** Optional className for styling */
  className?: string;
  /** Custom stats to override defaults */
  customStats?: StatItem[];
}

/**
 * QuickStats component
 *
 * Features:
 * - Grid layout of statistical cards
 * - Icons and trend indicators
 * - Responsive design
 * - Real-time data from API
 * - Customizable stats via props
 * - Loading and error states
 */
export function QuickStats({ className, customStats }: QuickStatsProps) {
  const { t } = useTranslation('dashboard');
  const { stats: apiStats, isLoading, error, refetch } = useFormattedStats();

  /**
   * Convert API stats to StatItem format
   */
  const getStatsFromAPI = (): StatItem[] => {
    if (!apiStats) {
      return [];
    }

    // Helper function to translate if it's a translation key
    const translateValue = (value: string) => {
      return value.startsWith('dashboard:') || value.startsWith('common:')
        ? t(value.replace('dashboard:', '').replace('common:', ''))
        : value;
    };

    return [
      {
        title: translateValue(apiStats.dataUsage.title),
        value: translateValue(apiStats.dataUsage.value),
        description: translateValue(apiStats.dataUsage.description),
        icon: <Activity className='h-4 w-4' />,
        trend: apiStats.dataUsage.trend
          ? {
              value: apiStats.dataUsage.trend,
              isPositive: true,
            }
          : undefined,
        colorClass: 'text-blue-600',
      },
      {
        title: translateValue(apiStats.connectionStatus.title),
        value: translateValue(apiStats.connectionStatus.value),
        description: translateValue(apiStats.connectionStatus.description),
        icon: <Wifi className='h-4 w-4' />,
        colorClass: apiStats.connectionStatus.value.includes('active')
          ? 'text-green-600'
          : 'text-gray-600',
      },
      {
        title: translateValue(apiStats.daysRemaining.title),
        value: translateValue(apiStats.daysRemaining.value),
        description: translateValue(apiStats.daysRemaining.description),
        icon: <Clock className='h-4 w-4' />,
        trend: apiStats.daysRemaining.trend
          ? {
              value: apiStats.daysRemaining.trend,
              isPositive: true,
            }
          : undefined,
        colorClass:
          parseInt(apiStats.daysRemaining.value) > 7
            ? 'text-emerald-600'
            : 'text-orange-600',
      },
      {
        title: translateValue(apiStats.activeNodes.title),
        value: translateValue(apiStats.activeNodes.value),
        description: translateValue(apiStats.activeNodes.description),
        icon: <Server className='h-4 w-4' />,
        colorClass: apiStats.activeNodes.value.includes('active')
          ? 'text-purple-600'
          : 'text-gray-600',
      },
    ];
  };

  /**
   * Fallback stats when API is unavailable or user not authenticated
   */
  const getFallbackStats = (): StatItem[] => {
    const isAuthError = error?.includes('not authenticated');
    const fallbackValue = isAuthError ? '--' : t('stats.noData');
    const fallbackDescription = isAuthError
      ? t('errors.loginRequired')
      : t('errors.dataUnavailable');

    return [
      {
        title: t('stats.quickStats.dataUsage.title'),
        value: fallbackValue,
        description: fallbackDescription,
        icon: <Activity className='h-4 w-4' />,
        colorClass: 'text-gray-600',
      },
      {
        title: t('stats.quickStats.connectionStatus.title'),
        value: isAuthError
          ? t('service.notConnected')
          : t('subscription.status.unknown'),
        description: fallbackDescription,
        icon: <Wifi className='h-4 w-4' />,
        colorClass: 'text-gray-600',
      },
      {
        title: t('stats.quickStats.daysRemaining.title'),
        value: fallbackValue,
        description: fallbackDescription,
        icon: <Clock className='h-4 w-4' />,
        colorClass: 'text-gray-600',
      },
      {
        title: t('stats.quickStats.activeNodes.title'),
        value: isAuthError
          ? t('service.noService')
          : t('subscription.status.unknown'),
        description: fallbackDescription,
        icon: <Server className='h-4 w-4' />,
        colorClass: 'text-gray-600',
      },
    ];
  };

  // Use custom stats if provided, otherwise use API data or fallback
  const stats =
    customStats || (apiStats ? getStatsFromAPI() : getFallbackStats());

  // Show loading state
  if (isLoading && !customStats) {
    return (
      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}
      >
        {[1, 2, 3, 4].map(index => (
          <Card key={index} className='animate-pulse'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 bg-gray-200 rounded w-24'></div>
              <div className='h-8 w-8 bg-gray-200 rounded-lg'></div>
            </CardHeader>
            <CardContent>
              <div className='space-y-1'>
                <div className='h-8 bg-gray-200 rounded w-16'></div>
                <div className='h-3 bg-gray-200 rounded w-20'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state with retry option
  if (error && !customStats) {
    return (
      <div className={`grid gap-4 md:grid-cols-1 ${className || ''}`}>
        <Card className='border-red-200'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center space-x-2 text-red-600'>
              <AlertCircle className='h-5 w-5' />
              <span className='text-sm font-medium'>
                {t('errors.statisticsLoadFailed')}
              </span>
              <button
                onClick={refetch}
                className='ml-2 text-xs underline hover:no-underline'
              >
                {t('common:actions.refresh')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}
    >
      {stats.map((stat, index) => (
        <Card key={index} className='hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-muted ${stat.colorClass || ''}`}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-1'>
              <div className='text-2xl font-bold text-foreground'>
                {stat.value}
              </div>
              {stat.description && (
                <p className='text-xs text-muted-foreground'>
                  {stat.description}
                </p>
              )}
              {stat.trend && (
                <div className='flex items-center space-x-1 text-xs'>
                  <TrendingUp
                    className={`h-3 w-3 ${
                      stat.trend.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  <span
                    className={
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {stat.trend.value}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Generate alternative stats for user dashboard
 */
export const getAlternativeStats = (t: (key: string) => string): StatItem[] => [
  {
    title: t('dashboard:stats.downloadSpeed'),
    value: '0 Mbps',
    description: t('dashboard:stats.currentSpeed'),
    icon: <Download className='h-4 w-4' />,
    colorClass: 'text-indigo-600',
  },
  {
    title: t('dashboard:stats.serviceStatus'),
    value: t('dashboard:stats.connected'),
    description: t('dashboard:stats.serviceActive'),
    icon: <Shield className='h-4 w-4' />,
    colorClass: 'text-green-600',
  },
  {
    title: t('dashboard:stats.supportTickets'),
    value: 0,
    description: t('dashboard:stats.openRequests'),
    icon: <Ticket className='h-4 w-4' />,
    colorClass: 'text-orange-600',
  },
];

/**
 * Default export
 */
export default QuickStats;
