/**
 * Common components barrel export
 *
 * Centralized exports for all common components to simplify imports
 * across the application.
 */

// Header component
export {
  Header,
  type HeaderProps,
  type NavItem,
  default as HeaderDefault,
} from './Header';

// Language Switcher component
export {
  LanguageSwitcher,
  type LanguageSwitcherProps,
  default as LanguageSwitcherDefault,
} from './LanguageSwitcher';

// Layout components
export {
  Layout,
  AuthLayout,
  AdminLayout,
  PageLayout,
  Container,
  type LayoutProps,
  type LayoutVariant,
  default as LayoutDefault,
} from './Layout';

// Error boundary
export {
  ErrorBoundary,
  withErrorBoundary,
  SimpleErrorFallback,
  default as ErrorBoundaryDefault,
} from './ErrorBoundary';

// Loading spinner
export {
  LoadingSpinner,
  PageLoadingSpinner,
  ComponentLoadingSpinner,
  ButtonLoadingSpinner,
  InlineLoadingSpinner,
  SuspenseFallback,
  type LoadingSpinnerProps,
  type SpinnerVariant,
  type SpinnerSize,
  default as LoadingSpinnerDefault,
} from './LoadingSpinner';
