/**
 * React hooks for dashboard data management
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { useAuthStatus } from '@/features/auth/stores/authStore';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscription';
import { apiClient } from '@/lib/api/client';
import { USER_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  DashboardData,
  DashboardStats,
} from '@/features/subscription/types/subscription.types';

/**
 * User profile interface
 */
interface UserProfile {
  id: number;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  role: string;
  status: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

/**
 * Dashboard data hook return type
 */
interface UseDashboardDataReturn {
  user: UserProfile | null;
  subscription: DashboardData;
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching user profile data
 */
export function useUserProfile() {
  const { isAuthenticated } = useAuthStatus();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await apiClient.get<UserProfile>(USER_ENDPOINTS.PROFILE);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching complete dashboard data (optimized with React Query)
 */
export function useDashboardData(): UseDashboardDataReturn {
  const { isAuthenticated } = useAuthStatus();

  // Use React Query hooks to avoid duplicate API calls
  const userQuery = useUserProfile();
  const activeSubscriptionsQuery = useActiveSubscriptions({
    enabled: isAuthenticated,
  });

  // Transform the data to match the expected format
  const subscription: DashboardData = {
    subscription: activeSubscriptionsQuery.data?.[0] || null,
    trafficStats: null, // Will be populated by traffic stats if needed
    isLoading: activeSubscriptionsQuery.isLoading,
    error: activeSubscriptionsQuery.error?.message || null,
  };

  // Transform to dashboard stats if we have subscription data
  const stats = subscription.subscription
    ? dashboardService.transformSubscriptionToStats(subscription.subscription)
    : null;

  const isLoading = userQuery.isLoading || activeSubscriptionsQuery.isLoading;
  const error =
    userQuery.error?.message || activeSubscriptionsQuery.error?.message || null;

  const refetch = async () => {
    await Promise.all([
      userQuery.refetch(),
      activeSubscriptionsQuery.refetch(),
    ]);
  };

  return {
    user: userQuery.data || null,
    subscription,
    stats,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Formatted stats for UI components
 */
interface FormattedStats {
  dataUsage: {
    title: string;
    value: string;
    description: string;
    trend?: string;
  };
  connectionStatus: { title: string; value: string; description: string };
  daysRemaining: {
    title: string;
    value: string;
    description: string;
    trend?: string;
  };
  activeNodes: { title: string; value: string; description: string };
}

/**
 * Formatted stats hook return type
 */
interface UseFormattedStatsReturn {
  stats: FormattedStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for getting formatted dashboard statistics (optimized with React Query)
 */
export function useFormattedStats(): UseFormattedStatsReturn {
  const { _isAuthenticated } = useAuthStatus();

  // Use the optimized dashboard data hook to avoid duplicate API calls
  const {
    subscription: _subscription,
    stats,
    isLoading,
    error,
  } = useDashboardData();

  // Transform stats to formatted stats for UI components
  const formattedStats = stats
    ? dashboardService.transformToFormattedStats(stats)
    : null;

  return {
    stats: formattedStats,
    isLoading,
    error,
    refetch: async () => {
      // This will be handled by the parent hook's refetch
    },
  };
}

/**
 * Hook for checking subscription status
 */
export function useSubscriptionStatus() {
  const { isAuthenticated, isInitialized } = useAuthStatus();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      // Don't check if user is not authenticated
      if (!isAuthenticated) {
        setHasActiveSubscription(false);
        setIsLoading(false);
        return;
      }

      try {
        const isActive = await dashboardService.hasActiveSubscription();
        setHasActiveSubscription(isActive);
      } catch (error) {
        console.error('Failed to check subscription status:', error);
        setHasActiveSubscription(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Only check status if auth store is initialized
    if (isInitialized) {
      checkStatus();
    }
  }, [isAuthenticated, isInitialized]);

  return { hasActiveSubscription, isLoading };
}
