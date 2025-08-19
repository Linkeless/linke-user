/**
 * API Endpoints Constants
 * Centralized definition of all API endpoint URLs
 * Based on the Linke backend API specification
 */

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  OAUTH_URL: '/auth/url',
  OAUTH_TOKEN: '/auth/token',
  OAUTH_PROVIDER: '/auth/{provider}',
  OAUTH_CALLBACK: '/auth/{provider}/callback',
  TELEGRAM_WIDGET: '/auth/telegram/widget',
} as const;

/**
 * User management endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: '/user/profile',
  BINDINGS: '/user/bindings',
  BINDING_BY_PROVIDER: '/user/bindings/{provider}',
  SET_PRIMARY_BINDING: '/user/bindings/{provider}/primary',
  NOTIFICATION_HISTORY: '/users/{user_id}/notifications/history',
} as const;

/**
 * Subscription management endpoints
 */
export const SUBSCRIPTION_ENDPOINTS = {
  // Plans
  PLANS: '/subscription/plans',
  PLAN_BY_CODE: '/subscription/plans/code/{code}',
  POPULAR_PLANS: '/subscription/plans/popular',
  PLAN_BY_ID: '/subscription/plans/{id}',

  // User subscriptions
  MY_SUBSCRIPTIONS: '/subscriptions/my',
  ACTIVE_SUBSCRIPTIONS: '/subscriptions/my/active',
  CLASH_CONFIG: '/subscriptions/clash',

  // Subscription management
  SUBSCRIPTION_BY_ID: '/subscriptions/{id}',
  CANCEL_SUBSCRIPTION: '/subscriptions/{id}/cancel',
  SUBSCRIPTION_TRAFFIC_STATS: '/subscriptions/{id}/traffic-stats',
} as const;

/**
 * Payment management endpoints
 */
export const PAYMENT_ENDPOINTS = {
  // Payment methods
  PAYMENT_METHODS: '/payment-methods',
  DEFAULT_PAYMENT_METHOD: '/payment-methods/default',
  PAYMENT_METHOD_BY_ID: '/payment-methods/{id}',
  SET_DEFAULT_PAYMENT_METHOD: '/payment-methods/{id}/default',
  PAYMENT_METHOD_STATISTICS: '/payment-methods/{id}/statistics',
  VALIDATE_PAYMENT_METHOD: '/payment-methods/{id}/validate',

  // Payment processing
  PAYMENT_CONFIGS: '/payment/configs',
  PAYMENT_METHODS_LIST: '/payment/methods',
  PAYMENT_NOTIFY: '/payment/notify/{gateway}',
  PAYMENT_ORDERS: '/payment/orders',
} as const;

/**
 * Order management endpoints
 */
export const ORDER_ENDPOINTS = {
  // Order operations
  ORDERS: '/orders',
  CREATE_ORDER: '/orders/create',
  PAY_ORDER: '/orders/pay',
  ORDER_BY_ID: '/orders/{id}',
  ORDER_SUMMARY: '/orders/{id}/summary',
  ORDER_INVOICE: '/orders/{id}/invoice',

  // Payment orders
  PAYMENT_ORDERS_MY: '/payment/orders/my',
  PAYMENT_ORDER_BY_NO: '/payment/orders/{payment_no}',
} as const;

/**
 * Support ticket endpoints
 */
export const TICKET_ENDPOINTS = {
  TICKETS: '/tickets',
  MY_TICKETS: '/tickets/my',
  TICKET_BY_ID: '/tickets/{id}',
  CLOSE_TICKET: '/tickets/{id}/close',
  TICKET_MESSAGES: '/tickets/{id}/messages',
} as const;

/**
 * All endpoints grouped by feature
 */
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  SUBSCRIPTION: SUBSCRIPTION_ENDPOINTS,
  PAYMENT: PAYMENT_ENDPOINTS,
  ORDER: ORDER_ENDPOINTS,
  TICKET: TICKET_ENDPOINTS,
} as const;

/**
 * Utility function to replace path parameters in endpoints
 * @param endpoint - The endpoint with placeholders (e.g., '/users/{id}')
 * @param params - Object with parameter values (e.g., { id: '123' })
 * @returns The endpoint with parameters replaced
 *
 * @example
 * buildEndpoint('/users/{id}', { id: '123' }) // returns '/users/123'
 * buildEndpoint('/auth/{provider}', { provider: 'google' }) // returns '/auth/google'
 */
export function buildEndpoint(
  endpoint: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`{${key}}`, String(value)),
    endpoint,
  );
}

/**
 * Type-safe endpoint builders for commonly used parameterized endpoints
 */
