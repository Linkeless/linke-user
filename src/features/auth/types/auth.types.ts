/**
 * Authentication-related type definitions
 */

/**
 * User interface representing a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;

  /** User's email address */
  email: string;

  /** User's username */
  username: string;

  /** Optional avatar URL */
  avatar?: string;

  /** Authentication provider used */
  provider?: 'local' | 'google' | 'github' | 'telegram';

  /** Account creation timestamp */
  createdAt: Date;
}

/**
 * Authentication tokens interface
 */
export interface AuthTokens {
  /** JWT access token for authenticated requests */
  accessToken: string;

  /** Refresh token for obtaining new access tokens */
  refreshToken: string;

  /** Token expiration time in seconds */
  expiresIn: number;
}

/**
 * Login credentials interface for email/password authentication
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;

  /** User's password */
  password: string;

  /** Optional remember me flag */
  rememberMe?: boolean;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Current authenticated user */
  user: User | null;

  /** Authentication tokens */
  tokens: AuthTokens | null;

  /** Whether user is currently authenticated */
  isAuthenticated: boolean;

  /** Whether authentication is in progress */
  isLoading: boolean;

  /** Current authentication error if any */
  error: string | null;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'telegram';

/**
 * Login response from the API
 */
export interface LoginResponse {
  /** User information */
  user: User;

  /** Authentication tokens */
  tokens: AuthTokens;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  /** New authentication tokens */
  tokens: AuthTokens;
}

/**
 * Backend API Response Types (DTOs from backend)
 */

/**
 * Backend authentication response structure
 */
export interface BackendAuthResponse {
  user: BackendUserResponse;
  token: BackendTokenResponse;
}

/**
 * Backend token response structure
 */
export interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

/**
 * Backend user response structure
 */
export interface BackendUserResponse {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  provider: string;
  created_at: string;
}
