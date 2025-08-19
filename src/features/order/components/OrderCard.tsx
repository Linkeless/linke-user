/**
 * Order card component
 */

import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order.types';

interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onPay?: (orderId: string) => void;
  onDownloadInvoice?: (orderId: string) => void;
}

/**
 * Display order information in a card layout
 */
export function OrderCard({
  order,
  onViewDetails,
  onPay,
  onDownloadInvoice,
}: OrderCardProps) {
  const { t, i18n } = useTranslation('order');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canPay = orderService.canPay(order);
  const canDownloadInvoice = orderService.canDownloadInvoice(order);
  const expiryInfo = orderService.getExpiryTime(order);

  return (
    <Card className='hover:shadow-lg transition-shadow duration-200'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-base'>
                {t('labels.orderNo')}: {order.order_no}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            {order.subscription_plan && (
              <p className='text-sm text-muted-foreground'>
                {order.subscription_plan.name}
              </p>
            )}
          </div>
          <div className='text-right'>
            <p className='text-lg font-bold'>
              {orderService.formatAmount(order.amount, order.currency)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>
              {t('labels.createdAt')}:
            </span>
            <span>{formatDate(order.created_at)}</span>
          </div>

          {order.paid_at && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                {t('labels.paidAt')}:
              </span>
              <span>{formatDate(order.paid_at)}</span>
            </div>
          )}

          {order.payment_method && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                {t('labels.paymentMethod')}:
              </span>
              <span>{order.payment_method}</span>
            </div>
          )}

          {canPay && expiryInfo.remainingMinutes > 0 && (
            <div className='flex justify-between text-orange-600'>
              <span>{t('labels.expiresIn')}:</span>
              <span>
                {t('labels.minutes', { count: expiryInfo.remainingMinutes })}
              </span>
            </div>
          )}

          {canPay && expiryInfo.expired && (
            <div className='text-red-600 text-center'>
              {t('messages.orderExpired')}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='flex-1'
          onClick={() => onViewDetails(order.id)}
        >
          {t('actions.viewDetails')}
        </Button>

        {canPay && !expiryInfo.expired && onPay && (
          <Button
            variant='default'
            size='sm'
            className='flex-1'
            onClick={() => onPay(order.id)}
          >
            {t('actions.pay')}
          </Button>
        )}

        {canDownloadInvoice && onDownloadInvoice && (
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => onDownloadInvoice(order.id)}
          >
            {t('actions.downloadInvoice')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default OrderCard;
