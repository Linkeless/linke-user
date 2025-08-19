/**
 * Title Sanitizer Utility
 * Comprehensive XSS prevention and content sanitization for title strings
 */

/**
 * Sanitization configuration options
 */
interface SanitizationConfig {
  /** Maximum allowed title length */
  maxLength: number;
  /** Whether to allow Unicode characters */
  allowUnicode: boolean;
  /** Whether to allow emoji characters */
  allowEmoji: boolean;
  /** Custom whitelist of allowed characters */
  customWhitelist?: string;
  /** Whether to preserve original whitespace */
  preserveWhitespace: boolean;
  /** Whether to log sanitization warnings */
  logWarnings: boolean;
}

/**
 * Sanitization result with details
 */
interface SanitizationResult {
  /** The sanitized string */
  sanitized: string;
  /** Whether any changes were made */
  wasModified: boolean;
  /** List of issues found and resolved */
  issues: string[];
  /** Original string length */
  originalLength: number;
  /** Final string length */
  finalLength: number;
}

/**
 * Default sanitization configuration
 */
const DEFAULT_CONFIG: SanitizationConfig = {
  maxLength: 200, // Conservative maximum
  allowUnicode: true,
  allowEmoji: true,
  preserveWhitespace: false,
  logWarnings: false,
};

/**
 * Dangerous patterns that should be removed
 */
