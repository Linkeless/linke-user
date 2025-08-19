/**
 * ThemeProvider component
 * Provides theme context for dark/light mode switching
 */

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Props for ThemeProvider component
 */
interface ThemeProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Default theme (defaults to 'system') */
  defaultTheme?: 'light' | 'dark' | 'system';
  /** Storage key for theme persistence (defaults to 'linke-theme') */
  storageKey?: string;
  /** Whether to force theme (disables system preference) */
  forcedTheme?: 'light' | 'dark';
}

/**
 * ThemeProvider component
 *
 * Features:
 * - Light/dark mode support
 * - System preference detection
 * - LocalStorage persistence
 * - Tailwind CSS dark mode integration
 * - SSR safe
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@/app/providers';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'linke-theme',
  forcedTheme,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme={defaultTheme}
      enableSystem={true}
      storageKey={storageKey}
      forcedTheme={forcedTheme}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Default export
 */
export default ThemeProvider;
