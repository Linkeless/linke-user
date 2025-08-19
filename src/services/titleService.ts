/**
 * TitleService singleton
 * Manages document title updates and state
 */

import { TitleFormatter } from '@/utils/titleFormatter';
import { announceNavigation, announceLoading } from '@/utils/titleAnnouncer';
import {
  type TitleState,
  type TitleParts,
  type TitleConfig,
  type TitleUpdateEvent,
  type TitleError,
  TitleErrorType,
  DEFAULT_TITLE_CONFIG,
} from '@/types/title.types';

export class TitleService {
  private static instance: TitleService | null = null;
  private titleState: TitleState;
  private formatter: TitleFormatter;
  private updateTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(event: TitleUpdateEvent) => void> = new Set();
  private isSupported: boolean = true;

  private constructor(config?: Partial<TitleConfig>) {
    this.formatter = new TitleFormatter(config);
    this.titleState = {
      currentTitle: document.title || DEFAULT_TITLE_CONFIG.appName,
      baseTitle: DEFAULT_TITLE_CONFIG.appName,
      isLoading: false,
      notificationCount: 0,
      lastUpdate: Date.now(),
    };

    // Check for document.title support
    this.checkBrowserSupport();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<TitleConfig>): TitleService {
    if (!TitleService.instance) {
      TitleService.instance = new TitleService(config);
    }
    return TitleService.instance;
  }

  /**
   * Reset singleton instance (mainly for testing)
   */
  static resetInstance(): void {
    if (TitleService.instance) {
      TitleService.instance.cleanup();
      TitleService.instance = null;
    }
  }

  /**
   * Check browser support for document.title
   */
  private checkBrowserSupport(): void {
    try {
      const testTitle = 'test';
      document.title = testTitle;
      this.isSupported = document.title === testTitle;
      document.title = this.titleState.currentTitle;
    } catch (error) {
      this.isSupported = false;
      console.warn('Browser does not support document.title updates:', error);
    }
  }

  /**
   * Set the page title
   */
  setTitle(title: string): void {
    const sanitizedTitle = this.formatter.sanitize(title);
    this.titleState.baseTitle = sanitizedTitle;
    this.scheduleUpdate();
  }

  /**
   * Set loading state
   */
  setLoadingState(isLoading: boolean): void {
    if (this.titleState.isLoading !== isLoading) {
      this.titleState.isLoading = isLoading;
      if (isLoading) {
        this.titleState.loadingStartTime = Date.now();
      } else {
        this.titleState.loadingStartTime = undefined;
      }
      this.scheduleUpdate();
    }
  }

  /**
   * Set notification count
   */
  setNotificationCount(count: number): void {
    const safeCount = Math.max(0, Math.floor(count));
    if (this.titleState.notificationCount !== safeCount) {
      this.titleState.notificationCount = safeCount;
      this.scheduleUpdate();
    }
  }

  /**
   * Set user context
   */
  setUserContext(username?: string): void {
    const sanitizedUsername = username
      ? this.formatter.sanitize(username)
      : undefined;
    if (this.titleState.username !== sanitizedUsername) {
      this.titleState.username = sanitizedUsername;
      this.scheduleUpdate();
    }
  }

  /**
   * Format title with current state
   */
  formatTitle(parts: TitleParts): string {
    return this.formatter.format(parts);
  }

  /**
   * Sanitize title for safety
   */
  sanitizeTitle(title: string): string {
    return this.formatter.sanitize(title);
  }

  /**
   * Schedule debounced update
   */
  private scheduleUpdate(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    this.updateTimer = setTimeout(() => {
      this.updateDocument();
      this.updateTimer = null;
    }, 50); // 50ms debounce
  }

