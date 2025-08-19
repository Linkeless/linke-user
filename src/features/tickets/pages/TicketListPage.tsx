/**
 * TicketListPage Component
 * Main page for displaying user's support tickets
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminLayout } from '@/features/dashboard/components/DashboardLayout';
import { TicketList } from '../components/TicketList';
import { useTickets } from '../hooks/useTickets';
import type { TicketFilters } from '../types/ticket.types';

export function TicketListPage() {
  const { t } = useTranslation('tickets');
  const { t: tNav } = useTranslation('navigation');
  const [filters, _setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error, refetch } = useTickets(filters);
  const tickets = data?.data || [];

  return (
    <AdminLayout
      navigation={[
        { label: tNav('menu.dashboard'), href: '/dashboard' },
        { label: tNav('menu.subscriptions'), href: '/subscriptions' },
        { label: t('title'), href: '/tickets', active: true },
      ]}
    >
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>

        {/* Ticket List */}
        <TicketList
          tickets={tickets}
          loading={isLoading}
          error={error}
          onRefresh={refetch}
        />
      </div>
    </AdminLayout>
  );
}

export default TicketListPage;
