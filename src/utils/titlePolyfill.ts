/**
 * Title Polyfill for Browser Compatibility
 * Provides fallbacks for older browsers and feature detection
 */

/**
 * Browser support information
 */
interface BrowserSupport {
  hasDocumentTitle: boolean;
  hasTitleElement: boolean;
  supportsPropertyDescriptor: boolean;
  browserName: string;
  browserVersion: string;
  isSupported: boolean;
}

/**
 * Polyfill configuration
 */
interface PolyfillConfig {
  /** Whether to log warnings for unsupported features */
  logWarnings: boolean;
  /** Whether to use fallback methods automatically */
  useAutomaticFallback: boolean;
  /** Custom title update function */
  customTitleUpdater?: (title: string) => void;
}

/**
 * Default polyfill configuration
 */
const DEFAULT_CONFIG: PolyfillConfig = {
  logWarnings: true,
  useAutomaticFallback: true,
  customTitleUpdater: undefined,
};

/**
 * Browser support detection results
 */
let browserSupport: BrowserSupport | null = null;

/**
 * Current polyfill configuration
 */
let config: PolyfillConfig = DEFAULT_CONFIG;

/**
 * Original document.title descriptor (if it exists)
 */
let originalTitleDescriptor: PropertyDescriptor | undefined;

/**
 * Detect browser support for title-related features
 */
function detectBrowserSupport(): BrowserSupport {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  // Detect browser
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('MSIE')) {
    browserName = 'Internet Explorer';
    const match = userAgent.match(/MSIE (\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  // Test document.title support
  let hasDocumentTitle = false;
  try {
    const testTitle = 'test_title_support';
    const originalTitle = document.title;
    document.title = testTitle;
    hasDocumentTitle = document.title === testTitle;
    document.title = originalTitle;
  } catch (_error) {
    hasDocumentTitle = false;
  }

  // Test title element support
  const hasTitleElement = !!document.querySelector('title');

  // Test property descriptor support
  let supportsPropertyDescriptor = false;
  try {
    supportsPropertyDescriptor =
      typeof Object.getOwnPropertyDescriptor === 'function' &&
      typeof Object.defineProperty === 'function';
  } catch (_error) {
    supportsPropertyDescriptor = false;
  }

  // Determine if browser is supported
  const supportedBrowsers = {
    Chrome: 90,
    Firefox: 88,
    Safari: 14,
    Edge: 90,
  };

  const minVersion =
    supportedBrowsers[browserName as keyof typeof supportedBrowsers];
  const currentVersion = parseInt(browserVersion, 10);
  const isSupported = minVersion
    ? currentVersion >= minVersion
    : hasDocumentTitle;

  return {
    hasDocumentTitle,
    hasTitleElement,
    supportsPropertyDescriptor,
    browserName,
    browserVersion,
    isSupported,
  };
}

/**
 * Fallback method to update title using title element
 */
function updateTitleElement(title: string): boolean {
  try {
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.textContent = title;
      return true;
    }

    // Create title element if it doesn't exist
    const newTitleElement = document.createElement('title');
    newTitleElement.textContent = title;

    const head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      head.appendChild(newTitleElement);
      return true;
    }
  } catch (error) {
    if (config.logWarnings) {
      console.warn('[TitlePolyfill] Failed to update title element:', error);
    }
  }

  return false;
}

/**
 * Fallback method using document.title with error handling
 */
function updateDocumentTitle(title: string): boolean {
  try {
    document.title = title;
    return document.title === title;
  } catch (error) {
    if (config.logWarnings) {
      console.warn('[TitlePolyfill] Failed to update document.title:', error);
    }
    return false;
  }
}

/**
 * Enhanced title update with multiple fallback methods
 */
function enhancedTitleUpdate(title: string): boolean {
  // Try custom updater first
  if (config.customTitleUpdater) {
    try {
      config.customTitleUpdater(title);
      return true;
    } catch (error) {
      if (config.logWarnings) {
        console.warn('[TitlePolyfill] Custom title updater failed:', error);
      }
    }
  }

  // Try document.title
  if (browserSupport?.hasDocumentTitle && updateDocumentTitle(title)) {
    return true;
  }

  // Try title element fallback
  if (browserSupport?.hasTitleElement && updateTitleElement(title)) {
    return true;
  }

  // Last resort: try both methods
  const titleElementSuccess = updateTitleElement(title);
  const documentTitleSuccess = updateDocumentTitle(title);

  return titleElementSuccess || documentTitleSuccess;
}

/**
 * Install polyfill for document.title
 */
