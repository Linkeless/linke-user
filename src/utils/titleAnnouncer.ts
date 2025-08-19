/**
 * Title Announcer Utility
 * Screen reader announcements and accessibility support for title changes
 */

/**
 * Announcement configuration
 */
interface AnnouncementConfig {
  /** Whether announcements are enabled */
  enabled: boolean;
  /** Politeness level for screen readers */
  politeness: 'off' | 'polite' | 'assertive';
  /** Delay before announcement in milliseconds */
  delay: number;
  /** Duration to keep announcement element in DOM */
  duration: number;
  /** Whether to announce loading state changes */
  announceLoading: boolean;
  /** Whether to announce notification count changes */
  announceNotifications: boolean;
  /** Custom announcement format function */
  customFormatter?: (title: string, context: AnnouncementContext) => string;
  /** Whether to log announcement activity */
  debug: boolean;
}

/**
 * Announcement context information
 */
interface AnnouncementContext {
  /** Previous title */
  previousTitle?: string;
  /** Current title */
  currentTitle: string;
  /** Type of change */
  changeType: 'navigation' | 'loading' | 'notification' | 'manual';
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Live region types
 */
type LiveRegionType = 'status' | 'alert' | 'log' | 'marquee' | 'timer';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AnnouncementConfig = {
  enabled: true,
  politeness: 'polite',
  delay: 100,
  duration: 1500,
  announceLoading: true,
  announceNotifications: true,
  debug: false,
};

/**
 * Live region manager for screen reader announcements
 */
class LiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();
  private config: AnnouncementConfig;

  constructor(config: AnnouncementConfig) {
    this.config = config;
    this.initializeRegions();
  }

  /**
   * Initialize default live regions
   */
  private initializeRegions(): void {
    this.createLiveRegion('main', 'status', this.config.politeness);
    this.createLiveRegion('navigation', 'status', 'polite');
    this.createLiveRegion('alerts', 'alert', 'assertive');
  }

  /**
   * Create a live region element
   */
  private createLiveRegion(
    id: string,
    role: LiveRegionType,
    ariaPoliteness: 'off' | 'polite' | 'assertive',
  ): HTMLElement {
    // Remove existing region if it exists
    this.removeLiveRegion(id);

    const region = document.createElement('div');
    region.id = `title-announcer-${id}`;
    region.className = 'sr-only title-announcer-region';
    region.setAttribute('role', role);
    region.setAttribute('aria-live', ariaPoliteness);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('aria-relevant', 'additions text');

    // Style to be invisible but accessible to screen readers
    Object.assign(region.style, {
      position: 'absolute',
      left: '-10000px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
      margin: '0',
      padding: '0',
    });

    document.body.appendChild(region);
    this.regions.set(id, region);

    if (this.config.debug) {
      console.log(
        `[TitleAnnouncer] Created live region: ${id} (${role}, ${ariaPoliteness})`,
      );
    }

    return region;
  }

  /**
   * Remove a live region
   */
  private removeLiveRegion(id: string): void {
    const existing = this.regions.get(id);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
      this.regions.delete(id);
    }
  }

  /**
   * Announce text in a specific region
   */
  announce(text: string, regionId: string = 'main'): void {
    if (!this.config.enabled || !text.trim()) {
      return;
    }

    const region = this.regions.get(regionId);
    if (!region) {
      if (this.config.debug) {
        console.warn(`[TitleAnnouncer] Live region not found: ${regionId}`);
      }
      return;
    }

    // Clear previous content after a short delay to allow screen readers to process
    setTimeout(() => {
      region.textContent = '';

      // Add new content after clearing
      setTimeout(() => {
        region.textContent = text;

        if (this.config.debug) {
          console.log(`[TitleAnnouncer] Announced in ${regionId}: "${text}"`);
        }

        // Clear content after duration
        setTimeout(() => {
          if (region.textContent === text) {
            region.textContent = '';
          }
        }, this.config.duration);
      }, 10);
    }, this.config.delay);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnnouncementConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Recreate regions if politeness changed
    if (newConfig.politeness) {
      this.initializeRegions();
    }
  }

  /**
   * Cleanup all regions
   */
  cleanup(): void {
    this.regions.forEach((region, id) => {
      this.removeLiveRegion(id);
    });
    this.regions.clear();
  }
}

/**
 * Title announcer class
 */
export class TitleAnnouncer {
  private config: AnnouncementConfig;
  private liveRegionManager: LiveRegionManager;
  private lastAnnouncement: string = '';
  private lastAnnouncementTime: number = 0;

  constructor(config: Partial<AnnouncementConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.liveRegionManager = new LiveRegionManager(this.config);
  }

  /**
   * Announce title change
   */
  announceTitle(context: AnnouncementContext): void {
    if (!this.config.enabled) {
      return;
    }

    const announcement = this.formatAnnouncement(context);

    if (!announcement || announcement === this.lastAnnouncement) {
      return;
    }

    // Prevent rapid duplicate announcements
    const now = Date.now();
    if (now - this.lastAnnouncementTime < 500) {
      return;
    }

    const regionId = this.selectRegion(context);
    this.liveRegionManager.announce(announcement, regionId);

    this.lastAnnouncement = announcement;
    this.lastAnnouncementTime = now;
  }

