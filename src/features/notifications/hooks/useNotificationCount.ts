/**
 * useNotificationCount Hook
 * Manages notification count for title display
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTitleContext } from '@/contexts/TitleContext';
import { useTranslation } from 'react-i18next';

/**
 * Notification item interface
 */
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  url?: string;
}

/**
 * Notification count hook state
 */
interface NotificationCountState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

/**
 * Hook options
 */
interface UseNotificationCountOptions {
  /** Auto-fetch interval in milliseconds (default: 30000ms = 30s) */
  fetchInterval?: number;
  /** Whether to update title automatically */
  updateTitle?: boolean;
  /** Whether to fetch on mount */
  fetchOnMount?: boolean;
  /** Mock mode for development */
  useMockData?: boolean;
}

/**
 * Generate mock notifications for development
 */
function getMockNotifications(t: any): Notification[] {
  return [
    {
      id: '1',
      title: t('mock.welcome.title'),
      message: t('mock.welcome.message'),
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: '2',
      title: t('mock.serviceUpdate.title'),
      message: t('mock.serviceUpdate.message'),
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      id: '3',
      title: t('mock.paymentReminder.title'),
      message: t('mock.paymentReminder.message'),
      type: 'warning',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];
}

/**
 * Hook for managing notification count with title integration
 *
 * @param options Configuration options
 * @returns Notification state and methods
 *
 * @example
 * ```tsx
 * function NotificationProvider() {
 *   const { unreadCount, notifications, markAsRead } = useNotificationCount({
 *     updateTitle: true,
 *     fetchInterval: 30000
 *   });
 *
 *   return (
 *     <div>
 *       <span>Unread: {unreadCount}</span>
 *       {notifications.map(notif => (
 *         <div key={notif.id} onClick={() => markAsRead(notif.id)}>
 *           {notif.title}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useNotificationCount(
  options: UseNotificationCountOptions = {},
) {
  const { t } = useTranslation('notifications');
  const {
    fetchInterval = 30000,
    updateTitle = true,
    fetchOnMount = true,
    useMockData = process.env.NODE_ENV === 'development',
  } = options;

  const titleContext = useTitleContext();

  const [state, setState] = useState<NotificationCountState>({
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    isLoading: false,
    error: null,
    lastFetch: null,
  });

  /**
   * Fetch notifications from API or use mock data
   */
  const fetchNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let notifications: Notification[];

      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        notifications = getMockNotifications(t);
      } else {
        // TODO: Replace with actual API call
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        notifications = data.notifications || [];
      }

      const unreadCount = notifications.filter(n => !n.read).length;
      const totalCount = notifications.length;

      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        totalCount,
        isLoading: false,
        lastFetch: new Date(),
      }));

      // Update title if enabled
      if (updateTitle) {
        titleContext.setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : t('errors.fetchFailed'),
      }));
    }
  }, [useMockData, updateTitle, titleContext]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      setState(prev => {
        const updatedNotifications = prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        );
        const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

        // Update title count
        if (updateTitle) {
          titleContext.setNotificationCount(newUnreadCount);
        }

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      });

      // TODO: Make API call to mark as read
      if (!useMockData) {
        try {
          await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      }
    },
    [updateTitle, titleContext, useMockData],
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    setState(prev => {
      const updatedNotifications = prev.notifications.map(notif => ({
        ...notif,
        read: true,
      }));

      // Update title count to 0
      if (updateTitle) {
        titleContext.setNotificationCount(0);
      }

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    });

    // TODO: Make API call to mark all as read
    if (!useMockData) {
      try {
        await fetch('/api/notifications/read-all', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  }, [updateTitle, titleContext, useMockData]);

  /**
   * Add new notification (for testing/development)
   */
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      setState(prev => {
        const updatedNotifications = [newNotification, ...prev.notifications];
        const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

        // Update title count
        if (updateTitle && !newNotification.read) {
          titleContext.setNotificationCount(newUnreadCount);
        }

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
          totalCount: updatedNotifications.length,
        };
      });
    },
    [updateTitle, titleContext],
  );

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      setState(prev => {
        const updatedNotifications = prev.notifications.filter(
          n => n.id !== notificationId,
        );
        const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

        // Update title count
        if (updateTitle) {
          titleContext.setNotificationCount(newUnreadCount);
        }

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
          totalCount: updatedNotifications.length,
        };
      });

      // TODO: Make API call to delete
      if (!useMockData) {
        try {
          await fetch(`/api/notifications/${notificationId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Failed to delete notification:', error);
        }
      }
    },
    [updateTitle, titleContext, useMockData],
  );

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (fetchOnMount) {
      fetchNotifications();
    }
  }, [fetchOnMount, fetchNotifications]);

  // Set up polling interval
  useEffect(() => {
    if (fetchInterval > 0) {
      const interval = setInterval(fetchNotifications, fetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchInterval, fetchNotifications]);

  // Memoized unread notifications
  const unreadNotifications = useMemo(() => {
    return state.notifications.filter(n => !n.read);
  }, [state.notifications]);

  // Memoized recent notifications (last 24 hours)
  const recentNotifications = useMemo(() => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return state.notifications.filter(n => n.createdAt > yesterday);
  }, [state.notifications]);

  return {
    // State
    notifications: state.notifications,
    unreadNotifications,
    recentNotifications,
    unreadCount: state.unreadCount,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,
    lastFetch: state.lastFetch,

    // Actions
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
    refresh,
    fetchNotifications,
  };
}

/**
 * Simplified hook that only returns unread count
 * Useful when you only need the count for title display
 */
export function useUnreadCount(
  options: Pick<
    UseNotificationCountOptions,
    'fetchInterval' | 'useMockData'
  > = {},
) {
  const { unreadCount, isLoading, error } = useNotificationCount({
    ...options,
    updateTitle: true,
    fetchOnMount: true,
  });

  return { unreadCount, isLoading, error };
}

/**
 * Hook for notification count without title integration
 * Use when you want to manage title updates manually
 */
export function useNotificationCountOnly(
  options: Omit<UseNotificationCountOptions, 'updateTitle'> = {},
) {
  return useNotificationCount({
    ...options,
    updateTitle: false,
  });
}
