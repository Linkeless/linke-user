/**
 * Authentication service for handling user authentication operations
 * Implements login, logout, refresh token, and OAuth functionality
 */

import { apiClient, isApiError } from '@/lib/api/client';
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints';
import { tokenUtils } from '@/lib/utils/token';
import { emailSchema } from '@/lib/utils/validation';
import { config } from '@/lib/constants/config';
import type {
  LoginCredentials,
  LoginResponse,
  User,
  AuthTokens,
  OAuthProvider,
  BackendAuthResponse,
  BackendTokenResponse,
  BackendUserResponse,
} from '@/features/auth/types/auth.types';
import type { AxiosResponse } from 'axios';

/**
 * Authentication service interface
 */
interface AuthServiceInterface {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthTokens>;
  getCurrentUser(): Promise<User>;
  getOAuthUrl(provider: OAuthProvider): Promise<string>;
  handleOAuthCallback(
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<LoginResponse>;
}

/**
 * Error class for authentication-specific errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Authentication service implementation
 */
class AuthService implements AuthServiceInterface {
  /**
   * Map backend authentication response to frontend format
   */
  private mapAuthResponse(backendResponse: BackendAuthResponse): LoginResponse {
    return {
      user: this.mapUserResponse(backendResponse.user),
      tokens: this.mapTokenResponse(backendResponse.token),
    };
  }

  /**
   * Map backend user response to frontend format
   */
  private mapUserResponse(backendUser: BackendUserResponse): User {
    const user: User = {
      id: String(backendUser.id),
      email: backendUser.email,
      username: backendUser.name,
      provider: backendUser.provider as
        | 'local'
        | 'google'
        | 'github'
        | 'telegram',
      createdAt: new Date(backendUser.created_at),
    };

    // Only include avatar if it exists
    if (backendUser.avatar) {
      user.avatar = backendUser.avatar;
    }

    return user;
  }

  /**
   * Map backend token response to frontend format
   */
  private mapTokenResponse(backendToken: BackendTokenResponse): AuthTokens {
    return {
      accessToken: backendToken.access_token,
      refreshToken: backendToken.refresh_token,
      expiresIn: backendToken.expires_in,
    };
  }
  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise resolving to login response with user and tokens
   * @throws AuthError on authentication failure
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Validate email format before API call
      const emailValidation = emailSchema.safeParse(credentials.email);
      if (!emailValidation.success) {
        throw new AuthError(
          'Please enter a valid email address',
          'INVALID_EMAIL',
          400
        );
      }

      const response: AxiosResponse<BackendAuthResponse> = await apiClient.post(
        AUTH_ENDPOINTS.LOGIN,
        {
          email: emailValidation.data,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false,
        }
      );

      // Map backend response to frontend format
      const loginResponse = this.mapAuthResponse(response.data);

      // Store tokens securely with Remember Me setting
      await tokenUtils.storeTokens(
        loginResponse.tokens,
        credentials.rememberMe
      );

