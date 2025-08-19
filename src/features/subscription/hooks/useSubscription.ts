/**
 * React Query hooks for subscription-related data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { userSubscriptionService } from '../services/userSubscriptionService';
import { subscriptionPlanService } from '../services/subscriptionPlanService';

/**
 * Query keys for subscription-related queries
 */
export const subscriptionQueryKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...subscriptionQueryKeys.lists(), { filters }] as const,
  details: () => [...subscriptionQueryKeys.all, 'detail'] as const,
  detail: (id: string | number) =>
    [...subscriptionQueryKeys.details(), id] as const,
  active: () => [...subscriptionQueryKeys.all, 'active'] as const,
  traffic: (id: string | number) =>
    [...subscriptionQueryKeys.all, 'traffic', id] as const,
  dashboard: () => [...subscriptionQueryKeys.all, 'dashboard'] as const,
  clashConfig: () => [...subscriptionQueryKeys.all, 'clash-config'] as const,
} as const;

/**
 * Query keys for subscription plans
 */
export const planQueryKeys = {
  all: ['plans'] as const,
  lists: () => [...planQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...planQueryKeys.lists(), { filters }] as const,
  details: () => [...planQueryKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...planQueryKeys.details(), id] as const,
  popular: () => [...planQueryKeys.all, 'popular'] as const,
  byCode: (code: string) => [...planQueryKeys.all, 'code', code] as const,
} as const;

/**
 * Hook to get user's subscriptions
 */
export function useSubscriptions(
  status?: string,
  limit = 10,
  offset = 0,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.list({ status, limit, offset }),
    queryFn: () =>
      userSubscriptionService.getAllSubscriptions(status, limit, offset),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get user's active subscriptions
 */
export function useActiveSubscriptions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionQueryKeys.active(),
    queryFn: () => userSubscriptionService.getActiveSubscriptions(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get subscription details by ID
 */
export function useSubscriptionDetail(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.detail(id),
    queryFn: () => userSubscriptionService.getSubscriptionById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to get traffic statistics for a subscription
 */
export function useTrafficStats(
  subscriptionId: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.traffic(subscriptionId),
    queryFn: () =>
      userSubscriptionService.getTrafficStats(Number(subscriptionId)),
    enabled: (options?.enabled ?? true) && !!subscriptionId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to get dashboard data
 */
export function useDashboardSubscriptionData(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionQueryKeys.dashboard(),
    queryFn: () => userSubscriptionService.getDashboardData(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get subscription plans
 */
export function useSubscriptionPlans(
  currency?: string,
  limit = 100,
  offset = 0,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: planQueryKeys.list({ currency, limit, offset }),
    queryFn: () => subscriptionPlanService.getPlans(currency, limit, offset),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get popular subscription plans
 */
export function usePopularPlans(limit = 5, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: planQueryKeys.popular(),
    queryFn: () => subscriptionPlanService.getPopularPlans(limit),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get plan details by ID
 */
export function usePlanDetail(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: planQueryKeys.detail(id),
    queryFn: () => subscriptionPlanService.getPlanById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get plan details by code
 */
export function usePlanByCode(code: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: planQueryKeys.byCode(code),
    queryFn: () => subscriptionPlanService.getPlanByCode(code),
    enabled: (options?.enabled ?? true) && !!code,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to download Clash configuration
 */
export function useDownloadClashConfig() {
  const { t } = useTranslation('subscription');

  return useMutation({
    mutationFn: (filename?: string) =>
      userSubscriptionService.downloadClashConfig(filename),
    onSuccess: () => {
      toast.success(t('config.downloadSuccess'));
    },
    onError: error => {
      console.error('Failed to download Clash config:', error);
      toast.error(t('config.downloadError'));
    },
  });
}

/**
 * Hook to refresh subscription data
 */
export function useRefreshSubscriptionData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all subscription-related queries
      await queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.all,
      });
      await queryClient.invalidateQueries({ queryKey: planQueryKeys.all });
    },
    onSuccess: () => {
      toast.success('Data refreshed successfully');
    },
    onError: () => {
      toast.error('Failed to refresh data');
    },
  });
}

/**
 * Hook to check if user has any active subscriptions
 */
export function useHasActiveSubscriptions() {
  const { data: activeSubscriptions = [], isLoading } =
    useActiveSubscriptions();

  return {
    hasActiveSubscriptions: activeSubscriptions.length > 0,
    activeSubscriptionsCount: activeSubscriptions.length,
    isLoading,
  };
}

/**
 * Hook to get primary subscription (first active subscription)
 */
export function usePrimarySubscription() {
  const { data: activeSubscriptions = [], ...rest } = useActiveSubscriptions();

  return {
    ...rest,
    data: activeSubscriptions[0] || null,
    primarySubscription: activeSubscriptions[0] || null,
  };
}

/**
 * Hook to get subscription with traffic stats
 */
export function useSubscriptionWithTraffic(subscriptionId: string | number) {
  const subscription = useSubscriptionDetail(subscriptionId);
  const trafficStats = useTrafficStats(subscriptionId, {
    enabled: !!subscriptionId && subscription.isSuccess,
  });

  return {
    subscription: subscription.data,
    trafficStats: trafficStats.data,
    isLoading: subscription.isLoading || trafficStats.isLoading,
    error: subscription.error || trafficStats.error,
    isSuccess: subscription.isSuccess && trafficStats.isSuccess,
  };
}
