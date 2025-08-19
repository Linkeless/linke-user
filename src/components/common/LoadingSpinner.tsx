/**
 * LoadingSpinner component - Reusable loading indicator with animation
 *
 * Provides flexible loading indicators for different contexts including
 * page loading, component loading, button states, and suspense fallbacks.
 */

import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Loading spinner variants
 */
export type SpinnerVariant =
  | 'default' // Standard spinner
  | 'dots' // Bouncing dots
  | 'pulse' // Pulsing circle
  | 'bars' // Loading bars
  | 'minimal'; // Minimal spinner

/**
 * Loading spinner sizes
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Spinner variant */
  variant?: SpinnerVariant;
  /** Spinner size */
  size?: SpinnerSize;
  /** Loading message to display */
  message?: string;
  /** Whether to show message below spinner */
  showMessage?: boolean;
  /** Custom className */
  className?: string;
  /** Color scheme */
  color?: 'primary' | 'muted' | 'white';
  /** Whether spinner should be centered */
  centered?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * Get size classes for spinner
 */
const getSizeClasses = (size: SpinnerSize) => {
  switch (size) {
    case 'xs':
      return 'h-3 w-3';
    case 'sm':
      return 'h-4 w-4';
    case 'md':
      return 'h-6 w-6';
    case 'lg':
      return 'h-8 w-8';
    case 'xl':
      return 'h-12 w-12';
    default:
      return 'h-6 w-6';
  }
};

/**
 * Get color classes for spinner
 */
const getColorClasses = (color: 'primary' | 'muted' | 'white') => {
  switch (color) {
    case 'primary':
      return 'text-primary';
    case 'muted':
      return 'text-muted-foreground';
    case 'white':
      return 'text-white';
    default:
      return 'text-primary';
  }
};

/**
 * Default spinning icon component
 */
function DefaultSpinner({
  size,
  color,
  className,
}: {
  size: SpinnerSize;
  color: 'primary' | 'muted' | 'white';
  className?: string;
}) {
  return (
    <Loader2
      className={cn(
        'animate-spin',
        getSizeClasses(size),
        getColorClasses(color),
        className
      )}
    />
  );
}

/**
 * Bouncing dots spinner
 */
function DotsSpinner({
  size,
  color,
  className,
}: {
  size: SpinnerSize;
  color: 'primary' | 'muted' | 'white';
  className?: string;
}) {
  const dotSize =
    size === 'xs' ? 'h-1 w-1' : size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const colorClass = getColorClasses(color);

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce bg-current',
            dotSize,
            colorClass
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulsing circle spinner
 */
function PulseSpinner({
  size,
  color,
  className,
}: {
  size: SpinnerSize;
  color: 'primary' | 'muted' | 'white';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-full animate-pulse bg-current',
        getSizeClasses(size),
        getColorClasses(color),
        className
      )}
      style={{
        animationDuration: '1.5s',
      }}
    />
  );
}

/**
 * Loading bars spinner
 */
function BarsSpinner({
  size,
  color,
  className,
}: {
  size: SpinnerSize;
  color: 'primary' | 'muted' | 'white';
  className?: string;
}) {
  const barWidth = size === 'xs' ? 'w-0.5' : size === 'sm' ? 'w-1' : 'w-1.5';
  const barHeight = getSizeClasses(size).split(' ')[0]; // Get height class
  const colorClass = getColorClasses(color);

  return (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={cn(
            'bg-current animate-pulse',
            barWidth,
            barHeight,
            colorClass
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Minimal spinner
 */
function MinimalSpinner({
  size,
  color,
  className,
}: {
  size: SpinnerSize;
  color: 'primary' | 'muted' | 'white';
  className?: string;
}) {
  return (
    <RefreshCw
      className={cn(
        'animate-spin',
        getSizeClasses(size),
        getColorClasses(color),
        className
      )}
      style={{
        animationDuration: '2s',
      }}
    />
  );
}

/**
 * LoadingSpinner component
 *
 * Features:
 * - Multiple spinner variants for different contexts
 * - Configurable sizes and colors
 * - Optional loading messages
 * - Accessibility support
 * - Smooth animations
 * - Responsive design
 */
export function LoadingSpinner({
  variant = 'default',
  size = 'md',
  message,
  showMessage = true,
  className,
  color = 'primary',
  centered = false,
  ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  /**
   * Render spinner based on variant
   */
  const renderSpinner = () => {
    const props = { size, color };

    switch (variant) {
      case 'dots':
        return <DotsSpinner {...props} />;
      case 'pulse':
        return <PulseSpinner {...props} />;
      case 'bars':
        return <BarsSpinner {...props} />;
      case 'minimal':
        return <MinimalSpinner {...props} />;
      default:
        return <DefaultSpinner {...props} />;
    }
  };

  /**
   * Get message size class
   */
  const getMessageSize = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      case 'xl':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        centered && 'min-h-[200px]',
        className
      )}
      role='status'
      aria-label={ariaLabel}
    >
      {/* Spinner */}
      <div className='flex items-center justify-center'>{renderSpinner()}</div>

      {/* Loading Message */}
      {message && showMessage && (
        <p
          className={cn(
            'mt-3 font-medium text-center',
            getMessageSize(),
            getColorClasses(color)
          )}
        >
          {message}
        </p>
      )}

      {/* Screen reader text */}
      <span className='sr-only'>{ariaLabel}</span>
    </div>
  );
}

/**
 * Pre-configured spinner variants for common use cases
 */

/**
 * Page loading spinner - Full page centered loading
 */
export function PageLoadingSpinner({
  message = 'Loading page...',
}: {
  message?: string;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <LoadingSpinner variant='default' size='lg' message={message} centered />
    </div>
  );
}

/**
 * Component loading spinner - For loading states within components
 */
export function ComponentLoadingSpinner({
  message = 'Loading...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('py-8', className)}>
      <LoadingSpinner variant='default' size='md' message={message} centered />
    </div>
  );
}

/**
 * Button loading spinner - Small spinner for button loading states
 */
export function ButtonLoadingSpinner({ className }: { className?: string }) {
  return (
    <LoadingSpinner
      variant='default'
      size='sm'
      showMessage={false}
      className={className || ''}
    />
  );
}

/**
 * Inline loading spinner - Small spinner for inline loading
 */
export function InlineLoadingSpinner({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner variant='minimal' size='sm' showMessage={false} />
      {message && (
        <span className='text-sm text-muted-foreground'>{message}</span>
      )}
    </div>
  );
}

/**
 * Suspense fallback component
 */
export function SuspenseFallback({
  message = 'Loading...',
}: {
  message?: string;
}) {
  return (
    <div className='flex items-center justify-center min-h-[400px] w-full'>
      <LoadingSpinner variant='default' size='lg' message={message} />
    </div>
  );
}

/**
 * Default export
 */
export default LoadingSpinner;
