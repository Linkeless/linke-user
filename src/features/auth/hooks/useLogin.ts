/**
 * useLogin hook for authentication using TanStack Query
 * Provides mutation-based login functionality with auth store integration
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authServiceUtils, type AuthError } from '../services/authService';
import { useAuthActions } from '../stores/authStore';
import type {
  LoginCredentials,
  LoginResponse,
  OAuthProvider,
} from '../types/auth.types';

/**
 * Login mutation variables for email/password login
 */
export interface LoginMutationVariables {
  type: 'credentials';
  credentials: LoginCredentials;
}

/**
 * OAuth login mutation variables
 */
export interface OAuthLoginMutationVariables {
  type: 'oauth';
  provider: OAuthProvider;
  code: string;
  state?: string;
}

/**
 * Combined login mutation variables supporting both login types
 */
export type LoginVariables =
  | LoginMutationVariables
  | OAuthLoginMutationVariables;

/**
 * Return type for the useLogin hook
 */
export interface UseLoginReturn {
  // Mutation state
  mutate: (variables: LoginVariables) => void;
  mutateAsync: (variables: LoginVariables) => Promise<LoginResponse>;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: AuthError | null;
  data: LoginResponse | undefined;
  reset: () => void;

  // Convenience methods
  loginWithCredentials: (credentials: LoginCredentials) => void;
  loginWithCredentialsAsync: (
    credentials: LoginCredentials
  ) => Promise<LoginResponse>;
  loginWithOAuth: (
    provider: OAuthProvider,
    code: string,
    state?: string
  ) => void;
  loginWithOAuthAsync: (
    provider: OAuthProvider,
    code: string,
    state?: string
  ) => Promise<LoginResponse>;
}

/**
 * Options for the useLogin hook
 */
export interface UseLoginOptions {
  /**
   * Called on successful login
   */
  onSuccess?: (data: LoginResponse, variables: LoginVariables) => void;

  /**
   * Called on login error
   */
  onError?: (error: AuthError, variables: LoginVariables) => void;

  /**
   * Called when the login mutation settles (success or error)
   */
  onSettled?: (
    data: LoginResponse | undefined,
    error: AuthError | null,
    variables: LoginVariables
  ) => void;

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
   * Custom error message prefix for toast
   */
  errorMessagePrefix?: string;
}

/**
 * React Query mutation hook for user login operations
 *
 * Supports both email/password and OAuth login flows with:
 * - Automatic auth store updates on success
 * - Toast notifications for user feedback
 * - Error handling with typed AuthError
 * - Loading states for UI feedback
 * - TypeScript safety for mutation variables
 *
 * @param options - Configuration options for the mutation
 * @returns UseLoginReturn object with mutation state and convenience methods
 *
 * @example
 * ```tsx
 * // Basic usage with email/password
 * function LoginForm() {
 *   const {
 *     loginWithCredentials,
 *     isLoading,
 *     error
 *   } = useLogin({
 *     onSuccess: () => {
 *       navigate('/dashboard');
 *     }
 *   });
 *
 *   const handleSubmit = (formData) => {
 *     loginWithCredentials({
 *       email: formData.email,
 *       password: formData.password,
 *       rememberMe: formData.rememberMe
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <button disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * // OAuth usage
 * function OAuthCallback() {
 *   const { loginWithOAuth } = useLogin();
 *
 *   useEffect(() => {
 *     const urlParams = new URLSearchParams(window.location.search);
 *     const code = urlParams.get('code');
 *     const state = urlParams.get('state');
 *
 *     if (code) {
 *       loginWithOAuth('google', code, state);
 *     }
 *   }, [loginWithOAuth]);
 *
 *   return <div>Processing login...</div>;
 * }
 *
 * // Async usage with error handling
 * function AdvancedLogin() {
 *   const { loginWithCredentialsAsync } = useLogin({ showToasts: false });
 *
 *   const handleLogin = async (credentials) => {
 *     try {
 *       const response = await loginWithCredentialsAsync(credentials);
 *       console.log('Login successful:', response.user);
 *       // Custom success handling
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *       // Custom error handling
 *     }
 *   };
 *
 *   return <button onClick={() => handleLogin(credentials)}>Login</button>;
 * }
 * ```
 */
export const useLogin = (options: UseLoginOptions = {}): UseLoginReturn => {
  const {
    onSuccess,
    onError,
    onSettled,
    showToasts = true,
    successMessage = 'Welcome back! You have been logged in successfully.',
    errorMessagePrefix = 'Login failed',
  } = options;

  // Get auth store actions
  const {
    setUser,
    setTokens,
    setAuthenticated,
    setError,
    reset: _reset,
  } = useAuthActions();

  // Create the login mutation
  const mutation = useMutation<LoginResponse, AuthError, LoginVariables>({
    mutationFn: async (variables: LoginVariables): Promise<LoginResponse> => {
      if (variables.type === 'credentials') {
        return await authServiceUtils.login(variables.credentials);
      } else {
        return await authServiceUtils.handleOAuthCallback(
          variables.provider,
          variables.code,
          variables.state
        );
      }
    },
    onSuccess: (data: LoginResponse, variables: LoginVariables) => {
      // Update auth store with user and tokens
      setUser(data.user);
      setTokens(data.tokens);
      setAuthenticated(true);
      setError(null);

      // Show success toast
      if (showToasts) {
        toast.success(successMessage);
      }

      // Call custom onSuccess callback
      onSuccess?.(data, variables);
    },
    onError: (error: AuthError, variables: LoginVariables) => {
      // Update auth store with error
      setError(error.message);
      setAuthenticated(false);

      // Show error toast
      if (showToasts) {
        const errorMessage =
          error.message || 'An unexpected error occurred. Please try again.';
        toast.error(`${errorMessagePrefix}: ${errorMessage}`);
      }

      // Call custom onError callback
      onError?.(error, variables);
    },
    onSettled: (
      data: LoginResponse | undefined,
      error: AuthError | null,
      variables: LoginVariables
    ) => {
      // Call custom onSettled callback
      onSettled?.(data, error, variables);
    },
    // Prevent retrying login mutations automatically
    retry: false,
    // Use a specific mutation key for potential invalidation
    mutationKey: ['auth', 'login'],
  });

  // Convenience method for email/password login
  const loginWithCredentials = (credentials: LoginCredentials): void => {
    mutation.mutate({
      type: 'credentials',
      credentials,
    });
  };

  // Async convenience method for email/password login
  const loginWithCredentialsAsync = (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    return mutation.mutateAsync({
      type: 'credentials',
      credentials,
    });
  };

  // Convenience method for OAuth login
  const loginWithOAuth = (
    provider: OAuthProvider,
    code: string,
    state?: string
  ): void => {
    mutation.mutate({
      type: 'oauth',
      provider,
      code,
      ...(state !== undefined && { state }),
    });
  };

  // Async convenience method for OAuth login
  const loginWithOAuthAsync = (
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<LoginResponse> => {
    return mutation.mutateAsync({
      type: 'oauth',
      provider,
      code,
      ...(state !== undefined && { state }),
    });
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
    loginWithCredentials,
    loginWithCredentialsAsync,
    loginWithOAuth,
    loginWithOAuthAsync,
  };
};

/**
 * Default export for convenience
 */
export default useLogin;
