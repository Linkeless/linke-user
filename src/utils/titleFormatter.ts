/**
 * TitleFormatter utility class
 * Handles title formatting, truncation, and sanitization
 */

import {
  type TitleConfig,
  type TitleParts,
  DEFAULT_TITLE_CONFIG,
} from '@/types/title.types';

export class TitleFormatter {
  private config: TitleConfig;

  constructor(config?: Partial<TitleConfig>) {
    this.config = {
      ...DEFAULT_TITLE_CONFIG,
      ...config,
    };
  }

  /**
   * Format title parts into a complete title string
   */
  format(parts: TitleParts): string {
    const segments: string[] = [];

    // Add notification count if present
    if (parts.notificationCount && parts.notificationCount > 0) {
      const count =
        parts.notificationCount > 99
          ? '99+'
          : parts.notificationCount.toString();
      segments.push(this.config.notificationFormat.replace('%count%', count));
    }

    // Add loading prefix if loading
    if (parts.isLoading) {
      segments.push(this.config.loadingPrefix);
    }

    // Add page title if present
    if (parts.page) {
      segments.push(this.sanitize(parts.page));
    }

    // Add username if present
    if (parts.username) {
      const truncatedUsername = this.truncate(
        parts.username,
        this.config.usernameMaxLength,
      );
      segments.push(this.sanitize(truncatedUsername));
    }

    // Add app name (use provided or default)
    const appName = parts.appName || this.config.appName;
    segments.push(appName);

    // Join segments and ensure max length
    const fullTitle = segments.filter(Boolean).join(this.config.separator);

    return this.truncate(fullTitle, this.config.maxLength);
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text || '';
    }

    // Try to truncate at word boundary
    const truncated = text.substring(
      0,
      maxLength - this.config.truncationSuffix.length,
    );
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > maxLength * 0.8) {
      // If we have a space reasonably close to the end, truncate there
      return (
        truncated.substring(0, lastSpaceIndex) + this.config.truncationSuffix
      );
    }

    // Otherwise just truncate at character boundary
    return truncated + this.config.truncationSuffix;
  }

  /**
   * Sanitize text to prevent XSS attacks
   * Removes HTML tags and dangerous characters
   */
  sanitize(text: string): string {
    if (!text) {
      return '';
    }

    // Remove HTML tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Remove dangerous characters and scripts
    sanitized = sanitized
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/&(?!(amp|lt|gt|quot|#39|#x27|#x2F|#x60|#x3D);)/g, '&amp;'); // Escape unescaped ampersands

    // Decode HTML entities to prevent double encoding
    const textarea = document.createElement('textarea');
    textarea.innerHTML = sanitized;
    sanitized = textarea.value;

    // Final cleanup - keep only safe characters
    // Allow: letters, numbers, spaces, common punctuation, and common symbols
    sanitized = sanitized.replace(
      /[^\w\s\-.,!?'"@#$%&*()+=:;/\\|[\]{}~`\u4e00-\u9fa5]/g,
      '',
    );

    // Trim whitespace
    return sanitized.trim();
  }

  /**
   * Build title string with loading state consideration
   */
  buildTitleWithLoadingState(
    baseTitle: string,
    isLoading: boolean,
    loadingStartTime?: number,
  ): string {
    if (!isLoading) {
      return baseTitle;
    }

    const now = Date.now();
    const loadingDuration = loadingStartTime ? now - loadingStartTime : 0;

    let prefix = this.config.loadingPrefix;
    if (loadingDuration > this.config.stillLoadingThreshold) {
      prefix = this.config.stillLoadingPrefix;
    }

    return prefix + baseTitle;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TitleConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): TitleConfig {
    return { ...this.config };
  }

  /**
   * Validate title for safety and length
   */
  validate(title: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!title) {
      errors.push('Title is empty');
    }

    if (title && title.length > this.config.maxLength * 2) {
      errors.push(
        `Title exceeds maximum safe length (${this.config.maxLength * 2})`,
      );
    }

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<img.*?onerror/i,
    ];

    for (const pattern of xssPatterns) {
      if (title && pattern.test(title)) {
        errors.push(`Potential XSS pattern detected: ${pattern}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format notification count for display
   */
  formatNotificationCount(count: number): string {
    if (count <= 0) {
      return '';
    }

    const displayCount = count > 99 ? '99+' : count.toString();
    return this.config.notificationFormat.replace('%count%', displayCount);
  }

  /**
   * Create a simple title without special formatting
   */
  createSimpleTitle(page: string, includeAppName: boolean = true): string {
    const parts = [this.sanitize(page)];

    if (includeAppName) {
      parts.push(this.config.appName);
    }

    return parts.join(this.config.separator);
  }
}
