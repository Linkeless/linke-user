# OAuth Backend Integration Documentation

## Overview

This document describes the OAuth backend integration implementation for the Linke User Portal application. The OAuth integration supports three providers: Google, GitHub, and Telegram.

## Current Implementation Status

### ✅ Completed Components

#### 1. Frontend OAuth Implementation

- **Location**: `/src/features/auth/`
- **Key Files**:
  - `services/authService.ts` - OAuth service methods
  - `components/OAuthButtons.tsx` - OAuth UI components
  - `types/auth.types.ts` - TypeScript type definitions
  - `hooks/useAuth.ts` - Authentication hooks

#### 2. API Client Configuration

- **Location**: `/src/lib/api/`
- **Features**:
  - Axios client with interceptors
  - Automatic token refresh
  - Request/response error handling
  - CORS configuration

#### 3. OAuth Endpoints

All OAuth endpoints are configured and ready:

- `POST /auth/url` - Generate OAuth authorization URL
- `POST /auth/token` - Exchange authorization code for JWT
- `GET /auth/{provider}` - Initiate OAuth login
- `GET /auth/{provider}/callback` - Handle OAuth callback
- `GET /auth/telegram/widget` - Telegram widget support

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the environment:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1

# OAuth Feature Flags (backend handles OAuth configuration)
VITE_ENABLE_OAUTH_GOOGLE=true
VITE_ENABLE_OAUTH_GITHUB=true
VITE_ENABLE_OAUTH_TELEGRAM=true
```

**Important**: OAuth client IDs and secrets are managed exclusively by the backend for security. The frontend only needs to know which providers are enabled.

### 2. Backend OAuth Configuration

**All OAuth credentials (client ID and client secret) must be configured on the backend server.** The frontend does not need access to these credentials.

### 3. OAuth Provider Configuration

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback`
   - `http://localhost:8080/api/v1/auth/google/callback`

#### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:5173/auth/github/callback`
   - `http://localhost:8080/api/v1/auth/github/callback`

#### Telegram OAuth Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get the bot token
3. Configure your domain in bot settings

### 3. Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## OAuth Flow (Secure Authorization Code Flow)

### 1. Frontend Initiates OAuth

```typescript
// Option A: Direct redirect to backend OAuth endpoint
window.location.href = `${API_URL}/auth/google`;

// Option B: Get OAuth URL from backend first
const authUrl = await authService.getOAuthUrl('google');
window.location.href = authUrl;
```

### 2. Backend Handles OAuth

- Backend redirects to OAuth provider with client_id
- User authorizes on provider's page
- Provider redirects back to backend callback
- Backend exchanges code for tokens using client_secret
- Backend redirects to frontend with tokens or session

### 3. Frontend Receives Authentication

```typescript
// Handle OAuth callback from backend
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

const response = await authService.handleOAuthCallback('google', code, state);
```

### 4. Token Storage

Tokens are automatically stored in localStorage and managed by the auth store.

## API Integration

### OAuth Service Methods

```typescript
interface AuthService {
  // Get OAuth authorization URL from backend
  // Backend manages all OAuth credentials
  getOAuthUrl(provider: OAuthProvider): Promise<string>;

  // Exchange authorization code for tokens via backend
  // Backend uses client_secret to complete OAuth flow
  handleOAuthCallback(
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<AuthResponse>;

  // Standard auth methods
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse>;
}
```

### Using OAuth in Components

```tsx
import { useAuth } from '@/features/auth/hooks/useAuth';
import { OAuthButtons } from '@/features/auth/components/OAuthButtons';

function LoginPage() {
  const { login, loginWithOAuth } = useAuth();

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      await loginWithOAuth(provider);
    } catch (error) {
      console.error('OAuth login failed:', error);
    }
  };

  return (
    <div>
      <OAuthButtons onOAuthLogin={handleOAuthLogin} />
    </div>
  );
}
```

## Testing

### Test Page

A test page is available at `test-oauth.html` to verify the OAuth integration:

```bash
# Open test page in browser
open test-oauth.html
```

The test page provides:

1. Backend connection test
2. OAuth URL generation test
3. Token exchange test (mock)
4. Full OAuth flow simulation

### Manual Testing Steps

1. **Verify Backend Connection**:
   - Ensure backend is running at `http://localhost:8080`
   - Check `/api/v1/health` endpoint

2. **Test OAuth URL Generation**:

   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/url \
     -H "Content-Type: application/json" \
     -d '{"provider": "google", "redirect_uri": "http://localhost:5173/callback"}'
   ```

3. **Test Complete OAuth Flow**:
   - Click OAuth login button
   - Authorize with provider
   - Verify redirect and token storage

## Security Considerations

### OAuth Credentials

- **Client Secret**: Never exposed to frontend, stored only on backend
- **Client ID**: Managed by backend, not exposed in frontend code
- **Authorization Code Flow**: Proper OAuth 2.0 flow with backend handling secrets

### Token Storage

- Access tokens stored in localStorage
- Refresh tokens stored in httpOnly cookies (when backend configured)
- Automatic token refresh on 401 responses

### CSRF Protection

- State parameter validation in OAuth flow
- Secure random state generation by backend

### CORS Configuration

- Configured for development: `http://localhost:5173`
- Update for production domains

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS allows frontend origin
   - Check `withCredentials` setting in axios

2. **OAuth Configuration Issues**
   - Verify OAuth credentials are properly configured on backend
   - Check provider console for correct redirect URIs
   - Ensure backend has correct client_id and client_secret

3. **Redirect URI Mismatch**
   - Ensure redirect URIs match in provider settings
   - Check both frontend and backend callback URLs

4. **Token Storage Issues**
   - Clear localStorage and retry
   - Check browser console for errors

### Debug Mode

Enable debug mode in `.env`:

```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## Next Steps

1. **Production Deployment**:
   - Update OAuth redirect URIs for production domain
   - Configure HTTPS for secure token transmission
   - Set production API URL

2. **Enhanced Security**:
   - Implement PKCE for OAuth 2.0
   - Add rate limiting for auth endpoints
   - Implement session management

3. **Additional Features**:
   - Add more OAuth providers (Apple, Microsoft)
   - Implement account linking
   - Add two-factor authentication

## Support

For issues or questions:

- Check the test page at `test-oauth.html`
- Review browser console for errors
- Verify backend API is running and accessible
- Ensure OAuth providers are properly configured
