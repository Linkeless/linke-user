/**
 * Plan Selection Page
 *
 * Displays available subscription plans with comparison
 * and purchase options
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, RefreshCw, Grid, List, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AdminLayout } from '@/components/common/Layout';

import { PlanCard } from '../components/PlanCard';
import {
  useSubscriptionPlans,
  usePopularPlans,
} from '../hooks/useSubscription';

/**
 * Currency selector component
 */
function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
}: {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}) {
  const currencies = [
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];

  return (
    <div className='flex gap-2'>
      {currencies.map(currency => (
        <Button
          key={currency.code}
          variant={selectedCurrency === currency.code ? 'default' : 'outline'}
          size='sm'
          onClick={() => onCurrencyChange(currency.code)}
        >
          {currency.symbol} {currency.code}
        </Button>
      ))}
    </div>
  );
}

/**
 * View mode toggle component
 */
function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'grid' | 'comparison';
  onViewModeChange: (mode: 'grid' | 'comparison') => void;
}) {
  return (
    <div className='flex gap-1 p-1 bg-muted rounded-lg'>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => onViewModeChange('grid')}
      >
        <Grid className='w-4 h-4 mr-2' />
        {t('labels.grid')}
      </Button>
      <Button
        variant={viewMode === 'comparison' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => onViewModeChange('comparison')}
      >
        <List className='w-4 h-4 mr-2' />
        {t('labels.compare')}
      </Button>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  const { t } = useTranslation('subscription');

  return (
    <Card>
      <CardContent className='text-center py-12'>
        <div className='space-y-4'>
          <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto'>
            <Star className='w-8 h-8 text-muted-foreground' />
          </div>

          <div className='space-y-2'>
            <h3 className='text-lg font-medium'>{t('empty.noPlans')}</h3>
            <p className='text-muted-foreground'>
              {t('empty.noPlansDescription')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * PlanSelectionPage component
 */
export default function PlanSelectionPage() {
  const { t } = useTranslation('subscription');
  const { t: tNav } = useTranslation('navigation');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [selectedCurrency, setSelectedCurrency] = useState('CNY');
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);

  // Get renewal subscription ID from URL params
  const renewalSubscriptionId = searchParams.get('renew');

  // Queries
  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
    error: plansErrorMessage,
    refetch: refetchPlans,
  } = useSubscriptionPlans(selectedCurrency, 100, 0);

  const { data: popularPlans = [], isLoading: popularLoading } =
    usePopularPlans(5);

  const plans = plansData?.data || [];
  const isLoading = plansLoading || popularLoading;

  // Get popular plan IDs for highlighting
  const popularPlanIds = new Set(popularPlans.map(p => p.id));

  // Find monthly plans for comparison pricing
  const monthlyPlans = plans.filter(p => p.billing_cycle === 'monthly');

  // Handlers
  const handlePlanSelect = (planId: number) => {
    if (viewMode === 'comparison') {
      setSelectedPlans(prev =>
        prev.includes(planId)
          ? prev.filter(id => id !== planId)
          : prev.length < 4 // Limit comparison to 4 plans
            ? [...prev, planId]
            : prev,
      );
    }
  };

  const handlePlanPurchase = (planId: number) => {
    // Navigate to payment/checkout with plan ID and renewal info
    const params = new URLSearchParams();
    params.set('plan', planId.toString());
    if (renewalSubscriptionId) {
      params.set('renew', renewalSubscriptionId);
    }
    navigate(`/checkout?${params.toString()}`);
  };

  const handleGoBack = () => {
    if (renewalSubscriptionId) {
      navigate(`/subscriptions/${renewalSubscriptionId}`);
    } else {
      navigate('/subscriptions');
    }
  };

  const getMonthlyPriceForComparison = (planId: number) => {
    const monthlyPlan = monthlyPlans.find(
      p =>
        p.name.replace(/\s*(monthly|yearly|annual)/i, '') ===
        plans
          .find(plan => plan.id === planId)
          ?.name.replace(/\s*(monthly|yearly|annual)/i, ''),
    );
    return monthlyPlan?.price;
  };

  // Filter plans for comparison mode
  const comparisonPlans =
    viewMode === 'comparison' && selectedPlans.length > 0
      ? plans.filter(p => selectedPlans.includes(p.id))
      : [];

  if (plansError) {
    return (
      <AdminLayout
        navigation={[
          { label: tNav('menu.dashboard'), href: '/dashboard' },
          { label: tNav('menu.subscriptions'), href: '/subscriptions' },
          { label: tNav('menu.plans'), href: '/plans', active: true },
          { label: tNav('menu.orders'), href: '/orders' },
          { label: tNav('menu.tickets'), href: '/tickets' },
        ]}
      >
        <div className='max-w-6xl mx-auto space-y-6'>
          <div className='text-center py-12'>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>
              {t('errors.plansLoadFailed')}
            </h2>
            <p className='text-muted-foreground mb-4'>
              {plansErrorMessage?.message || t('errors.genericError')}
            </p>
            <Button onClick={() => refetchPlans()}>
              <RefreshCw className='w-4 h-4 mr-2' />
              {t('actions.tryAgain')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      navigation={[
        { label: tNav('menu.dashboard'), href: '/dashboard' },
        { label: tNav('menu.subscriptions'), href: '/subscriptions' },
        { label: tNav('menu.plans'), href: '/plans', active: true },
        { label: tNav('menu.orders'), href: '/orders' },
        { label: tNav('menu.tickets'), href: '/tickets' },
      ]}
    >
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-start'>
          <div className='flex items-center gap-4'>
            {renewalSubscriptionId && (
              <Button variant='outline' size='sm' onClick={handleGoBack}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                {t('actions.back')}
              </Button>
            )}

            <div>
              <h1 className='text-3xl font-bold'>
                {renewalSubscriptionId
                  ? t('messages.renewSubscription')
                  : t('planSelection')}
              </h1>
              <p className='text-muted-foreground'>
                {renewalSubscriptionId
                  ? t('messages.chooseRenewalPlan')
                  : t('messages.choosePerfectPlan')}
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={() => refetchPlans()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              {t('actions.refresh')}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>{t('labels.options')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col sm:flex-row gap-4 justify-between'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  {t('labels.currency')}
                </label>
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  {t('labels.viewMode')}
                </label>
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>

            {viewMode === 'comparison' && (
              <div className='pt-2 border-t'>
                <p className='text-sm text-muted-foreground'>
                  {selectedPlans.length === 0
                    ? t('messages.selectUpToFourPlans')
                    : `${selectedPlans.length} plan${selectedPlans.length > 1 ? 's' : ''} selected for comparison`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Plans Section */}
        {popularPlans.length > 0 && viewMode === 'grid' && (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Star className='w-5 h-5 text-yellow-500 fill-current' />
              <h2 className='text-xl font-semibold'>
                {t('billing.mostPopular')}
              </h2>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {popularPlans
                .filter(plan => plan.currency === selectedCurrency)
                .map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onPurchase={handlePlanPurchase}
                    isPopular={true}
                    showFeatures={false}
                    monthlyPrice={getMonthlyPriceForComparison(plan.id)}
                  />
                ))}
            </div>

            <Separator className='my-8' />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className='flex justify-center py-12'>
            <LoadingSpinner />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold'>
              {viewMode === 'comparison'
                ? t('messages.planComparison')
                : t('messages.allPlans')}
            </h2>

            {viewMode === 'grid' ? (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {plans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={
                      viewMode === 'comparison' ? handlePlanSelect : undefined
                    }
                    onPurchase={handlePlanPurchase}
                    isSelected={selectedPlans.includes(plan.id)}
                    isPopular={popularPlanIds.has(plan.id)}
                    showFeatures={true}
                    monthlyPrice={getMonthlyPriceForComparison(plan.id)}
                  />
                ))}
              </div>
            ) : (
              <div className='grid gap-6 lg:grid-cols-2 xl:grid-cols-3'>
                {comparisonPlans.length > 0 ? (
                  comparisonPlans.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onPurchase={handlePlanPurchase}
                      isSelected={true}
                      comparisonMode={true}
                      showFeatures={true}
                      monthlyPrice={getMonthlyPriceForComparison(plan.id)}
                    />
                  ))
                ) : (
                  <div className='col-span-full'>
                    <Card>
                      <CardContent className='text-center py-12'>
                        <p className='text-muted-foreground'>
                          {t('messages.selectUpToFourPlans')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
