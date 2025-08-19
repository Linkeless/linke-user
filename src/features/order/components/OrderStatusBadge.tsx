/**
 * Order status badge component
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '../types/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/**
 * Display order status with appropriate color and text
 */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const { t } = useTranslation('order');

  const getStatusStyles = (status: OrderStatus): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusStyles(status),
        className
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}

export default OrderStatusBadge;
