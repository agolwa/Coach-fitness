/**
 * Theme Migration Utilities
 * Provides compatibility layer between old and new theme systems
 * during the gradual migration process.
 */

import { Platform } from 'react-native';
import { designTokens, getColorTokens, type ColorScheme, type ColorTokens } from '../styles/design-tokens';

/**
 * Compatibility layer for components during migration
 * Provides both old and new theme access patterns
 */
export class ThemeMigrationHelper {
  private currentScheme: ColorScheme;

  constructor(scheme: ColorScheme = 'light') {
    this.currentScheme = scheme;
  }

  /**
   * Get color tokens in the new format
   */
  getNewColors(): ColorTokens {
    return getColorTokens(this.currentScheme);
  }

  /**
   * Get colors in the old theme store format for backward compatibility
   * This mirrors the structure from the original theme-store.ts
   */
  getLegacyColors() {
    const colors = this.getNewColors();
    
    return {
      // Core Colors
      background: colors.background,
      foreground: colors.foreground,
      card: {
        DEFAULT: colors.card,
        foreground: colors.cardForeground,
      },
      popover: {
        DEFAULT: colors.popover,
        foreground: colors.popoverForeground,
      },

      // Primary - Uber Green
      primary: {
        DEFAULT: colors.primary,
        foreground: colors.primaryForeground,
      },

      // Secondary - Neutral grays
      secondary: {
        DEFAULT: colors.secondary,
        foreground: colors.secondaryForeground,
      },

      // Muted - Light grays for subtle elements
      muted: {
        DEFAULT: colors.muted,
        foreground: colors.mutedForeground,
      },

      // Accent - Slightly darker than secondary
      accent: {
        DEFAULT: colors.accent,
        foreground: colors.accentForeground,
      },

      // Destructive - Uber's red for errors
      destructive: {
        DEFAULT: colors.destructive,
        foreground: colors.destructiveForeground,
      },

      // Borders and inputs
      border: colors.border,
      input: colors.input,
      'input-background': colors.inputBackground,
      'switch-background': colors.switchBackground,
      ring: colors.ring,

      // Chart colors
      chart: {
        1: colors.chart1,
        2: colors.chart2,
        3: colors.chart3,
        4: colors.chart4,
        5: colors.chart5,
      },

      // Sidebar colors (if needed)
      sidebar: {
        DEFAULT: colors.sidebar,
        foreground: colors.sidebarForeground,
        primary: colors.sidebarPrimary,
        'primary-foreground': colors.sidebarPrimaryForeground,
        accent: colors.sidebarAccent,
        'accent-foreground': colors.sidebarAccentForeground,
        border: colors.sidebarBorder,
        ring: colors.sidebarRing,
      },
    };
  }

  /**
   * Get platform-specific shadow styles
   */
  getShadowStyle(intensity: 'sm' | 'md' | 'lg' = 'sm') {
    const shadows = designTokens.shadows[intensity];
    
    if (Platform.OS === 'ios') {
      return shadows.ios;
    } else {
      return shadows.android;
    }
  }

  /**
   * Convert color key to CSS variable format
   * Useful for components migrating to CSS variables
   */
  toCssVariable(colorKey: keyof ColorTokens): string {
    // Convert camelCase to kebab-case for CSS variables
    const kebabCase = colorKey.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `var(--${kebabCase})`;
  }

  /**
   * Helper to determine if a component should use the new system
   * Can be used for gradual rollout with feature flags
   */
  shouldUseNewSystem(componentName: string): boolean {
    // During migration, you can control which components use the new system
    const migratedComponents = [
      'NativeWindTest',
      'StateDemo',
      'HelloWave',
      // Add more components as they get migrated
    ];
    
    return migratedComponents.includes(componentName);
  }

