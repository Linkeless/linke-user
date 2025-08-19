/**
 * Route Metadata Configuration
 * Defines route-specific title configurations and metadata
 */

import type { RouteMetadata } from '@/types/title.types';

/**
 * Comprehensive route metadata configuration
 * Each route includes path, title, and display options
 */
export const ROUTE_METADATA: RouteMetadata[] = [
  // Root and Home Routes
  {
    path: '/',
    title: 'Home',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/home',
    title: 'Home',
    showUsername: false,
    showNotifications: false,
  },

  // Authentication Routes
  {
    path: '/login',
    title: 'Login',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/register',
    title: 'Register',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/forgot-password',
    title: 'Forgot Password',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/reset-password',
    title: 'Reset Password',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/auth/callback',
    title: 'Authenticating...',
    showUsername: false,
    showNotifications: false,
    customFormatter: (title: string) => `${title} - Please wait`,
  },
  {
    path: '/auth/google/callback',
    title: 'Google Login',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/auth/github/callback',
    title: 'GitHub Login',
    showUsername: false,
    showNotifications: false,
  },

  // Main Application Routes
  {
    path: '/dashboard',
    title: 'Dashboard',
    showUsername: true,
    showNotifications: true,
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

  // Subscription and Billing Routes
  {
    path: '/subscription',
    title: 'My Subscription',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/billing',
    title: 'Billing',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/plans',
    title: 'Plans & Pricing',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/upgrade',
    title: 'Upgrade Plan',
    showUsername: true,
    showNotifications: false,
  },

  // Service Management Routes
  {
    path: '/nodes',
    title: 'Nodes',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/usage',
    title: 'Usage Statistics',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/analytics',
    title: 'Analytics',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/connections',
    title: 'Connections',
    showUsername: true,
    showNotifications: false,
  },

  // Communication Routes
  {
    path: '/notifications',
    title: 'Notifications',
    showUsername: true,
    showNotifications: true,
    customFormatter: (title: string) => title, // Don't add count to notification page itself
  },
  {
    path: '/messages',
    title: 'Messages',
    showUsername: true,
    showNotifications: true,
  },
  {
    path: '/support',
    title: 'Support',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/contact',
    title: 'Contact Us',
    showUsername: false,
    showNotifications: false,
  },

  // Help and Documentation Routes
  {
    path: '/help',
    title: 'Help Center',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/docs',
    title: 'Documentation',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/faq',
    title: 'FAQ',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/tutorials',
    title: 'Tutorials',
    showUsername: false,
    showNotifications: false,
  },

  // Account Management Routes
  {
    path: '/account',
    title: 'Account Settings',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/security',
    title: 'Security Settings',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/privacy',
    title: 'Privacy Settings',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/api-keys',
    title: 'API Keys',
    showUsername: true,
    showNotifications: false,
  },

  // Error and Status Routes
  {
    path: '/404',
    title: 'Page Not Found',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/500',
    title: 'Server Error',
    showUsername: false,
    showNotifications: false,
  },
  {
    path: '/maintenance',
    title: 'Maintenance',
    showUsername: false,
    showNotifications: false,
  },

  // Dynamic Route Patterns
  {
    path: '/user/:id',
    title: 'User Profile',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/node/:id',
    title: 'Node Details',
    showUsername: true,
    showNotifications: false,
  },
  {
    path: '/invoice/:id',
    title: 'Invoice',
    showUsername: true,
    showNotifications: false,
  },
];

/**
 * Find route metadata by path
 * Supports exact matching and pattern matching for dynamic routes
 *
 * @param pathname Current pathname
 * @returns Matching RouteMetadata or undefined
 *
 * @example
 * ```typescript
 * const metadata = findRouteMetadata('/dashboard');
 * console.log(metadata?.title); // 'Dashboard'
 *
 * const userMetadata = findRouteMetadata('/user/123');
 * console.log(userMetadata?.title); // 'User Profile'
 * ```
 */
export function findRouteMetadata(pathname: string): RouteMetadata | undefined {
  // Try exact match first
  let found = ROUTE_METADATA.find(route => route.path === pathname);

  if (found) {
    return found;
  }

  // Try pattern matching for dynamic routes
  found = ROUTE_METADATA.find(route => {
    return matchRoutePattern(pathname, route.path);
  });

  return found;
}

/**
 * Match pathname against route pattern
 * Supports parameters (:id) and wildcards (*)
 *
 * @param pathname Pathname to match
 * @param pattern Route pattern
 * @returns True if pathname matches pattern
 */
export function matchRoutePattern(pathname: string, pattern: string): boolean {
  // Exact match
  if (pattern === pathname) {
    return true;
  }

  // Convert pattern to regex
  const regexPattern = pattern
    // Escape special regex characters except : and *
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // Replace :param with [^/]+ (matches anything except /)
    .replace(/:\w+/g, '[^/]+')
    // Replace * with .* (matches anything)
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

/**
 * Get default title for unknown routes
 *
 * @param pathname Current pathname
 * @returns Default title based on pathname
 */
export function getDefaultTitle(pathname: string): string {
  // Remove leading slash and convert to title case
  const path = pathname.replace(/^\//, '');

  if (!path) {
    return 'Home';
  }

  // Split by / and take the first segment
  const segment = path.split('/')[0];

  // Convert kebab-case or snake_case to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

/**
 * Add custom route metadata at runtime
 * Useful for dynamic routes or plugin-based systems
 *
 * @param metadata RouteMetadata to add
 */
export function addRouteMetadata(metadata: RouteMetadata): void {
  // Check if route already exists
  const existingIndex = ROUTE_METADATA.findIndex(
    route => route.path === metadata.path
  );

  if (existingIndex >= 0) {
    // Update existing route
    ROUTE_METADATA[existingIndex] = metadata;
  } else {
    // Add new route
    ROUTE_METADATA.push(metadata);
  }
}

/**
 * Remove route metadata
 *
 * @param path Route path to remove
 */
export function removeRouteMetadata(path: string): void {
  const index = ROUTE_METADATA.findIndex(route => route.path === path);

  if (index >= 0) {
    ROUTE_METADATA.splice(index, 1);
  }
}

/**
 * Get all routes that should show username
 *
 * @returns Array of route paths that show username
 */
export function getRoutesWithUsername(): string[] {
  return ROUTE_METADATA.filter(route => route.showUsername).map(
    route => route.path
  );
}

/**
 * Get all routes that should show notifications
 *
 * @returns Array of route paths that show notifications
 */
export function getRoutesWithNotifications(): string[] {
  return ROUTE_METADATA.filter(route => route.showNotifications).map(
    route => route.path
  );
}

/**
 * Validate route metadata configuration
 * Checks for duplicate paths and missing required fields
 *
 * @returns Validation results
 */
export function validateRouteMetadata(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const paths = new Set<string>();

  for (const route of ROUTE_METADATA) {
    // Check for required fields
    if (!route.path) {
      errors.push('Route missing path');
    }
    if (!route.title) {
      errors.push(`Route ${route.path} missing title`);
    }

    // Check for duplicate paths
    if (paths.has(route.path)) {
      errors.push(`Duplicate route path: ${route.path}`);
    }
    paths.add(route.path);

    // Check for potential issues
    if (route.path.includes('//')) {
      warnings.push(`Route ${route.path} contains double slashes`);
    }

    if (route.title && route.title.length > 50) {
      warnings.push(
        `Route ${route.path} has very long title (${route.title.length} chars)`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Export metadata for specific route groups
 */
export const AUTHENTICATION_ROUTES = ROUTE_METADATA.filter(
  route =>
    route.path.startsWith('/auth') ||
    route.path.includes('login') ||
    route.path.includes('register')
);

export const USER_ROUTES = ROUTE_METADATA.filter(
  route => route.showUsername === true
);

export const PUBLIC_ROUTES = ROUTE_METADATA.filter(
  route => route.showUsername === false && !route.path.startsWith('/auth')
);

/**
 * Default fallback metadata for unknown routes
 */
export const FALLBACK_ROUTE_METADATA: RouteMetadata = {
  path: '*',
  title: 'Page',
  showUsername: false,
  showNotifications: false,
};
