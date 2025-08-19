/**
 * Subscription Detail Page
 *
 * Displays detailed information about a specific subscription
 * including usage statistics, billing info, and management options
 */

import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  CreditCard,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AdminLayout } from '@/components/common/Layout';

import { SubscriptionCard } from '../components/SubscriptionCard';
import { TrafficUsageCard } from '../components/TrafficUsageCard';
import {
  useSubscriptionWithTraffic,
  useDownloadClashConfig,
} from '../hooks/useSubscription';
import { userSubscriptionService } from '../services/userSubscriptionService';

/**
 * Billing information component
 */
function BillingInfoCard({ subscription }: { subscription: any }) {
  const { t, i18n } = useTranslation('subscription');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='w-5 h-5' />
          {t('labels.billingInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              {t('labels.price')}
            </label>
            <div className='text-lg font-semibold'>
              {formatPrice(subscription.price, subscription.currency)}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              {t('labels.billingCycle')}
            </label>
            <div className='text-lg'>
              {t(`billing.${subscription.billing_cycle}`)}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              {t('labels.currentPeriod')}
            </label>
            <div className='text-sm'>
              {formatDate(subscription.current_period_start)} -{' '}
              {formatDate(subscription.current_period_end)}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              {subscription.next_billing_date
                ? t('labels.nextBilling')
                : t('labels.endDate')}
            </label>
            <div className='text-sm'>
              {formatDate(
                subscription.next_billing_date || subscription.end_date
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              {t('labels.autoRenewal')}
            </span>
            <span
              className={`text-sm font-medium ${subscription.auto_renew ? 'text-green-600' : 'text-gray-600'}`}
            >
              {subscription.auto_renew
                ? t('labels.enabled')
                : t('labels.disabled')}
            </span>
          </div>

          {subscription.cancel_at_period_end && (
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                {t('labels.cancellation')}
              </span>
              <span className='text-sm font-medium text-orange-600'>
                {t('labels.endsAtPeriodEnd')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Plan details component
 */
function PlanDetailsCard({ subscription }: { subscription: any }) {
  const { t } = useTranslation('subscription');
  const plan = subscription.subscription_plan;

  if (!plan) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings className='w-5 h-5' />
          {t('labels.planDetails')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div>
            <h3 className='font-medium'>{plan.name}</h3>
            {plan.description && (
              <p className='text-sm text-muted-foreground mt-1'>
                {plan.description}
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>
                {t('labels.planId')}:
              </span>
              <div className='font-mono'>{plan.id}</div>
            </div>
            <div>
              <span className='text-muted-foreground'>
                {t('labels.subscriptionId')}:
              </span>
              <div className='font-mono'>{subscription.id}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Actions component
 */
function ActionsCard({
  subscription,
  onDownloadConfig,
}: {
  subscription: any;
  onDownloadConfig: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation('subscription');

  const isActive = subscription.status === 'active' && !subscription.is_expired;
  const canRenew = userSubscriptionService.canRenew(subscription);
  const daysRemaining =
    userSubscriptionService.getDaysUntilExpiry(subscription);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('labels.actions')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isActive && (
          <Button onClick={onDownloadConfig} className='w-full'>
            <Download className='w-4 h-4 mr-2' />
            {t('actions.downloadConfig')}
          </Button>
        )}

        {(subscription.is_expired || daysRemaining <= 7) && canRenew && (
          <Button
            onClick={() => navigate(`/plans?renew=${subscription.id}`)}
            className='w-full'
          >
            {t('actions.renewNow')}
          </Button>
        )}

        <Button
          variant='outline'
          onClick={() => navigate('/subscriptions')}
          className='w-full'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          {t('actions.backToSubscriptions')}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * SubscriptionDetailPage component
 */
export default function SubscriptionDetailPage() {
  const { t } = useTranslation('subscription');
  const { t: tNav } = useTranslation('navigation');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const downloadClashConfig = useDownloadClashConfig();

  // Fetch subscription and traffic data
  const {
    subscription,
    trafficStats,
    isLoading,
    error,
    isSuccess: _isSuccess,
  } = useSubscriptionWithTraffic(id!);

  const handleDownloadConfig = async () => {
    if (!subscription) {
      return;
    }

    const filename = `clash-config-${subscription.subscription_plan?.name || 'subscription'}-${subscription.id}.yaml`;
    downloadClashConfig.mutate(filename);
  };

  if (!id) {
    return (
      <AdminLayout
        navigation={[
          { label: tNav('menu.dashboard'), href: '/dashboard' },
          {
            label: tNav('menu.subscriptions'),
            href: '/subscriptions',
            active: true,
          },
          { label: tNav('menu.plans'), href: '/plans' },
          { label: tNav('menu.orders'), href: '/orders' },
          { label: tNav('menu.tickets'), href: '/tickets' },
        ]}
      >
        <div className='max-w-4xl mx-auto space-y-6'>
          <div className='text-center py-12'>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>
              {t('messages.invalidSubscription')}
            </h2>
            <p className='text-muted-foreground mb-4'>
              {t('messages.noSubscriptionId')}
            </p>
            <Button onClick={() => navigate('/subscriptions')}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              {t('actions.backToSubscriptions')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        navigation={[
          { label: tNav('menu.dashboard'), href: '/dashboard' },
          {
            label: tNav('menu.subscriptions'),
            href: '/subscriptions',
            active: true,
          },
          { label: tNav('menu.plans'), href: '/plans' },
          { label: tNav('menu.orders'), href: '/orders' },
          { label: tNav('menu.tickets'), href: '/tickets' },
        ]}
      >
        <div className='max-w-4xl mx-auto space-y-6'>
          <div className='text-center py-12'>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>
              {t('errors.detailsLoadFailed')}
            </h2>
            <p className='text-muted-foreground mb-4'>
              {error?.message || t('errors.genericError')}
            </p>
            <div className='flex gap-3 justify-center'>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className='w-4 h-4 mr-2' />
                {t('actions.tryAgain')}
              </Button>
              <Button
                variant='outline'
                onClick={() => navigate('/subscriptions')}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                {t('actions.backToSubscriptions')}
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      navigation={[
        { label: tNav('menu.dashboard'), href: '/dashboard' },
        {
          label: tNav('menu.subscriptions'),
          href: '/subscriptions',
          active: true,
        },
        { label: tNav('menu.plans'), href: '/plans' },
        { label: tNav('menu.orders'), href: '/orders' },
        { label: tNav('menu.tickets'), href: '/tickets' },
      ]}
    >
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold'>{t('subscriptionDetails')}</h1>
            <p className='text-muted-foreground'>
              {subscription
                ? `${subscription.subscription_plan?.name || 'Subscription'} ${t('messages.detailsAndUsage')}`
                : t('messages.loadingSubscriptionInfo')}
            </p>
          </div>

          <Button variant='outline' onClick={() => navigate('/subscriptions')}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('actions.back')}
          </Button>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-12'>
            <LoadingSpinner />
          </div>
        ) : subscription ? (
          <div className='space-y-6'>
            {/* Subscription Overview */}
            <div className='grid gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <SubscriptionCard
                  subscription={subscription}
                  showActions={false}
                  compact={false}
                />
              </div>
              <div>
                <ActionsCard
                  subscription={subscription}
                  onDownloadConfig={handleDownloadConfig}
                />
              </div>
            </div>

            {/* Traffic Usage */}
            {trafficStats && (
              <TrafficUsageCard
                trafficStats={trafficStats}
                subscriptionId={subscription.id}
                showDetails={true}
                compact={false}
              />
            )}

            {/* Detailed Information */}
            <div className='grid gap-6 md:grid-cols-2'>
              <BillingInfoCard subscription={subscription} />
              <PlanDetailsCard subscription={subscription} />
            </div>
          </div>
        ) : (
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold text-muted-foreground'>
              {t('messages.subscriptionNotFound')}
            </h2>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
