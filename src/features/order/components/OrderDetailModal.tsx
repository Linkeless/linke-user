/**
 * Order detail modal component
 */

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useOrderDetails, useOrderSummary } from '../hooks/useOrderDetails';
import { useDownloadInvoice } from '../hooks/useOrderPayment';
import { orderService } from '../services/orderService';

interface OrderDetailModalProps {
  orderId: string | undefined;
  open: boolean;
  onClose: () => void;
  onPay?: (orderId: string) => void;
}

/**
 * Display detailed order information in a modal
 */
export function OrderDetailModal({
  orderId,
  open,
  onClose,
  onPay,
}: OrderDetailModalProps) {
  const { t, i18n } = useTranslation('order');
  const { order, isLoading: isLoadingOrder } = useOrderDetails(orderId);
  const { summary, isLoading: isLoadingSummary } = useOrderSummary(orderId);
  const { downloadInvoice, isLoading: isDownloading } = useDownloadInvoice();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadInvoice = () => {
    if (order) {
      downloadInvoice({
        orderId: order.id,
        filename: `invoice-${order.order_no}.pdf`,
      });
    }
  };

  const canPay = order ? orderService.canPay(order) : false;
  const canDownloadInvoice = order
    ? orderService.canDownloadInvoice(order)
    : false;

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('title.orderDetail')}</DialogTitle>
        </DialogHeader>

        {isLoadingOrder || isLoadingSummary ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : order ? (
          <div className='space-y-4'>
            {/* Order Basic Info */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold'>{t('labels.basicInfo')}</h3>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('labels.orderNo')}:
                  </span>
                  <p className='font-medium'>{order.order_no}</p>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('labels.amount')}:
                  </span>
                  <p className='font-medium'>
                    {orderService.formatAmount(order.amount, order.currency)}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('labels.createdAt')}:
                  </span>
                  <p className='font-medium'>{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('labels.updatedAt')}:
                  </span>
                  <p className='font-medium'>{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription Plan Info */}
            {order.subscription_plan && (
              <>
                <div className='space-y-3'>
                  <h3 className='font-semibold'>{t('labels.planInfo')}</h3>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('labels.planName')}:
                      </span>
                      <p className='font-medium'>
                        {order.subscription_plan.name}
                      </p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('labels.billingCycle')}:
                      </span>
                      <p className='font-medium'>
                        {t(`billing.${order.subscription_plan.billing_cycle}`)}
                      </p>
                    </div>
                    {order.subscription_plan.description && (
                      <div className='col-span-2'>
                        <span className='text-muted-foreground'>
                          {t('labels.description')}:
                        </span>
                        <p className='font-medium'>
                          {order.subscription_plan.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Payment Info */}
            {order.paid_at && (
              <>
                <div className='space-y-3'>
                  <h3 className='font-semibold'>{t('labels.paymentInfo')}</h3>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('labels.paidAt')}:
                      </span>
                      <p className='font-medium'>{formatDate(order.paid_at)}</p>
                    </div>
                    {order.payment_method && (
                      <div>
                        <span className='text-muted-foreground'>
                          {t('labels.paymentMethod')}:
                        </span>
                        <p className='font-medium'>{order.payment_method}</p>
                      </div>
                    )}
                    {order.payment_no && (
                      <div className='col-span-2'>
                        <span className='text-muted-foreground'>
                          {t('labels.paymentNo')}:
                        </span>
                        <p className='font-medium'>{order.payment_no}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Order Summary (if available) */}
            {summary && (
              <>
                <div className='space-y-3'>
                  <h3 className='font-semibold'>{t('labels.orderSummary')}</h3>
                  <div className='space-y-2'>
                    {summary.items.map((item, index) => (
                      <div key={index} className='flex justify-between text-sm'>
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className='font-medium'>
                          {orderService.formatAmount(
                            item.total_price,
                            order.currency,
                          )}
                        </span>
                      </div>
                    ))}

                    <Separator className='my-2' />

                    <div className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>
                          {t('labels.subtotal')}:
                        </span>
                        <span>
                          {orderService.formatAmount(
                            summary.subtotal,
                            order.currency,
                          )}
                        </span>
                      </div>
                      {summary.discount > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            {t('labels.discount')}:
                          </span>
                          <span className='text-green-600'>
                            -
                            {orderService.formatAmount(
                              summary.discount,
                              order.currency,
                            )}
                          </span>
                        </div>
                      )}
                      {summary.tax > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            {t('labels.tax')}:
                          </span>
                          <span>
                            {orderService.formatAmount(
                              summary.tax,
                              order.currency,
                            )}
                          </span>
                        </div>
                      )}
                      <div className='flex justify-between font-semibold'>
                        <span>{t('labels.total')}:</span>
                        <span>
                          {orderService.formatAmount(
                            summary.total,
                            order.currency,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            {t('messages.orderNotFound')}
          </div>
        )}

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose}>
            {t('actions.close')}
          </Button>

          {canPay && onPay && order && (
            <Button variant='default' onClick={() => onPay(order.id)}>
              {t('actions.pay')}
            </Button>
          )}

          {canDownloadInvoice && order && (
            <Button
              variant='outline'
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              {isDownloading
                ? t('actions.downloading')
                : t('actions.downloadInvoice')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailModal;