      return loginResponse;
    } catch (error: any) {
      throw this.handleAuthError(error, 'Login failed');
    }
  }

  /**
   * Log out the current user
   * Clears tokens and calls logout endpoint
   * @throws AuthError on logout failure
   */
  async logout(): Promise<void> {
    try {
      // Get tokens before clearing
      const refreshToken = await tokenUtils.getRefreshToken();
      const accessToken = await tokenUtils.getAccessToken();

      // Call logout endpoint if we have tokens
      if (refreshToken && accessToken) {
        await apiClient.post(
          AUTH_ENDPOINTS.LOGOUT,
          {
            refresh_token: refreshToken,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error: any) {
      // Log the error but don't throw - logout should always clear local state
      console.warn('Logout endpoint failed:', error);
    } finally {
      // Always clear local tokens regardless of API call success
      await tokenUtils.clearTokens();
    }
  }

  /**
   * Refresh the authentication tokens
   * @returns Promise resolving to new authentication tokens
   * @throws AuthError if refresh fails
   */
  async refreshToken(): Promise<AuthTokens> {
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      try {
        const refreshToken = await tokenUtils.getRefreshToken();

        if (!refreshToken) {
          throw new AuthError(
            'No refresh token available',
            'NO_REFRESH_TOKEN',
            401
          );
        }

        const response: AxiosResponse<BackendTokenResponse> =
          await apiClient.post(AUTH_ENDPOINTS.REFRESH, {
            refresh_token: refreshToken,
          });

        // Map backend token response to frontend format
        const tokens = this.mapTokenResponse(response.data);

        // Store new tokens
        await tokenUtils.storeTokens(tokens);

        return tokens;
      } catch (error: any) {
        retryCount++;

        // If we've exhausted retries, clear tokens and throw
        if (retryCount > maxRetries) {
          await tokenUtils.clearTokens();
          throw this.handleAuthError(error, 'Token refresh failed');
        }

        // Wait briefly before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // This should never be reached, but TypeScript requires a return
    throw new AuthError(
      'Token refresh failed after retries',
      'REFRESH_FAILED',
      401
    );
  }

  /**
   * Get current authenticated user profile
   * @returns Promise resolving to current user
   * @throws AuthError if user fetch fails
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> =
        await apiClient.get('/user/profile');

      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error, 'Failed to fetch user profile');
    }
  }

  /**
   * Get OAuth authorization URL for a provider
   * Backend handles all OAuth configuration including client ID and secret
   * @param provider - OAuth provider (google, github, telegram)
   * @returns Promise resolving to authorization URL
   * @throws AuthError if URL generation fails
   */
  async getOAuthUrl(provider: OAuthProvider): Promise<string> {
    try {
      // Request OAuth URL from backend which manages all OAuth credentials
      const response: AxiosResponse<{ auth_url: string; state: string }> =
        await apiClient.post(AUTH_ENDPOINTS.OAUTH_URL, {
          provider,
          redirect_uri: `${window.location.origin}/auth/callback`,
        });

      return response.data.auth_url;
    } catch (error: any) {
      throw this.handleAuthError(error, `Failed to get ${provider} OAuth URL`);
    }
  }

  /**
   * Handle OAuth callback and complete authentication
   * Backend exchanges the authorization code for tokens using stored client secret
   * @param provider - OAuth provider
   * @param code - Authorization code from OAuth provider
   * @param state - Optional state parameter for CSRF protection
   * @returns Promise resolving to login response
   * @throws AuthError if OAuth callback fails
   */
  async handleOAuthCallback(
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<LoginResponse> {
    try {
      // Exchange authorization code for tokens via backend
      // Backend uses client secret to complete OAuth flow
      const response: AxiosResponse<BackendAuthResponse> = await apiClient.post(
        AUTH_ENDPOINTS.OAUTH_TOKEN,
        {
          provider,
          code,
          state,
        }
      );

      // Map backend response to frontend format
      const loginResponse = this.mapAuthResponse(response.data);

      // Store tokens securely
      await tokenUtils.storeTokens(loginResponse.tokens);

      return loginResponse;
    } catch (error: any) {
      throw this.handleAuthError(
        error,
        `${provider} OAuth authentication failed`
      );
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns Boolean indicating authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if we have tokens
      if (!tokenUtils.hasTokens()) {
        return false;
      }

      // Check if access token is valid
      const accessToken = await tokenUtils.getAccessToken();

      // If access token is null, it might be expired
      if (!accessToken) {
        // Try to refresh tokens
        try {
          await this.refreshToken();
          return true;
        } catch {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Change user password
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @throws AuthError if password change fails
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      throw this.handleAuthError(error, 'Password change failed');
    }
  }

  /**
   * Handle and normalize authentication errors
   * @param error - Raw error from API call
   * @param defaultMessage - Default error message
   * @returns Normalized AuthError
   */
  private handleAuthError(error: any, defaultMessage: string): AuthError {
    // Development logging
    if (config.debug.enabled) {
      console.error('[AuthService] Error details:', {
        error: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.response?.config?.url,
        defaultMessage,
      });
    }

    if (isApiError(error)) {
      return new AuthError(
        error.message || defaultMessage,
        error.code,
        error.status,
        error.details
      );
    }

    if (error.response) {
      // Axios response error with comprehensive status code mapping
      const status = error.response.status;
      const data = error.response.data;

      // Map specific status codes to user-friendly messages
      let userMessage: string;
      let errorCode: string;

      switch (status) {
        case 401:
          userMessage = 'Invalid email or password';
          errorCode = 'INVALID_CREDENTIALS';
          break;
        case 429:
          userMessage = 'Too many attempts. Please try again later.';
          errorCode = 'RATE_LIMITED';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = 'Server error. Please try again later.';
          errorCode = 'SERVER_ERROR';
          break;
        case 423:
          userMessage = 'Account is locked. Please contact support.';
          errorCode = 'ACCOUNT_LOCKED';
          break;
        case 422:
          userMessage = 'Please verify your email first.';
          errorCode = 'EMAIL_NOT_VERIFIED';
          break;
        default:
          userMessage = data?.message || defaultMessage;
          errorCode = data?.code || 'API_ERROR';
      }

      return new AuthError(userMessage, errorCode, status, data?.details);
    }

    if (error.request) {
      // Network error
      return new AuthError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }

    if (error.code === 'ERR_NETWORK') {
      // Axios network error
      return new AuthError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }

    // Generic error
    return new AuthError(error.message || defaultMessage, 'UNKNOWN_ERROR', 0);
  }
}

/**
 * Singleton instance of the authentication service
 */
const authService = new AuthService();

/**
 * Auth service utility functions
 */
export const authServiceUtils = {
  /**
   * Login with email and password
   */
  login: (credentials: LoginCredentials) => authService.login(credentials),

  /**
   * Logout current user
   */
  logout: () => authService.logout(),

  /**
   * Refresh authentication tokens
   */
  refreshToken: () => authService.refreshToken(),

  /**
   * Get current user profile
   */
  getCurrentUser: () => authService.getCurrentUser(),

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl: (provider: OAuthProvider) => authService.getOAuthUrl(provider),

  /**
   * Handle OAuth callback
   */
  handleOAuthCallback: (
    provider: OAuthProvider,
    code: string,
    state?: string
  ) => authService.handleOAuthCallback(provider, code, state),

  /**
   * Check authentication status
   */
  isAuthenticated: () => authService.isAuthenticated(),

  /**
   * Change user password
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    authService.changePassword(currentPassword, newPassword),
} as const;

/**
 * Default export for convenience
 */
export default authService;

/**
 * Named exports for specific use cases
 */
export { authService };

/**
 * Type exports for external use
 */
export type { AuthServiceInterface };
