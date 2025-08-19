/**
 * Dashboard layout component
 *
 * Provides the main layout structure for the dashboard using the
 * reusable Header component for consistency across the application.
 */

import { useTranslation } from 'react-i18next';
import { Header, type NavItem } from '@/components/common/Header';
import { useUnreadCount } from '@/features/notifications/hooks/useNotificationCount';

/**
 * Props for DashboardLayout component
 */
interface DashboardLayoutProps {
  /** Content to render inside the layout */
  children: React.ReactNode;
  /** Optional className for the main container */
  className?: string;
  /** Optional custom navigation items */
  navigation?: NavItem[];
}

/**
 * Create default navigation configuration for Dashboard
 * This is now a function that uses translations
 */
const createDefaultDashboardNavigation = (
  t: (key: string) => string
): NavItem[] => [
  { label: t('navigation:menu.dashboard'), href: '/dashboard', active: true },
  { label: t('navigation:menu.subscriptions'), href: '/subscriptions' },
  { label: t('navigation:menu.plans'), href: '/plans' },
  { label: t('navigation:menu.orders'), href: '/orders' },
  { label: t('navigation:menu.tickets'), href: '/tickets' },
];

/**
 * DashboardLayout component
 *
 * Features:
 * - Uses the reusable Header component for consistency
 * - Dashboard-specific navigation configuration
 * - Maintains all existing functionality (theme toggle, user menu, etc.)
 * - Clean, modern styling with proper responsive design
 */
export function DashboardLayout({
  children,
  className,
  navigation,
}: DashboardLayoutProps) {
  // Initialize translations
  const { t } = useTranslation();

  // Initialize notification count for title updates
  const { unreadCount: _unreadCount } = useUnreadCount({
    fetchInterval: 30000, // Fetch every 30 seconds
    useMockData: true, // Use mock data in development
  });

  // Use provided navigation or create default with translations
  const navItems = navigation || createDefaultDashboardNavigation(t);

  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      {/* Use the reusable Header component */}
      <Header
        navigation={navItems}
        showThemeToggle={true}
        showUserMenu={true}
        sticky={true}
      />

      {/* Main Content */}
      <main className='flex-1'>{children}</main>
    </div>
  );
}

/**
 * Alias export for backward compatibility
 */
export const AdminLayout = DashboardLayout;

/**
 * Default export
 */
export default DashboardLayout;
