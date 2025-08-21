/**
 * Theme Hook for React Native Components
 * Provides easy access to theme store with additional utilities
 */

import { useCallback, useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store';
import { animationPresets } from '../stores/theme-store';
import type { ColorScheme, Theme, ThemeContextType } from '../types/theme';

// Breakpoints for responsive design
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Main theme hook - replaces the original useTheme from ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const store = useThemeStore();
  
  // Initialize theme on first use
  useEffect(() => {
    store.initializeTheme();
  }, []);

  // Create stable callback references
  const setColorScheme = useCallback((scheme: ColorScheme) => {
    store.setColorScheme(scheme);
  }, [store.setColorScheme]);

  const toggleColorScheme = useCallback(() => {
    store.toggleColorScheme();
  }, [store.toggleColorScheme]);

  const initializeTheme = useCallback(() => {
    return store.initializeTheme();
  }, [store.initializeTheme]);

  const persistTheme = useCallback(() => {
    return store.persistTheme();
  }, [store.persistTheme]);

  const validateTheme = useCallback((theme: Partial<Theme>) => {
    return store.validateTheme(theme);
  }, [store.validateTheme]);

  return {
    // State
    colorScheme: store.colorScheme,
    theme: store.theme,
    isDark: store.isDark,
    isLight: store.isLight,

    // Actions
    setColorScheme,
    toggleColorScheme,
    initializeTheme,
    persistTheme,
    validateTheme,

    // Additional utilities
    animations: animationPresets,
    breakpoints,
  };
};

/**
 * Hook for accessing theme colors directly
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook for accessing typography settings
 */
export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook for accessing spacing values
 */
export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

/**
 * Hook for accessing border radius values
 */
export const useThemeBorderRadius = () => {
  const { theme } = useTheme();
  return theme.borderRadius;
};

/**
 * Hook for accessing shadow values
 */
export const useThemeShadows = () => {
  const { theme } = useTheme();
  return theme.shadows;
};

/**
 * Hook for theme-aware conditional styling
 * Usage: const styles = useThemeStyles((theme) => ({ color: theme.colors.primary }))
 */
export const useThemeStyles = <T>(styleFactory: (theme: Theme) => T): T => {
  const { theme } = useTheme();
  return styleFactory(theme);
};

/**
 * Hook for responsive design based on screen size
 * Note: In React Native, you'd typically use Dimensions API
 */
export const useResponsiveValue = <T>(
  values: { sm?: T; md?: T; lg?: T; xl?: T; default: T }
): T => {
  // In React Native, you would use Dimensions.get('window').width
  // For now, returning default value - can be enhanced with actual screen detection
  return values.default;
};

/**
 * Legacy compatibility hook - matches original ThemeProvider API
 * Provides backward compatibility with existing components
 */
export const useThemeLegacy = () => {
  const { colorScheme, toggleColorScheme } = useTheme();
  
  return {
    theme: colorScheme, // Maps colorScheme to theme for compatibility
    toggleTheme: toggleColorScheme, // Maps toggleColorScheme to toggleTheme
  };
};

/**
 * Hook for theme-aware animations
 */
export const useThemeAnimations = () => {
  const { animations, theme } = useTheme();
  
  return {
    ...animations,
    // Add theme-specific animation overrides if needed
    theme: {
      ...animations.theme,
      duration: theme.transitions.duration.normal,
      timing: theme.transitions.timing,
    },
  };
};

/**
 * Hook for color scheme detection and system integration
 */
export const useColorSchemeDetection = () => {
  const { colorScheme, setColorScheme } = useTheme();
  
  const followSystem = useCallback(() => {
    // In a real implementation, you'd listen to system changes
    // and update accordingly. This is a placeholder.
    console.log('Following system color scheme');
  }, []);

  const setManualScheme = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
  }, [setColorScheme]);

  return {
    currentScheme: colorScheme,
    setScheme: setManualScheme,
    followSystem,
    isSystemScheme: false, // Would check if following system
  };
};

// Export all hooks
export default useTheme;