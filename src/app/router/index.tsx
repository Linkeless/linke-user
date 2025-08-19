import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { TitleProvider } from '@/contexts/TitleContext';
import { RouteTitle } from '@/components/RouteTitle';

// Lazy load components for code splitting
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const OAuthCallbackPage = lazy(
  () => import('@/features/auth/pages/OAuthCallbackPage')
);
const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/DashboardPage')
);

// Subscription pages
const SubscriptionListPage = lazy(
  () => import('@/features/subscription/pages/SubscriptionListPage')
);
const PlanSelectionPage = lazy(
  () => import('@/features/subscription/pages/PlanSelectionPage')
);
const SubscriptionDetailPage = lazy(
  () => import('@/features/subscription/pages/SubscriptionDetailPage')
);

// Ticket pages
const TicketListPage = lazy(
  () => import('@/features/tickets/pages/TicketListPage')
);
const TicketDetailPage = lazy(
  () => import('@/features/tickets/pages/TicketDetailPage')
);
const CreateTicketPage = lazy(
  () => import('@/features/tickets/pages/CreateTicketPage')
);

// Order pages
const OrderListPage = lazy(
  () => import('@/features/order/pages/OrderListPage')
);

/**
 * Loading fallback component
 * Displays a loading spinner while lazy components are being loaded
 */
function LoadingFallback() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center space-y-4'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
        <p className='text-muted-foreground'>Loading page...</p>
      </div>
    </div>
  );
}

/**
 * Root layout component with Suspense wrapper
 * Provides consistent loading behavior across all routes
 * Includes automatic title management
 */
function RootLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteTitle />
      <Outlet />
    </Suspense>
  );
}

/**
 * Router configuration
 *
 * Features:
 * - BrowserRouter for clean URLs
 * - Code splitting with React.lazy and Suspense
 * - Protected routes with authentication checks
 * - Automatic redirects for unauthenticated users
 * - Root redirect to dashboard for authenticated users
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        // Root redirect - redirect to dashboard
        index: true,
        element: <Navigate to='/dashboard' replace />,
      },
      {
        // Public login route
        path: 'login',
        element: <LoginPage />,
      },
      {
        // OAuth callback route
        path: 'auth/callback',
        element: <OAuthCallbackPage />,
      },
      {
        // Protected dashboard route
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected subscriptions route
        path: 'subscriptions',
        element: (
          <ProtectedRoute>
            <SubscriptionListPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected subscription detail route
        path: 'subscriptions/:id',
        element: (
          <ProtectedRoute>
            <SubscriptionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected plans route
        path: 'plans',
        element: (
          <ProtectedRoute>
            <PlanSelectionPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected tickets route
        path: 'tickets',
        element: (
          <ProtectedRoute>
            <TicketListPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected create ticket route
        path: 'tickets/new',
        element: (
          <ProtectedRoute>
            <CreateTicketPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected ticket detail route
        path: 'tickets/:id',
        element: (
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        // Protected orders route
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrderListPage />
          </ProtectedRoute>
        ),
      },
      {
        // Catch-all route - redirect to dashboard
        path: '*',
        element: <Navigate to='/dashboard' replace />,
      },
    ],
  },
]);

/**
 * AppRouter component
 *
 * Main router component that provides routing for the entire application.
 * Includes lazy loading, authentication protection, proper loading states,
 * and automatic title management.
 */
export function AppRouter() {
  return (
    <TitleProvider
      config={{
        appName: 'Linke User Portal',
        maxLength: 60,
        separator: ' - ',
      }}
      debug={process.env.NODE_ENV === 'development'}
    >
      <RouterProvider router={router} />
    </TitleProvider>
  );
}

export default AppRouter;
