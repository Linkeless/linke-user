/**
 * LogoutButton component with confirmation dialog
 * Provides a secure logout functionality with user confirmation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useAuthStore, useAuthActions } from '@/features/auth/stores/authStore';
import { authServiceUtils } from '@/features/auth/services/authService';

/**
 * Props for LogoutButton component
 */
interface LogoutButtonProps {
  /** Button variant */
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Custom className */
  className?: string;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Custom button text */
  children?: React.ReactNode;
  /** Redirect path after logout (defaults to '/login') */
  redirectTo?: string;
  /** Whether to show confirmation dialog */
  showConfirmation?: boolean;
}

/**
 * LogoutButton component
 *
 * Features:
 * - Confirmation dialog before logout
 * - Clear authentication state
 * - Redirect to login page
 * - Error handling
 * - Loading state during logout
 */
export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className,
  showIcon = true,
  children,
  redirectTo = '/login',
  showConfirmation = true,
}: LogoutButtonProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use direct selector instead of creating object
  const isLoading = useAuthStore(state => state.isLoading);

  const { reset, setLoading, setError } = useAuthActions();

  /**
   * Handle logout process
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLoading(true);
      setError(null);

      // Call logout service
      await authServiceUtils.logout();

      // Clear auth state
      reset();

      // Close dialog
      setIsOpen(false);

      // Redirect to login or specified route
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);

      // Set error in store for user feedback
      setError(error.message || t('logout.error'));

      // Still clear local state and redirect even if API call fails
      // This ensures user is logged out locally
      reset();
      navigate(redirectTo, { replace: true });
    } finally {
      setIsLoggingOut(false);
      setLoading(false);
    }
  };

  /**
   * Handle logout without confirmation
   */
  const handleDirectLogout = async () => {
    if (showConfirmation) {
      setIsOpen(true);
    } else {
      await handleLogout();
    }
  };

  const buttonContent = children || (
    <>
      {showIcon && <LogOut className='mr-2 h-4 w-4' />}
      {t('actions.logout')}
    </>
  );

  const isButtonLoading = isLoading || isLoggingOut;

  if (!showConfirmation) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleDirectLogout}
        disabled={isButtonLoading}
      >
        {buttonContent}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isButtonLoading}
        >
          {buttonContent}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('logout.confirm.title')}</DialogTitle>
          <DialogDescription>
            {t('logout.confirm.description')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            disabled={isLoggingOut}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <LogOut className='mr-2 h-4 w-4 animate-spin' />
                {t('logout.loading')}
              </>
            ) : (
              <>
                <LogOut className='mr-2 h-4 w-4' />
                {t('actions.logout')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simple logout button without confirmation (for dropdowns, etc.)
 */
export function SimpleLogoutButton(
  props: Omit<LogoutButtonProps, 'showConfirmation'>,
) {
  return <LogoutButton {...props} showConfirmation={false} />;
}

/**
 * Default export
 */
export default LogoutButton;