function installTitlePolyfill(): void {
  if (!browserSupport) {
    browserSupport = detectBrowserSupport();
  }

  // Skip if browser has good support
  if (browserSupport.isSupported && browserSupport.hasDocumentTitle) {
    return;
  }

  if (config.logWarnings) {
    console.warn(
      `[TitlePolyfill] Browser ${browserSupport.browserName} ${browserSupport.browserVersion} ` +
        'has limited title support. Installing polyfill...',
    );
  }

  // Store original descriptor if available
  if (browserSupport.supportsPropertyDescriptor) {
    try {
      originalTitleDescriptor =
        Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
        Object.getOwnPropertyDescriptor(document, 'title');
    } catch (_error) {
      // Ignore errors
    }
  }

  // Install polyfill
  try {
    if (browserSupport.supportsPropertyDescriptor) {
      // Use property descriptor for modern browsers
      Object.defineProperty(document, 'title', {
        get(): string {
          const titleElement = document.querySelector('title');
          return titleElement ? titleElement.textContent || '' : '';
        },
        set(value: string) {
          if (!enhancedTitleUpdate(value) && config.logWarnings) {
            console.warn('[TitlePolyfill] All title update methods failed');
          }
        },
        configurable: true,
        enumerable: true,
      });
    } else {
      // Fallback for very old browsers
      const originalTitle = document.title;
      (document as any).__titlePolyfill = true;

      // Override the title property if possible
      if (typeof document.title !== 'undefined') {
        let currentTitle = originalTitle;

        // Create getter/setter functions
        (document as any).__getTitlePolyfill = () => currentTitle;
        (document as any).__setTitlePolyfill = (value: string) => {
          currentTitle = value;
          enhancedTitleUpdate(value);
        };
      }
    }
  } catch (error) {
    if (config.logWarnings) {
      console.error('[TitlePolyfill] Failed to install polyfill:', error);
    }
  }
}

/**
 * Uninstall polyfill and restore original functionality
 */
function uninstallTitlePolyfill(): void {
  if (!browserSupport || browserSupport.isSupported) {
    return;
  }

  try {
    if (originalTitleDescriptor && browserSupport.supportsPropertyDescriptor) {
      Object.defineProperty(document, 'title', originalTitleDescriptor);
    } else {
      // Clean up fallback properties
      delete (document as any).__titlePolyfill;
      delete (document as any).__getTitlePolyfill;
      delete (document as any).__setTitlePolyfill;
    }
  } catch (error) {
    if (config.logWarnings) {
      console.warn('[TitlePolyfill] Failed to uninstall polyfill:', error);
    }
  }
}

/**
 * Initialize title polyfill with configuration
 */
export function initializeTitlePolyfill(
  userConfig: Partial<PolyfillConfig> = {},
): BrowserSupport {
  config = { ...DEFAULT_CONFIG, ...userConfig };

  if (!browserSupport) {
    browserSupport = detectBrowserSupport();
  }

  if (config.logWarnings) {
    console.log('[TitlePolyfill] Browser support:', browserSupport);
  }

  if (config.useAutomaticFallback && !browserSupport.isSupported) {
    installTitlePolyfill();
  }

  return browserSupport;
}

/**
 * Get current browser support information
 */
export function getBrowserSupport(): BrowserSupport {
  if (!browserSupport) {
    browserSupport = detectBrowserSupport();
  }
  return browserSupport;
}

/**
 * Test if title functionality is working
 */
export function testTitleFunctionality(): boolean {
  const testTitle = `test_${Date.now()}`;
  const originalTitle = document.title;

  try {
    document.title = testTitle;
    const success = document.title === testTitle;
    document.title = originalTitle;
    return success;
  } catch (_error) {
    return false;
  }
}

/**
 * Manually update title with polyfill
 */
export function polyfillUpdateTitle(title: string): boolean {
  return enhancedTitleUpdate(title);
}

/**
 * Get current polyfill configuration
 */
export function getPolyfillConfig(): PolyfillConfig {
  return { ...config };
}

/**
 * Update polyfill configuration
 */
export function updatePolyfillConfig(newConfig: Partial<PolyfillConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Check if polyfill is currently installed
 */
export function isPolyfillInstalled(): boolean {
  return (
    (document as any).__titlePolyfill === true ||
    originalTitleDescriptor !== undefined
  );
}

/**
 * Force reinstall polyfill
 */
export function reinstallPolyfill(): void {
  uninstallTitlePolyfill();
  installTitlePolyfill();
}

/**
 * Clean up polyfill on page unload
 */
export function cleanupPolyfill(): void {
  uninstallTitlePolyfill();
  browserSupport = null;
  originalTitleDescriptor = undefined;
}

// Auto-initialize with default settings if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Initialize on DOM ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeTitlePolyfill();
    });
  } else {
    initializeTitlePolyfill();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanupPolyfill);
}

// Export types
export type { BrowserSupport, PolyfillConfig };
