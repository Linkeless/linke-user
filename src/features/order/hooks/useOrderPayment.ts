/**
 * Hook for order payment
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import type { PaymentRequest, PaymentResponse } from '../types/order.types';

/**
 * Custom hook for processing order payments
 */
export function useOrderPayment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('order');

  const mutation = useMutation({
    mutationFn: (data: PaymentRequest) => orderService.payOrder(data),
    onSuccess: (response: PaymentResponse, variables) => {
      if (response.success) {
        // Invalidate order details to refetch with updated status
        queryClient.invalidateQueries({
          queryKey: ['order', variables.order_id],
        });
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Show success message
        toast.success(t('messages.paymentSuccess'));

        // If there's a payment URL, redirect to it
        if (response.payment_url) {
          window.location.href = response.payment_url;
        }
      } else {
        // Payment failed
        toast.error(response.message || t('errors.paymentFailed'));
      }
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(error.message || t('errors.paymentFailed'));
    },
  });

  return {
    payOrder: mutation.mutate,
    payOrderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Custom hook for downloading invoice
 */
export function useDownloadInvoice() {
  const { t } = useTranslation('order');

  const mutation = useMutation({
    mutationFn: ({
      orderId,
      filename,
    }: {
      orderId: string | number;
      filename?: string;
    }) => orderService.downloadInvoice(orderId, filename),
    onSuccess: () => {
      toast.success(t('messages.invoiceDownloaded'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('errors.invoiceDownloadFailed'));
    },
  });

  return {
    downloadInvoice: mutation.mutate,
    downloadInvoiceAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
