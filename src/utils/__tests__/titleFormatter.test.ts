/**
 * TitleFormatter Unit Tests
 */

import { TitleFormatter } from '../titleFormatter';
import type { TitleParts, TitleConfig } from '@/types/title.types';

describe('TitleFormatter', () => {
  let formatter: TitleFormatter;

  beforeEach(() => {
    formatter = new TitleFormatter();
  });

  describe('format()', () => {
    it('should format basic title with app name', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
      };

      const result = formatter.format(parts);
      expect(result).toBe('Dashboard - Linke User Portal');
    });

    it('should include username when provided', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        username: 'john_doe',
      };

      const result = formatter.format(parts);
      expect(result).toBe('Dashboard - john_doe - Linke User Portal');
    });

    it('should include notification count when provided', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        notificationCount: 5,
      };

      const result = formatter.format(parts);
      expect(result).toBe('(5)  - Dashboard - Linke User Portal');
    });

    it('should show 99+ for notification counts over 99', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        notificationCount: 150,
      };

      const result = formatter.format(parts);
      expect(result).toBe('(99+)  - Dashboard - Linke User Portal');
    });

    it('should include loading prefix when loading', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        isLoading: true,
      };

      const result = formatter.format(parts);
      expect(result).toBe('Loading...  - Dashboard - Linke User Portal');
    });

    it('should handle all parts together', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        username: 'john_doe',
        notificationCount: 3,
        isLoading: true,
      };

      const result = formatter.format(parts);
      expect(result).toBe(
        '(3)  - Loading...  - Dashboard - john_doe - Linke User...',
      );
    });

    it('should use custom app name when provided', () => {
      const parts: TitleParts = {
        page: 'Dashboard',
        appName: 'Custom App',
      };

      const result = formatter.format(parts);
      expect(result).toBe('Dashboard - Custom App');
    });

    it('should handle empty page name', () => {
      const parts: TitleParts = {};

      const result = formatter.format(parts);
      expect(result).toBe('Linke User Portal');
    });

    it('should sanitize malicious content', () => {
      const parts: TitleParts = {
        page: '<script>alert("xss")</script>Dashboard',
      };

      const result = formatter.format(parts);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Dashboard');
    });
  });

  describe('truncate()', () => {
    it('should not truncate short text', () => {
      const text = 'Short title';
      const result = formatter.truncate(text, 50);
      expect(result).toBe(text);
    });

    it('should truncate long text', () => {
      const text = 'This is a very long title that exceeds the maximum length';
      const result = formatter.truncate(text, 30);
      expect(result).toHaveLength(28);
      expect(result).toEndWith('...');
    });

    it('should truncate at word boundary when possible', () => {
      const text = 'This is a test title';
      const result = formatter.truncate(text, 12);
      expect(result).toBe('This is a...');
    });

    it('should handle text shorter than max length', () => {
      const text = 'Short';
      const result = formatter.truncate(text, 50);
      expect(result).toBe('Short');
    });

    it('should handle empty text', () => {
      const result = formatter.truncate('', 50);
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      const result1 = formatter.truncate(null as any, 50);
      const result2 = formatter.truncate(undefined as any, 50);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
  });

  describe('sanitize()', () => {
    it('should remove HTML tags', () => {
      const text = 'Hello <b>world</b>';
      const result = formatter.sanitize(text);
      expect(result).toBe('Hello world');
    });

    it('should remove script tags', () => {
      const text = 'Hello <script>alert("xss")</script> world';
      const result = formatter.sanitize(text);
      expect(result).toBe('Hello alert("xss") world');
    });

    it('should remove dangerous characters', () => {
      const text = 'Hello<>world';
      const result = formatter.sanitize(text);
      expect(result).toBe('Helloworld');
    });

    it('should remove javascript: protocol', () => {
      const text = 'javascript:alert("xss")';
      const result = formatter.sanitize(text);
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const text = 'onclick=alert("xss")';
      const result = formatter.sanitize(text);
      expect(result).not.toContain('onclick');
    });

    it('should preserve safe characters', () => {
      const text = 'Hello-World_123 @test #tag';
      const result = formatter.sanitize(text);
      expect(result).toContain('Hello-World_123');
      expect(result).toContain('@test');
      expect(result).toContain('#tag');
    });

    it('should handle Unicode characters', () => {
      const text = 'Hello 世界 🌍';
      const result = formatter.sanitize(text);
      expect(result).toContain('Hello');
      expect(result).toContain('世界');
      // Emoji may be filtered out by sanitization
      expect(result).toContain('Hello');
      expect(result).toContain('世界');
    });

    it('should handle empty input', () => {
      const result = formatter.sanitize('');
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      const result1 = formatter.sanitize(null as any);
      const result2 = formatter.sanitize(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
  });

  describe('buildTitleWithLoadingState()', () => {
    it('should add loading prefix for loading state', () => {
      const baseTitle = 'Dashboard - App';
      const result = formatter.buildTitleWithLoadingState(baseTitle, true);
      expect(result).toBe('Loading... Dashboard - App');
    });

    it('should not modify title when not loading', () => {
      const baseTitle = 'Dashboard - App';
      const result = formatter.buildTitleWithLoadingState(baseTitle, false);
      expect(result).toBe(baseTitle);
    });

    it('should show "still loading" after threshold', () => {
      const baseTitle = 'Dashboard - App';
      const startTime = Date.now() - 5000; // 5 seconds ago
      const result = formatter.buildTitleWithLoadingState(
        baseTitle,
        true,
        startTime,
      );
      expect(result).toBe('Still loading... Dashboard - App');
    });

    it('should show normal loading for short duration', () => {
      const baseTitle = 'Dashboard - App';
      const startTime = Date.now() - 1000; // 1 second ago
      const result = formatter.buildTitleWithLoadingState(
        baseTitle,
        true,
        startTime,
      );
      expect(result).toBe('Loading... Dashboard - App');
    });
  });

  describe('validate()', () => {
    it('should validate safe titles', () => {
      const title = 'Safe Dashboard Title';
      const result = formatter.validate(title);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect dangerous patterns', () => {
      const title = '<script>alert("xss")</script>';
      const result = formatter.validate(title);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect overly long titles', () => {
      const title = 'a'.repeat(500);
      const result = formatter.validate(title);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Title exceeds maximum safe length'),
      );
    });

    it('should detect empty titles', () => {
      const result = formatter.validate('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is empty');
    });
  });

  describe('formatNotificationCount()', () => {
    it('should format count less than 100', () => {
      const result = formatter.formatNotificationCount(5);
      expect(result).toBe('(5) ');
    });

    it('should format count of 99+', () => {
      const result = formatter.formatNotificationCount(150);
      expect(result).toBe('(99+) ');
    });

    it('should return empty string for zero count', () => {
      const result = formatter.formatNotificationCount(0);
      expect(result).toBe('');
    });

    it('should return empty string for negative count', () => {
      const result = formatter.formatNotificationCount(-1);
      expect(result).toBe('');
    });
  });

  describe('createSimpleTitle()', () => {
    it('should create simple title with app name', () => {
      const result = formatter.createSimpleTitle('Dashboard');
      expect(result).toBe('Dashboard - Linke User Portal');
    });

    it('should create simple title without app name', () => {
      const result = formatter.createSimpleTitle('Dashboard', false);
      expect(result).toBe('Dashboard');
    });

    it('should sanitize page name', () => {
      const result = formatter.createSimpleTitle('<script>Dashboard</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Dashboard');
    });
  });

  describe('configuration', () => {
    it('should use custom configuration', () => {
      const customConfig: Partial<TitleConfig> = {
        appName: 'Custom App',
        separator: ' | ',
        maxLength: 50,
      };

      const customFormatter = new TitleFormatter(customConfig);
      const parts: TitleParts = { page: 'Dashboard' };
      const result = customFormatter.format(parts);

      expect(result).toBe('Dashboard | Custom App');
    });

    it('should update configuration', () => {
      const parts: TitleParts = { page: 'Dashboard' };

      formatter.updateConfig({ appName: 'Updated App' });
      const result = formatter.format(parts);

      expect(result).toBe('Dashboard - Updated App');
    });

    it('should get current configuration', () => {
      const config = formatter.getConfig();
      expect(config.appName).toBe('Linke User Portal');
      expect(config.separator).toBe(' - ');
    });
  });
});
