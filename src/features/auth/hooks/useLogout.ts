/**
 * useLogout hook for authentication using TanStack Query
 * Provides mutation-based logout functionality with auth store integration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authServiceUtils, type AuthError } from '../services/authService';
import { useAuthActions } from '../stores/authStore';

/**
 * Return type for the useLogout hook
 */
export interface UseLogoutReturn {
  // Mutation state
  mutate: () => void;
  mutateAsync: () => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: AuthError | null;
  data: void | undefined;
  reset: () => void;

  // Convenience method
  logout: () => void;
  logoutAsync: () => Promise<void>;
}

/**
 * Options for the useLogout hook
 */
export interface UseLogoutOptions {
  /**
   * Called on successful logout
   */
  onSuccess?: () => void;

  /**
   * Called on logout error
   */
  onError?: (error: AuthError) => void;

  /**
   * Called when the logout mutation settles (success or error)
   */
  onSettled?: (data: void | undefined, error: AuthError | null) => void;

  /**
   * Whether to show toast notifications
   * @default true
   */
  showToasts?: boolean;

  /**
   * Custom success message for toast
   */
  successMessage?: string;

  /**
   * Custom error message for toast
   */
  errorMessage?: string;

  /**
   * Whether to redirect to login page after logout
   * @default true
   */
  redirectToLogin?: boolean;

  /**
   * Custom redirect path (overrides redirectToLogin)
   */
  redirectPath?: string;

  /**
   * Whether to clear all cached queries
   * @default true
   */
  clearCache?: boolean;
}

/**
 * React Query mutation hook for user logout operations
 *
 * Features:
 * - Calls logout API endpoint through authService
 * - Always clears local auth state (even if API fails)
 * - Toast notifications for user feedback
 * - Optional redirect to login page
 * - Clears TanStack Query cache
 * - Error handling with typed AuthError
 * - Loading states for UI feedback
 * - TypeScript safety
 *
 * @param options - Configuration options for the mutation
 * @returns UseLogoutReturn object with mutation state and convenience methods
 *
 * @example
 * ```tsx
 * // Basic usage
 * function LogoutButton() {
 *   const { logout, isLoading } = useLogout({
 *     onSuccess: () => {
 *       console.log('Successfully logged out');
 *     }
 *   });
 *
 *   return (
 *     <button onClick={logout} disabled={isLoading}>
 *       {isLoading ? 'Logging out...' : 'Logout'}
 *     </button>
 *   );
 * }
 *
 * // Custom redirect without toast
 * function HeaderLogout() {
 *   const { logout } = useLogout({
 *     showToasts: false,
 *     redirectPath: '/welcome',
 *   });
 *
 *   return <button onClick={logout}>Sign Out</button>;
 * }
 *
 * // Async usage with error handling
 * function AdvancedLogout() {
 *   const { logoutAsync } = useLogout({
 *     showToasts: false,
 *     redirectToLogin: false
 *   });
 *
 *   const handleLogout = async () => {
 *     try {
 *       await logoutAsync();
 *       console.log('Logout successful');
 *       // Custom success handling
 *     } catch (error) {
 *       console.error('Logout failed:', error);
 *       // Custom error handling
 *     }
 *   };
 *
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 */
export const useLogout = (options: UseLogoutOptions = {}): UseLogoutReturn => {
  const {
    onSuccess,
    onError,
    onSettled,
    showToasts = true,
    successMessage = 'You have been logged out successfully.',
    errorMessage = 'Logout failed, but you have been signed out locally.',
    redirectToLogin = true,
    redirectPath,
    clearCache = true,
  } = options;

  // Get React Router navigate function
  const navigate = useNavigate();

  // Get TanStack Query client for cache management
  const queryClient = useQueryClient();

  // Get auth store actions
  const { reset, setError } = useAuthActions();

  // Create the logout mutation
  const mutation = useMutation<void, AuthError, void>({
    mutationFn: async (): Promise<void> => {
      await authServiceUtils.logout();
    },
    onSuccess: () => {
      // Always clear auth store on success
      reset();

      // Clear TanStack Query cache if requested
      if (clearCache) {
        queryClient.clear();
      }

      // Show success toast
      if (showToasts) {
        toast.success(successMessage);
      }

      // Handle navigation
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (redirectToLogin) {
        navigate('/login', { replace: true });
      }

      // Call custom onSuccess callback
      onSuccess?.();
    },
    onError: (error: AuthError) => {
      // Always clear auth store even on API error
      // This ensures user is logged out locally even if server logout fails
      reset();

      // Clear TanStack Query cache if requested
      if (clearCache) {
        queryClient.clear();
      }

      // Update auth store with error (will be cleared by reset, but for consistency)
      setError(error.message);

      // Show error toast
      if (showToasts) {
        toast.error(errorMessage);
      }

      // Handle navigation even on error
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (redirectToLogin) {
        navigate('/login', { replace: true });
      }

      // Call custom onError callback
      onError?.(error);
    },
    onSettled: (data: void | undefined, error: AuthError | null) => {
      // Call custom onSettled callback
      onSettled?.(data, error);
    },
    // Don't retry logout mutations
    retry: false,
    // Use a specific mutation key for potential invalidation
    mutationKey: ['auth', 'logout'],
  });

  // Convenience method for logout
  const logout = (): void => {
    mutation.mutate();
  };

  // Async convenience method for logout
  const logoutAsync = (): Promise<void> => {
    return mutation.mutateAsync();
  };

  return {
    // Core mutation properties
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending, // For backward compatibility
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,

    // Convenience methods
    logout,
    logoutAsync,
  };
};

/**
 * Default export for convenience
 */
export default useLogout;
