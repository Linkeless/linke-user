/**
 * useDocumentTitle Hook
 * Provides declarative API for setting page titles in React components
 */

import { useEffect, useRef, useMemo } from 'react';
import { TitleService } from '@/services/titleService';
import type { UseDocumentTitleOptions, TitleParts } from '@/types/title.types';

/**
 * Hook for managing document title in React components
 *
 * @param options Configuration options for title management
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const user = useCurrentUser();
 *
 *   useDocumentTitle({
 *     title: 'Dashboard',
 *     showUsername: true,
 *     isLoading: !user,
 *     dependencies: [user]
 *   });
 *
 *   return <div>Dashboard content</div>;
 * }
 * ```
 */
export function useDocumentTitle(options: UseDocumentTitleOptions): void {
  const {
    title,
    showUsername = false,
    showNotificationCount = false,
    isLoading = false,
    dependencies = [],
  } = options;

  const titleServiceRef = useRef<TitleService>();
  const previousOptionsRef = useRef<UseDocumentTitleOptions>();

  // Initialize title service if not already done
  if (!titleServiceRef.current) {
    titleServiceRef.current = TitleService.getInstance();
  }

  // Memoize title parts to prevent unnecessary updates
  const titleParts = useMemo<TitleParts>(
    () => ({
      page: title,
      isLoading,
    }),
    [title, isLoading, ...dependencies],
  );

  // Effect to update title when options change
  useEffect(() => {
    const titleService = titleServiceRef.current!;

    // Check if we need to update
    const currentOptions = {
      title,
      showUsername,
      showNotificationCount,
      isLoading,
    };
    const optionsChanged = !isOptionsEqual(
      currentOptions,
      previousOptionsRef.current,
    );

    if (optionsChanged) {
      // Update title parts
      titleService.updateWithParts(titleParts);

      // Store current options for next comparison
      previousOptionsRef.current = currentOptions;
    }
  }, [title, showUsername, showNotificationCount, isLoading, titleParts]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset loading state when component unmounts
      if (titleServiceRef.current && isLoading) {
        titleServiceRef.current.setLoadingState(false);
      }
    };
  }, []);
}

/**
 * Simplified hook for static titles (no dynamic features)
 *
 * @param title Static title to set
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   useStaticTitle('Login');
 *   return <div>Login form</div>;
 * }
 * ```
 */
export function useStaticTitle(title: string): void {
  useDocumentTitle({
    title,
    showUsername: false,
    showNotificationCount: false,
    isLoading: false,
  });
}

/**
 * Hook for loading titles with automatic state management
 *
 * @param title Base title when not loading
 * @param isLoading Loading state
 *
 * @example
 * ```tsx
 * function DataPage() {
 *   const { data, isLoading } = useQuery('data');
 *   useLoadingTitle('Data View', isLoading);
 *
 *   return <div>{data ? 'Data content' : 'Loading...'}</div>;
 * }
 * ```
 */
export function useLoadingTitle(title: string, isLoading: boolean): void {
  useDocumentTitle({
    title,
    isLoading,
  });
}

/**
 * Hook for user-specific titles
 *
 * @param title Base title
 * @param username Username to display
 * @param options Additional options
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const user = useCurrentUser();
 *
 *   useUserTitle('Profile', user?.username, {
 *     showNotificationCount: true,
 *     isLoading: !user
 *   });
 *
 *   return <div>Profile content</div>;
 * }
 * ```
 */
export function useUserTitle(
  title: string,
  username?: string,
  options: Partial<UseDocumentTitleOptions> = {},
): void {
  const titleService = useMemo(() => TitleService.getInstance(), []);

  useEffect(() => {
    if (username) {
      titleService.setUserContext(username);
    }
  }, [username, titleService]);

  useDocumentTitle({
    title,
    showUsername: !!username,
    ...options,
    dependencies: [username, ...(options.dependencies || [])],
  });
}

/**
 * Hook for notification-aware titles
 *
 * @param title Base title
 * @param notificationCount Number of notifications
 * @param options Additional options
 *
 * @example
 * ```tsx
 * function NotificationsPage() {
 *   const { notifications } = useNotifications();
 *
 *   useNotificationTitle('Notifications', notifications.length, {
 *     showUsername: true
 *   });
 *
 *   return <div>Notifications list</div>;
 * }
 * ```
 */
export function useNotificationTitle(
  title: string,
  notificationCount: number,
  options: Partial<UseDocumentTitleOptions> = {},
): void {
  const titleService = useMemo(() => TitleService.getInstance(), []);

  useEffect(() => {
    titleService.setNotificationCount(notificationCount);
  }, [notificationCount, titleService]);

  useDocumentTitle({
    title,
    showNotificationCount: true,
    ...options,
    dependencies: [notificationCount, ...(options.dependencies || [])],
  });
}

/**
 * Hook to get current title information
 *
 * @returns Current title state information
 *
 * @example
 * ```tsx
 * function DebugComponent() {
 *   const titleInfo = useTitleInfo();
 *
 *   return (
 *     <div>
 *       Current title: {titleInfo.currentTitle}
 *       Is loading: {titleInfo.isLoading}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTitleInfo() {
  const titleService = useMemo(() => TitleService.getInstance(), []);
  return titleService.getState();
}

/**
 * Compare options objects for equality
 */
function isOptionsEqual(
  current: Partial<UseDocumentTitleOptions>,
  previous?: Partial<UseDocumentTitleOptions>,
): boolean {
  if (!previous) {
    return false;
  }

  return (
    current.title === previous.title &&
    current.showUsername === previous.showUsername &&
    current.showNotificationCount === previous.showNotificationCount &&
    current.isLoading === previous.isLoading
  );
}

/**
 * Custom hook for handling title updates on route changes
 * Used internally by RouteTitle component
 */
export function useRouteTitle(
  routePath: string,
  defaultTitle: string,
  options: Partial<UseDocumentTitleOptions> = {},
): void {
  const memoizedOptions = useMemo(
    () => ({
      title: defaultTitle,
      ...options,
      dependencies: [routePath, ...(options.dependencies || [])],
    }),
    [routePath, defaultTitle, options],
  );

  useDocumentTitle(memoizedOptions);
}

/**
 * Hook for debugging title updates
 * Logs title changes to console in development mode
 */
export function useTitleDebug(
  enabled: boolean = process.env.NODE_ENV === 'development',
): void {
  const titleService = useMemo(() => TitleService.getInstance(), []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleTitleUpdate = (event: any) => {
      console.log('[Title Update]', {
        from: event.from,
        to: event.to,
        source: event.source,
        timestamp: new Date(event.timestamp).toISOString(),
      });
    };

    titleService.addUpdateListener(handleTitleUpdate);

    return () => {
      titleService.removeUpdateListener(handleTitleUpdate);
    };
  }, [enabled, titleService]);
}
