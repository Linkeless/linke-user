/**
 * ErrorBoundary component - Global error boundary with fallback UI
 *
 * Provides a React error boundary that catches JavaScript errors anywhere in the
 * component tree and displays a fallback UI instead of crashing the application.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Children components to protect */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    reset: () => void
  ) => ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show detailed error info in development */
  showDetails?: boolean;
  /** Custom error boundary name for logging */
  name?: string;
  /** Whether to enable automatic retry after errors */
  enableRetry?: boolean;
  /** Maximum number of retries before giving up */
  maxRetries?: number;
}

/**
 * ErrorBoundary component
 *
 * Features:
 * - Catches and handles React component errors
 * - Provides user-friendly error fallback UI
 * - Detailed error reporting in development
 * - Retry functionality for temporary issues
 * - Error logging and reporting
 * - Graceful degradation
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  /**
   * Static method to update state when error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  /**
   * Lifecycle method called after error has been caught
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, name = 'ErrorBoundary' } = this.props;

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log error details
    console.group(`🚨 ${name} caught an error`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in onError handler:', handlerError);
      }
    }

    // Report to error tracking service (e.g., Sentry, LogRocket)
    this.reportError(error, errorInfo);
  }

  /**
   * Report error to external service
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const { name = 'ErrorBoundary' } = this.props;

    // In a real app, you'd send this to your error tracking service
    const errorReport = {
      id: this.state.errorId,
      boundary: name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, errorReport);

    console.info('Error report prepared:', errorReport);
  };

  /**
   * Reset error boundary state
   */
  private resetError = () => {
    this.retryCount += 1;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  /**
   * Handle page reload
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Navigate to home page
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Check if retry is available
   */
  private canRetry = (): boolean => {
    const { enableRetry = true, maxRetries = 3 } = this.props;
    return enableRetry && this.retryCount < maxRetries;
  };

  override render() {
    const {
      children,
      fallback,
      showDetails = import.meta.env.DEV,
    } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo!, this.resetError);
      }

      // Default fallback UI
      return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-background'>
          <Card className='w-full max-w-2xl'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center'>
                <AlertTriangle className='h-6 w-6 text-destructive' />
              </div>
              <CardTitle className='text-2xl font-semibold'>
                Something went wrong
              </CardTitle>
              <p className='text-muted-foreground'>
                We encountered an unexpected error. This has been reported and
                we're working to fix it.
              </p>
            </CardHeader>

            <CardContent className='space-y-6'>
              {/* Error Actions */}
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                {this.canRetry() && (
                  <Button
                    onClick={this.resetError}
                    className='flex items-center gap-2'
                  >
                    <RefreshCw className='h-4 w-4' />
                    Try Again
                  </Button>
                )}

                <Button
                  variant='outline'
                  onClick={this.handleReload}
                  className='flex items-center gap-2'
                >
                  <RefreshCw className='h-4 w-4' />
                  Reload Page
                </Button>

                <Button
                  variant='ghost'
                  onClick={this.handleGoHome}
                  className='flex items-center gap-2'
                >
                  <Home className='h-4 w-4' />
                  Go Home
                </Button>
              </div>

              {/* Error Details (Development) */}
              {showDetails && (
                <details className='mt-6'>
                  <summary className='flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground'>
                    <Bug className='h-4 w-4' />
                    Technical Details
                  </summary>

                  <div className='mt-4 space-y-4'>
                    <div>
                      <h4 className='text-sm font-medium mb-2'>
                        Error Message:
                      </h4>
                      <pre className='bg-muted p-3 rounded text-xs overflow-auto'>
                        {error.message}
                      </pre>
                    </div>

                    {error.stack && (
                      <div>
                        <h4 className='text-sm font-medium mb-2'>
                          Stack Trace:
                        </h4>
                        <pre className='bg-muted p-3 rounded text-xs overflow-auto max-h-48'>
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className='text-sm font-medium mb-2'>
                          Component Stack:
                        </h4>
                        <pre className='bg-muted p-3 rounded text-xs overflow-auto max-h-48'>
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    <div className='text-xs text-muted-foreground'>
                      Error ID: {this.state.errorId}
                    </div>
                  </div>
                </details>
              )}

              {/* Retry Info */}
              {this.retryCount > 0 && (
                <div className='text-center text-sm text-muted-foreground'>
                  Retry attempts: {this.retryCount} /{' '}
                  {this.props.maxRetries || 3}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based error boundary for functional components
 * This creates a higher-order component that wraps children with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Simple error fallback component for minor errors
 */
export function SimpleErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className='text-center p-6 border border-destructive/20 rounded-lg bg-destructive/5'>
      <AlertTriangle className='h-8 w-8 text-destructive mx-auto mb-3' />
      <h3 className='font-medium text-destructive mb-2'>
        Failed to load content
      </h3>
      <p className='text-sm text-muted-foreground mb-4'>
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button variant='outline' size='sm' onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

/**
 * Default export
 */
export default ErrorBoundary;
