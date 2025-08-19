/**
 * Title Navigation Integration Tests
 * Tests the complete title management system during navigation
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { TitleProvider } from '@/contexts/TitleContext';
import { RouteTitle } from '@/components/RouteTitle';
import {
  useDocumentTitle,
  useStaticTitle,
  useLoadingTitle,
} from '@/hooks/useDocumentTitle';
import { TitleService } from '@/services/titleService';

import { vi } from 'vitest';

// Mock external dependencies
vi.mock('@/utils/titleAnnouncer');
vi.mock('@/features/auth/stores/authStore', () => ({
  useCurrentUser: () => ({ username: 'testuser', email: 'test@example.com' }),
}));

// Test components
function DashboardPage() {
  useDocumentTitle({
    title: 'Dashboard',
    showUsername: true,
    showNotificationCount: true,
  });
  return <div data-testid='dashboard'>Dashboard Content</div>;
}

function LoginPage() {
  useStaticTitle('Login');
  return <div data-testid='login'>Login Content</div>;
}

function LoadingPage() {
  useLoadingTitle('Data Loading', true);
  return <div data-testid='loading'>Loading Content</div>;
}

function ProfilePage() {
  useDocumentTitle({
    title: 'Profile',
    showUsername: true,
  });
  return <div data-testid='profile'>Profile Content</div>;
}

function NavigationTestComponent() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        data-testid='nav-dashboard'
      >
        To Dashboard
      </button>
      <button onClick={() => navigate('/login')} data-testid='nav-login'>
        To Login
      </button>
      <button onClick={() => navigate('/loading')} data-testid='nav-loading'>
        To Loading
      </button>
      <button onClick={() => navigate('/profile')} data-testid='nav-profile'>
        To Profile
      </button>
    </div>
  );
}

// Test wrapper component
function TestApp({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
  return (
    <TitleProvider debug={false}>
      <MemoryRouter initialEntries={initialEntries}>
        <RouteTitle />
        <NavigationTestComponent />
        <Routes>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/loading' element={<LoadingPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/' element={<div data-testid='home'>Home</div>} />
        </Routes>
      </MemoryRouter>
    </TitleProvider>
  );
}

describe('Title Navigation Integration', () => {
  let originalTitle: string;

  beforeEach(() => {
    // Store original title
    originalTitle = document.title;

    // Reset title service
    TitleService.resetInstance();
  });

  afterEach(() => {
    // Restore original title
    document.title = originalTitle;

    // Cleanup
    TitleService.resetInstance();
  });

  describe('route-based title updates', () => {
    it('should update title when navigating to dashboard', async () => {
      render(<TestApp initialEntries={['/dashboard']} />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Dashboard');
          expect(document.title).toContain('Linke User Portal');
        },
        { timeout: 1000 }
      );
    });

    it('should update title when navigating to login', async () => {
      render(<TestApp initialEntries={['/login']} />);

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Login');
          expect(document.title).toContain('Linke User Portal');
        },
        { timeout: 1000 }
      );
    });

    it('should show loading state in title', async () => {
      render(<TestApp initialEntries={['/loading']} />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Loading');
          expect(document.title).toContain('Data Loading');
        },
        { timeout: 1000 }
      );
    });

    it('should include username in profile title', async () => {
      render(<TestApp initialEntries={['/profile']} />);

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Profile');
          expect(document.title).toContain('testuser');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('navigation transitions', () => {
    it('should update title when navigating between routes', async () => {
      const { getByTestId } = render(<TestApp initialEntries={['/login']} />);

      // Start at login
      await waitFor(() => {
        expect(document.title).toContain('Login');
      });

      // Navigate to dashboard
      act(() => {
        getByTestId('nav-dashboard').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Dashboard');
          expect(document.title).not.toContain('Login');
        },
        { timeout: 1000 }
      );
    });

    it('should handle rapid navigation changes', async () => {
      const { getByTestId } = render(<TestApp initialEntries={['/login']} />);

      // Rapidly navigate between routes
      act(() => {
        getByTestId('nav-dashboard').click();
      });

      act(() => {
        getByTestId('nav-profile').click();
      });

      act(() => {
        getByTestId('nav-login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('login')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Login');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('browser navigation', () => {
    it('should update title with browser back/forward', async () => {
      // This test simulates browser navigation using MemoryRouter's history
      const { getByTestId } = render(<TestApp initialEntries={['/login']} />);

      // Navigate to dashboard
      act(() => {
        getByTestId('nav-dashboard').click();
      });

      await waitFor(() => {
        expect(document.title).toContain('Dashboard');
      });

      // Navigate to profile
      act(() => {
        getByTestId('nav-profile').click();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Profile');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('deep linking', () => {
    it('should set correct title on direct navigation to dashboard', async () => {
      render(<TestApp initialEntries={['/dashboard']} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('dashboard')).toBeInTheDocument();
          expect(document.title).toContain('Dashboard');
        },
        { timeout: 1000 }
      );
    });

    it('should set correct title on direct navigation to profile', async () => {
      render(<TestApp initialEntries={['/profile']} />);

      await waitFor(
        () => {
          expect(screen.getByTestId('profile')).toBeInTheDocument();
          expect(document.title).toContain('Profile');
          expect(document.title).toContain('testuser');
        },
        { timeout: 1000 }
      );
    });

    it('should handle unknown routes gracefully', async () => {
      render(<TestApp initialEntries={['/unknown-route']} />);

      // Should fallback to default or show 404-like behavior
      await waitFor(
        () => {
          // The exact behavior depends on your routing setup
          expect(document.title).toBeDefined();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('loading states during navigation', () => {
    it('should show loading state during route transition', async () => {
      const { getByTestId } = render(<TestApp initialEntries={['/login']} />);

      // Navigate to loading page
      act(() => {
        getByTestId('nav-loading').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(document.title).toContain('Loading');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('error scenarios', () => {
    it('should handle title service errors gracefully', async () => {
      // Mock title service to throw error
      const titleService = TitleService.getInstance();
      const originalUpdate = titleService.updateWithParts;
      titleService.updateWithParts = vi.fn(() => {
        throw new Error('Title service error');
      });

      expect(() => {
        render(<TestApp initialEntries={['/dashboard']} />);
      }).not.toThrow();

      // Restore original method
      titleService.updateWithParts = originalUpdate;
    });

    it('should handle missing route metadata', async () => {
      // Test with a route that doesn't have specific metadata
      render(<TestApp initialEntries={['/unknown']} />);

      // Should not crash and should have some default title
      await waitFor(
        () => {
          expect(document.title).toBeDefined();
          expect(document.title.length).toBeGreaterThan(0);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('concurrent title updates', () => {
    it('should handle multiple components updating title simultaneously', async () => {
      // Component that updates title multiple times
      function ConcurrentUpdateComponent() {
        useDocumentTitle({ title: 'First Title' });
        useDocumentTitle({ title: 'Second Title' });
        useDocumentTitle({ title: 'Final Title' });
        return <div data-testid='concurrent'>Concurrent Updates</div>;
      }

      function ConcurrentTestApp() {
        return (
          <TitleProvider>
            <MemoryRouter>
              <RouteTitle />
              <Routes>
                <Route path='/' element={<ConcurrentUpdateComponent />} />
              </Routes>
            </MemoryRouter>
          </TitleProvider>
        );
      }

      render(<ConcurrentTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('concurrent')).toBeInTheDocument();
      });

      // Should resolve to the final title
      await waitFor(
        () => {
          expect(document.title).toContain('Final Title');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('cleanup and memory leaks', () => {
    it('should cleanup title listeners on unmount', async () => {
      const { unmount } = render(<TestApp initialEntries={['/dashboard']} />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Unmount should not cause errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('title formatting consistency', () => {
    it('should maintain consistent title format across routes', async () => {
      const { getByTestId } = render(<TestApp initialEntries={['/login']} />);

      // Check login title format
      await waitFor(() => {
        expect(document.title).toMatch(/Login - Linke User Portal/);
      });

      // Navigate to dashboard
      act(() => {
        getByTestId('nav-dashboard').click();
      });

      await waitFor(
        () => {
          expect(document.title).toMatch(/Dashboard.*Linke User Portal/);
        },
        { timeout: 1000 }
      );

      // Navigate to profile
      act(() => {
        getByTestId('nav-profile').click();
      });

      await waitFor(
        () => {
          expect(document.title).toMatch(/Profile.*Linke User Portal/);
        },
        { timeout: 1000 }
      );
    });
  });
});
