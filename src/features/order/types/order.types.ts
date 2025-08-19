/**
 * Type definitions for order-related data
 * Based on the backend API specification
 */

import type { SubscriptionPlan } from '@/features/subscription/types/subscription.types';

/**
 * Order status enumeration
 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'refunded';

/**
 * Order model
 */
export interface Order {
  id: string;
  order_no: string;
  user_id: number;
  subscription_plan_id: number;
  amount: number;
  currency: string;
  status: OrderStatus;
  payment_method?: string;
  payment_no?: string;
  paid_at?: string;
  expired_at?: string;
  created_at: string;
  updated_at: string;
  subscription_plan?: SubscriptionPlan;
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  subscription_plan_id: number;
  billing_cycle: string;
  quantity?: number;
  coupon_code?: string;
}

/**
 * Payment request
 */
export interface PaymentRequest {
  order_id: string;
  payment_method: string;
  return_url?: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  payment_no?: string;
  message?: string;
}

/**
 * Order list response
 */
export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Order summary
 */
export interface OrderSummary {
  order_id: string;
  order_no: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Order item
 */
export interface OrderItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/**
 * Order query parameters
 */
export interface OrderQueryParams {
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sort_by?: 'created_at' | 'amount' | 'status';
}

/**
 * Invoice data
 */
export interface Invoice {
  invoice_no: string;
  order_no: string;
  issue_date: string;
  due_date?: string;
  customer_info: CustomerInfo;
  company_info: CompanyInfo;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
}

/**
 * Customer information for invoice
 */
export interface CustomerInfo {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  tax_id?: string;
}

/**
 * Company information for invoice
 */
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  website?: string;
}

/**
 * Invoice item
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

/**
 * Order statistics
 */
export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  total_revenue: number;
  average_order_value: number;
  currency: string;
}