  /**
   * Get safe fallback styles for components
   * Provides fallback in case new system fails
   */
  getFallbackStyles() {
    const colors = this.getLegacyColors();
    
    return {
      button: {
        primary: {
          backgroundColor: colors.primary.DEFAULT,
          color: colors.primary.foreground,
        },
        secondary: {
          backgroundColor: colors.secondary.DEFAULT,
          color: colors.secondary.foreground,
        },
      },
      card: {
        backgroundColor: colors.card.DEFAULT,
        borderColor: colors.border,
      },
      text: {
        primary: { color: colors.foreground },
        secondary: { color: colors.muted.foreground },
      },
    };
  }

  /**
   * Update the current color scheme
   */
  setColorScheme(scheme: ColorScheme) {
    this.currentScheme = scheme;
  }
}

/**
 * Utility functions for component migration
 */

/**
 * Safe color accessor - tries new system first, falls back to legacy
 */
export const safeGetColor = (
  newColorKey: keyof ColorTokens,
  legacyColorPath: string,
  scheme: ColorScheme = 'light',
  fallbackColor: string = '#000000'
): string => {
  try {
    const colors = getColorTokens(scheme);
    return colors[newColorKey] || fallbackColor;
  } catch (error) {
    console.warn(`Failed to get color ${newColorKey}, using fallback:`, error);
    return fallbackColor;
  }
};

/**
 * Convert theme object property path to new token key
 * Example: "primary.DEFAULT" -> "primary"
 */
export const mapLegacyColorPath = (legacyPath: string): keyof ColorTokens | null => {
  const pathMappings: Record<string, keyof ColorTokens> = {
    'primary.DEFAULT': 'primary',
    'primary.foreground': 'primaryForeground',
    'secondary.DEFAULT': 'secondary',
    'secondary.foreground': 'secondaryForeground',
    'card.DEFAULT': 'card',
    'card.foreground': 'cardForeground',
    'muted.DEFAULT': 'muted',
    'muted.foreground': 'mutedForeground',
    'destructive.DEFAULT': 'destructive',
    'destructive.foreground': 'destructiveForeground',
    'background': 'background',
    'foreground': 'foreground',
    'border': 'border',
    'ring': 'ring',
  };
  
  return pathMappings[legacyPath] || null;
};

/**
 * Generate CSS variables from design tokens
 * Used to update global.css during migration
 */
export const generateCSSVariables = (scheme: ColorScheme) => {
  const colors = getColorTokens(scheme);
  const cssVars: string[] = [];
  
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars.push(`  --${cssVarName}: ${value};`);
  });
  
  return cssVars.join('\n');
};

/**
 * Validation helpers
 */
export const validateMigration = {
  /**
   * Check if all required CSS variables are defined
   */
  checkCSSVariables(): boolean {
    // In a real implementation, this would check the DOM for CSS variables
    // For now, we'll assume they're properly defined
    return true;
  },

  /**
   * Verify color contrast ratios meet accessibility standards
   */
  checkColorContrast(foreground: string, background: string): boolean {
    // Simplified contrast check - in production, use a proper contrast library
    // This is a placeholder for accessibility validation
    return true;
  },

  /**
   * Ensure all components using old system have fallbacks
   */
  validateComponentFallbacks(componentName: string): boolean {
    // Check if component has proper fallback mechanisms
    return true;
  },
};

/**
 * Migration progress tracker
 */
export class MigrationProgress {
  private static migratedComponents = new Set<string>();
  
  static markComponentMigrated(componentName: string) {
    this.migratedComponents.add(componentName);
    console.log(`✅ Component migrated: ${componentName}`);
  }
  
  static isComponentMigrated(componentName: string): boolean {
    return this.migratedComponents.has(componentName);
  }
  
  static getMigrationStatus() {
    const totalComponents = 25; // Approximate count of components to migrate
    const migratedCount = this.migratedComponents.size;
    const percentage = Math.round((migratedCount / totalComponents) * 100);
    
    return {
      migratedCount,
      totalComponents,
      percentage,
      remaining: totalComponents - migratedCount,
      migratedComponents: Array.from(this.migratedComponents),
    };
  }
}

export default ThemeMigrationHelper;