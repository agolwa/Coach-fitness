/**
 * Theme System Types for React Native
 * Based on Uber Design System extracted from globals.css
 */

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Core Colors
  background: string;
  foreground: string;
  card: {
    DEFAULT: string;
    foreground: string;
  };
  popover: {
    DEFAULT: string;
    foreground: string;
  };

  // Primary - Uber Green  
  primary: {
    DEFAULT: string;
    foreground: string;
  };

  // Secondary - Neutral grays
  secondary: {
    DEFAULT: string;
    foreground: string;
  };

  // Muted - Light grays for subtle elements
  muted: {
    DEFAULT: string;
    foreground: string;
  };

  // Accent - Slightly darker than secondary
  accent: {
    DEFAULT: string;
    foreground: string;
  };

  // Destructive - Uber's red for errors
  destructive: {
    DEFAULT: string;
    foreground: string;
  };

  // Borders and inputs
  border: string;
  input: string;
  'input-background': string;
  'switch-background': string;

  // Focus ring
  ring: string;

  // Chart colors for data visualization
  chart: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };

  // Sidebar colors (if needed)
  sidebar: {
    DEFAULT: string;
    foreground: string;
    primary: string;
    'primary-foreground': string;
    accent: string;
    'accent-foreground': string;
    border: string;
    ring: string;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

export interface ThemeTypography {
  fontWeights: {
    normal: number; // 400
    medium: number; // 500
    semibold: number; // 600
  };
  fontSizes: {
    xs: number;    // 12px
    sm: number;    // 14px
    base: number;  // 16px
    lg: number;    // 18px
    xl: number;    // 20px
    '2xl': number; // 24px
    '3xl': number; // 30px
  };
  lineHeights: {
    tight: number;  // 1.25
    normal: number; // 1.5
    relaxed: number; // 1.6
  };
  letterSpacing: {
    tight: string;   // -0.025em
    normal: string;  // 0em
    wide: string;    // 0.005em
  };
}

export interface ThemeBorderRadius {
  sm: number; // 6px
  md: number; // 8px
  lg: number; // 10px
  xl: number; // 12px
  full: number; // 9999px
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  name: string;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  transitions: {
    duration: {
      fast: number;    // 200ms
      normal: number;  // 300ms
    };
    timing: string;    // cubic-bezier(0.4, 0, 0.2, 1)
  };
}

// Design token validation interfaces
export interface DesignToken<T = string | number> {
  value: T;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border-radius';
  description?: string;
  deprecated?: boolean;
}

export interface TokenGroup<T = DesignToken> {
  [key: string]: T | TokenGroup<T>;
}

export interface DesignTokens {
  colors: TokenGroup<DesignToken<string>>;
  spacing: TokenGroup<DesignToken<number>>;
  typography: TokenGroup<DesignToken>;
  borderRadius: TokenGroup<DesignToken<number>>;
  shadows: TokenGroup<DesignToken<string>>;
}

// Zustand theme store interface
export interface ThemeStore {
  // Current theme state
  colorScheme: ColorScheme;
  theme: Theme;
  
  // Theme management actions
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  
  // Theme initialization and persistence
  initializeTheme: () => Promise<void>;
  persistTheme: () => Promise<void>;
  
  // Theme validation
  validateTheme: (theme: Partial<Theme>) => boolean;
  
  // Computed getters
  isDark: boolean;
  isLight: boolean;
}

// Component variant types for consistent styling
export type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type InputVariant = 'default' | 'error' | 'success';

export type CardVariant = 'default' | 'elevated' | 'outline';

// Animation presets for consistent transitions
export interface AnimationPresets {
  fade: {
    duration: number;
    timing: string;
  };
  slide: {
    duration: number;
    timing: string;
  };
  scale: {
    duration: number;
    timing: string;
  };
  theme: {
    duration: number;
    timing: string;
  };
}

// Theme context type for React components
export interface ThemeContextType extends ThemeStore {
  animations: AnimationPresets;
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export default Theme;