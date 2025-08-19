/**
 * Type definitions for subscription-related data
 * Based on the backend API specification
 */

/**
 * User subscription response from the API
 */
export interface UserSubscription {
  id: number;
  uuid: string;
  user_id: number;
  subscription_plan_id: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial';
  start_date: string;
  end_date: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  trial_end_date?: string;
  billing_cycle: string;
  billing_interval: number;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  price: number;
  currency: string;
  days_left: number;
  is_expired: boolean;
  is_in_trial: boolean;
  is_paused: boolean;
  is_max_pause_duration_exceeded: boolean;
  paused_at?: string;
  resumed_at?: string;
  cancelled_at?: string;
  last_used_at?: string;
  pause_duration_days?: number;
  remaining_pause_days?: number;
  max_pause_duration?: number;
  pause_reason?: string;
  cancellation_reason?: string;
  renewal_attempts: number;
  renewal_fail_reason?: string;
  last_renewal_failed?: string;
  paused_by_admin_id?: number;
  resumed_by_admin_id?: number;
  created_at: string;
  updated_at: string;
  subscription_plan?: SubscriptionPlan;
  user?: UserBasic;
}

/**
 * Basic user information
 */
export interface UserBasic {
  id: number;
  name: string;
  email: string;
  username?: string;
}

/**
 * Subscription plan information
 */
export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: string;
  billing_interval: number;
}

/**
 * Full subscription plan response from API
 */
export interface SubscriptionPlanResponse {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  features?: string[];
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly' | 'daily';
  billing_interval: number;
  trial_days?: number;
  setup_fee?: number;
  data_limit?: number; // -1 for unlimited
  speed_limit?: number; // -1 for unlimited
  device_limit?: number; // -1 for unlimited
  server_count?: number;
  is_active: boolean;
  is_visible: boolean;
  is_featured: boolean;
  sort_order: number;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Traffic statistics response
 */
export interface TrafficStats {
  subscription_id: number;
  used_bytes: number;
  total_bytes: number;
  remaining_bytes: number;
  usage_percent: number;
  period: string;
  status: string;
  reset_date: string;
  last_updated: string;
}

/**
 * Aggregated dashboard data
 */
export interface DashboardData {
  subscription: UserSubscription | null;
  trafficStats: TrafficStats | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Statistics data for dashboard
 */
export interface DashboardStats {
  dataUsage: {
    used: number;
    total: number;
    usagePercent: number;
    resetDate: string;
  };
  connectionStatus: {
    status: string;
    isActive: boolean;
  };
  daysRemaining: {
    days: number;
    nextBillingDate?: string;
    isExpired: boolean;
  };
  subscription: {
    planName: string;
    status: string;
    isActive: boolean;
  };
}
