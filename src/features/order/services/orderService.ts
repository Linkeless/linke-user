/**
 * Order Service
 * Handles API calls related to order management
 */

import { apiClient } from '@/lib/api/client';
import { ORDER_ENDPOINTS, EndpointBuilders } from '@/lib/api/endpoints';
import type {
  Order,
  OrderListResponse,
  CreateOrderRequest,
  PaymentRequest,
  PaymentResponse,
  OrderSummary,
  OrderQueryParams,
} from '../types/order.types';

/**
 * Order Service Class
 */
export class OrderService {
  /**
   * Get user's orders with optional filters
   */
  async getOrders(params?: OrderQueryParams): Promise<OrderListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.start_date) {
        queryParams.append('start_date', params.start_date);
      }
      if (params?.end_date) {
        queryParams.append('end_date', params.end_date);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.sort) {
        queryParams.append('sort', params.sort);
      }
      if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by);
      }

      const url = queryParams.toString()
        ? `${ORDER_ENDPOINTS.ORDERS}?${queryParams.toString()}`
        : ORDER_ENDPOINTS.ORDERS;

      const response = await apiClient.get(url);

      // Handle different response formats
      if (response.data._embedded) {
        // HAL format response
        return {
          data: response.data._embedded.orders || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
        };
      } else if (Array.isArray(response.data)) {
        // Array response
        return {
          data: response.data,
          total: response.data.length,
          page: 1,
          limit: response.data.length,
        };
      } else {
        // Already formatted response
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  /**
   * Get order details by ID
   */
  async getOrderById(id: string | number): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(
        EndpointBuilders.orderById(id),
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<Order>(
        ORDER_ENDPOINTS.CREATE_ORDER,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);

      // Handle specific error cases
      if (error instanceof Error) {
        const apiError = error as any;
        if (apiError.response?.status === 400) {
          throw new Error(
            apiError.response.data?.message || 'Invalid order data',
          );
        } else if (apiError.response?.status === 404) {
          throw new Error('Subscription plan not found');
        }
      }

      throw new Error('Failed to create order');
    }
  }

  /**
   * Pay for an order
   */
  async payOrder(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post<PaymentResponse>(
        ORDER_ENDPOINTS.PAY_ORDER,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to process payment:', error);

      // Handle specific payment errors
      if (error instanceof Error) {
        const apiError = error as any;
        if (apiError.response?.status === 400) {
          throw new Error(apiError.response.data?.message || 'Payment failed');
        } else if (apiError.response?.status === 404) {
          throw new Error('Order not found');
        } else if (apiError.response?.status === 409) {
          throw new Error('Order already paid');
        }
      }

      throw new Error('Failed to process payment');
    }
  }

  /**
   * Get order summary
   */
  async getOrderSummary(id: string | number): Promise<OrderSummary> {
    try {
      const response = await apiClient.get<OrderSummary>(
        EndpointBuilders.orderSummary(id),
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order summary for ${id}:`, error);
      throw new Error('Failed to fetch order summary');
    }
  }

  /**
   * Generate and download invoice
   */
  async generateInvoice(id: string | number): Promise<Blob> {
    try {
      const response = await apiClient.post(
        EndpointBuilders.orderInvoice(id),
        {},
        {
          responseType: 'blob',
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to generate invoice for order ${id}:`, error);
      throw new Error('Failed to generate invoice');
    }
  }

  /**
   * Download invoice as file
   */
  async downloadInvoice(id: string | number, filename?: string): Promise<void> {
    try {
      const blob = await this.generateInvoice(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      throw error;
    }
  }

  /**
   * Get payment orders
   */
  async getPaymentOrders(params?: {
    page?: number;
    limit?: number;
  }): Promise<OrderListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = queryParams.toString()
        ? `${ORDER_ENDPOINTS.PAYMENT_ORDERS_MY}?${queryParams.toString()}`
        : ORDER_ENDPOINTS.PAYMENT_ORDERS_MY;

      const response = await apiClient.get(url);

      // Handle response format
      if (response.data._embedded) {
        return {
          data: response.data._embedded.orders || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
        };
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch payment orders:', error);
      throw new Error('Failed to fetch payment orders');
    }
  }

  /**
   * Get order status color for UI
   */
  getStatusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' | 'blue' {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
      case 'expired':
      case 'refunded':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get order status display text (for i18n keys)
   */
  getStatusKey(status: string): string {
    return `order.status.${status}`;
  }

  /**
   * Check if order can be paid
   */
  canPay(order: Order): boolean {
    return order.status === 'pending' && !order.paid_at;
  }

  /**
   * Check if invoice can be downloaded
   */
  canDownloadInvoice(order: Order): boolean {
    return order.status === 'paid' && !!order.paid_at;
  }

  /**
   * Format order amount with currency
   */
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency || 'CNY',
    }).format(amount);
  }

  /**
   * Calculate order expiry time
   */
  getExpiryTime(order: Order): { expired: boolean; remainingMinutes: number } {
    if (order.status !== 'pending' || !order.expired_at) {
      return { expired: false, remainingMinutes: 0 };
    }

    const now = new Date();
    const expiry = new Date(order.expired_at);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { expired: true, remainingMinutes: 0 };
    }

    return {
      expired: false,
      remainingMinutes: Math.ceil(diffMs / (1000 * 60)),
    };
  }
}

/**
 * Default instance of the service
 */
export const orderService = new OrderService();

/**
 * Export service class for custom instantiation
 */
export default OrderService;
