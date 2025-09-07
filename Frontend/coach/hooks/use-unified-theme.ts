/**
 * Unified Theme Hook
 * Provides compatibility layer between old and new theme systems
 * during the gradual migration process.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useThemeStore } from '../stores/theme-store';
import { ThemeMigrationHelper } from '../utils/theme-migration';
import { designTokens, getColorTokens, type ColorScheme } from '../styles/design-tokens';
import type { Theme, ThemeContextType } from '../types/theme';

/**
 * Unified theme hook that provides both old and new theme systems
 * Components can gradually migrate from old to new
 */
export const useUnifiedTheme = () => {
  // Get the current color scheme from the existing store
  const { colorScheme, setColorScheme, toggleColorScheme, initializeTheme } = useThemeStore();
  
  // Create migration helper instance
  const migrationHelper = useMemo(
    () => new ThemeMigrationHelper(colorScheme),
    [colorScheme]
  );

  // Update migration helper when color scheme changes
  useEffect(() => {
    migrationHelper.setColorScheme(colorScheme);
  }, [colorScheme, migrationHelper]);

  // Legacy theme object (backward compatibility)
  const legacyTheme = useMemo(() => {
    const legacyColors = migrationHelper.getLegacyColors();
    
    return {
      name: colorScheme,
      colorScheme,
      colors: legacyColors,
      spacing: designTokens.spacing,
      typography: designTokens.typography,
      borderRadius: designTokens.borderRadius,
      shadows: designTokens.shadows,
      transitions: designTokens.animations,
    } as Theme;
  }, [colorScheme, migrationHelper]);

  // New theme tokens (forward compatibility)
  const newTokens = useMemo(() => {
    return {
      colors: getColorTokens(colorScheme),
      typography: designTokens.typography,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      shadows: designTokens.shadows,
      animations: designTokens.animations,
      components: designTokens.components,
    };
  }, [colorScheme]);

  // Safe color accessor for components in transition
  const getColor = useCallback(
    (colorKey: string, fallback: string = '#000000') => {
      try {
        // Try new system first
        const newColors = newTokens.colors;
        const camelCaseKey = colorKey as keyof typeof newColors;
        if (newColors[camelCaseKey]) {
          return newColors[camelCaseKey];
        }

        // Fall back to legacy system
        const legacyColors = legacyTheme.colors;
        const pathParts = colorKey.split('.');
        let value = legacyColors as any;
        
        for (const part of pathParts) {
          if (value && typeof value === 'object') {
            value = value[part] || (value.DEFAULT !== undefined ? value.DEFAULT : value);
          } else {
            break;
          }
        }
        
        return typeof value === 'string' ? value : fallback;
      } catch (error) {
        console.warn(`Failed to get color ${colorKey}, using fallback:`, error);
        return fallback;
      }
    },
    [newTokens.colors, legacyTheme.colors]
  );

  // Get CSS variable for a color
  const getCssVariable = useCallback(
    (colorKey: string) => {
      return migrationHelper.toCssVariable(colorKey as any);
    },
    [migrationHelper]
  );

  // Get platform-specific shadow style
  const getShadowStyle = useCallback(
    (intensity: 'sm' | 'md' | 'lg' = 'sm') => {
      return migrationHelper.getShadowStyle(intensity);
    },
    [migrationHelper]
  );

  // Check if component should use new system
  const shouldUseNewSystem = useCallback(
    (componentName: string) => {
      return migrationHelper.shouldUseNewSystem(componentName);
    },
    [migrationHelper]
  );

  // Get fallback styles for safety
  const getFallbackStyles = useCallback(() => {
    return migrationHelper.getFallbackStyles();
  }, [migrationHelper]);

  return {
    // Current state
    colorScheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',

    // Theme objects
    legacyTheme, // For backward compatibility
    newTokens,   // For forward compatibility

    // Actions (maintain existing API)
    setColorScheme,
    toggleColorScheme,
    initializeTheme,

    // Migration utilities
    getColor,
    getCssVariable,
    getShadowStyle,
    shouldUseNewSystem,
    getFallbackStyles,

    // Migration helper (for advanced use)
    migrationHelper,

    // Utility flags
    isUnifiedThemeActive: true, // Indicates this is the unified system
  };
};

/**
 * Hook for components that need only colors
 * Provides both old and new color access patterns
 */
export const useUnifiedColors = () => {
  const { legacyTheme, newTokens, getColor, getCssVariable } = useUnifiedTheme();

  return {
    // Legacy format (for components not yet migrated)
    legacy: legacyTheme.colors,
    
    // New format (for migrated components)
    tokens: newTokens.colors,
    
    // Safe accessor
    get: getColor,
    
    // CSS variable accessor
    css: getCssVariable,
  };
};

/**
 * Hook for components in active migration
 * Provides both styling approaches with safe fallbacks
 */
export const useSafeTheme = (componentName: string) => {
  const unified = useUnifiedTheme();
  const usingNewSystem = unified.shouldUseNewSystem(componentName);
  const fallbacks = unified.getFallbackStyles();

  return {
    ...unified,
    
    // Component-specific flags
    usingNewSystem,
    usingLegacySystem: !usingNewSystem,
    
    // Safe style getters with fallbacks
    getButtonStyle: (variant: 'primary' | 'secondary' = 'primary') => {
      if (usingNewSystem) {
        // Return CSS classes for new system
        return variant === 'primary' 
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground';
      } else {
        // Return inline styles for legacy system
        return fallbacks.button[variant];
      }
    },

    getCardStyle: () => {
      if (usingNewSystem) {
        return 'bg-card border-border';
      } else {
        return fallbacks.card;
      }
    },

    getTextStyle: (variant: 'primary' | 'secondary' = 'primary') => {
      if (usingNewSystem) {
        return variant === 'primary' 
          ? 'text-foreground' 
          : 'text-muted-foreground';
      } else {
        return fallbacks.text[variant];
      }
    },
  };
};

/**
 * Drop-in replacement for the original useTheme hook
 * Maintains backward compatibility while adding new features
 */
export const useCompatibilityTheme = (): ThemeContextType => {
  const unified = useUnifiedTheme();

  return {
    // Original API
    colorScheme: unified.colorScheme,
    theme: unified.legacyTheme,
    isDark: unified.isDark,
    isLight: unified.isLight,
    setColorScheme: unified.setColorScheme,
    toggleColorScheme: unified.toggleColorScheme,
    initializeTheme: unified.initializeTheme,
    persistTheme: async () => {}, // Placeholder - handled by existing store
    validateTheme: () => true, // Placeholder
    
    // Additional utilities (these were in the original hook)
    animations: designTokens.animations,
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  };
};

/**
 * Debug hook for development
 * Helps identify which components are using which system
 */
export const useThemeDebug = () => {
  const unified = useUnifiedTheme();
  
  return {
    systemStatus: {
      colorScheme: unified.colorScheme,
      isUnifiedActive: unified.isUnifiedThemeActive,
    },
    
    colorComparison: {
      primary: {
        legacy: unified.legacyTheme.colors.primary.DEFAULT,
        new: unified.newTokens.colors.primary,
        cssVar: unified.getCssVariable('primary'),
      },
      background: {
        legacy: unified.legacyTheme.colors.background,
        new: unified.newTokens.colors.background,
        cssVar: unified.getCssVariable('background'),
      },
    },

    logComponentMigration: (componentName: string) => {
      const usingNew = unified.shouldUseNewSystem(componentName);
      console.log(`🎨 ${componentName}: ${usingNew ? 'NEW' : 'LEGACY'} theme system`);
    },
  };
};

export default useUnifiedTheme;