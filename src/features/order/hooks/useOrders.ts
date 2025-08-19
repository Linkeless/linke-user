/**
 * Hook for managing orders list
 */

import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { OrderQueryParams } from '../types/order.types';

/**
 * Custom hook for fetching and managing orders
 */
export function useOrders(params?: OrderQueryParams) {
  const queryKey = ['orders', params];

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: () => orderService.getOrders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });

  return {
    orders: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    isRefetching,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Custom hook for fetching payment orders
 */
export function usePaymentOrders(params?: { page?: number; limit?: number }) {
  const queryKey = ['payment-orders', params];

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: () => orderService.getPaymentOrders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    orders: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    isRefetching,
    error: error as Error | null,
    refetch,
  };
}
