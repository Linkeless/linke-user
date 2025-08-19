# AuthProvider

The `AuthProvider` component provides authentication context to the entire application. It handles authentication state initialization, token refresh, and provides authentication state to child components.

## Features

- **Initialization**: Automatically checks for existing tokens and validates them on app startup
- **Token Refresh**: Sets up automatic token refresh intervals to prevent token expiration
- **Loading State**: Shows a loading spinner during authentication initialization
- **Error Handling**: Properly handles authentication errors and clears invalid state
- **Cleanup**: Properly cleans up intervals and resources on unmount

## Usage

### Basic Setup

Wrap your application root with the `AuthProvider`:

```tsx
import React from 'react';
import { AuthProvider } from '@/app/providers';
import App from './App';

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default Root;
```

### Using Authentication Context

Use the `useAuthContext` hook in any child component:

```tsx
import React from 'react';
import { useAuthContext } from '@/app/providers';

function UserProfile() {
  const { user, isAuthenticated, isLoading, error } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### Available Context Values

- `user`: Current authenticated user or `null`
- `tokens`: Authentication tokens or `null`
- `isAuthenticated`: Boolean indicating if user is authenticated
- `isLoading`: Boolean indicating if authentication is in progress
- `error`: Error message string or `null`
- `isInitialized`: Boolean indicating if initialization is complete

## Implementation Details

### Token Refresh Strategy

The provider automatically sets up token refresh intervals:

1. Checks token expiration time
2. Schedules refresh 5 minutes before expiry
3. Automatically refreshes tokens
4. Re-schedules the next refresh cycle
5. Clears authentication state if refresh fails

### Initialization Process

1. Check for existing tokens in storage
2. Validate tokens with the authentication service
3. Fetch current user data if tokens are valid
4. Set up automatic token refresh
5. Update authentication state
6. Show loading state during process

### Error Handling

- Network errors during initialization are handled gracefully
- Invalid or expired tokens are automatically cleared
- Failed token refresh triggers logout
- Error messages are stored in context for UI display

### Security Considerations

- Uses session storage for token storage (cleared on tab close)
- Tokens are validated on initialization
- Automatic cleanup of expired tokens
- Secure token refresh with proper error handling

## Dependencies

The AuthProvider depends on:

- `@/features/auth/stores/authStore`: Zustand store for auth state
- `@/features/auth/services/authService`: Authentication service utilities
- `@/lib/utils/token`: Token management utilities
- `@/lib/constants/config`: Application configuration
- `@/features/auth/types/auth.types`: TypeScript type definitions
