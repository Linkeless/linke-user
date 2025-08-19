import { useTheme as useNextTheme } from 'next-themes';

/**
 * Custom hook that wraps next-themes useTheme hook for type safety and convenience.
 * Provides access to theme state and methods for changing themes.
 *
 * @returns Object containing theme state and methods:
 * - theme: Current active theme ('light' | 'dark' | 'system')
 * - setTheme: Function to change the theme
 * - resolvedTheme: The resolved theme when using 'system' ('light' | 'dark')
 * - systemTheme: The current system theme ('light' | 'dark')
 * - themes: Array of available themes
 */
export function useTheme() {
  return useNextTheme();
}

export default useTheme;
