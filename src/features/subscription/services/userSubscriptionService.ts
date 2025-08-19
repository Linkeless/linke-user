/**
 * User Subscription Service
 * Handles API calls related to user subscriptions and traffic statistics
 */

import { apiClient } from '@/lib/api/client';
import { SUBSCRIPTION_ENDPOINTS, EndpointBuilders } from '@/lib/api/endpoints';
import type {
  UserSubscription,
  TrafficStats,
  DashboardData,
  DashboardStats,
} from '../types/subscription.types';

/**
 * User Subscription Service Class
 */
export class UserSubscriptionService {
  /**
   * Get user's active subscriptions
   */
  async getActiveSubscriptions(): Promise<UserSubscription[]> {
    try {
      const response = await apiClient.get<UserSubscription[]>(
        SUBSCRIPTION_ENDPOINTS.ACTIVE_SUBSCRIPTIONS
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch active subscriptions:', error);
      throw new Error('Failed to fetch active subscriptions');
    }
  }

  /**
   * Get user's all subscriptions with optional status filter
   */
  async getAllSubscriptions(
    status?: string,
    limit = 10,
    offset = 0
  ): Promise<{ data: UserSubscription[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await apiClient.get(
        `${SUBSCRIPTION_ENDPOINTS.MY_SUBSCRIPTIONS}?${params.toString()}`
      );

      // Handle HAL collection response
      return {
        data: response.data._embedded?.subscriptions || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw new Error('Failed to fetch subscriptions');
    }
  }

  /**
   * Get traffic statistics for a specific subscription
   */
  async getTrafficStats(subscriptionId: number): Promise<TrafficStats> {
    try {
      const response = await apiClient.get<TrafficStats>(
        EndpointBuilders.subscriptionTrafficStats(subscriptionId)
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch traffic stats for subscription ${subscriptionId}:`,
        error
      );
      throw new Error('Failed to fetch traffic statistics');
    }
  }

  /**
   * Get primary active subscription (first active subscription)
   */
  async getPrimarySubscription(): Promise<UserSubscription | null> {
    try {
      const activeSubscriptions = await this.getActiveSubscriptions();
      return activeSubscriptions.length > 0 ? activeSubscriptions[0] : null;
    } catch (error) {
      console.error('Failed to fetch primary subscription:', error);
      return null;
    }
  }

  /**
   * Get aggregated dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const subscription = await this.getPrimarySubscription();
      let trafficStats: TrafficStats | null = null;

      if (subscription) {
        try {
          trafficStats = await this.getTrafficStats(subscription.id);
        } catch (error) {
          console.warn(
            'Failed to fetch traffic stats, continuing without them:',
            error
          );
        }
      }

      return {
        subscription,
        trafficStats,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        subscription: null,
        trafficStats: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch dashboard data',
      };
    }
  }

  /**
   * Transform raw API data into dashboard statistics
   */
  transformToDashboardStats(data: DashboardData): DashboardStats | null {
    if (!data.subscription) {
      return null;
    }

    const { subscription, trafficStats } = data;

    // Data usage statistics
    const dataUsage = {
      used: trafficStats?.used_bytes || 0,
      total: trafficStats?.total_bytes || 0,
      usagePercent: trafficStats?.usage_percent || 0,
      resetDate: trafficStats?.reset_date || subscription.current_period_end,
    };

    // Connection status
    const connectionStatus = {
      status: subscription.status,
      isActive: subscription.status === 'active' && !subscription.is_expired,
    };

    // Days remaining
    const daysRemaining = {
      days: subscription.days_left,
      nextBillingDate: subscription.next_billing_date,
      isExpired: subscription.is_expired,
    };

    // Subscription info
    const subscriptionInfo = {
      planName: subscription.subscription_plan?.name || 'Unknown Plan',
      status: subscription.status,
      isActive: subscription.status === 'active',
    };

    return {
      dataUsage,
      connectionStatus,
      daysRemaining,
      subscription: subscriptionInfo,
    };
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 GB';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Check if subscription has unlimited data
   */
  isUnlimitedData(trafficStats: TrafficStats | null): boolean {
    return (
      !trafficStats ||
      trafficStats.total_bytes === -1 ||
      trafficStats.total_bytes === 0
    );
  }

  /**
   * Get subscription details by ID
   */
  async getSubscriptionById(id: string | number): Promise<UserSubscription> {
    try {
      const response = await apiClient.get<UserSubscription>(
        EndpointBuilders.subscriptionById(id)
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch subscription ${id}:`, error);
      throw new Error('Failed to fetch subscription details');
    }
  }

  /**
   * Get Clash configuration
   */
  async getClashConfig(): Promise<Blob> {
    try {
      const response = await apiClient.get(
        SUBSCRIPTION_ENDPOINTS.CLASH_CONFIG,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Clash config:', error);
      throw new Error('Failed to fetch Clash configuration');
    }
  }

  /**
   * Download Clash configuration as file
   */
  async downloadClashConfig(filename = 'clash-config.yaml'): Promise<void> {
    try {
      const blob = await this.getClashConfig();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download Clash config:', error);
      throw error;
    }
  }

  /**
   * Check if subscription can be renewed
   */
  canRenew(subscription: UserSubscription): boolean {
    return subscription.auto_renew && !subscription.cancel_at_period_end;
  }

  /**
   * Get subscription status color for UI
   */
  getStatusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
    switch (status) {
      case 'active':
        return 'green';
      case 'trial':
        return 'yellow';
      case 'paused':
        return 'yellow';
      case 'cancelled':
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Calculate days until expiry
   */
  getDaysUntilExpiry(subscription: UserSubscription): number {
    if (subscription.is_expired) {
      return 0;
    }
    const endDate = new Date(subscription.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Default instance of the service
 */
export const userSubscriptionService = new UserSubscriptionService();

/**
 * Export service class for custom instantiation
 */
export default UserSubscriptionService;
