/**
 * Token management utilities for secure authentication
 * Implements secure token storage, retrieval, and validation
 */

import { config } from '@/lib/constants/config';
import type { AuthTokens } from '@/features/auth/types/auth.types';

/**
 * Storage keys for tokens in different storage mechanisms
 */
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'linke_access_token',
  REFRESH_TOKEN: 'linke_refresh_token',
  TOKEN_EXPIRY: 'linke_token_expiry',
} as const;

/**
 * Interface for token storage methods
 */
interface TokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Token manager class for handling JWT tokens securely
 */
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private storage: TokenStorage;
  private persistentStorage: TokenStorage;
  private _rememberMe = false;

  constructor() {
    // Use sessionStorage for session-only storage
    // Use localStorage for "Remember Me" functionality
    this.storage = window.sessionStorage;
    this.persistentStorage = window.localStorage;
    this.loadTokensFromStorage();
  }

  /**
   * Store authentication tokens securely with Remember Me support
   */
  async storeTokens(
    tokens: AuthTokens,
    rememberMe: boolean = false,
  ): Promise<void> {
    try {
      // Calculate expiry timestamp
      const expiryTime = Date.now() + tokens.expiresIn * 1000;

      // Store in memory for immediate access (priority)
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiry = expiryTime;
      this._rememberMe = rememberMe;

      // Choose storage based on Remember Me preference (for future use)

      // Access tokens always stored in session storage for security
      // Only store in sessionStorage for session-based access
      this.storage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      this.storage.setItem(
        TOKEN_STORAGE_KEYS.TOKEN_EXPIRY,
        expiryTime.toString(),
      );

      // Refresh token storage depends on Remember Me setting
      if (rememberMe) {
        // Store refresh token in localStorage for 30 days
        this.persistentStorage.setItem(
          TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
          tokens.refreshToken,
        );
        // Clear session storage refresh token to avoid conflicts
        this.storage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      } else {
        // Store refresh token in sessionStorage for session only
        this.storage.setItem(
          TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
          tokens.refreshToken,
        );
        // Clear persistent storage refresh token
        this.persistentStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      }

      if (config.debug.enabled) {
        console.log('Tokens stored successfully', {
          rememberMe,
          storage: rememberMe ? 'localStorage' : 'sessionStorage',
        });
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Get access token with memory-first strategy
   */
  async getAccessToken(): Promise<string | null> {
    // Priority 1: Check memory first
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Priority 2: Check sessionStorage as fallback
    try {
      const storedToken = this.storage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      const storedExpiry = this.storage.getItem(
        TOKEN_STORAGE_KEYS.TOKEN_EXPIRY,
      );

      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        if (Date.now() < expiryTime) {
          // Update memory cache
          this.accessToken = storedToken;
          this.tokenExpiry = expiryTime;
          return storedToken;
        }
      }
    } catch (error) {
      console.error('Failed to retrieve access token from storage:', error);
    }

    // Token is expired or missing, signal refresh needed
    if (this.refreshToken || this.hasRefreshTokenInStorage()) {
      if (config.debug.enabled) {
        console.log('Access token expired, refresh needed');
      }
      return null;
    }

    return null;
  }

  /**
   * Get access token synchronously (for interceptors)
   * Returns token immediately without async operations
   */
  getAccessTokenSync(): string | null {
    if (config.debug.enabled) {
      console.log('🔍 getAccessTokenSync called');
    }

    // Check memory first
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      if (config.debug.enabled) {
        console.log('✅ Found valid token in memory');
      }
      return this.accessToken;
    }

    // Check sessionStorage synchronously
    try {
      const storedToken = this.storage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      const storedExpiry = this.storage.getItem(
        TOKEN_STORAGE_KEYS.TOKEN_EXPIRY,
      );

      if (config.debug.enabled) {
        console.log('🔍 Checking sessionStorage:', {
          hasStoredToken: !!storedToken,
          hasStoredExpiry: !!storedExpiry,
          storedExpiry,
          now: Date.now(),
        });
      }

      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        if (Date.now() < expiryTime) {
          // Update memory cache
          this.accessToken = storedToken;
          this.tokenExpiry = expiryTime;
          if (config.debug.enabled) {
            console.log(
              '✅ Found valid token in sessionStorage, cached to memory',
            );
          }
          return storedToken;
        } else {
          if (config.debug.enabled) {
            console.log('❌ Token in sessionStorage is expired');
          }
        }
      }
    } catch (error) {
      console.error('Failed to retrieve access token from storage:', error);
    }

    if (config.debug.enabled) {
      console.log('❌ No valid token found');
    }
    return null;
  }

  /**
   * Check if refresh token exists in storage
   */
  private hasRefreshTokenInStorage(): boolean {
    return !!(
      this.storage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN) ||
      this.persistentStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN)
    );
  }

  /**
   * Get refresh token from memory or storage
   */
  async getRefreshToken(): Promise<string | null> {
    // Check memory first
    if (this.refreshToken) {
      return this.refreshToken;
    }

    // Check sessionStorage
    const sessionRefreshToken = this.storage.getItem(
      TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
    );
    if (sessionRefreshToken) {
      this.refreshToken = sessionRefreshToken;
      this._rememberMe = false;
      return sessionRefreshToken;
    }

    // Check localStorage (Remember Me)
    const persistentRefreshToken = this.persistentStorage.getItem(
      TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
    );
    if (persistentRefreshToken) {
      this.refreshToken = persistentRefreshToken;
      this._rememberMe = true;
      return persistentRefreshToken;
    }

    return null;
  }

  /**
   * Get both access and refresh tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();

    if (accessToken && refreshToken && this.tokenExpiry) {
      const expiresIn = Math.max(
        0,
        Math.floor((this.tokenExpiry - Date.now()) / 1000),
      );

      return {
        accessToken,
        refreshToken,
        expiresIn,
      };
    }

    return null;
  }

  /**
   * Check if access token is expired with timezone consideration
   */
  isAccessTokenExpired(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return true;
    }

    // Add 60 second buffer to prevent edge cases and clock skew
    return Date.now() >= this.tokenExpiry - 60000;
  }

  /**
   * Check if access token is about to expire (within 5 minutes)
   * Used for preemptive token refresh
   */
  isAccessTokenExpiringSoon(): boolean {
    if (!this.tokenExpiry) {
      return true;
    }

    // Check if token expires within 5 minutes for preemptive refresh
    return Date.now() >= this.tokenExpiry - 300000;
  }

  /**
   * Get time until token expiry in milliseconds
   * Handles timezone and clock skew considerations
   */
  getTimeUntilExpiry(): number {
    if (!this.tokenExpiry) {
      return 0;
    }

    // Return positive milliseconds until expiry, 0 if expired
    return Math.max(0, this.tokenExpiry - Date.now());
  }

  /**
   * Check if token should be preemptively refreshed
   * Returns true if token expires within the next 5 minutes
   */
  shouldRefreshPreemptively(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    // Refresh if less than 5 minutes (300000ms) remaining
    return timeUntilExpiry > 0 && timeUntilExpiry <= 300000;
  }

  /**
   * Clear all stored tokens from memory and storage
   */
  async clearTokens(): Promise<void> {
    try {
      // Clear memory
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this._rememberMe = false;

      // Clear sessionStorage
      this.storage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      this.storage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      this.storage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);

      // Clear localStorage
      this.persistentStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);

      if (config.debug.enabled) {
        console.log('Tokens cleared successfully from all storage locations');
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Load tokens from storage on initialization
   * Checks both sessionStorage and localStorage for tokens
   */
  private loadTokensFromStorage(): void {
    try {
      const accessToken = this.storage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      const tokenExpiry = this.storage.getItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);

      // Check for refresh token in sessionStorage first
      let refreshToken = this.storage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      let isRememberMe = false;

      // If no session refresh token, check localStorage
      if (!refreshToken) {
        refreshToken = this.persistentStorage.getItem(
          TOKEN_STORAGE_KEYS.REFRESH_TOKEN,
        );
        isRememberMe = true;
      }

      if (accessToken && refreshToken && tokenExpiry) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = parseInt(tokenExpiry, 10);
        this._rememberMe = isRememberMe;

        // Check if token is expired and clear if necessary
        if (this.isAccessTokenExpired()) {
          if (config.debug.enabled) {
            console.log('Stored token expired, clearing');
          }
          this.clearTokens();
        } else if (config.debug.enabled) {
          console.log('Tokens loaded from storage', {
            rememberMe: isRememberMe,
            storage: isRememberMe ? 'localStorage' : 'sessionStorage',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      // Clear potentially corrupted data
      this.clearTokens();
    }
  }

  /**
   * Decode JWT token payload (without verification)
   * Used for extracting expiration time and user info
   */
  decodeToken(token: string): Record<string, any> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      // Decode base64url
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Get token expiration date
   */
  getTokenExpirationDate(): Date | null {
    if (!this.tokenExpiry) {
      return null;
    }

    return new Date(this.tokenExpiry);
  }

  /**
   * Check if any tokens exist (authenticated state)
   */
  hasTokens(): boolean {
    return Boolean(this.accessToken && this.refreshToken);
  }

  /**
   * Check if "Remember Me" was used for current session
   */
  get rememberMe(): boolean {
    return this._rememberMe;
  }

  /**
   * Validate token format (basic JWT structure check)
   */
  validateTokenFormat(token: string): boolean {
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
    return jwtPattern.test(token);
  }
}

/**
 * Singleton instance of token manager
 */
const tokenManager = new TokenManager();

/**
 * Utility functions for token management
 */
export const tokenUtils = {
  /**
   * Store authentication tokens with Remember Me support
   */
  storeTokens: (tokens: AuthTokens, rememberMe?: boolean) =>
    tokenManager.storeTokens(tokens, rememberMe),

  /**
   * Get valid access token (memory-first strategy)
   */
  getAccessToken: () => tokenManager.getAccessToken(),

  /**
   * Get access token synchronously (for interceptors)
   */
  getAccessTokenSync: () => tokenManager.getAccessTokenSync(),

  /**
   * Get refresh token
   */
  getRefreshToken: () => tokenManager.getRefreshToken(),

  /**
   * Get all tokens
   */
  getTokens: () => tokenManager.getTokens(),

  /**
   * Clear all tokens
   */
  clearTokens: () => tokenManager.clearTokens(),

  /**
   * Check if access token is expired
   */
  isTokenExpired: () => tokenManager.isAccessTokenExpired(),

  /**
   * Check if access token is expiring soon
   */
  isTokenExpiringSoon: () => tokenManager.isAccessTokenExpiringSoon(),

  /**
   * Check if token should be preemptively refreshed
   */
  shouldRefreshPreemptively: () => tokenManager.shouldRefreshPreemptively(),

  /**
   * Check if user has tokens (is authenticated)
   */
  hasTokens: () => tokenManager.hasTokens(),

  /**
   * Get token expiration date
   */
  getExpirationDate: () => tokenManager.getTokenExpirationDate(),

  /**
   * Get time until token expires
   */
  getTimeUntilExpiry: () => tokenManager.getTimeUntilExpiry(),

  /**
   * Decode JWT token payload
   */
  decodeToken: (token: string) => tokenManager.decodeToken(token),

  /**
   * Validate token format
   */
  validateFormat: (token: string) => tokenManager.validateTokenFormat(token),
} as const;

/**
 * Hook for React components to access token utilities
 * This provides a consistent interface for token management
 */
export function useTokenManager() {
  return tokenUtils;
}

/**
 * Default export for convenience
 */
export default tokenUtils;

/**
 * Type exports for external use
 */
export type { TokenStorage };