  /**
   * Update the document title
   */
  updateDocument(): void {
    try {
      const parts: TitleParts = {
        page: this.titleState.baseTitle,
        username: this.titleState.username,
        notificationCount: this.titleState.notificationCount,
        isLoading: this.titleState.isLoading,
      };

      let newTitle = this.formatter.format(parts);

      // Handle extended loading state
      if (this.titleState.isLoading && this.titleState.loadingStartTime) {
        newTitle = this.formatter.buildTitleWithLoadingState(
          newTitle,
          true,
          this.titleState.loadingStartTime,
        );
      }

      // Only update if title has changed
      if (newTitle !== this.titleState.currentTitle) {
        const previousTitle = this.titleState.currentTitle;

        if (this.isSupported) {
          document.title = newTitle;
        } else {
          this.updateTitleFallback(newTitle);
        }

        this.titleState.currentTitle = newTitle;
        this.titleState.lastUpdate = Date.now();

        // Announce title change for accessibility
        this.announceAccessibility(newTitle, previousTitle);

        // Emit update event
        this.emitUpdateEvent({
          from: previousTitle,
          to: newTitle,
          timestamp: this.titleState.lastUpdate,
          source: this.determineUpdateSource(),
        });
      }
    } catch (error) {
      this.handleError({
        type: TitleErrorType.UPDATE_FAILED,
        message: 'Failed to update document title',
        originalError: error as Error,
        context: { state: this.titleState },
      });
    }
  }

  /**
   * Fallback method for updating title in unsupported browsers
   */
  private updateTitleFallback(title: string): void {
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Determine the source of the update
   */
  private determineUpdateSource():
    | 'route'
    | 'manual'
    | 'loading'
    | 'notification' {
    if (this.titleState.isLoading) {
      return 'loading';
    }
    if (this.titleState.notificationCount > 0) {
      return 'notification';
    }
    return 'manual';
  }

  /**
   * Add update event listener
   */
  addUpdateListener(listener: (event: TitleUpdateEvent) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove update event listener
   */
  removeUpdateListener(listener: (event: TitleUpdateEvent) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit update event to listeners
   */
  private emitUpdateEvent(event: TitleUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in title update listener:', error);
      }
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: TitleError): void {
    console.error(`[TitleService] ${error.type}: ${error.message}`, error);
    // Could emit error events here if needed
  }

  /**
   * Get current state
   */
  getState(): Readonly<TitleState> {
    return { ...this.titleState };
  }

  /**
   * Get current title
   */
  getCurrentTitle(): string {
    return this.titleState.currentTitle;
  }

  /**
   * Update with title parts directly
   */
  updateWithParts(parts: TitleParts): void {
    if (parts.page !== undefined) {
      this.setTitle(parts.page);
    }
    if (parts.username !== undefined) {
      this.setUserContext(parts.username);
    }
    if (parts.notificationCount !== undefined) {
      this.setNotificationCount(parts.notificationCount);
    }
    if (parts.isLoading !== undefined) {
      this.setLoadingState(parts.isLoading);
    }
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.titleState = {
      currentTitle: DEFAULT_TITLE_CONFIG.appName,
      baseTitle: DEFAULT_TITLE_CONFIG.appName,
      isLoading: false,
      notificationCount: 0,
      lastUpdate: Date.now(),
    };
    this.updateDocument();
  }

  /**
   * Announce accessibility information
   */
  private announceAccessibility(newTitle: string, previousTitle: string): void {
    try {
      const source = this.determineUpdateSource();

      switch (source) {
        case 'loading': {
          const isLoading = this.titleState.isLoading;
          announceLoading(isLoading, this.titleState.baseTitle);
          break;
        }

        case 'route':
        case 'manual': {
          // Clean title for announcement (remove app name)
          const cleanTitle = newTitle.replace(/ - Linke User Portal$/, '');
          announceNavigation(cleanTitle, previousTitle);
          break;
        }

        // Don't announce notification changes as they can be repetitive
        case 'notification':
        default:
          break;
      }
    } catch (error) {
      // Silently fail accessibility announcements to not break main functionality
      console.warn('[TitleService] Accessibility announcement failed:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    this.listeners.clear();
  }
}
