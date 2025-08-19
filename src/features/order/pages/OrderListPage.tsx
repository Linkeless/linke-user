/**
 * Order list page component
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/common/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { OrderCard } from '../components/OrderCard';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { CreateOrderForm } from '../components/CreateOrderForm';
import { PaymentModal } from '../components/PaymentModal';
import { useOrders } from '../hooks/useOrders';
import { useDownloadInvoice } from '../hooks/useOrderPayment';
import type { OrderQueryParams, OrderStatus } from '../types/order.types';
import { PlusCircle, RefreshCw, Search } from 'lucide-react';

/**
 * Main order management page
 */
export function OrderListPage() {
  const { t } = useTranslation('order');
  const [filters, setFilters] = useState<OrderQueryParams>({
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_by: 'created_at',
  });

  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders with filters
  const { orders, total, isLoading, isRefetching, refetch } =
    useOrders(filters);
  const { downloadInvoice } = useDownloadInvoice();

  // Calculate pagination
  const totalPages = Math.ceil(total / (filters.limit || 10));
  const currentPage = filters.page || 1;

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : (status as OrderStatus),
      page: 1, // Reset to first page
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy as 'created_at' | 'amount' | 'status',
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Modal handlers
  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  const handlePay = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowPaymentModal(true);
  };

  const handleDownloadInvoice = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      downloadInvoice({
        orderId,
        filename: `invoice-${order.order_no}.pdf`,
      });
    }
  };

  const handleCreateSuccess = (orderId: string) => {
    refetch();
    // Optionally open the new order details
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  // Filter orders by search term
  const filteredOrders = orders.filter(
    order =>
      order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.subscription_plan?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-2xl font-bold'>{t('title.orderManagement')}</h1>
            <p className='text-muted-foreground mt-1'>
              {t('description.orderManagement')}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusCircle className='mr-2 h-4 w-4' />
            {t('actions.createOrder')}
          </Button>
        </div>

        {/* Filters Section */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* Search */}
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder={t('placeholders.searchOrders')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-9'
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className='w-full lg:w-[180px]'>
                  <SelectValue placeholder={t('labels.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('filters.allStatus')}</SelectItem>
                  <SelectItem value='pending'>{t('status.pending')}</SelectItem>
                  <SelectItem value='paid'>{t('status.paid')}</SelectItem>
                  <SelectItem value='cancelled'>
                    {t('status.cancelled')}
                  </SelectItem>
                  <SelectItem value='expired'>{t('status.expired')}</SelectItem>
                  <SelectItem value='refunded'>
                    {t('status.refunded')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={filters.sort_by || 'created_at'}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className='w-full lg:w-[180px]'>
                  <SelectValue placeholder={t('labels.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_at'>
                    {t('sort.createdAt')}
                  </SelectItem>
                  <SelectItem value='amount'>{t('sort.amount')}</SelectItem>
                  <SelectItem value='status'>{t('sort.status')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh Button */}
              <Button
                variant='outline'
                size='icon'
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <LoadingSpinner />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className='py-12'>
              <div className='text-center space-y-3'>
                <p className='text-muted-foreground'>
                  {searchTerm || filters.status
                    ? t('messages.noOrdersFound')
                    : t('messages.noOrders')}
                </p>
                {!searchTerm && !filters.status && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    {t('actions.createFirstOrder')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Order Cards Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  onPay={handlePay}
                  onDownloadInvoice={handleDownloadInvoice}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t('pagination.previous')}
                </Button>

                <div className='flex items-center gap-1'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            )}

            {/* Page Info */}
            <div className='text-center text-sm text-muted-foreground'>
              {t('pagination.pageInfo', {
                current: currentPage,
                total: totalPages,
                count: total,
              })}
            </div>
          </>
        )}

        {/* Modals */}
        <OrderDetailModal
          orderId={selectedOrderId}
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrderId(undefined);
          }}
          onPay={handlePay}
        />

        <CreateOrderForm
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        <PaymentModal
          orderId={selectedOrderId}
          open={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderId(undefined);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      </div>
    </AdminLayout>
  );
}

export default OrderListPage;
