/**
 * Axios client configuration for API communication
 * Provides centralized HTTP client with authentication and interceptors
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import { config as appConfig } from '@/lib/constants/config';
import { setupInterceptors } from './interceptors';

/**
 * API Error interface for consistent error handling
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

/**
 * API Request timeout in milliseconds (30 seconds)
 */
const API_TIMEOUT = 30000;

/**
 * Default request headers
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

/**
 * Create and configure Axios instance
 */
const createApiClient = (): AxiosInstance => {
  // In development, use relative URL to leverage Vite proxy
  // In production, use full URL from config
  const baseURL = appConfig.isDevelopment
    ? '/api/v1' // Vite will proxy this to http://localhost:8080/api/v1
    : appConfig.api.baseUrl;

  const instance = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    headers: DEFAULT_HEADERS,
    // Enable cookies for potential httpOnly token storage
    withCredentials: true,
  });

  // Setup interceptors from the dedicated interceptors module
  setupInterceptors(instance);

  return instance;
};

/**
 * Main API client instance
 * Use this instance for all API calls throughout the application
 */
export const apiClient = createApiClient();

/**
 * Utility function to check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'code' in error &&
    'status' in error
  );
}

/**
 * Utility function to create a new API client instance
 * Useful for testing or special configurations
 */
export function createCustomApiClient(
  axiosConfig?: AxiosRequestConfig,
): AxiosInstance {
  return axios.create({
    ...axiosConfig,
    baseURL: axiosConfig?.baseURL || appConfig.api.baseUrl,
    timeout: axiosConfig?.timeout || API_TIMEOUT,
    headers: {
      ...DEFAULT_HEADERS,
      ...axiosConfig?.headers,
    },
  });
}

/**
 * Default export for convenience
 */
export default apiClient;

/**
 * Type exports for external use
 */
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError };
