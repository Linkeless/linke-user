import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus } from '@/features/auth/stores/authStore';

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component
 *
 * Provides route protection for authenticated users.
 * Redirects unauthenticated users to login page while preserving
 * the intended destination for post-login redirect.
 *
 * Features:
 * - Authentication status checking
 * - Automatic redirect to login for unauthenticated users
 * - Preserves intended destination in location state
 * - Loading state handling during auth initialization
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStatus();
  const location = useLocation();

  // Show loading indicator while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-4'>
          <div
            className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'
            data-testid='loading-spinner'
          ></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

export default ProtectedRoute;
