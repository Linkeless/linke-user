/**
 * useLoadingTitle Hook
 * Advanced loading state management for titles with automatic timing
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTitleContext } from '@/contexts/TitleContext';
import { TitleService } from '@/services/titleService';

/**
 * Loading operation interface
 */
interface LoadingOperation {
  id: string;
  description: string;
  startTime: number;
  timeout?: number;
}

/**
 * Loading state configuration
 */
interface LoadingStateConfig {
  /** Immediate loading prefix (default: "Loading... ") */
  loadingPrefix?: string;
  /** Extended loading prefix after threshold (default: "Still loading... ") */
  stillLoadingPrefix?: string;
  /** Time threshold for "still loading" in ms (default: 3000) */
  stillLoadingThreshold?: number;
  /** Maximum loading time before showing warning (default: 30000) */
  maxLoadingTime?: number;
  /** Warning prefix for very long operations (default: "Please wait... ") */
  warningPrefix?: string;
}

/**
 * Loading title hook options
 */
interface UseLoadingTitleOptions {
  /** Base title when not loading */
  baseTitle?: string;
  /** Loading state configuration */
  config?: LoadingStateConfig;
  /** Whether to update global title context */
  updateGlobalState?: boolean;
  /** Debug mode for logging */
  debug?: boolean;
}

/**
 * Default loading configuration
 */
const DEFAULT_CONFIG: Required<LoadingStateConfig> = {
  loadingPrefix: 'Loading... ',
  stillLoadingPrefix: 'Still loading... ',
  stillLoadingThreshold: 3000,
  maxLoadingTime: 30000,
  warningPrefix: 'Please wait... ',
};

/**
 * Hook for advanced loading state management with title updates
 *
 * @param options Configuration options
 * @returns Loading state management interface
 *
 * @example
 * ```tsx
 * function DataComponent() {
 *   const { startLoading, stopLoading, isLoading } = useLoadingTitle({
 *     baseTitle: 'Data View',
 *     updateGlobalState: true
 *   });
 *
 *   const fetchData = async () => {
 *     const loadingId = startLoading('Fetching user data');
 *     try {
 *       const data = await api.getData();
 *       setData(data);
 *     } finally {
 *       stopLoading(loadingId);
 *     }
 *   };
 *
 *   return <div>{isLoading ? 'Loading...' : 'Data loaded'}</div>;
 * }
 * ```
 */