const DANGEROUS_PATTERNS = [
  // Script injections
  /<script[\s\S]*?<\/script>/gi,
  /<script[^>]*>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,

  // HTML injection
  /<iframe[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?<\/embed>/gi,
  /<applet[\s\S]*?<\/applet>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /<style[\s\S]*?<\/style>/gi,

  // Data URLs and base64
  /data\s*:\s*[^;]+;base64/gi,
  /data\s*:\s*text\/html/gi,

  // Expression and eval
  /expression\s*\(/gi,
  /eval\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,

  // Event handlers
  /on\w+\s*=/gi,

  // Form elements
  /<form[\s\S]*?<\/form>/gi,
  /<input[^>]*>/gi,
  /<textarea[\s\S]*?<\/textarea>/gi,
  /<select[\s\S]*?<\/select>/gi,
];

/**
 * HTML entities map for decoding
 */
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#x2F;': '/',
  '&#x60;': '`',
  '&#x3D;': '=',
  '&nbsp;': ' ',
  '&apos;': "'",
};

/**
 * Character classification utilities
 */
const CharacterSets = {
  // Basic ASCII characters
  basicASCII: /^[\x20-\x7E]*$/,

  // Alphanumeric with basic punctuation
  alphanumericPunctuation: /^[a-zA-Z0-9\s\-.,!?'"@#$%&*()+=:;/\\|[\]{}~`]*$/,

  // Unicode letters and numbers
  unicodeLetters: /\p{L}/gu,
  unicodeNumbers: /\p{N}/gu,

  // Emoji characters
  emoji: /\p{Emoji}/gu,

  // Control characters (to be removed)
  // eslint-disable-next-line no-control-regex
  controlChars: /[\u0000-\u001F\u007F]/g,

  // HTML-like patterns
  htmlTags: /<[^>]*>/g,

  // Suspicious URL patterns
  urlLike: /(https?|ftp|file|data|javascript|vbscript):/gi,
};

/**
 * Comprehensive title sanitizer class
 */
export class TitleSanitizer {
  private config: SanitizationConfig;

  constructor(config: Partial<SanitizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main sanitization method
   */
  sanitize(input: string): string {
    const result = this.sanitizeWithDetails(input);
    return result.sanitized;
  }

  /**
   * Sanitization with detailed results
   */
  sanitizeWithDetails(input: string): SanitizationResult {
    if (typeof input !== 'string') {
      return {
        sanitized: '',
        wasModified: true,
        issues: ['Input is not a string'],
        originalLength: 0,
        finalLength: 0,
      };
    }

    const originalLength = input.length;
    const issues: string[] = [];
    let current = input;
    let wasModified = false;

    // Step 1: Remove dangerous patterns
    const {
      sanitized: step1,
      modified: mod1,
      issues: iss1,
    } = this.removeDangerousPatterns(current);
    current = step1;
    wasModified = wasModified || mod1;
    issues.push(...iss1);

    // Step 2: Decode HTML entities
    const {
      sanitized: step2,
      modified: mod2,
      issues: iss2,
    } = this.decodeHtmlEntities(current);
    current = step2;
    wasModified = wasModified || mod2;
    issues.push(...iss2);

    // Step 3: Remove HTML tags
    const {
      sanitized: step3,
      modified: mod3,
      issues: iss3,
    } = this.removeHtmlTags(current);
    current = step3;
    wasModified = wasModified || mod3;
    issues.push(...iss3);

    // Step 4: Remove control characters
    const {
      sanitized: step4,
      modified: mod4,
      issues: iss4,
    } = this.removeControlCharacters(current);
    current = step4;
    wasModified = wasModified || mod4;
    issues.push(...iss4);

    // Step 5: Apply character whitelist
    const {
      sanitized: step5,
      modified: mod5,
      issues: iss5,
    } = this.applyCharacterWhitelist(current);
    current = step5;
    wasModified = wasModified || mod5;
    issues.push(...iss5);

    // Step 6: Normalize whitespace
    const {
      sanitized: step6,
      modified: mod6,
      issues: iss6,
    } = this.normalizeWhitespace(current);
    current = step6;
    wasModified = wasModified || mod6;
    issues.push(...iss6);

    // Step 7: Enforce length limit
    const {
      sanitized: final,
      modified: mod7,
      issues: iss7,
    } = this.enforceLengthLimit(current);
    current = final;
    wasModified = wasModified || mod7;
    issues.push(...iss7);

    // Log warnings if enabled
    if (this.config.logWarnings && issues.length > 0) {
      console.warn('[TitleSanitizer] Sanitization issues found:', issues);
    }

    return {
      sanitized: current,
      wasModified,
      issues,
      originalLength,
      finalLength: current.length,
    };
  }

  /**
   * Remove dangerous patterns
   */
  private removeDangerousPatterns(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    let sanitized = input;
    const issues: string[] = [];
    let modified = false;

    for (const pattern of DANGEROUS_PATTERNS) {
      const matches = sanitized.match(pattern);
      if (matches) {
        sanitized = sanitized.replace(pattern, '');
        modified = true;
        issues.push(`Removed dangerous pattern: ${pattern.toString()}`);
      }
    }

    return { sanitized, modified, issues };
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    let sanitized = input;
    let modified = false;
    const issues: string[] = [];

    // Decode common HTML entities
    for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
      if (sanitized.includes(entity)) {
        sanitized = sanitized.replace(new RegExp(entity, 'g'), replacement);
        modified = true;
      }
    }

    // Decode numeric entities
    const numericEntities = sanitized.match(/&#\d+;/g);
    if (numericEntities) {
      for (const entity of numericEntities) {
        const code = parseInt(entity.slice(2, -1), 10);
        if (code > 0 && code < 1114111) {
          // Valid Unicode range
          const char = String.fromCharCode(code);
          sanitized = sanitized.replace(entity, char);
          modified = true;
        }
      }
    }

    // Decode hex entities
    const hexEntities = sanitized.match(/&#x[0-9a-fA-F]+;/g);
    if (hexEntities) {
      for (const entity of hexEntities) {
        const code = parseInt(entity.slice(3, -1), 16);
        if (code > 0 && code < 1114111) {
          // Valid Unicode range
          const char = String.fromCharCode(code);
          sanitized = sanitized.replace(entity, char);
          modified = true;
        }
      }
    }

    if (modified) {
      issues.push('Decoded HTML entities');
    }

    return { sanitized, modified, issues };
  }

  /**
   * Remove HTML tags
   */
  private removeHtmlTags(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    const sanitized = input.replace(CharacterSets.htmlTags, '');
    const modified = sanitized !== input;
    const issues = modified ? ['Removed HTML tags'] : [];

    return { sanitized, modified, issues };
  }

  /**
   * Remove control characters
   */
  private removeControlCharacters(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    const sanitized = input.replace(CharacterSets.controlChars, '');
    const modified = sanitized !== input;
    const issues = modified ? ['Removed control characters'] : [];

    return { sanitized, modified, issues };
  }

  /**
   * Apply character whitelist
   */
  private applyCharacterWhitelist(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    let sanitized = input;
    const issues: string[] = [];
    let modified = false;

    if (this.config.customWhitelist) {
      // Use custom whitelist
      const pattern = new RegExp(`[^${this.config.customWhitelist}]`, 'g');
      sanitized = sanitized.replace(pattern, '');
      modified = sanitized !== input;
      if (modified) {
        issues.push('Applied custom character whitelist');
      }
    } else {
      // Use default character filtering
      let filtered = '';
      for (const char of sanitized) {
        if (this.isAllowedCharacter(char)) {
          filtered += char;
        } else {
          modified = true;
        }
      }
      sanitized = filtered;
      if (modified) {
        issues.push('Filtered disallowed characters');
      }
    }

    return { sanitized, modified, issues };
  }

  /**
   * Check if character is allowed
   */
  private isAllowedCharacter(char: string): boolean {
    // Always allow basic alphanumeric and common punctuation
    if (/[a-zA-Z0-9\s\-.,!?'"()[\]{}]/.test(char)) {
      return true;
    }

    // Check Unicode letters if allowed
    if (this.config.allowUnicode && CharacterSets.unicodeLetters.test(char)) {
      return true;
    }

    // Check Unicode numbers if allowed
    if (this.config.allowUnicode && CharacterSets.unicodeNumbers.test(char)) {
      return true;
    }

    // Check emoji if allowed
    if (this.config.allowEmoji && CharacterSets.emoji.test(char)) {
      return true;
    }

    // Allow additional safe punctuation
    if (/[@#$%&*+=:;/\\|~`]/.test(char)) {
      return true;
    }

    return false;
  }

  /**
   * Normalize whitespace
   */
  private normalizeWhitespace(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    if (this.config.preserveWhitespace) {
      return { sanitized: input, modified: false, issues: [] };
    }

    // Replace multiple whitespace with single space and trim
    const sanitized = input.replace(/\s+/g, ' ').trim();
    const modified = sanitized !== input;
    const issues = modified ? ['Normalized whitespace'] : [];

    return { sanitized, modified, issues };
  }

  /**
   * Enforce length limit
   */
  private enforceLengthLimit(input: string): {
    sanitized: string;
    modified: boolean;
    issues: string[];
  } {
    if (input.length <= this.config.maxLength) {
      return { sanitized: input, modified: false, issues: [] };
    }

    // Try to truncate at word boundary
    let sanitized = input.substring(0, this.config.maxLength);
    const lastSpace = sanitized.lastIndexOf(' ');

    if (lastSpace > this.config.maxLength * 0.8) {
      sanitized = sanitized.substring(0, lastSpace);
    }

    return {
      sanitized: sanitized.trim(),
      modified: true,
      issues: [
        `Truncated from ${input.length} to ${sanitized.length} characters`,
      ],
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SanitizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SanitizationConfig {
    return { ...this.config };
  }
}

/**
 * Default sanitizer instance
 */
export const defaultSanitizer = new TitleSanitizer();

/**
 * Quick sanitization function using default settings
 */
export function sanitizeTitle(input: string): string {
  return defaultSanitizer.sanitize(input);
}

/**
 * Sanitization with detailed results using default settings
 */
export function sanitizeTitleWithDetails(input: string): SanitizationResult {
  return defaultSanitizer.sanitizeWithDetails(input);
}

/**
 * Create a sanitizer with custom configuration
 */
export function createSanitizer(
  config: Partial<SanitizationConfig>
): TitleSanitizer {
  return new TitleSanitizer(config);
}

/**
 * Validate if a string is safe for use as a title
 */
export function isValidTitle(input: string): boolean {
  const result = defaultSanitizer.sanitizeWithDetails(input);
  return !result.wasModified;
}

/**
 * Get a list of potential security issues in a title
 */
export function analyzeTitle(input: string): string[] {
  const result = defaultSanitizer.sanitizeWithDetails(input);
  return result.issues;
}

// Export types
export type { SanitizationConfig, SanitizationResult };
