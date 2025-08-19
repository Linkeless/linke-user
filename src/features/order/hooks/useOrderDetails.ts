/**
 * Hook for fetching order details
 */

import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

/**
 * Custom hook for fetching order details
 */
export function useOrderDetails(orderId: string | number | undefined) {
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId!),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    order,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Custom hook for fetching order summary
 */
export function useOrderSummary(orderId: string | number | undefined) {
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order-summary', orderId],
    queryFn: () => orderService.getOrderSummary(orderId!),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    summary,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