  /**
   * Format announcement text
   */
  private formatAnnouncement(context: AnnouncementContext): string {
    if (this.config.customFormatter) {
      return this.config.customFormatter(context.currentTitle, context);
    }

    const { currentTitle, changeType, previousTitle: _previousTitle } = context;

    switch (changeType) {
      case 'navigation':
        return `Navigated to ${currentTitle}`;

      case 'loading':
        if (currentTitle.includes('Loading')) {
          return this.config.announceLoading
            ? `Loading ${currentTitle.replace(/^Loading\.{3}\s*/, '')}`
            : '';
        }
        if (currentTitle.includes('Still loading')) {
          return this.config.announceLoading
            ? 'Still loading, please wait'
            : '';
        }
        return '';

      case 'notification': {
        if (!this.config.announceNotifications) {
          return '';
        }

        const notificationMatch = currentTitle.match(/^\((\d+)\)/);
        if (notificationMatch) {
          const count = parseInt(notificationMatch[1], 10);
          return count === 1
            ? '1 new notification'
            : `${count} new notifications`;
        }
        return '';
      }

      case 'manual':
        return `Page title updated to ${currentTitle}`;

      default:
        return `Page title: ${currentTitle}`;
    }
  }

  /**
   * Select appropriate live region based on context
   */
  private selectRegion(context: AnnouncementContext): string {
    switch (context.changeType) {
      case 'navigation':
        return 'navigation';
      case 'loading':
        return 'main';
      case 'notification':
        return 'alerts';
      default:
        return 'main';
    }
  }

  /**
   * Announce loading state
   */
  announceLoading(isLoading: boolean, description?: string): void {
    if (!this.config.announceLoading) {
      return;
    }

    const context: AnnouncementContext = {
      currentTitle: isLoading
        ? `Loading ${description || ''}`
        : 'Loading complete',
      changeType: 'loading',
    };

    this.announceTitle(context);
  }

  /**
   * Announce notification count
   */
  announceNotifications(count: number): void {
    if (!this.config.announceNotifications || count <= 0) {
      return;
    }

    const context: AnnouncementContext = {
      currentTitle: `(${count})`,
      changeType: 'notification',
    };

    this.announceTitle(context);
  }

  /**
   * Announce navigation change
   */
  announceNavigation(newTitle: string, previousTitle?: string): void {
    const context: AnnouncementContext = {
      currentTitle: newTitle,
      previousTitle,
      changeType: 'navigation',
    };

    this.announceTitle(context);
  }

  /**
   * Manual announcement
   */
  announceManual(title: string, metadata?: Record<string, any>): void {
    const context: AnnouncementContext = {
      currentTitle: title,
      changeType: 'manual',
      metadata,
    };

    this.announceTitle(context);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnnouncementConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.liveRegionManager.updateConfig(this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AnnouncementConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.liveRegionManager.cleanup();
  }
}

/**
 * Global announcer instance
 */
let globalAnnouncer: TitleAnnouncer | null = null;

/**
 * Initialize global announcer
 */
export function initializeAnnouncer(
  config: Partial<AnnouncementConfig> = {},
): TitleAnnouncer {
  if (globalAnnouncer) {
    globalAnnouncer.cleanup();
  }

  globalAnnouncer = new TitleAnnouncer(config);
  return globalAnnouncer;
}

/**
 * Get global announcer instance
 */
export function getAnnouncer(): TitleAnnouncer | null {
  return globalAnnouncer;
}

/**
 * Quick announcement using global instance
 */
export function announceTitle(context: AnnouncementContext): void {
  if (!globalAnnouncer) {
    globalAnnouncer = new TitleAnnouncer();
  }
  globalAnnouncer.announceTitle(context);
}

/**
 * Quick loading announcement
 */
export function announceLoading(
  isLoading: boolean,
  description?: string,
): void {
  if (!globalAnnouncer) {
    globalAnnouncer = new TitleAnnouncer();
  }
  globalAnnouncer.announceLoading(isLoading, description);
}

/**
 * Quick notification announcement
 */
export function announceNotifications(count: number): void {
  if (!globalAnnouncer) {
    globalAnnouncer = new TitleAnnouncer();
  }
  globalAnnouncer.announceNotifications(count);
}

/**
 * Quick navigation announcement
 */
export function announceNavigation(
  newTitle: string,
  previousTitle?: string,
): void {
  if (!globalAnnouncer) {
    globalAnnouncer = new TitleAnnouncer();
  }
  globalAnnouncer.announceNavigation(newTitle, previousTitle);
}

/**
 * Check if accessibility features are needed
 */
export function isAccessibilityNeeded(): boolean {
  // Check for screen reader indicators
  const hasScreenReader =
    navigator.userAgent.includes('NVDA') ||
    navigator.userAgent.includes('JAWS') ||
    navigator.userAgent.includes('VoiceOver') ||
    // Check for aria-live support
    'ariaLive' in document.createElement('div') ||
    // Check for prefers-reduced-motion (users who care about accessibility)
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return hasScreenReader;
}

/**
 * Auto-initialize if accessibility is detected
 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Initialize after DOM is ready
  const initializeIfNeeded = () => {
    if (isAccessibilityNeeded()) {
      initializeAnnouncer({
        enabled: true,
        debug: false,
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIfNeeded);
  } else {
    initializeIfNeeded();
  }
}

// Export types
export type { AnnouncementConfig, AnnouncementContext, LiveRegionType };
