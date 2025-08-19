/**
 * Axios interceptors for request/response handling
 * Handles authentication headers and token refresh logic
 */

import type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenUtils } from '@/lib/utils/token';
import { config as appConfig } from '@/lib/constants/config';
import type { ApiError } from './client';

/**
 * Request interceptor to add authorization headers
 * Automatically attaches Bearer token to authenticated requests
 * Uses synchronous token retrieval for consistent behavior
 */
export const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  try {
    // Use synchronous token retrieval to avoid race conditions
    const accessToken = tokenUtils.getAccessTokenSync();

    if (accessToken) {
      // Ensure Authorization header format: "Bearer <access_token>"
      config.headers.Authorization = `Bearer ${accessToken}`;

      if (appConfig.debug.enabled) {
        console.log('🔑 Token attached synchronously from storage');
      }
    } else {
      // Check if we should attempt preemptive refresh
      if (tokenUtils.shouldRefreshPreemptively()) {
        if (appConfig.debug.enabled) {
          console.log('⏰ Token expiring soon, may trigger refresh');
        }
      }

      if (appConfig.debug.enabled) {
        console.log('❌ No valid token found for request');
      }
    }

    // Log request in development mode - always log for debugging 401 issues
    if (import.meta.env.DEV) {
      console.log(
        `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
          hasToken: !!accessToken,
          tokenLength: accessToken?.length || 0,
          fullAuthHeader: config.headers.Authorization,
        }
      );
    }

    return config;
  } catch (error) {
    console.error('Request interceptor error:', error);
    return config;
  }
};

/**
 * Request interceptor error handler
 */
export const requestInterceptorError = (error: any): Promise<never> => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
};

/**
 * Response interceptor for successful responses
 * Logs responses in development mode
 */
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Log successful response in development mode - always log for debugging
  if (import.meta.env.DEV) {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      }
    );
  }

  return response;
};

/**
 * Track ongoing refresh requests to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

/**
 * Process the queue of failed requests after token refresh
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Refresh authentication token using the real API endpoint
 * Handles backend DTO format and request queuing
 */
const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await tokenUtils.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Import here to avoid circular dependency
    const { apiClient } = await import('./client');
    const { AUTH_ENDPOINTS } = await import('./endpoints');

    // Make refresh request using backend DTO format
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH, {
      refresh_token: refreshToken,
    });

    // Map backend response to frontend format
    const backendTokenResponse = response.data;
    const tokens = {
      accessToken: backendTokenResponse.access_token,
      refreshToken: backendTokenResponse.refresh_token,
      expiresIn: backendTokenResponse.expires_in,
    };

    // Store new tokens (preserve remember me setting)
    const hasRememberMe =
      (await tokenUtils.getRefreshToken()) !== null &&
      window.localStorage.getItem('linke_refresh_token') !== null;
    await tokenUtils.storeTokens(tokens, hasRememberMe);

    if (appConfig.debug.enabled) {
      console.log('🔄 Token refreshed successfully via real API');
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

/**
 * Response interceptor error handler
 * Handles 401 errors and automatic token refresh with request retry
 */
export const responseInterceptorError = async (
  error: AxiosError
): Promise<any> => {
  const originalRequest = error.config as AxiosRequestConfig & {
    _retry?: boolean;
  };

  // Handle 401 Unauthorized errors (token expired)
  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry
  ) {
    // Check if we have a refresh token
    const refreshToken = await tokenUtils.getRefreshToken();

    if (!refreshToken) {
      // No refresh token available, redirect to login
      if (appConfig.debug.enabled) {
        console.log('No refresh token available, redirecting to login');
      }
      await tokenUtils.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(createApiError(error));
    }

    if (isRefreshing) {
      // If we're already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          // Import here to avoid circular dependency
          return import('./client').then(({ apiClient }) =>
            apiClient(originalRequest)
          );
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh the token
      const newAccessToken = await refreshAuthToken();

      if (newAccessToken) {
        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        const { apiClient } = await import('./client');
        return apiClient(originalRequest);
      } else {
        throw new Error('Failed to obtain new access token');
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);

      // Process queued requests with error
      processQueue(refreshError, null);

      // Clear tokens and redirect to login
      await tokenUtils.clearTokens();

      // Dispatch custom event for auth state change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:token-refresh-failed', {
            detail: { error: refreshError },
          })
        );

        // Redirect to login as fallback
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }

      return Promise.reject(createApiError(error));
    } finally {
      isRefreshing = false;
    }
  }

  // Handle other errors
  const apiError = createApiError(error);

  // Log error in development mode
  if (import.meta.env.DEV) {
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      {
        status: apiError.status,
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
      }
    );
  }

  return Promise.reject(apiError);
};

/**
 * Create standardized API error from Axios error
 */
function createApiError(error: AxiosError): ApiError {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as any;

    return {
      message: data?.message || data?.error || 'An error occurred',
      code: data?.code || `HTTP_${error.response.status}`,
      status: error.response.status,
      details: data?.details || data,
    };
  }

  if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      status: 0,
      details: { timeout: error.code === 'ECONNABORTED' },
    };
  }

  // Request setup error
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'CLIENT_ERROR',
    status: 0,
    details: { originalError: error },
  };
}

/**
 * Setup interceptors on an Axios instance
 * This function can be used to apply all interceptors to any Axios instance
 */
export function setupInterceptors(axiosInstance: any): void {
  // Request interceptors
  axiosInstance.interceptors.request.use(
    requestInterceptor,
    requestInterceptorError
  );

  // Response interceptors
  axiosInstance.interceptors.response.use(
    responseInterceptor,
    responseInterceptorError
  );
}
