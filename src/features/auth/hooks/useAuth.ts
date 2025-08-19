/**
 * Comprehensive useAuth hook that provides all authentication functionality
 * Combines auth state, actions, and service methods in a single hook
 */

import { useCallback } from 'react';
import { useAuthStore, useAuthActions } from '../stores/authStore';
import { authServiceUtils, AuthError } from '../services/authService';
import type {
  LoginCredentials,
  OAuthProvider,
  User,
  AuthTokens,
} from '../types/auth.types';

/**
 * Return type for the useAuth hook
 */
export interface UseAuthReturn {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Auth methods
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  getOAuthUrl: (provider: OAuthProvider) => Promise<string>;
  handleOAuthCallback: (
    provider: OAuthProvider,
    code: string,
    state?: string
  ) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

/**
 * Comprehensive authentication hook that provides:
 * - Current auth state (user, tokens, loading, error)
 * - Authentication methods (login, logout, refresh, etc.)
 * - OAuth functionality
 * - Error handling and state management
 *
 * @returns UseAuthReturn object with auth state and methods
 *
 * @example
 * ```tsx
 * function LoginComponent() {
 *   const { login, isLoading, error, isAuthenticated } = useAuth();
 *
 *   const handleLogin = async (credentials) => {
 *     try {
 *       await login(credentials);
 *       // Login successful, user will be redirected automatically
 *     } catch (error) {
 *       // Error is automatically set in state
 *       console.error('Login failed:', error);
 *     }
 *   };
 *
 *   if (isAuthenticated) {
 *     return <div>Welcome back!</div>;
 *   }
 *
 *   return (
 *     <form onSubmit={handleLogin}>
 *       {error && <div className="error">{error}</div>}
 *       <button disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  // Get auth state from store
  const { user, tokens, isAuthenticated, isLoading, error, isInitialized } =
    useAuthStore(state => ({
      user: state.user,
      tokens: state.tokens,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      isInitialized: state.isInitialized(),
    }));

  // Get store actions
  const { setUser, setTokens, setLoading, setError, setAuthenticated, reset } =
    useAuthActions();

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await authServiceUtils.login(credentials);

        // Update store with user and tokens
        setUser(response.user);
        setTokens(response.tokens);
        setAuthenticated(true);
      } catch (error) {
        const errorMessage =
          error instanceof AuthError
            ? error.message
            : 'Login failed. Please try again.';
        setError(errorMessage);
        setAuthenticated(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setTokens, setLoading, setError, setAuthenticated],
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await authServiceUtils.logout();

      // Reset auth state
      reset();
    } catch (error) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : 'Logout failed. Clearing local session.';
      setError(errorMessage);

      // Always reset local state even if API call fails
      reset();
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, reset]);

  /**
   * Refresh authentication tokens
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const newTokens = await authServiceUtils.refreshToken();

      // Update tokens in store
      setTokens(newTokens);
    } catch (error) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : 'Token refresh failed. Please login again.';
      setError(errorMessage);

      // Clear auth state on refresh failure
      reset();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setTokens, setLoading, setError, reset]);

  /**
   * Get current user profile from API
   */
  const getCurrentUser = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const userData = await authServiceUtils.getCurrentUser();

      // Update user in store
      setUser(userData);
    } catch (error) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : 'Failed to fetch user profile.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  /**
   * Get OAuth authorization URL for a provider
   */
  const getOAuthUrl = useCallback(
    async (provider: OAuthProvider): Promise<string> => {
      try {
        setError(null);
        return await authServiceUtils.getOAuthUrl(provider);
      } catch (error) {
        const errorMessage =
          error instanceof AuthError
            ? error.message
            : `Failed to get ${provider} authorization URL.`;
        setError(errorMessage);
        throw error;
      }
    },
    [setError],
  );

  /**
   * Handle OAuth callback and complete authentication
   */
  const handleOAuthCallback = useCallback(
    async (
      provider: OAuthProvider,
      code: string,
      state?: string,
    ): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await authServiceUtils.handleOAuthCallback(
          provider,
          code,
          state,
        );

        // Update store with user and tokens
        setUser(response.user);
        setTokens(response.tokens);
        setAuthenticated(true);
      } catch (error) {
        const errorMessage =
          error instanceof AuthError
            ? error.message
            : `${provider} authentication failed.`;
        setError(errorMessage);
        setAuthenticated(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setTokens, setLoading, setError, setAuthenticated],
  );

  /**
   * Change user password
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await authServiceUtils.changePassword(currentPassword, newPassword);
      } catch (error) {
        const errorMessage =
          error instanceof AuthError
            ? error.message
            : 'Password change failed.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  /**
   * Clear current error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, [setError]);

  /**
   * Check authentication status and refresh tokens if needed
   * Useful for app initialization or periodic auth checks
   */
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await authServiceUtils.isAuthenticated();

      if (isAuth && !user) {
        // We have valid tokens but no user data, fetch user profile
        await getCurrentUser();
      } else if (!isAuth) {
        // No valid authentication, clear state
        reset();
      }
    } catch (_error) {
      // Silent failure for auth checks, just clear state
      reset();
    } finally {
      setLoading(false);
    }
  }, [user, getCurrentUser, reset, setLoading, setError]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,

    // Methods
    login,
    logout,
    refreshToken,
    getCurrentUser,
    getOAuthUrl,
    handleOAuthCallback,
    changePassword,
    clearError,
    checkAuthStatus,
  };
};

/**
 * Default export for convenience
 */
export default useAuth;