export const EndpointBuilders = {
  /**
   * Build OAuth provider endpoint
   */
  oauthProvider: (provider: string) =>
    buildEndpoint(AUTH_ENDPOINTS.OAUTH_PROVIDER, { provider }),

  /**
   * Build OAuth callback endpoint
   */
  oauthCallback: (provider: string) =>
    buildEndpoint(AUTH_ENDPOINTS.OAUTH_CALLBACK, { provider }),

  /**
   * Build user binding endpoint
   */
  userBinding: (provider: string) =>
    buildEndpoint(USER_ENDPOINTS.BINDING_BY_PROVIDER, { provider }),

  /**
   * Build set primary binding endpoint
   */
  setPrimaryBinding: (provider: string) =>
    buildEndpoint(USER_ENDPOINTS.SET_PRIMARY_BINDING, { provider }),

  /**
   * Build plan by code endpoint
   */
  planByCode: (code: string) =>
    buildEndpoint(SUBSCRIPTION_ENDPOINTS.PLAN_BY_CODE, { code }),

  /**
   * Build plan by ID endpoint
   */
  planById: (id: string | number) =>
    buildEndpoint(SUBSCRIPTION_ENDPOINTS.PLAN_BY_ID, { id }),

  /**
   * Build subscription by ID endpoint
   */
  subscriptionById: (id: string | number) =>
    buildEndpoint(SUBSCRIPTION_ENDPOINTS.SUBSCRIPTION_BY_ID, { id }),

  /**
   * Build cancel subscription endpoint
   */
  cancelSubscription: (id: string | number) =>
    buildEndpoint(SUBSCRIPTION_ENDPOINTS.CANCEL_SUBSCRIPTION, { id }),

  /**
   * Build subscription traffic stats endpoint
   */
  subscriptionTrafficStats: (id: string | number) =>
    buildEndpoint(SUBSCRIPTION_ENDPOINTS.SUBSCRIPTION_TRAFFIC_STATS, { id }),

  /**
   * Build payment method by ID endpoint
   */
  paymentMethodById: (id: string | number) =>
    buildEndpoint(PAYMENT_ENDPOINTS.PAYMENT_METHOD_BY_ID, { id }),

  /**
   * Build set default payment method endpoint
   */
  setDefaultPaymentMethod: (id: string | number) =>
    buildEndpoint(PAYMENT_ENDPOINTS.SET_DEFAULT_PAYMENT_METHOD, { id }),

  /**
   * Build payment method statistics endpoint
   */
  paymentMethodStatistics: (id: string | number) =>
    buildEndpoint(PAYMENT_ENDPOINTS.PAYMENT_METHOD_STATISTICS, { id }),

  /**
   * Build validate payment method endpoint
   */
  validatePaymentMethod: (id: string | number) =>
    buildEndpoint(PAYMENT_ENDPOINTS.VALIDATE_PAYMENT_METHOD, { id }),

  /**
   * Build payment notification endpoint
   */
  paymentNotify: (gateway: string) =>
    buildEndpoint(PAYMENT_ENDPOINTS.PAYMENT_NOTIFY, { gateway }),

  /**
   * Build ticket by ID endpoint
   */
  ticketById: (id: string | number) =>
    buildEndpoint(TICKET_ENDPOINTS.TICKET_BY_ID, { id }),

  /**
   * Build close ticket endpoint
   */
  closeTicket: (id: string | number) =>
    buildEndpoint(TICKET_ENDPOINTS.CLOSE_TICKET, { id }),

  /**
   * Build ticket messages endpoint
   */
  ticketMessages: (id: string | number) =>
    buildEndpoint(TICKET_ENDPOINTS.TICKET_MESSAGES, { id }),

  /**
   * Build user notification history endpoint
   */
  userNotificationHistory: (userId: string | number) =>
    buildEndpoint(USER_ENDPOINTS.NOTIFICATION_HISTORY, { user_id: userId }),

  /**
   * Build order by ID endpoint
   */
  orderById: (id: string | number) =>
    buildEndpoint(ORDER_ENDPOINTS.ORDER_BY_ID, { id }),

  /**
   * Build order summary endpoint
   */
  orderSummary: (id: string | number) =>
    buildEndpoint(ORDER_ENDPOINTS.ORDER_SUMMARY, { id }),

  /**
   * Build order invoice endpoint
   */
  orderInvoice: (id: string | number) =>
    buildEndpoint(ORDER_ENDPOINTS.ORDER_INVOICE, { id }),

  /**
   * Build payment order by number endpoint
   */
  paymentOrderByNo: (paymentNo: string) =>
    buildEndpoint(ORDER_ENDPOINTS.PAYMENT_ORDER_BY_NO, {
      payment_no: paymentNo,
    }),
} as const;

/**
 * Export default endpoints object for convenience
 */
export default ENDPOINTS;
