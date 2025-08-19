/**
 * useDocumentTitle Hook Unit Tests
 */

import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  useDocumentTitle,
  useStaticTitle,
  useLoadingTitle,
  useUserTitle,
  useTitleInfo,
} from '../useDocumentTitle';
import { TitleProvider } from '@/contexts/TitleContext';
import { TitleService } from '@/services/titleService';

import { vi } from 'vitest';

// Mock the title service
vi.mock('@/services/titleService');
vi.mock('@/utils/titleAnnouncer');

const MockTitleService = TitleService as any;

// Test wrapper with TitleProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <TitleProvider>{children}</TitleProvider>
);

describe('useDocumentTitle', () => {
  let mockTitleService: any;

  beforeEach(() => {
    mockTitleService = {
      updateWithParts: vi.fn(),
      setLoadingState: vi.fn(),
      getState: vi.fn(() => ({
        currentTitle: 'Test Title',
        baseTitle: 'Test',
        isLoading: false,
        notificationCount: 0,
        lastUpdate: Date.now(),
      })),
      getInstance: vi.fn(() => mockTitleService),
    } as any;

    MockTitleService.getInstance.mockReturnValue(mockTitleService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useDocumentTitle', () => {
    it('should update title service with basic options', () => {
      renderHook(
        () =>
          useDocumentTitle({
            title: 'Dashboard',
          }),
        { wrapper },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Dashboard',
        isLoading: false,
      });
    });

    it('should update title with loading state', () => {
      renderHook(
        () =>
          useDocumentTitle({
            title: 'Dashboard',
            isLoading: true,
          }),
        { wrapper },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Dashboard',
        isLoading: true,
      });
    });

    it('should update when title changes', () => {
      const { rerender } = renderHook(
        ({ title }) =>
          useDocumentTitle({
            title,
          }),
        {
          wrapper,
          initialProps: { title: 'Dashboard' },
        },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Dashboard',
        isLoading: false,
      });

      // Clear previous calls
      mockTitleService.updateWithParts.mockClear();

      rerender({ title: 'Profile' });

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Profile',
        isLoading: false,
      });
    });

    it('should handle dependencies', () => {
      let dependency = 'dep1';

      const { rerender } = renderHook(
        () =>
          useDocumentTitle({
            title: 'Dashboard',
            dependencies: [dependency],
          }),
        { wrapper },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledTimes(1);

      // Change dependency
      dependency = 'dep2';
      rerender();

      expect(mockTitleService.updateWithParts).toHaveBeenCalledTimes(2);
    });

    it('should cleanup loading state on unmount if loading', () => {
      const { unmount } = renderHook(
        () =>
          useDocumentTitle({
            title: 'Dashboard',
            isLoading: true,
          }),
        { wrapper },
      );

      unmount();

      expect(mockTitleService.setLoadingState).toHaveBeenCalledWith(false);
    });

    it('should not cleanup loading state on unmount if not loading', () => {
      const { unmount } = renderHook(
        () =>
          useDocumentTitle({
            title: 'Dashboard',
            isLoading: false,
          }),
        { wrapper },
      );

      // Clear initial call
      mockTitleService.setLoadingState.mockClear();

      unmount();

      expect(mockTitleService.setLoadingState).not.toHaveBeenCalled();
    });
  });

  describe('useStaticTitle', () => {
    it('should set static title without dynamic features', () => {
      renderHook(() => useStaticTitle('Login'), { wrapper });

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Login',
        isLoading: false,
      });
    });
  });

  describe('useLoadingTitle', () => {
    it('should set loading state', () => {
      renderHook(() => useLoadingTitle('Data View', true), { wrapper });

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Data View',
        isLoading: true,
      });
    });

    it('should handle loading state changes', () => {
      const { rerender } = renderHook(
        ({ isLoading }) => useLoadingTitle('Data View', isLoading),
        {
          wrapper,
          initialProps: { isLoading: false },
        },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Data View',
        isLoading: false,
      });

      mockTitleService.updateWithParts.mockClear();

      rerender({ isLoading: true });

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Data View',
        isLoading: true,
      });
    });
  });

  describe('useUserTitle', () => {
    it('should set user context and title', () => {
      mockTitleService.setUserContext = vi.fn();

      renderHook(() => useUserTitle('Profile', 'john_doe'), { wrapper });

      expect(mockTitleService.setUserContext).toHaveBeenCalledWith('john_doe');
      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Profile',
        isLoading: false,
      });
    });

    it('should handle username changes', () => {
      mockTitleService.setUserContext = vi.fn();

      const { rerender } = renderHook(
        ({ username }) => useUserTitle('Profile', username),
        {
          wrapper,
          initialProps: { username: 'john_doe' },
        },
      );

      expect(mockTitleService.setUserContext).toHaveBeenCalledWith('john_doe');

      mockTitleService.setUserContext.mockClear();

      rerender({ username: 'jane_doe' });

      expect(mockTitleService.setUserContext).toHaveBeenCalledWith('jane_doe');
    });

    it('should handle undefined username', () => {
      mockTitleService.setUserContext = vi.fn();

      renderHook(() => useUserTitle('Profile', undefined), { wrapper });

      expect(mockTitleService.setUserContext).toHaveBeenCalledWith(undefined);
      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Profile',
        isLoading: false,
      });
    });

    it('should handle additional options', () => {
      mockTitleService.setUserContext = vi.fn();

      renderHook(
        () =>
          useUserTitle('Profile', 'john_doe', {
            showNotificationCount: true,
            isLoading: true,
          }),
        { wrapper },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledWith({
        page: 'Profile',
        isLoading: true,
      });
    });
  });

  describe('useTitleInfo', () => {
    it('should return current title state', () => {
      const mockState = {
        currentTitle: 'Dashboard - App',
        baseTitle: 'Dashboard',
        isLoading: false,
        notificationCount: 3,
        lastUpdate: Date.now(),
      };

      mockTitleService.getState.mockReturnValue(mockState);

      const { result } = renderHook(() => useTitleInfo());

      expect(result.current).toEqual(mockState);
    });
  });

  describe('error handling', () => {
    it('should handle title service errors gracefully', () => {
      mockTitleService.updateWithParts.mockImplementation(() => {
        throw new Error('Title service error');
      });

      expect(() => {
        renderHook(
          () =>
            useDocumentTitle({
              title: 'Dashboard',
            }),
          { wrapper },
        );
      }).not.toThrow();
    });
  });

  describe('memoization', () => {
    it('should memoize title parts to prevent unnecessary updates', () => {
      const { rerender } = renderHook(
        ({ extraProp: _extraProp }) =>
          useDocumentTitle({
            title: 'Dashboard',
            isLoading: false,
            dependencies: ['static-dependency'],
          }),
        {
          wrapper,
          initialProps: { extraProp: 'value1' },
        },
      );

      expect(mockTitleService.updateWithParts).toHaveBeenCalledTimes(1);

      // Clear previous calls
      mockTitleService.updateWithParts.mockClear();

      // Re-render with different prop that's not in dependencies
      rerender({ extraProp: 'value2' });

      // Should not cause additional update
      expect(mockTitleService.updateWithParts).not.toHaveBeenCalled();
    });
  });
});
