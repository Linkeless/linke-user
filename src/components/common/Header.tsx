/**
 * Header component - Reusable header with logo, navigation, and user menu
 *
 * Provides a flexible header component that can be used across the application
 * with consistent branding, navigation, and user interaction patterns.
 */

import React from 'react';
import { Sun, Moon, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { useCurrentUser } from '@/features/auth/stores/authStore';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { useTheme } from '@/app/hooks/useTheme';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Navigation item interface
 */
export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

/**
 * Props for Header component
 */
export interface HeaderProps {
  /** Application logo/brand configuration */
  logo?: {
    /** Logo text/brand name */
    text?: string;
    /** Logo icon/image component */
    icon?: React.ReactNode;
    /** Logo click handler */
    onClick?: () => void;
  };
  /** Navigation items for desktop menu */
  navigation?: NavItem[];
  /** Whether to show theme toggle */
  showThemeToggle?: boolean;
  /** Whether to show user menu */
  showUserMenu?: boolean;
  /** Custom className for header */
  className?: string;
  /** Whether header should be sticky */
  sticky?: boolean;
  /** Additional header actions */
  actions?: React.ReactNode;
  /** Mobile menu content (if different from desktop nav) */
  mobileContent?: React.ReactNode;
}

/**
 * Header component
 *
 * Features:
 * - Responsive design with mobile menu
 * - Configurable logo and navigation
 * - User menu with authentication info
 * - Theme toggle integration
 * - Sticky positioning option
 * - Accessible keyboard navigation
 */
export function Header({
  logo = {
    text: 'Linke',
    icon: (
      <div className='h-8 w-8 rounded-lg bg-primary flex items-center justify-center'>
        <span className='text-primary-foreground font-bold text-sm'>L</span>
      </div>
    ),
  },
  navigation = [],
  showThemeToggle = true,
  showUserMenu = true,
  className,
  sticky = true,
  actions,
  mobileContent,
}: HeaderProps) {
  const user = useCurrentUser();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  /**
   * Handle navigation item click
   */
  const handleNavClick = (item: NavItem) => {
    if (item.disabled) {
      return;
    }

    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      // Handle navigation using React Router
      navigate(item.href);
    }
  };

  return (
    <header
      className={`
        ${sticky ? 'sticky top-0 z-50' : ''} 
        w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        ${className || ''}
      `}
    >
      <div className='container mx-auto flex h-16 items-center'>
        {/* Left Section - Logo and Brand */}
        <div className='flex items-center flex-shrink-0 min-w-fit'>
          <button
            onClick={logo.onClick}
            className='flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg'
            disabled={!logo.onClick}
          >
            {logo.icon}
            {logo.text && (
              <span className='font-bold text-xl text-foreground hidden sm:block'>
                {logo.text}
              </span>
            )}
          </button>
        </div>

        {/* Center Section - Navigation */}
        <div className='flex-1 flex justify-center px-4'>
          {navigation.length > 0 && (
            <nav className='hidden lg:flex items-center space-x-4 xl:space-x-6'>
              {navigation.map((item, index) => (
                <Button
                  key={index}
                  variant='ghost'
                  className={`
                    text-sm font-medium px-3
                    ${item.active ? 'bg-accent text-accent-foreground' : ''}
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => handleNavClick(item)}
                  disabled={item.disabled}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section - Actions, Theme toggle, User menu */}
        <div className='flex items-center space-x-2 flex-shrink-0 min-w-fit justify-end'>
          {/* Custom actions */}
          {actions}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          {showThemeToggle && (
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleTheme}
              className='h-9 w-9'
              aria-label='Toggle theme'
            >
              {resolvedTheme === 'dark' ? (
                <Sun className='h-4 w-4' />
              ) : (
                <Moon className='h-4 w-4' />
              )}
              <span className='sr-only'>Toggle theme</span>
            </Button>
          )}

          {/* User Menu */}
          {showUserMenu && user && (
            <div className='flex items-center space-x-2'>
              {/* User Avatar/Name - Desktop */}
              <div className='hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted'>
                <div className='h-6 w-6 rounded-full bg-primary flex items-center justify-center'>
                  <User className='h-3 w-3 text-primary-foreground' />
                </div>
                <span className='text-sm font-medium text-foreground'>
                  {user.username || user.email?.split('@')[0] || 'User'}
                </span>
              </div>

              {/* Logout Button - Desktop */}
              <LogoutButton
                variant='ghost'
                size='sm'
                className='hidden md:flex'
              />

              {/* Mobile Menu */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='md:hidden'
                    aria-label='Open menu'
                  >
                    <Menu className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  {mobileContent || (
                    <div className='space-y-4'>
                      {/* User Info */}
                      <div className='flex items-center space-x-3 p-4 bg-muted rounded-lg'>
                        <div className='h-10 w-10 rounded-full bg-primary flex items-center justify-center'>
                          <User className='h-5 w-5 text-primary-foreground' />
                        </div>
                        <div>
                          <p className='font-medium text-foreground'>
                            {user.username ||
                              user.email?.split('@')[0] ||
                              'User'}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Navigation Links - Mobile */}
                      {navigation.length > 0 && (
                        <nav className='space-y-2'>
                          {navigation.map((item, index) => (
                            <Button
                              key={index}
                              variant='ghost'
                              className={`
                                w-full justify-start
                                ${item.active ? 'bg-accent text-accent-foreground' : ''}
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              onClick={() => handleNavClick(item)}
                              disabled={item.disabled}
                            >
                              {item.label}
                            </Button>
                          ))}
                        </nav>
                      )}

                      {/* Language Switcher - Mobile */}
                      <div className='border-t pt-4 space-y-2'>
                        <LanguageSwitcher asMobileItem={true} />
                      </div>

                      {/* Actions - Mobile */}
                      <div className='border-t pt-4 space-y-2'>
                        <LogoutButton
                          variant='destructive'
                          className='w-full'
                          showConfirmation={false}
                        />
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Default export
 */
export default Header;
