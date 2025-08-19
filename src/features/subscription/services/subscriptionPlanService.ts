/**
 * Subscription Plan Service
 * Handles API calls related to subscription plans
 */

import { apiClient } from '@/lib/api/client';
import { SUBSCRIPTION_ENDPOINTS, EndpointBuilders } from '@/lib/api/endpoints';
import type { SubscriptionPlanResponse } from '../types/subscription.types';

/**
 * Subscription Plan Service Class
 */
export class SubscriptionPlanService {
  /**
   * Get all available subscription plans
   */
  async getPlans(
    currency?: string,
    limit = 100,
    offset = 0,
  ): Promise<{ data: SubscriptionPlanResponse[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (currency) {
        params.append('currency', currency);
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await apiClient.get(
        `${SUBSCRIPTION_ENDPOINTS.PLANS}?${params.toString()}`,
      );

      // Handle HAL collection response
      return {
        data: response.data._embedded?.plans || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }
  }

  /**
   * Get popular/recommended subscription plans
   */
  async getPopularPlans(limit = 5): Promise<SubscriptionPlanResponse[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const response = await apiClient.get<SubscriptionPlanResponse[]>(
        `${SUBSCRIPTION_ENDPOINTS.POPULAR_PLANS}?${params.toString()}`,
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch popular plans:', error);
      throw new Error('Failed to fetch popular plans');
    }
  }

  /**
   * Get subscription plan details by ID
   */
  async getPlanById(id: string | number): Promise<SubscriptionPlanResponse> {
    try {
      const response = await apiClient.get<SubscriptionPlanResponse>(
        EndpointBuilders.planById(id),
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch plan ${id}:`, error);
      throw new Error('Failed to fetch plan details');
    }
  }

  /**
   * Get subscription plan details by code
   */
  async getPlanByCode(code: string): Promise<SubscriptionPlanResponse> {
    try {
      const response = await apiClient.get<SubscriptionPlanResponse>(
        EndpointBuilders.planByCode(code),
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch plan with code ${code}:`, error);
      throw new Error('Failed to fetch plan details');
    }
  }

  /**
   * Format price with currency
   */
  formatPrice(price: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      CNY: '¥',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price.toFixed(2)}`;
  }

  /**
   * Calculate monthly price for different billing cycles
   */
  calculateMonthlyPrice(
    price: number,
    billingCycle: string,
    billingInterval: number,
  ): number {
    switch (billingCycle) {
      case 'monthly':
        return price / billingInterval;
      case 'yearly':
        return price / (billingInterval * 12);
      case 'quarterly':
        return price / (billingInterval * 3);
      case 'weekly':
        return price / (billingInterval * (1 / 4));
      case 'daily':
        return price / (billingInterval * (1 / 30));
      default:
        return price;
    }
  }

  /**
   * Get discount percentage for longer billing cycles
   */
  calculateDiscount(yearlyPrice: number, monthlyPrice: number): number {
    if (monthlyPrice === 0) {
      return 0;
    }
    const yearlyMonthlyEquivalent = monthlyPrice * 12;
    return Math.round(
      ((yearlyMonthlyEquivalent - yearlyPrice) / yearlyMonthlyEquivalent) * 100,
    );
  }
}

/**
 * Default instance of the service
 */
export const subscriptionPlanService = new SubscriptionPlanService();

/**
 * Export service class for custom instantiation
 */
export default SubscriptionPlanService;
