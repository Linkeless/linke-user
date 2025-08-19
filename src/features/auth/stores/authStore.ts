import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, AuthTokens } from '../types/auth.types';

/**
 * Authentication store state interface
 */
interface AuthStoreState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;

  // Computed getters
  isInitialized: () => boolean;
}

/**
 * Initial state for the auth store
 */
const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasInitialized: true, // Start as initialized to prevent infinite loading
};

/**
 * Zustand store for authentication state management
 *
 * Features:
 * - Persistent storage for user session
 * - DevTools integration for debugging
 * - Computed properties for authentication status
 * - Actions for state mutations
 */
export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Actions
        setUser: (user: User | null) => {
          set(
            state => ({
              ...state,
              user,
              isAuthenticated: user !== null,
              error: null, // Clear error on successful user set
            }),
            false,
            'auth/setUser',
          );
        },

        setTokens: (tokens: AuthTokens | null) => {
          set(
            state => ({
              ...state,
              tokens,
              isAuthenticated: tokens !== null && state.user !== null,
            }),
            false,
            'auth/setTokens',
          );
        },

        setLoading: (loading: boolean) => {
          set(
            state => ({ ...state, isLoading: loading }),
            false,
            'auth/setLoading',
          );
        },

        setError: (error: string | null) => {
          set(state => ({ ...state, error }), false, 'auth/setError');
        },

        setAuthenticated: (authenticated: boolean) => {
          set(
            state => ({ ...state, isAuthenticated: authenticated }),
            false,
            'auth/setAuthenticated',
          );
        },

        setInitialized: (initialized: boolean) => {
          set(
            state => ({ ...state, hasInitialized: initialized }),
            false,
            'auth/setInitialized',
          );
        },

        reset: () => {
          set(
            () => ({ ...initialState, hasInitialized: true }),
            false,
            'auth/reset',
          );
        },

        // Computed getters
        isInitialized: () => {
          const state = get();
          // Consider initialized if we have explicitly set the initialization flag
          return state.hasInitialized;
        },
      }),
      {
        name: 'auth-storage', // Storage key
        partialize: state => ({
          // Only persist essential auth data
          user: state.user,
          tokens: state.tokens,
          isAuthenticated: state.isAuthenticated,
        }),
        // Version for migration support
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle migrations if state structure changes
          if (version === 0) {
            // Example: migrate from v0 to v1
            return {
              ...persistedState,
              // Add any new fields or transform data
            };
          }
          return persistedState;
        },
      },
    ),
    {
      name: 'auth-store', // DevTools name
    },
  ),
);

/**
 * Hook to get authentication status
 * Convenience hook for components that only need to check auth status
 */
export const useAuthStatus = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const isInitialized = useAuthStore(state => state.isInitialized());

  return { isAuthenticated, isLoading, isInitialized };
};

/**
 * Hook to get current user
 * Convenience hook for components that only need user data
 */
export const useCurrentUser = () => {
  return useAuthStore(state => state.user);
};

/**
 * Hook to get authentication error
 * Convenience hook for error handling components
 */
export const useAuthError = () => {
  return useAuthStore(state => state.error);
};

/**
 * Hook to get authentication actions
 * Convenience hook for components that need to trigger auth actions
 */
export const useAuthActions = () => {
  const setUser = useAuthStore(state => state.setUser);
  const setTokens = useAuthStore(state => state.setTokens);
  const setLoading = useAuthStore(state => state.setLoading);
  const setError = useAuthStore(state => state.setError);
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);
  const setInitialized = useAuthStore(state => state.setInitialized);
  const reset = useAuthStore(state => state.reset);

  return {
    setUser,
    setTokens,
    setLoading,
    setError,
    setAuthenticated,
    setInitialized,
    reset,
  };
};
