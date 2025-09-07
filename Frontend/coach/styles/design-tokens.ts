/**
 * Design Tokens - Single Source of Truth
 * Values extracted from Figma migration: /Frontend/figma-migration/styles/globals.css
 * 
 * This file contains all design values approved from Figma designs.
 * These tokens will be used to generate CSS variables and component variants.
 */

export const designTokens = {
  /**
   * Color Palette - Extracted from Figma Migration
   * Using exact HEX values from figma-migration/styles/globals.css
   */
  colors: {
    light: {
      // Core Colors
      background: '#ffffff',
      foreground: '#202020',
      card: '#ffffff',
      cardForeground: '#202020',
      popover: '#ffffff',
      popoverForeground: '#202020',
      
      // Primary - Uber Green (consistent across themes)
      primary: '#00b561',
      primaryForeground: '#ffffff',
      
      // Secondary - Neutral grays
      secondary: '#f6f6f6',
      secondaryForeground: '#202020',
      
      // Muted - Light grays for subtle elements
      muted: '#f6f6f6',
      mutedForeground: '#6b7280',
      
      // Accent - Slightly darker than secondary
      accent: '#f1f1f1',
      accentForeground: '#202020',
      
      // Destructive - Uber's red for errors
      destructive: '#e53e3e',
      destructiveForeground: '#ffffff',
      
      // Borders and inputs
      border: '#e5e5e5',
      input: '#ffffff',
      inputBackground: '#ffffff',
      switchBackground: '#e5e5e5',
      
      // Focus ring
      ring: '#00b561',
      
      // Warning/Guest mode colors
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      
      // Link colors
      link: '#0a7ea4',
      linkForeground: '#ffffff',
      
      // Switch colors
      switchTrackInactive: '#e2e8f0',
      switchTrackActive: '#10b981',
      
      // Chart colors for data visualization
      chart1: '#00b561',
      chart2: '#059669',
      chart3: '#0891b2',
      chart4: '#7c3aed',
      chart5: '#db2777',
      
      // Sidebar colors (if needed)
      sidebar: '#ffffff',
      sidebarForeground: '#202020',
      sidebarPrimary: '#00b561',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#f6f6f6',
      sidebarAccentForeground: '#202020',
      sidebarBorder: '#e5e5e5',
      sidebarRing: '#00b561',
    },
    
    dark: {
      // Core Colors - Dark theme
      background: '#000000',
      foreground: '#ffffff',
      card: '#111111',
      cardForeground: '#ffffff',
      popover: '#111111',
      popoverForeground: '#ffffff',
      
      // Primary - Uber Green (same as light)
      primary: '#00b561',
      primaryForeground: '#ffffff',
      
      // Secondary - Dark grays
      secondary: '#1a1a1a',
      secondaryForeground: '#ffffff',
      
      // Muted - Dark grays for subtle elements
      muted: '#1a1a1a',
      mutedForeground: '#9ca3af',
      
      // Accent - Slightly darker than secondary
      accent: '#1f1f1f',
      accentForeground: '#ffffff',
      
      // Destructive - Adjusted for dark theme
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      
      // Borders and inputs - Dark theme
      border: '#2a2a2a',
      input: '#111111',
      inputBackground: '#111111',
      switchBackground: '#2a2a2a',
      
      // Focus ring (same as light)
      ring: '#00b561',
      
      // Warning/Guest mode colors
      warning: '#f59e0b',
      warningForeground: '#000000',
      
      // Link colors - adjusted for dark theme
      link: '#38bdf8',
      linkForeground: '#000000',
      
      // Switch colors - dark theme variants
      switchTrackInactive: '#374151',
      switchTrackActive: '#10b981',
      
      // Chart colors (consistent across themes)
      chart1: '#00b561',
      chart2: '#059669',
      chart3: '#0891b2',
      chart4: '#7c3aed',
      chart5: '#db2777',
      
      // Sidebar colors - Dark theme
      sidebar: '#000000',
      sidebarForeground: '#ffffff',
      sidebarPrimary: '#00b561',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#1a1a1a',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#2a2a2a',
      sidebarRing: '#00b561',
    },
  },
  
  /**
   * Typography System - From Figma Migration
   */
  typography: {
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.6,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.005em',
    },
  },
  
  /**
   * Spacing System
   */
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  /**
   * Border Radius - From Figma Migration
   */
  borderRadius: {
    base: '8px', // --radius from Figma
    sm: '6px',   // calc(8px - 2px)
    md: '8px',   // base radius
    lg: '10px',  // calc(8px + 2px)
    xl: '12px',  // calc(8px + 4px)
    full: '9999px',
  },
  
  /**
   * Shadows - Platform specific
   */
  shadows: {
    sm: {
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    },
    md: {
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    },
    lg: {
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    },
  },
  
  /**
   * Animation & Transitions
   */
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  /**
   * Component-specific tokens
   */
  components: {
    button: {
      heights: {
        sm: '32px',   // 8 * 4
        default: '44px', // 11 * 4
        lg: '48px',   // 12 * 4
        xl: '56px',   // 14 * 4
      },
      padding: {
        sm: { horizontal: '12px', vertical: '8px' },
        default: { horizontal: '16px', vertical: '12px' },
        lg: { horizontal: '24px', vertical: '12px' },
        xl: { horizontal: '32px', vertical: '16px' },
      },
    },
    card: {
      padding: {
        sm: '12px',
        default: '16px',
        lg: '24px',
      },
    },
  },
} as const;

/**
 * Type definitions for design tokens
 */
export type ColorScheme = 'light' | 'dark';
export type ColorTokens = typeof designTokens.colors.light;
export type TypographyTokens = typeof designTokens.typography;
export type SpacingTokens = typeof designTokens.spacing;
export type BorderRadiusTokens = typeof designTokens.borderRadius;
export type ShadowTokens = typeof designTokens.shadows;
export type AnimationTokens = typeof designTokens.animations;
export type ComponentTokens = typeof designTokens.components;

/**
 * Helper function to get color tokens for a specific scheme
 */
export const getColorTokens = (scheme: ColorScheme): ColorTokens => {
  return designTokens.colors[scheme];
};

/**
 * Helper function to convert color tokens to CSS variables format
 */
export const colorToCssVar = (colorKey: string): string => {
  // Convert camelCase to kebab-case for CSS variables
  const kebabCase = colorKey.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `var(--${kebabCase})`;
};

/**
 * Figma Mapping Guide
 * This helps when updating tokens from Figma designs
 */
export const figmaMapping = {
  // Primary colors
  'Primary/Green': 'primary',
  'Primary/Green Foreground': 'primaryForeground',
  
  // Neutral colors
  'Neutral/Background': 'background',
  'Neutral/Foreground': 'foreground',
  'Neutral/Muted': 'muted',
  'Neutral/Muted Foreground': 'mutedForeground',
  
  // Semantic colors
  'Semantic/Destructive': 'destructive',
  'Semantic/Destructive Foreground': 'destructiveForeground',
  
  // Border and input colors
  'Border/Default': 'border',
  'Input/Background': 'inputBackground',
} as const;

export default designTokens;