export function useLoadingTitle(options: UseLoadingTitleOptions = {}) {
  const { baseTitle, config = {}, debug = false } = options;

  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config],
  );
  const titleContext = useTitleContext();
  const shouldUpdateGlobal = options.updateGlobalState ?? true;
  const titleService = useMemo(() => TitleService.getInstance(), []);

  const [operations, setOperations] = useState<Map<string, LoadingOperation>>(
    new Map(),
  );
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const timerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Compute loading state
  const isLoading = operations.size > 0;
  const oldestOperation = useMemo(() => {
    if (operations.size === 0) {
      return null;
    }
    return Array.from(operations.values()).reduce((oldest, current) =>
      current.startTime < oldest.startTime ? current : oldest,
    );
  }, [operations]);

  /**
   * Update title prefix based on loading duration
   */
  const updateTitlePrefix = useCallback(() => {
    if (!isLoading || !oldestOperation) {
      setCurrentPrefix('');
      return;
    }

    const now = Date.now();
    const duration = now - oldestOperation.startTime;

    let prefix = mergedConfig.loadingPrefix;

    if (duration > mergedConfig.maxLoadingTime) {
      prefix = mergedConfig.warningPrefix;
    } else if (duration > mergedConfig.stillLoadingThreshold) {
      prefix = mergedConfig.stillLoadingPrefix;
    }

    if (prefix !== currentPrefix) {
      setCurrentPrefix(prefix);

      if (debug) {
        console.log(
          `[useLoadingTitle] Title prefix updated: "${prefix}" (duration: ${duration}ms)`,
        );
      }
    }
  }, [isLoading, oldestOperation, mergedConfig, currentPrefix, debug]);

  /**
   * Start a loading operation
   */
  const startLoading = useCallback(
    (description: string = 'Loading', timeout?: number): string => {
      const id = `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const operation: LoadingOperation = {
        id,
        description,
        startTime: Date.now(),
        timeout,
      };

      setOperations(prev => new Map(prev).set(id, operation));

      // Set up timers for prefix updates
      const thresholdTimer = setTimeout(() => {
        updateTitlePrefix();
      }, mergedConfig.stillLoadingThreshold);

      const warningTimer = setTimeout(() => {
        updateTitlePrefix();
      }, mergedConfig.maxLoadingTime);

      timerRefs.current.set(id, thresholdTimer);
      timerRefs.current.set(`${id}_warning`, warningTimer);

      // Set up automatic timeout if specified
      if (timeout && timeout > 0) {
        const timeoutTimer = setTimeout(() => {
          stopLoading(id);
          if (debug) {
            console.warn(
              `[useLoadingTitle] Operation "${description}" timed out after ${timeout}ms`,
            );
          }
        }, timeout);
        timerRefs.current.set(`${id}_timeout`, timeoutTimer);
      }

      if (debug) {
        console.log(
          `[useLoadingTitle] Started loading: "${description}" (id: ${id})`,
        );
      }

      return id;
    },
    [mergedConfig, updateTitlePrefix, debug],
  );

  /**
   * Stop a loading operation
   */
  const stopLoading = useCallback(
    (id: string) => {
      setOperations(prev => {
        const newOperations = new Map(prev);
        const removed = newOperations.delete(id);

        if (removed && debug) {
          const operation = prev.get(id);
          const duration = operation ? Date.now() - operation.startTime : 0;
          console.log(
            `[useLoadingTitle] Stopped loading: "${operation?.description}" (duration: ${duration}ms)`,
          );
        }

        return newOperations;
      });

      // Clear associated timers
      const timersToRemove = [id, `${id}_warning`, `${id}_timeout`];
      timersToRemove.forEach(timerId => {
        const timer = timerRefs.current.get(timerId);
        if (timer) {
          clearTimeout(timer);
          timerRefs.current.delete(timerId);
        }
      });
    },
    [debug],
  );

  /**
   * Stop all loading operations
   */
  const stopAllLoading = useCallback(() => {
    if (debug && operations.size > 0) {
      console.log(
        `[useLoadingTitle] Stopping all ${operations.size} loading operations`,
      );
    }

    setOperations(new Map());

    // Clear all timers
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current.clear();
  }, [operations.size, debug]);

  /**
   * Get loading operation by ID
   */
  const getOperation = useCallback(
    (id: string): LoadingOperation | undefined => {
      return operations.get(id);
    },
    [operations],
  );

  /**
   * Get all current operations
   */
  const getAllOperations = useCallback((): LoadingOperation[] => {
    return Array.from(operations.values());
  }, [operations]);

  // Update title prefix when loading state changes
  useEffect(() => {
    updateTitlePrefix();
  }, [updateTitlePrefix]);

  // Update global title context
  useEffect(() => {
    if (shouldUpdateGlobal && titleContext) {
      titleContext.setLoadingState(isLoading);
    }
  }, [isLoading, titleContext, shouldUpdateGlobal]);

  // Update title service if base title provided
  useEffect(() => {
    if (baseTitle) {
      titleService.setTitle(baseTitle);
    }
  }, [baseTitle, titleService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
      timerRefs.current.clear();
    };
  }, []);

  // Memoized state for performance
  const state = useMemo(
    () => ({
      isLoading,
      operationCount: operations.size,
      currentPrefix,
      oldestOperation,
      hasLongRunningOperation:
        oldestOperation &&
        Date.now() - oldestOperation.startTime >
          mergedConfig.stillLoadingThreshold,
      hasVeryLongOperation:
        oldestOperation &&
        Date.now() - oldestOperation.startTime > mergedConfig.maxLoadingTime,
    }),
    [isLoading, operations.size, currentPrefix, oldestOperation, mergedConfig],
  );

  return {
    // State
    ...state,
    operations: getAllOperations(),

    // Actions
    startLoading,
    stopLoading,
    stopAllLoading,
    getOperation,
    getAllOperations,

    // Configuration
    config: mergedConfig,
  };
}

/**
 * Simplified loading hook for basic use cases
 */
export function useSimpleLoading(baseTitle?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useLoadingTitle({
    baseTitle,
    updateGlobalState: true,
  });

  const start = useCallback(
    (description?: string) => {
      setIsLoading(true);
      return startLoading(description);
    },
    [startLoading],
  );

  const stop = useCallback(
    (id: string) => {
      setIsLoading(false);
      stopLoading(id);
    },
    [stopLoading],
  );

  const withLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      description?: string,
    ): Promise<T> => {
      const id = start(description);
      try {
        return await operation();
      } finally {
        stop(id);
      }
    },
    [start, stop],
  );

  return {
    isLoading,
    start,
    stop,
    withLoading,
  };
}

/**
 * Hook for tracking multiple concurrent loading operations
 */
export function useMultipleLoading() {
  const { startLoading, stopLoading, operations, isLoading } = useLoadingTitle({
    updateGlobalState: true,
  });

  const loadingStates = useMemo(() => {
    const states: Record<string, boolean> = {};
    operations.forEach(op => {
      states[op.description] = true;
    });
    return states;
  }, [operations]);

  const isLoadingAny = useCallback(
    (descriptions: string[]): boolean => {
      return descriptions.some(desc => loadingStates[desc]);
    },
    [loadingStates],
  );

  return {
    isLoading,
    loadingStates,
    startLoading,
    stopLoading,
    isLoadingAny,
    operationCount: operations.length,
  };
}

/**
 * Hook for automatic loading state based on promises
 */
export function usePromiseLoading<T>(
  promiseFactory: (() => Promise<T>) | null,
  description: string = 'Loading',
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { withLoading } = useSimpleLoading();

  useEffect(() => {
    if (!promiseFactory) {
      return;
    }

    withLoading(promiseFactory, description)
      .then(result => {
        setData(result);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      });
  }, dependencies);

  return { data, error, isLoading: data === null && error === null };
}
