/**
 * useTheme hook wrapper
 * Provides convenient access to theme functionality
 */

import { useTheme as useNextTheme } from 'next-themes';

/**
 * Custom useTheme hook
 *
 * Wraps next-themes useTheme hook with additional utilities
 *
 * @returns Theme context with utilities
 *
 * @example
 * ```tsx
 * import { useTheme } from '@/app/hooks/useTheme';
 *
 * function ThemeToggle() {
 *   const { theme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const { theme, setTheme, systemTheme, themes, resolvedTheme, forcedTheme } =
    useNextTheme();

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  /**
   * Check if current theme is dark
   */
  const isDark = resolvedTheme === 'dark';

  /**
   * Check if current theme is light
   */
  const isLight = resolvedTheme === 'light';

  /**
   * Check if theme is using system preference
   */
  const isSystem = theme === 'system';

  return {
    // Original next-themes properties
    theme,
    setTheme,
    systemTheme,
    themes,
    resolvedTheme,
    forcedTheme,

    // Additional utilities
    toggleTheme,
    isDark,
    isLight,
    isSystem,
  };
}

/**
 * Export type for useTheme return value
 */
export type UseThemeReturn = ReturnType<typeof useTheme>;

/**
 * Default export
 */
export default useTheme;
