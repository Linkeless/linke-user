/**
 * Hook for creating orders
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import type { CreateOrderRequest, Order } from '../types/order.types';

/**
 * Custom hook for creating orders
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('order');

  const mutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: (newOrder: Order) => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Add the new order to cache
      queryClient.setQueryData(['order', newOrder.id], newOrder);

      // Show success message
      toast.success(
        t('messages.createSuccess', { orderNo: newOrder.order_no })
      );
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(error.message || t('errors.createFailed'));
    },
  });

  return {
    createOrder: mutation.mutate,
    createOrderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
