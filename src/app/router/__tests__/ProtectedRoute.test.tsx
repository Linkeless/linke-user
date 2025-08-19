import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as authStore from '@/features/auth/stores/authStore';

// Mock the auth store
vi.mock('@/features/auth/stores/authStore', () => ({
  useAuthStatus: vi.fn(),
}));

// Mock React Router's Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: any) => {
      mockNavigate(to, state, replace);
      return (
        <div
          data-testid='navigate'
          data-to={to}
          data-state={JSON.stringify(state)}
          data-replace={replace}
        />
      );
    },
  };
});

describe('ProtectedRoute', () => {
  const mockUseAuthStatus = authStore.useAuthStatus as MockedFunction<
    typeof authStore.useAuthStatus
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProtectedRoute = (initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ProtectedRoute>
          <div data-testid='protected-content'>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
  };

  describe('Loading States', () => {
    it('shows loading when auth is not initialized', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
      });

      renderProtectedRoute();

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('shows loading when auth is loading', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: true,
      });

      renderProtectedRoute();

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('shows loading when both loading and not initialized', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
      });

      renderProtectedRoute();

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    it('redirects to login when user is not authenticated', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute('/dashboard');

      const navigateElement = screen.getByTestId('navigate');
      expect(navigateElement).toHaveAttribute('data-to', '/login');
      expect(navigateElement).toHaveAttribute('data-replace', 'true');

      // Check that the current location is preserved in state
      const stateAttribute = navigateElement.getAttribute('data-state');
      const state = JSON.parse(stateAttribute!);
      expect(state.from.pathname).toBe('/dashboard');

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('preserves the intended destination in navigation state', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute('/profile');

      const navigateElement = screen.getByTestId('navigate');
      const stateAttribute = navigateElement.getAttribute('data-state');
      const state = JSON.parse(stateAttribute!);

      expect(state.from.pathname).toBe('/profile');
    });

    it('preserves query parameters in the intended destination', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute('/dashboard?tab=analytics&filter=active');

      const navigateElement = screen.getByTestId('navigate');
      const stateAttribute = navigateElement.getAttribute('data-state');
      const state = JSON.parse(stateAttribute!);

      expect(state.from.pathname).toBe('/dashboard');
      expect(state.from.search).toBe('?tab=analytics&filter=active');
    });

    it('uses replace navigation to avoid back button issues', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute();

      const navigateElement = screen.getByTestId('navigate');
      expect(navigateElement).toHaveAttribute('data-replace', 'true');
    });
  });

  describe('Authenticated Access', () => {
    it('renders protected content when user is authenticated', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute();

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('renders multiple children when authenticated', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid='child-1'>Child 1</div>
            <div data-testid='child-2'>Child 2</div>
            <div data-testid='child-3'>Child 3</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('works with complex children components', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid='header'>Header</div>
            <main data-testid='main-content'>
              <h1>Dashboard</h1>
              <p>Welcome to the dashboard!</p>
            </main>
            <footer data-testid='footer'>Footer</footer>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the dashboard!')).toBeInTheDocument();
    });
  });

  describe('Route Redirection Logic', () => {
    it('preserves hash and search parameters when redirecting', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute('/dashboard?view=grid#section1');

      const navigateElement = screen.getByTestId('navigate');
      const stateAttribute = navigateElement.getAttribute('data-state');
      const state = JSON.parse(stateAttribute!);

      expect(state.from.pathname).toBe('/dashboard');
      expect(state.from.search).toBe('?view=grid');
      expect(state.from.hash).toBe('#section1');
    });

    it('handles missing location state gracefully', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      // Render without initial entries to test default behavior
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid='protected-content'>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      const navigateElement = screen.getByTestId('navigate');
      expect(navigateElement).toHaveAttribute('data-to', '/login');

      const stateAttribute = navigateElement.getAttribute('data-state');
      const state = JSON.parse(stateAttribute!);
      expect(state.from.pathname).toBe('/');
    });

    it('works correctly in nested routing scenarios', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      renderProtectedRoute('/dashboard/settings/profile');

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    it('handles empty children gracefully', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>{null}</ProtectedRoute>
        </MemoryRouter>
      );

      // Should not crash and should not show any navigation or loading
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('maintains proper loading UI structure', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
      });

      renderProtectedRoute();

      // Check loading UI components
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Should have proper CSS classes for styling
      const loadingContainer = screen
        .getByTestId('loading-spinner')
        .closest('.min-h-screen');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('renders loading state with proper accessibility', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
      });

      renderProtectedRoute();

      // Loading spinner should be accessible
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();

      // Loading text should be visible to screen readers
      const loadingText = screen.getByText(/loading/i);
      expect(loadingText).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('transitions from loading to authenticated state', () => {
      const { rerender } = renderProtectedRoute();

      // Initially loading
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
      });

      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div data-testid='protected-content'>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Auth completes and user is authenticated
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div data-testid='protected-content'>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('transitions from loading to unauthenticated state', () => {
      const { rerender } = renderProtectedRoute();

      // Initially loading
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
      });

      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div data-testid='protected-content'>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Auth completes and user is not authenticated
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });

      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div data-testid='protected-content'>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
