/**
 * Authentication Provider Component
 *
 * Provides authentication context to the entire application.
 * Handles initialization, token refresh, and authentication state management.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuthStore, useAuthActions } from '@/features/auth/stores/authStore';
import { authServiceUtils } from '@/features/auth/services/authService';
import { tokenUtils } from '@/lib/utils/token';
import { config } from '@/lib/constants/config';
import type { User, AuthTokens } from '@/features/auth/types/auth.types';
import './AuthProvider.css';

/**
 * Auth context interface
 */
interface AuthContextValue {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth context - provides authentication state to children
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Custom hook to use auth context
 * @throws Error if used outside of AuthProvider
 */
const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Default token refresh interval (5 minutes before expiry)
 */
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Authentication Provider Component
 *
 * Features:
 * - Initializes authentication state on mount
 * - Validates existing tokens and refreshes if needed
 * - Sets up automatic token refresh interval
 * - Provides loading state during initialization
 * - Cleans up intervals on unmount
 * - Handles token expiration and auto-refresh
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Get auth state from store
  const user = useAuthStore(state => state.user);
  const tokens = useAuthStore(state => state.tokens);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const isInitialized = useAuthStore(state => state.hasInitialized);

  // Get store actions
  const {
    setUser,
    setTokens,
    setLoading,
    setError,
    setAuthenticated,
    setInitialized,
    reset,
  } = useAuthActions();

  /**
   * Clear refresh interval
   */
  const clearRefreshInterval = (): void => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  /**
   * Set up automatic token refresh interval
   */
  const setupTokenRefresh = useCallback((): void => {
    clearRefreshInterval();

    const timeUntilExpiry = tokenUtils.getTimeUntilExpiry();
    if (!timeUntilExpiry || timeUntilExpiry <= TOKEN_REFRESH_BUFFER) {
      return;
    }

    // Schedule refresh for 5 minutes before expiry
    const refreshDelay = Math.max(1000, timeUntilExpiry - TOKEN_REFRESH_BUFFER);

    refreshIntervalRef.current = setTimeout(async () => {
      try {
        if (config.debug.enabled) {
          console.log('Refreshing token automatically');
        }

        const newTokens = await authServiceUtils.refreshToken();
        setTokens(newTokens);

        // Don't call setupTokenRefresh here as it will be triggered by the tokens change
      } catch (error) {
        if (config.debug.enabled) {
          console.error('Automatic token refresh failed:', error);
        }

        // Clear authentication state on refresh failure
        reset();
      }
    }, refreshDelay);

    if (config.debug.enabled) {
      console.log(
        `Token refresh scheduled in ${Math.round(refreshDelay / 1000)} seconds`,
      );
    }
  }, [setTokens, reset]);

  /**
   * Initialize authentication state
   * Checks for existing tokens and validates them
   */
  const initializeAuth = async (): Promise<void> => {
    // Prevent multiple initialization attempts
    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Check if we have stored tokens
      if (!tokenUtils.hasTokens()) {
        if (config.debug.enabled) {
          console.log('No tokens found, user not authenticated');
        }
        setAuthenticated(false);
        return;
      }

      // Check if tokens are valid
      const isAuth = await authServiceUtils.isAuthenticated();

      if (!isAuth) {
        if (config.debug.enabled) {
          console.log('Token validation failed, clearing auth state');
        }
        reset();
        return;
      }

      // Get current tokens from storage
      const currentTokens = await tokenUtils.getTokens();
      if (currentTokens) {
        setTokens(currentTokens);
      }

      // Fetch current user if we don't have user data
      if (!user) {
        try {
          const userData = await authServiceUtils.getCurrentUser();
          setUser(userData);
        } catch (userError) {
          if (config.debug.enabled) {
            console.warn('Failed to fetch user data:', userError);
          }
          // Don't fail initialization if user fetch fails
          // User will be fetched on next auth action
        }
      }

      setAuthenticated(true);

      // Set up automatic token refresh
      setupTokenRefresh();

      if (config.debug.enabled) {
        console.log('Authentication initialization completed successfully');
      }
    } catch (error) {
      if (config.debug.enabled) {
        console.error('Authentication initialization failed:', error);
      }

      // Clear potentially invalid auth state
      reset();
      setError('Authentication initialization failed');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearRefreshInterval();
    };
  }, []); // Only run on mount

  /**
   * Auth context value
   */
  const contextValue: AuthContextValue = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
  };

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className='auth-provider-loading'>
        <div className='auth-provider-loading__spinner'>
          <div className='spinner' />
        </div>
        <div className='auth-provider-loading__text'>
          Initializing authentication...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Default export for convenience
 */
export default AuthProvider;

/**
 * Named exports
 */
export { useAuthContext };
