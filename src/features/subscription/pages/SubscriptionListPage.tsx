/**
 * Subscription List Page
 *
 * Displays user's subscriptions with filtering, pagination,
 * and actions for managing subscriptions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, RefreshCw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AdminLayout } from '@/components/common/Layout';

import { SubscriptionCard } from '../components/SubscriptionCard';
import {
  useSubscriptions,
  useDownloadClashConfig,
} from '../hooks/useSubscription';

/**
 * Filter component for subscription status
 */
function SubscriptionFilter({
  selectedStatus,
  onStatusChange,
}: {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}) {
  const { t } = useTranslation('subscription');

  const filters = [
    { key: '', label: t('filters.all') },
    { key: 'active', label: t('filters.active') },
    { key: 'expired', label: t('filters.expired') },
    { key: 'trial', label: t('filters.trial') },
  ];

  return (
    <div className='flex flex-wrap gap-2'>
      {filters.map(filter => (
        <Button
          key={filter.key}
          variant={selectedStatus === filter.key ? 'default' : 'outline'}
          size='sm'
          onClick={() => onStatusChange(filter.key)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({
  hasFilters,
  onClearFilters,
  onViewPlans,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onViewPlans: () => void;
}) {
  const { t } = useTranslation('subscription');

  return (
    <Card>
      <CardContent className='text-center py-12'>
        <div className='space-y-4'>
          <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto'>
            <Search className='w-8 h-8 text-muted-foreground' />
          </div>

          <div className='space-y-2'>
            <h3 className='text-lg font-medium'>
              {hasFilters
                ? t('messages.noMatchingSubscriptions')
                : t('empty.noSubscriptions')}
            </h3>
            <p className='text-muted-foreground'>
              {hasFilters
                ? t('messages.tryAdjustingFilters')
                : t('empty.noSubscriptionsDescription')}
            </p>
          </div>

          <div className='flex justify-center gap-3'>
            {hasFilters ? (
              <Button variant='outline' onClick={onClearFilters}>
                {t('actions.clearFilters')}
              </Button>
            ) : (
              <Button onClick={onViewPlans}>
                <Plus className='w-4 h-4 mr-2' />
                {t('actions.selectPlan')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SubscriptionListPage component
 */
export default function SubscriptionListPage() {
  const { t } = useTranslation('subscription');
  const { t: tNav } = useTranslation('navigation');
  const navigate = useNavigate();

  // State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;

  // Queries
  const {
    data: subscriptionData,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscriptions(selectedStatus || undefined, limit, currentPage * limit);

  const downloadClashConfig = useDownloadClashConfig();

  const subscriptions = subscriptionData?.data || [];
  const totalSubscriptions = subscriptionData?.total || 0;
  const totalPages = Math.ceil(totalSubscriptions / limit);
  const hasFilters = selectedStatus !== '' || searchTerm !== '';

  // Filter subscriptions locally by search term
  const filteredSubscriptions = subscriptions.filter(
    sub =>
      !searchTerm ||
      sub.subscription_plan?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sub.uuid.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handlers
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0); // Reset to first page
  };

  const handleClearFilters = () => {
    setSelectedStatus('');
    setSearchTerm('');
    setCurrentPage(0);
  };

  const handleViewDetails = (subscriptionId: number) => {
    navigate(`/subscriptions/${subscriptionId}`);
  };

  const handleDownloadConfig = async (subscriptionId: number) => {
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    const filename = subscription
      ? `clash-config-${subscription.subscription_plan?.name || 'subscription'}-${subscriptionId}.yaml`
      : `clash-config-${subscriptionId}.yaml`;

    downloadClashConfig.mutate(filename);
  };

  const handleRenew = (subscriptionId: number) => {
    // Navigate to renewal/purchase page
    navigate(`/plans?renew=${subscriptionId}`);
  };

  const handleViewPlans = () => {
    navigate('/plans');
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  if (isError) {
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
          <div className='text-center py-12'>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>
              {t('errors.loadFailed')}
            </h2>
            <p className='text-muted-foreground mb-4'>
              {error?.message || t('errors.genericError')}
            </p>
            <Button onClick={() => refetch()}>
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
            <h1 className='text-3xl font-bold'>{t('mySubscriptions')}</h1>
            <p className='text-muted-foreground'>
              {t('messages.manageAndMonitor')}
            </p>
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              {t('actions.refresh')}
            </Button>

            <Button onClick={handleViewPlans}>
              <Plus className='w-4 h-4 mr-2' />
              {t('actions.selectPlan')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='w-5 h-5' />
              {t('labels.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Status Filter */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                {t('labels.status')}
              </label>
              <SubscriptionFilter
                selectedStatus={selectedStatus}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Search */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                {t('labels.search')}
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  placeholder={t('messages.searchPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {hasFilters && (
              <Button variant='outline' size='sm' onClick={handleClearFilters}>
                {t('actions.clearAllFilters')}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className='flex justify-center py-12'>
            <LoadingSpinner />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
            onViewPlans={handleViewPlans}
          />
        ) : (
          <>
            {/* Subscription Grid */}
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {filteredSubscriptions.map(subscription => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onViewDetails={handleViewDetails}
                  onDownloadConfig={handleDownloadConfig}
                  onRenew={handleRenew}
                  showActions={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className='py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm text-muted-foreground'>
                      {t('pagination.page', {
                        current: currentPage + 1,
                        total: totalPages,
                      })}
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                      >
                        {t('pagination.previous')}
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                      >
                        {t('pagination.next')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
