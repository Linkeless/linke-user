/**
 * RouteTitle Component
 * Automatically manages route-based title updates
 */

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { RouteTitleProps, RouteMetadata } from '@/types/title.types';

/**
 * Default route metadata for common routes
 * Can be extended or overridden via props
 */
const DEFAULT_ROUTE_METADATA: RouteMetadata[] = [
  {
    path: '/',
    title: 'Home',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    showUsername: true,
    showNotifications: true,
  },
  {
    path: '/login',
    title: 'Login',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/auth/callback',
    title: 'Authenticating...',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/profile',
    title: 'Profile',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/settings',
    title: 'Settings',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/notifications',
    title: 'Notifications',
    showUsername: true,
    showNotifications: true,
  },
  {
    path: '/support',
    title: 'Support',
    showUsername: false,
    showNotifications: false,
  },
];

/**
 * RouteTitle component
 * Automatically updates page title based on current route
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <TitleProvider>
 *       <Router>
 *         <RouteTitle />
 *         <Routes>
 *           <Route path="/" element={<HomePage />} />
 *           <Route path="/dashboard" element={<Dashboard />} />
 *         </Routes>
 *       </Router>
 *     </TitleProvider>
 *   );
 * }
 * ```
 */
export function RouteTitle({
  title,
  showUsername,
  customFormat,
}: RouteTitleProps = {}): null {
  const location = useLocation();
  const { pathname } = location;

  // Find metadata for current route
  const routeMetadata = useMemo(() => {
    return findRouteMetadata(pathname, DEFAULT_ROUTE_METADATA);
  }, [pathname]);

  // Determine final title and options
  const finalTitle = title || routeMetadata?.title || 'Page';
  const finalShowUsername =
    showUsername ?? routeMetadata?.showUsername ?? false;
  const finalShowNotifications = routeMetadata?.showNotifications ?? false;

  // Apply custom formatting if provided
  const formattedTitle = useMemo(() => {
    let result = finalTitle;

    if (customFormat) {
      result = customFormat(result);
    } else if (routeMetadata?.customFormatter) {
      result = routeMetadata.customFormatter(result);
    }

    return result;
  }, [finalTitle, customFormat, routeMetadata?.customFormatter]);

  // Update title using the hook
  useDocumentTitle({
    title: formattedTitle,
    showUsername: finalShowUsername,
    showNotificationCount: finalShowNotifications,
    dependencies: [
      pathname,
      formattedTitle,
      finalShowUsername,
      finalShowNotifications,
    ],
  });

  return null; // This component doesn't render anything
}

/**
 * Advanced RouteTitle component with more customization options
 */
interface AdvancedRouteTitleProps extends RouteTitleProps {
  /** Custom route metadata to use instead of defaults */
  routeMetadata?: RouteMetadata[];
  /** Fallback title when no route matches */
  fallbackTitle?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom route matcher function */
  routeMatcher?: (pathname: string, route: RouteMetadata) => boolean;
}

export function AdvancedRouteTitle({
  title,
  showUsername,
  customFormat,
  routeMetadata = DEFAULT_ROUTE_METADATA,
  fallbackTitle = 'Page',
  debug = false,
  routeMatcher = defaultRouteMatcher,
}: AdvancedRouteTitleProps): null {
  const location = useLocation();
  const { pathname } = location;

  // Find metadata for current route using custom matcher
  const currentRouteMetadata = useMemo(() => {
    const found = routeMetadata.find(route => routeMatcher(pathname, route));

    if (debug) {
      console.log('[AdvancedRouteTitle] Route match:', {
        pathname,
        found: found?.path,
        title: found?.title,
      });
    }

    return found;
  }, [pathname, routeMetadata, routeMatcher, debug]);

  // Determine final title and options
  const finalTitle = title || currentRouteMetadata?.title || fallbackTitle;
  const finalShowUsername =
    showUsername ?? currentRouteMetadata?.showUsername ?? false;
  const finalShowNotifications =
    currentRouteMetadata?.showNotifications ?? false;

  // Apply formatting
  const formattedTitle = useMemo(() => {
    let result = finalTitle;

    if (customFormat) {
      result = customFormat(result);
    } else if (currentRouteMetadata?.customFormatter) {
      result = currentRouteMetadata.customFormatter(result);
    }

    return result;
  }, [finalTitle, customFormat, currentRouteMetadata?.customFormatter]);

  // Update title
  useDocumentTitle({
    title: formattedTitle,
    showUsername: finalShowUsername,
    showNotificationCount: finalShowNotifications,
    dependencies: [
      pathname,
      formattedTitle,
      finalShowUsername,
      finalShowNotifications,
    ],
  });

  return null;
}

/**
 * RouteTitle component that integrates with React Router's route definitions
 */
interface RouterIntegratedTitleProps {
  /** Route definitions with title metadata */
  routes?: Array<{
    path: string;
    title: string;
    showUsername?: boolean;
    showNotifications?: boolean;
  }>;
}

export function RouterIntegratedTitle({
  routes = [],
}: RouterIntegratedTitleProps): null {
  const location = useLocation();
  const { pathname: _pathname } = location;

  // Convert routes to RouteMetadata format
  const routeMetadata = useMemo<RouteMetadata[]>(() => {
    return [
      ...routes.map(route => ({
        path: route.path,
        title: route.title,
        showUsername: route.showUsername,
        showNotifications: route.showNotifications,
      })),
      ...DEFAULT_ROUTE_METADATA,
    ];
  }, [routes]);

  return <AdvancedRouteTitle routeMetadata={routeMetadata} />;
}

/**
 * Utility functions
 */

/**
 * Find route metadata for a given pathname
 */
export function findRouteMetadata(
  pathname: string,
  metadata: RouteMetadata[]
): RouteMetadata | undefined {
  // Try exact match first
  let found = metadata.find(route => route.path === pathname);

  if (found) {
    return found;
  }

  // Try pattern matching for dynamic routes
  found = metadata.find(route => {
    // Convert route pattern to regex
    const pattern = route.path.replace(/\*/g, '.*').replace(/:\w+/g, '[^/]+');

    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });

  return found;
}

/**
 * Default route matcher function
 */
function defaultRouteMatcher(pathname: string, route: RouteMetadata): boolean {
  // Exact match
  if (route.path === pathname) {
    return true;
  }

  // Wildcard matching
  if (route.path.includes('*')) {
    const pattern = route.path.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  }

  // Parameter matching (e.g., /user/:id)
  if (route.path.includes(':')) {
    const pattern = route.path.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  }

  return false;
}

/**
 * Hook for programmatic title updates based on route changes
 */
export function useRouteTitleEffect(
  routeConfig: Record<string, string>,
  options: {
    showUsername?: boolean;
    showNotifications?: boolean;
  } = {}
): void {
  const location = useLocation();
  const { pathname } = location;

  const title = routeConfig[pathname] || 'Page';

  useDocumentTitle({
    title,
    showUsername: options.showUsername,
    showNotificationCount: options.showNotifications,
    dependencies: [pathname],
  });
}

/**
 * Higher-order component for adding automatic route titles
 */
export function withRouteTitle<P extends object>(
  Component: React.ComponentType<P>,
  routeTitle: string,
  options: {
    showUsername?: boolean;
    showNotifications?: boolean;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    useDocumentTitle({
      title: routeTitle,
      showUsername: options.showUsername,
      showNotificationCount: options.showNotifications,
    });

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withRouteTitle(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default RouteTitle;
