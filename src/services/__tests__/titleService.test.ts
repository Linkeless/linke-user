/**
 * TitleService Unit Tests
 */

import { TitleService } from '../titleService';
import type { TitleParts } from '@/types/title.types';

import { vi } from 'vitest';

// Mock the announcer
vi.mock('@/utils/titleAnnouncer', () => ({
  announceNavigation: vi.fn(),
  announceLoading: vi.fn(),
}));

describe('TitleService', () => {
  let service: TitleService;
  let originalTitle: string;

  beforeEach(() => {
    // Reset singleton instance
    TitleService.resetInstance();

    // Store original document title
    originalTitle = document.title;

    // Create new instance
    service = TitleService.getInstance();
  });

  afterEach(() => {
    // Restore original title
    document.title = originalTitle;

    // Cleanup service
    service.cleanup();
    TitleService.resetInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TitleService.getInstance();
      const instance2 = TitleService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = TitleService.getInstance();
      TitleService.resetInstance();
      const instance2 = TitleService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('setTitle()', () => {
    it('should set base title', () => {
      service.setTitle('Dashboard');
      const state = service.getState();
      expect(state.baseTitle).toBe('Dashboard');
    });

    it('should sanitize title input', () => {
      service.setTitle('<script>alert("xss")</script>Dashboard');
      const state = service.getState();
      expect(state.baseTitle).not.toContain('<script>');
      expect(state.baseTitle).toContain('Dashboard');
    });

    it('should trigger title update', done => {
      service.setTitle('Dashboard');

      // Title updates are debounced, so wait a bit
      setTimeout(() => {
        expect(document.title).toContain('Dashboard');
        done();
      }, 100);
    });
  });

  describe('setLoadingState()', () => {
    it('should set loading state', () => {
      service.setLoadingState(true);
      const state = service.getState();
      expect(state.isLoading).toBe(true);
      expect(state.loadingStartTime).toBeDefined();
    });

    it('should clear loading state', () => {
      service.setLoadingState(true);
      service.setLoadingState(false);
      const state = service.getState();
      expect(state.isLoading).toBe(false);
      expect(state.loadingStartTime).toBeUndefined();
    });

    it('should not update if state unchanged', () => {
      const initialState = service.getState();
      service.setLoadingState(false);
      const newState = service.getState();
      expect(newState.lastUpdate).toBe(initialState.lastUpdate);
    });

    it('should trigger title update when loading state changes', done => {
      service.setTitle('Dashboard');
      service.setLoadingState(true);

      setTimeout(() => {
        expect(document.title).toContain('Loading');
        done();
      }, 100);
    });
  });

  describe('setNotificationCount()', () => {
    it('should set notification count', () => {
      service.setNotificationCount(5);
      const state = service.getState();
      expect(state.notificationCount).toBe(5);
    });

    it('should handle negative counts', () => {
      service.setNotificationCount(-5);
      const state = service.getState();
      expect(state.notificationCount).toBe(0);
    });

    it('should handle non-integer counts', () => {
      service.setNotificationCount(5.7);
      const state = service.getState();
      expect(state.notificationCount).toBe(5);
    });

    it('should not update if count unchanged', () => {
      service.setNotificationCount(5);
      const initialState = service.getState();
      service.setNotificationCount(5);
      const newState = service.getState();
      expect(newState.lastUpdate).toBe(initialState.lastUpdate);
    });

    it('should trigger title update when count changes', done => {
      service.setTitle('Dashboard');
      service.setNotificationCount(3);

      setTimeout(() => {
        expect(document.title).toContain('(3)');
        done();
      }, 100);
    });
  });

  describe('setUserContext()', () => {
    it('should set username', () => {
      service.setUserContext('john_doe');
      const state = service.getState();
      expect(state.username).toBe('john_doe');
    });

    it('should clear username', () => {
      service.setUserContext('john_doe');
      service.setUserContext(undefined);
      const state = service.getState();
      expect(state.username).toBeUndefined();
    });

    it('should sanitize username', () => {
      service.setUserContext('<script>alert("xss")</script>john');
      const state = service.getState();
      expect(state.username).not.toContain('<script>');
      expect(state.username).toContain('john');
    });

    it('should not update if username unchanged', () => {
      service.setUserContext('john_doe');
      const initialState = service.getState();
      service.setUserContext('john_doe');
      const newState = service.getState();
      expect(newState.lastUpdate).toBe(initialState.lastUpdate);
    });
  });

  describe('updateWithParts()', () => {
    it('should update multiple parts at once', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        username: 'john_doe',
        notificationCount: 5,
        isLoading: true,
      };

      service.updateWithParts(parts);
      const state = service.getState();

      expect(state.baseTitle).toBe('Dashboard');
      expect(state.username).toBe('john_doe');
      expect(state.notificationCount).toBe(5);
      expect(state.isLoading).toBe(true);
    });

    it('should handle partial updates', () => {
      service.setTitle('Initial');
      service.setUserContext('initial_user');

      const parts: TitleParts = {
        page: 'Updated',
        notificationCount: 3,
      };

      service.updateWithParts(parts);
      const state = service.getState();

      expect(state.baseTitle).toBe('Updated');
      expect(state.username).toBe('initial_user'); // Should remain unchanged
      expect(state.notificationCount).toBe(3);
    });
  });

  describe('getCurrentTitle()', () => {
    it('should return current document title', () => {
      document.title = 'Test Title';
      service = TitleService.getInstance(); // Reinitialize to capture current title
      expect(service.getCurrentTitle()).toBe('Test Title');
    });
  });

  describe('reset()', () => {
    it('should reset to default state', done => {
      service.setTitle('Dashboard');
      service.setNotificationCount(5);
      service.setUserContext('john_doe');
      service.setLoadingState(true);

      service.reset();

      setTimeout(() => {
        const state = service.getState();
        expect(state.baseTitle).toBe('Linke User Portal');
        expect(state.notificationCount).toBe(0);
        expect(state.username).toBeUndefined();
        expect(state.isLoading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('formatTitle()', () => {
    it('should format title with given parts', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        username: 'john_doe',
      };

      const result = service.formatTitle(parts);
      expect(result).toBe('Dashboard - john_doe - Linke User Portal');
    });
  });

  describe('sanitizeTitle()', () => {
    it('should sanitize dangerous content', () => {
      const dangerous = '<script>alert("xss")</script>Safe Content';
      const result = service.sanitizeTitle(dangerous);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe Content');
    });
  });

  describe('update listeners', () => {
    it('should add and notify listeners', done => {
      const listener = vi.fn();
      service.addUpdateListener(listener);

      service.setTitle('Test Title');

      setTimeout(() => {
        expect(listener).toHaveBeenCalled();
        const call = listener.mock.calls[0][0];
        expect(call.to).toContain('Test Title');
        done();
      }, 100);
    });

    it('should remove listeners', done => {
      const listener = vi.fn();
      service.addUpdateListener(listener);
      service.removeUpdateListener(listener);

      service.setTitle('Test Title');

      setTimeout(() => {
        expect(listener).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle listener errors gracefully', done => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();

      service.addUpdateListener(errorListener);
      service.addUpdateListener(goodListener);

      service.setTitle('Test Title');

      setTimeout(() => {
        expect(errorListener).toHaveBeenCalled();
        expect(goodListener).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('debouncing', () => {
    it('should debounce rapid updates', done => {
      const listener = vi.fn();
      service.addUpdateListener(listener);

      // Make rapid updates
      service.setTitle('Title1');
      service.setTitle('Title2');
      service.setTitle('Title3');

      setTimeout(() => {
        // Should only get one update event (the last one)
        expect(listener).toHaveBeenCalledTimes(1);
        const call = listener.mock.calls[0][0];
        expect(call.to).toContain('Title3');
        done();
      }, 100);
    });
  });

  describe('browser compatibility', () => {
    it('should handle document.title assignment failure', () => {
      // Mock document.title to throw error
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        Document.prototype,
        'title'
      );

      Object.defineProperty(document, 'title', {
        set: () => {
          throw new Error('Title assignment failed');
        },
        get: () => 'Failed Title',
        configurable: true,
      });

      expect(() => {
        service.setTitle('Test');
        service.updateDocument();
      }).not.toThrow();

      // Restore original descriptor
      if (originalDescriptor) {
        Object.defineProperty(Document.prototype, 'title', originalDescriptor);
      }
    });
  });

  describe('cleanup', () => {
    it('should cleanup timers and listeners', () => {
      const listener = vi.fn();
      service.addUpdateListener(listener);

      service.setTitle('Test'); // This creates a timer
      service.cleanup();

      // Listeners should be cleared
      expect(service.getState().currentTitle).toBeDefined();

      // Timer should be cleared (no way to directly test, but no errors should occur)
      expect(() => service.cleanup()).not.toThrow();
    });
  });
});
