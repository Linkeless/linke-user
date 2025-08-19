/**
 * Layout component - Base layout wrapper for consistent page structure
 *
 * Provides a flexible layout component that can be used as a base wrapper
 * for different page types, with optional header, footer, and sidebar support.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Header, type HeaderProps } from './Header';

/**
 * Layout variant types
 */
export type LayoutVariant =
  | 'default' // Standard layout with header
  | 'centered' // Centered content (auth pages, etc.)
  | 'fullscreen' // No header, full screen content
  | 'dashboard'; // Dashboard layout with sidebar support

/**
 * Props for Layout component
 */
export interface LayoutProps {
  /** Content to render inside the layout */
  children: React.ReactNode;
  /** Layout variant to determine structure */
  variant?: LayoutVariant;
  /** Header configuration (if using header) */
  header?: HeaderProps | false;
  /** Optional sidebar content */
  sidebar?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Custom className for the main container */
  className?: string;
  /** Custom className for the content area */
  contentClassName?: string;
  /** Whether to add padding to content */
  padded?: boolean;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Background variant */
  background?: 'default' | 'muted' | 'transparent';
}

/**
 * Layout component
 *
 * Features:
 * - Multiple layout variants for different use cases
 * - Configurable header with consistent navigation
 * - Optional sidebar and footer support
 * - Responsive design with mobile considerations
 * - Flexible content constraints and backgrounds
 * - Consistent spacing and typography scales
 */
export function Layout({
  children,
  variant = 'default',
  header,
  sidebar,
  footer,
  className,
  contentClassName,
  padded = true,
  maxWidth = 'full',
  background = 'default',
}: LayoutProps) {
  /**
   * Get background classes based on variant
   */
  const getBackgroundClass = () => {
    switch (background) {
      case 'muted':
        return 'bg-muted/50';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'bg-background';
    }
  };

  /**
   * Get max width classes
   */
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm mx-auto';
      case 'md':
        return 'max-w-md mx-auto';
      case 'lg':
        return 'max-w-lg mx-auto';
      case 'xl':
        return 'max-w-xl mx-auto';
      case '2xl':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  /**
   * Get content padding classes
   */
  const getContentPadding = () => {
    if (!padded) {
      return '';
    }

    switch (variant) {
      case 'centered':
        return 'p-6 md:p-8';
      case 'fullscreen':
        return '';
      case 'dashboard':
        return 'p-4 md:p-6';
      default:
        return 'p-4 md:p-6 lg:p-8';
    }
  };

  /**
   * Render layout based on variant
   */
  switch (variant) {
    case 'centered':
      return (
        <div
          className={cn(
            'min-h-screen flex items-center justify-center',
            getBackgroundClass(),
            className
          )}
        >
          <div
            className={cn(
              'w-full',
              getMaxWidthClass(),
              getContentPadding(),
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      );

    case 'fullscreen':
      return (
        <div className={cn('min-h-screen', getBackgroundClass(), className)}>
          <div className={cn('h-full', getContentPadding(), contentClassName)}>
            {children}
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className={cn('min-h-screen', getBackgroundClass(), className)}>
          {/* Header */}
          {header !== false && <Header {...(header || {})} />}

          <div className='flex flex-1'>
            {/* Sidebar */}
            {sidebar && (
              <aside className='hidden lg:block w-64 border-r bg-background/95 backdrop-blur'>
                <div className='sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto'>
                  {sidebar}
                </div>
              </aside>
            )}

            {/* Main Content */}
            <main
              className={cn(
                'flex-1 min-w-0',
                getContentPadding(),
                contentClassName
              )}
            >
              <div className={getMaxWidthClass()}>{children}</div>
            </main>
          </div>

          {/* Footer */}
          {footer && (
            <footer className='border-t bg-background/95 backdrop-blur'>
              {footer}
            </footer>
          )}
        </div>
      );

    default:
      return (
        <div
          className={cn(
            'min-h-screen flex flex-col',
            getBackgroundClass(),
            className
          )}
        >
          {/* Header */}
          {header !== false && <Header {...(header || {})} />}

          {/* Main Content */}
          <main className={cn('flex-1', getContentPadding(), contentClassName)}>
            <div className={getMaxWidthClass()}>{children}</div>
          </main>

          {/* Footer */}
          {footer && (
            <footer className='border-t bg-background/95 backdrop-blur'>
              {footer}
            </footer>
          )}
        </div>
      );
  }
}

/**
 * Pre-configured layout variants for common use cases
 */

/**
 * Auth layout - Centered layout for login/register pages
 */
export function AuthLayout({
  children,
  ...props
}: Omit<LayoutProps, 'variant'>) {
  return (
    <Layout variant='centered' maxWidth='md' header={false} {...props}>
      {children}
    </Layout>
  );
}

/**
 * Create default admin navigation with translations
 */
const createDefaultAdminNavigation = (t: (key: string) => string) => [
  { label: t('navigation:menu.dashboard'), href: '/dashboard' },
  { label: t('navigation:menu.subscriptions'), href: '/subscriptions' },
  { label: t('navigation:menu.orders'), href: '/orders' },
  { label: 'Plans', href: '/plans' },
];

/**
 * Admin layout - General purpose layout with header and optional sidebar
 * Note: For dashboard-specific features, use features/dashboard/components/DashboardLayout
 */
export function AdminLayout({
  children,
  navigation,
  ...props
}: Omit<LayoutProps, 'variant'> & { navigation?: any[] }) {
  const { t } = useTranslation();

  // Use provided navigation or create default with translations
  const navItems = navigation || createDefaultAdminNavigation(t);

  return (
    <Layout
      variant='dashboard'
      header={{
        navigation: navItems,
        showThemeToggle: true,
        showUserMenu: true,
      }}
      {...props}
    >
      {children}
    </Layout>
  );
}

/**
 * Page layout - Standard layout for content pages
 */
export function PageLayout({
  children,
  ...props
}: Omit<LayoutProps, 'variant'>) {
  return (
    <Layout variant='default' maxWidth='2xl' {...props}>
      {children}
    </Layout>
  );
}

/**
 * Container component - Simple content wrapper with consistent spacing
 */
export function Container({
  children,
  className,
  size = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-xl',
    full: 'w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Default export
 */
export default Layout;
