/**
 * Title system type definitions
 * Provides comprehensive type safety for the dynamic title management system
 */

/**
 * Configuration options for title formatting and behavior
 */
export interface TitleConfig {
  /** Application name displayed in all titles */
  appName: string;
  /** Separator between title parts (e.g., " - ") */
  separator: string;
  /** Maximum title length before truncation */
  maxLength: number;
  /** Prefix shown during loading operations */
  loadingPrefix: string;
  /** Prefix shown for extended loading operations */
  stillLoadingPrefix: string;
  /** Time threshold (ms) before showing "still loading" */
  stillLoadingThreshold: number;
  /** Format for notification count display */
  notificationFormat: string;
  /** Suffix added when title is truncated */
  truncationSuffix: string;
  /** Maximum username length before truncation */
  usernameMaxLength: number;
}

/**
 * Default configuration values for the title system
 */
export const DEFAULT_TITLE_CONFIG: TitleConfig = {
  appName: 'Linke User Portal',
  separator: ' - ',
  maxLength: 60,
  loadingPrefix: 'Loading... ',
  stillLoadingPrefix: 'Still loading... ',
  stillLoadingThreshold: 3000,
  notificationFormat: '(%count%) ',
  truncationSuffix: '...',
  usernameMaxLength: 20,
};

/**
 * Current state of the document title
 */
export interface TitleState {
  /** The current title text */
  currentTitle: string;
  /** Base title without modifiers */
  baseTitle: string;
  /** Whether content is loading */
  isLoading: boolean;
  /** Timestamp when loading started */
  loadingStartTime?: number;
  /** Number of unread notifications */
  notificationCount: number;
  /** Current user's username */
  username?: string;
  /** Last update timestamp */
  lastUpdate: number;
}

/**
 * Parts that can be combined to form a complete title
 */
export interface TitleParts {
  /** Page or section name */
  page?: string;
  /** Username to display */
  username?: string;
  /** Notification count */
  notificationCount?: number;
  /** Loading state flag */
  isLoading?: boolean;
  /** Application name override */
  appName?: string;
}

/**
 * Metadata for route-specific title configuration
 */
export interface RouteMetadata {
  /** Route path pattern */
  path: string;
  /** Title for this route */
  title: string;
  /** Whether to show username in title */
  showUsername?: boolean;
  /** Whether to show notification count */
  showNotifications?: boolean;
  /** Custom formatter function for this route */
  customFormatter?: (title: string) => string;
}

/**
 * Options for the useDocumentTitle hook
 */
export interface UseDocumentTitleOptions {
  /** The title to set */
  title: string;
  /** Whether to include username */
  showUsername?: boolean;
  /** Whether to include notification count */
  showNotificationCount?: boolean;
  /** Loading state flag */
  isLoading?: boolean;
  /** Dependencies for re-rendering */
  dependencies?: any[];
}

/**
 * Context value for title management
 */
export interface TitleContextValue {
  /** Current title text */
  currentTitle: string;
  /** Loading state */
  isLoading: boolean;
  /** Notification count */
  notificationCount: number;
  /** Update the title */
  updateTitle: (title: string) => void;
  /** Set loading state */
  setLoadingState: (loading: boolean) => void;
  /** Set notification count */
  setNotificationCount: (count: number) => void;
}

/**
 * Props for the RouteTitle component
 */
export interface RouteTitleProps {
  /** Override title for this route */
  title?: string;
  /** Whether to show username */
  showUsername?: boolean;
  /** Custom format function */
  customFormat?: (title: string) => string;
}

/**
 * Options for the withDocumentTitle HOC
 */
export interface WithDocumentTitleOptions {
  /** Title string or function to generate from props */
  title: string | ((props: any) => string);
  /** Whether to show username */
  showUsername?: boolean;
}

/**
 * Title update event for debugging and analytics
 */
export interface TitleUpdateEvent {
  /** Previous title */
  from: string;
  /** New title */
  to: string;
  /** Timestamp of update */
  timestamp: number;
  /** Source of update (route, manual, etc.) */
  source: 'route' | 'manual' | 'loading' | 'notification';
}

/**
 * Error types that can occur in title system
 */
export enum TitleErrorType {
  /** Failed to update document.title */
  UPDATE_FAILED = 'UPDATE_FAILED',
  /** Title exceeded maximum length */
  LENGTH_EXCEEDED = 'LENGTH_EXCEEDED',
  /** XSS attempt detected */
  XSS_DETECTED = 'XSS_DETECTED',
  /** Browser compatibility issue */
  BROWSER_INCOMPATIBLE = 'BROWSER_INCOMPATIBLE',
  /** Context used outside provider */
  CONTEXT_ERROR = 'CONTEXT_ERROR',
}

/**
 * Error information for title system failures
 */
export interface TitleError {
  /** Type of error */
  type: TitleErrorType;
  /** Error message */
  message: string;
  /** Original error if available */
  originalError?: Error;
  /** Context data for debugging */
  context?: Record<string, any>;
}
