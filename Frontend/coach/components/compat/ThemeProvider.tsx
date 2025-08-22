/**
 * Theme Provider - Backward Compatibility Layer
 * Provides the same API as the original ThemeProvider but uses Zustand store
 */

import React, { createContext, useContext } from 'react';
import { useThemeStore } from '../../stores/theme-store';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create context for backward compatibility (though not actually used)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Backward compatible ThemeProvider
 * This component maintains the same API as the original Context provider
 * but internally uses the Zustand theme store
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // No context provider needed - just render children
  // The store is accessed directly via the hook
  return <>{children}</>;
}

/**
 * Backward compatible useTheme hook
 * Maintains the same API as the original hook but uses Zustand store
 */
export function useTheme(): ThemeContextType {
  const colorScheme = useThemeStore(state => state.colorScheme);
  const toggleColorScheme = useThemeStore(state => state.toggleColorScheme);

  return {
    theme: colorScheme,
    toggleTheme: toggleColorScheme,
  };
}

// Export for backward compatibility
export default ThemeProvider;