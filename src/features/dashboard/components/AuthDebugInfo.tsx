/**
 * Debug component to show authentication state
 * Only for development/debugging purposes
 */

import React from 'react';
import {
  useAuthStatus,
  useCurrentUser,
} from '@/features/auth/stores/authStore';
import { tokenUtils } from '@/lib/utils/token';

export function AuthDebugInfo() {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStatus();
  const user = useCurrentUser();
  const [tokenInfo, setTokenInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const checkTokens = async () => {
      const accessToken = await tokenUtils.getAccessToken();
      const refreshToken = await tokenUtils.getRefreshToken();
      const hasTokens = tokenUtils.hasTokens();
      const isExpired = tokenUtils.isTokenExpired();

      // Try to decode the token to see its contents
      let decodedToken = null;
      if (accessToken) {
        try {
          decodedToken = tokenUtils.decodeToken(accessToken);
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }

      setTokenInfo({
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasTokens,
        isExpired,
        accessTokenLength: accessToken?.length || 0,
        tokenPrefix: `${accessToken?.substring(0, 20)}...`,
        decodedToken,
      });
    };

    checkTokens();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#000',
        color: '#fff',
        padding: '10px',
        fontSize: '11px',
        zIndex: 9999,
        borderRadius: '4px',
        maxWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto',
      }}
    >
      <div>
        <strong>Auth Debug Info:</strong>
      </div>
      <div>isAuthenticated: {String(isAuthenticated)}</div>
      <div>isLoading: {String(isLoading)}</div>
      <div>isInitialized: {String(isInitialized)}</div>
      <div>user: {user ? user.email : 'null'}</div>
      <div>hasAccessToken: {String(tokenInfo?.hasAccessToken)}</div>
      <div>hasRefreshToken: {String(tokenInfo?.hasRefreshToken)}</div>
      <div>hasTokens: {String(tokenInfo?.hasTokens)}</div>
      <div>isExpired: {String(tokenInfo?.isExpired)}</div>
      <div>tokenLength: {tokenInfo?.accessTokenLength}</div>
      <div>tokenPrefix: {tokenInfo?.tokenPrefix}</div>
      {tokenInfo?.decodedToken && (
        <div style={{ marginTop: '8px' }}>
          <div>
            <strong>Token payload:</strong>
          </div>
          <div>sub: {tokenInfo.decodedToken.sub}</div>
          <div>exp: {tokenInfo.decodedToken.exp}</div>
          <div>iat: {tokenInfo.decodedToken.iat}</div>
          <div>iss: {tokenInfo.decodedToken.iss}</div>
        </div>
      )}
    </div>
  );
}
