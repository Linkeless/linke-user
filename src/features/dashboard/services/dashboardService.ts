/**
 * Dashboard Service
 * Provides data aggregation and business logic for dashboard components
 */

import { apiClient } from '@/lib/api/client';
import { USER_ENDPOINTS } from '@/lib/api/endpoints';
import { userSubscriptionService } from '@/features/subscription/services/userSubscriptionService';
import type {
  DashboardData,
  DashboardStats,
  UserSubscription,
} from '@/features/subscription/types/subscription.types';

/**
 * User profile from API
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
 * Dashboard service class
 */
export class DashboardService {
  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      console.log('DashboardService: Making user profile request...');
      const response = await apiClient.get<UserProfile>(USER_ENDPOINTS.PROFILE);
      console.log('DashboardService: User profile response received');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<{
    user: UserProfile | null;
    subscription: DashboardData;
    stats: DashboardStats | null;
  }> {
    try {
      // Fetch user profile and subscription data in parallel
      const [userProfile, subscriptionData] = await Promise.allSettled([
        this.getUserProfile(),
        userSubscriptionService.getDashboardData(),
      ]);

      // Handle user profile result (may fail due to permissions)
      let user: UserProfile | null = null;
      if (userProfile.status === 'fulfilled') {
        user = userProfile.value;
      } else {
        console.warn(
          'User profile fetch failed, continuing without profile data:',
          userProfile.reason
        );
      }

      // Handle subscription data result
      const subscription =
        subscriptionData.status === 'fulfilled'
          ? subscriptionData.value
          : {
              subscription: null,
              trafficStats: null,
              isLoading: false,
              error: 'dashboard:errors.subscriptionLoadFailed',
            };

      // Transform subscription data to dashboard stats
      const stats =
        userSubscriptionService.transformToDashboardStats(subscription);

      return {
        user,
        subscription,
        stats,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get formatted dashboard statistics for UI components
   */
  async getFormattedStats(): Promise<{
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
  }> {
    try {
      const { stats } = await this.getDashboardData();

      if (!stats) {
        // Return default values when no subscription data is available
        return {
          dataUsage: {
            title: 'dashboard:stats.quickStats.dataUsage.title',
            value: 'dashboard:stats.noData',
            description: 'dashboard:subscription.messages.noSubscription',
          },
          connectionStatus: {
            title: 'dashboard:stats.quickStats.connectionStatus.title',
            value: 'dashboard:subscription.status.inactive',
            description: 'dashboard:subscription.messages.noSubscription',
          },
          daysRemaining: {
            title: 'dashboard:stats.quickStats.daysRemaining.title',
            value: '0',
            description: 'dashboard:subscription.messages.noSubscription',
          },
          activeNodes: {
            title: 'dashboard:stats.quickStats.activeNodes.title',
            value: 'dashboard:subscription.status.inactive',
            description: 'dashboard:subscription.messages.noSubscription',
          },
        };
      }

      const { dataUsage, connectionStatus, daysRemaining, subscription } =
        stats;

      // Format data usage
      const isUnlimited = userSubscriptionService.isUnlimitedData({
        total_bytes: dataUsage.total,
        used_bytes: dataUsage.used,
        remaining_bytes: dataUsage.total - dataUsage.used,
        usage_percent: dataUsage.usagePercent,
        subscription_id: 0,
        period: 'monthly',
        status: connectionStatus.status,
        reset_date: dataUsage.resetDate,
        last_updated: new Date().toISOString(),
      });

      const usedFormatted = userSubscriptionService.formatBytes(dataUsage.used);
      const totalFormatted = isUnlimited
        ? 'Unlimited'
        : userSubscriptionService.formatBytes(dataUsage.total);
      const usagePercent = isUnlimited ? 0 : Math.round(dataUsage.usagePercent);

      return {
        dataUsage: {
          title: 'dashboard:stats.quickStats.dataUsage.title',
          value: usedFormatted,
          description: 'dashboard:stats.quickStats.dataUsage.description',
          trend: isUnlimited
            ? `${usedFormatted} / Unlimited`
            : `${usagePercent}% of ${totalFormatted}`,
        },
        connectionStatus: {
          title: 'dashboard:stats.quickStats.connectionStatus.title',
          value: connectionStatus.isActive
            ? 'dashboard:subscription.status.active'
            : 'dashboard:subscription.status.inactive',
          description: connectionStatus.isActive
            ? 'dashboard:service.operational'
            : 'dashboard:service.notActive',
        },
        daysRemaining: {
          title: 'dashboard:stats.quickStats.daysRemaining.title',
          value: daysRemaining.isExpired
            ? '0'
            : Math.max(0, daysRemaining.days).toString(),
          description: daysRemaining.isExpired
            ? 'dashboard:service.subscriptionExpired'
            : 'dashboard:service.subscriptionExpires',
          trend: daysRemaining.nextBillingDate
            ? `Renews on ${new Date(daysRemaining.nextBillingDate).toLocaleDateString()}`
            : undefined,
        },
        activeNodes: {
          title: 'dashboard:stats.quickStats.activeNodes.title',
          value: subscription.isActive
            ? 'dashboard:subscription.status.active'
            : 'dashboard:subscription.status.inactive',
          description: subscription.isActive
            ? `${subscription.planName} dashboard:service.activePlan`
            : 'dashboard:service.noActivePlan',
        },
      };
    } catch (error) {
      console.error('Failed to get formatted stats:', error);
      // Return error state
      return {
        dataUsage: {
          title: 'dashboard:stats.quickStats.dataUsage.title',
          value: 'common:status.error',
          description: 'dashboard:errors.loadFailed',
        },
        connectionStatus: {
          title: 'dashboard:stats.quickStats.connectionStatus.title',
          value: 'common:status.error',
          description: 'dashboard:errors.loadFailed',
        },
        daysRemaining: {
          title: 'dashboard:stats.quickStats.daysRemaining.title',
          value: 'common:status.error',
          description: 'dashboard:errors.loadFailed',
        },
        activeNodes: {
          title: 'dashboard:stats.quickStats.activeNodes.title',
          value: 'common:status.error',
          description: 'dashboard:errors.loadFailed',
        },
      };
    }
  }

  /**
   * Check if user has any active subscriptions
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const { subscription } = await this.getDashboardData();
      return !!(
        subscription.subscription &&
        subscription.subscription.status === 'active'
      );
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Transform subscription data to dashboard stats
   */
  transformSubscriptionToStats(subscription: UserSubscription): DashboardStats {
    // Create a mock DashboardData to use existing transformation
    const mockDashboardData: DashboardData = {
      subscription,
      trafficStats: null, // Will be loaded separately if needed
      isLoading: false,
      error: null,
    };

    return (
      userSubscriptionService.transformToDashboardStats(mockDashboardData) || {
        dataUsage: {
          used: 0,
          total: 0,
          usagePercent: 0,
          resetDate: subscription.current_period_end,
        },
        connectionStatus: {
          status: subscription.status,
          isActive:
            subscription.status === 'active' && !subscription.is_expired,
        },
        daysRemaining: {
          days: subscription.days_left,
          nextBillingDate: subscription.next_billing_date,
          isExpired: subscription.is_expired,
        },
        subscription: {
          planName: subscription.subscription_plan?.name || 'Unknown Plan',
          status: subscription.status,
          isActive: subscription.status === 'active',
        },
      }
    );
  }

  /**
   * Transform dashboard stats to formatted stats for UI
   */
  transformToFormattedStats(stats: DashboardStats): {
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
  } {
    const { dataUsage, connectionStatus, daysRemaining, subscription } = stats;

    // Format data usage
    const isUnlimited = userSubscriptionService.isUnlimitedData({
      total_bytes: dataUsage.total,
      used_bytes: dataUsage.used,
      remaining_bytes: dataUsage.total - dataUsage.used,
      usage_percent: dataUsage.usagePercent,
      subscription_id: 0,
      period: 'monthly',
      status: connectionStatus.status,
      reset_date: dataUsage.resetDate,
      last_updated: new Date().toISOString(),
    });

    const usedFormatted = userSubscriptionService.formatBytes(dataUsage.used);
    const totalFormatted = isUnlimited
      ? 'Unlimited'
      : userSubscriptionService.formatBytes(dataUsage.total);
    const usagePercent = isUnlimited ? 0 : Math.round(dataUsage.usagePercent);

    return {
      dataUsage: {
        title: 'dashboard:stats.quickStats.dataUsage.title',
        value: usedFormatted,
        description: 'dashboard:stats.quickStats.dataUsage.description',
        trend: isUnlimited
          ? `${usedFormatted} / Unlimited`
          : `${usagePercent}% of ${totalFormatted}`,
      },
      connectionStatus: {
        title: 'dashboard:stats.quickStats.connectionStatus.title',
        value: connectionStatus.isActive
          ? 'dashboard:subscription.status.active'
          : 'dashboard:subscription.status.inactive',
        description: connectionStatus.isActive
          ? 'dashboard:service.operational'
          : 'dashboard:service.notActive',
      },
      daysRemaining: {
        title: 'dashboard:stats.quickStats.daysRemaining.title',
        value: daysRemaining.isExpired
          ? '0'
          : Math.max(0, daysRemaining.days).toString(),
        description: daysRemaining.isExpired
          ? 'dashboard:service.subscriptionExpired'
          : 'dashboard:service.subscriptionExpires',
        trend: daysRemaining.nextBillingDate
          ? `Renews on ${new Date(daysRemaining.nextBillingDate).toLocaleDateString()}`
          : undefined,
      },
      activeNodes: {
        title: 'dashboard:stats.quickStats.activeNodes.title',
        value: subscription.isActive
          ? 'dashboard:subscription.status.active'
          : 'dashboard:subscription.status.inactive',
        description: subscription.isActive
          ? `${subscription.planName} dashboard:service.activePlan`
          : 'dashboard:service.noActivePlan',
      },
    };
  }

  /**
   * Get subscription status for display
   */
  getSubscriptionStatusDisplay(status: string): {
    label: string;
    color: 'green' | 'yellow' | 'red' | 'gray';
  } {
    switch (status) {
      case 'active':
        return {
          label: 'dashboard:subscription.status.active',
          color: 'green',
        };
      case 'trial':
        return {
          label: 'dashboard:subscription.status.trial',
          color: 'yellow',
        };
      case 'paused':
        return {
          label: 'dashboard:subscription.status.paused',
          color: 'yellow',
        };
      case 'cancelled':
        return {
          label: 'dashboard:subscription.status.cancelled',
          color: 'red',
        };
      case 'expired':
        return { label: 'dashboard:subscription.status.expired', color: 'red' };
      default:
        return {
          label: 'dashboard:subscription.status.unknown',
          color: 'gray',
        };
    }
  }
}

/**
 * Default instance of the service
 */
export const dashboardService = new DashboardService();

/**
 * Export service class for custom instantiation
 */
export default DashboardService;
