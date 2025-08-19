/**
 * TitleProvider Context
 * Provides global title state management via React Context
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import { TitleService } from '@/services/titleService';
import type {
  TitleContextValue,
  TitleConfig,
  TitleUpdateEvent,
} from '@/types/title.types';

// Create the context
const TitleContext = createContext<TitleContextValue | null>(null);

/**
 * Props for TitleProvider component
 */
interface TitleProviderProps {
  /** Child components */
  children: ReactNode;
  /** Optional title configuration */
  config?: Partial<TitleConfig>;
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * TitleProvider component
 * Provides title management context to the entire application
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <TitleProvider config={{ appName: 'My App' }}>
 *       <Router>
 *         <Routes>
 *           <Route path="/" element={<HomePage />} />
 *         </Routes>
 *       </Router>
 *     </TitleProvider>
 *   );
 * }
 * ```
 */
export function TitleProvider({
  children,
  config,
  debug = false,
}: TitleProviderProps): JSX.Element {
  // Initialize title service
  const titleService = useMemo(
    () => TitleService.getInstance(config),
    [config],
  );

  // Local state to trigger re-renders
  const [state, setState] = useState(() => titleService.getState());

  // Update local state when title service state changes
  useEffect(() => {
    const handleTitleUpdate = (event: TitleUpdateEvent) => {
      setState(titleService.getState());

      if (debug) {
        console.log('[TitleProvider] Title updated:', event);
      }
    };

    titleService.addUpdateListener(handleTitleUpdate);

    return () => {
      titleService.removeUpdateListener(handleTitleUpdate);
    };
  }, [titleService, debug]);

  // Memoized context value
  const contextValue = useMemo<TitleContextValue>(
    () => ({
      currentTitle: state.currentTitle,
      isLoading: state.isLoading,
      notificationCount: state.notificationCount,

      updateTitle: (title: string) => {
        try {
          titleService.setTitle(title);
        } catch (error) {
          console.error('[TitleProvider] Failed to update title:', error);
        }
      },

      setLoadingState: (loading: boolean) => {
        try {
          titleService.setLoadingState(loading);
        } catch (error) {
          console.error('[TitleProvider] Failed to set loading state:', error);
        }
      },

      setNotificationCount: (count: number) => {
        try {
          titleService.setNotificationCount(count);
        } catch (error) {
          console.error(
            '[TitleProvider] Failed to set notification count:',
            error,
          );
        }
      },
    }),
    [state, titleService],
  );

  return (
    <TitleContext.Provider value={contextValue}>
      {children}
    </TitleContext.Provider>
  );
}

/**
 * Hook to access title context
 * Must be used within a TitleProvider
 *
 * @returns TitleContextValue with current state and methods
 * @throws Error if used outside TitleProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentTitle, updateTitle } = useTitleContext();
 *
 *   const handleClick = () => {
 *     updateTitle('New Title');
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current: {currentTitle}</p>
 *       <button onClick={handleClick}>Update Title</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTitleContext(): TitleContextValue {
  const context = useContext(TitleContext);

  if (!context) {
    throw new Error(
      'useTitleContext must be used within a TitleProvider. ' +
        'Make sure your component is wrapped with <TitleProvider>.',
    );
  }

  return context;
}

/**
 * Hook to access title context safely (returns null if outside provider)
 * Use this when you need optional title functionality
 *
 * @returns TitleContextValue or null if outside provider
 *
 * @example
 * ```tsx
 * function OptionalTitleComponent() {
 *   const titleContext = useTitleContextSafe();
 *
 *   if (titleContext) {
 *     titleContext.updateTitle('Optional Title');
 *   }
 *
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useTitleContextSafe(): TitleContextValue | null {
  return useContext(TitleContext);
}

/**
 * Hook for updating title with automatic cleanup
 * Useful for components that need to set a title temporarily
 *
 * @param title Title to set while component is mounted
 * @param dependencies Dependencies that trigger title update
 *
 * @example
 * ```tsx
 * function TemporaryTitleComponent() {
 *   const [count, setCount] = useState(0);
 *
 *   useTitleEffect(`Count: ${count}`, [count]);
 *
 *   return (
 *     <button onClick={() => setCount(c => c + 1)}>
 *       Increment: {count}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTitleEffect(title: string, dependencies: any[] = []): void {
  const { updateTitle } = useTitleContext();
  const previousTitleRef = React.useRef<string>();

  useEffect(() => {
    // Store previous title for cleanup
    const titleService = TitleService.getInstance();
    previousTitleRef.current = titleService.getCurrentTitle();

    // Set new title
    updateTitle(title);

    // Cleanup: restore previous title when component unmounts
    return () => {
      if (previousTitleRef.current) {
        updateTitle(previousTitleRef.current);
      }
    };
  }, dependencies);
}

/**
 * Hook for loading state management with title context
 *
 * @param isLoading Loading state
 * @param title Optional title to set while loading
 *
 * @example
 * ```tsx
 * function DataComponent() {
 *   const { data, isLoading } = useQuery('data');
 *
 *   useTitleLoading(isLoading, 'Loading Data...');
 *
 *   return <div>{data || 'Loading...'}</div>;
 * }
 * ```
 */
export function useTitleLoading(isLoading: boolean, title?: string): void {
  const { setLoadingState, updateTitle } = useTitleContext();

  useEffect(() => {
    setLoadingState(isLoading);

    if (title && isLoading) {
      updateTitle(title);
    }
  }, [isLoading, title, setLoadingState, updateTitle]);
}

/**
 * Hook for notification count management with title context
 *
 * @param count Notification count
 *
 * @example
 * ```tsx
 * function NotificationProvider() {
 *   const { notifications } = useNotifications();
 *
 *   useTitleNotifications(notifications.filter(n => !n.read).length);
 *
 *   return <NotificationList notifications={notifications} />;
 * }
 * ```
 */
export function useTitleNotifications(count: number): void {
  const { setNotificationCount } = useTitleContext();

  useEffect(() => {
    setNotificationCount(count);
  }, [count, setNotificationCount]);
}

/**
 * Higher-order component for providing title context
 * Alternative to TitleProvider for class components
 *
 * @param Component Component to wrap
 * @param config Optional title configuration
 *
 * @example
 * ```tsx
 * class MyClassComponent extends React.Component {
 *   render() {
 *     return <div>Class component with title context</div>;
 *   }
 * }
 *
 * export default withTitleProvider(MyClassComponent);
 * ```
 */
export function withTitleProvider<P extends object>(
  Component: React.ComponentType<P>,
  config?: Partial<TitleConfig>,
) {
  const WrappedComponent = (props: P) => (
    <TitleProvider config={config}>
      <Component {...props} />
    </TitleProvider>
  );

  WrappedComponent.displayName = `withTitleProvider(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Error boundary for title context
 * Catches errors in title-related operations
 */
interface TitleErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface TitleErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export class TitleErrorBoundary extends React.Component<
  TitleErrorBoundaryProps,
  TitleErrorBoundaryState
> {
  constructor(props: TitleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TitleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      '[TitleErrorBoundary] Title context error:',
      error,
      errorInfo,
    );

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Title system error occurred</div>;
    }

    return this.props.children;
  }
}
