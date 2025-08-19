import { AppRouter } from './router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import './App.css';

/**
 * Main App component
 *
 * The root component that sets up all providers and routing for the entire application.
 * Provider composition (outer to inner):
 * - ErrorBoundary: Catches and handles React errors globally
 * - QueryProvider: TanStack Query client for data fetching
 * - ThemeProvider: Theme context for dark/light mode
 * - AuthProvider: Authentication state and token management
 * - AppRouter: Application routing with protected routes
 */
function App() {
  return (
    <ErrorBoundary
      name='App'
      onError={(error, errorInfo) => {
        // Log to external error tracking service in production
        console.error('App-level error:', error, errorInfo);
      }}
    >
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
