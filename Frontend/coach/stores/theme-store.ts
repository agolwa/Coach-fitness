/**
 * Zustand Theme Store for React Native
 * Replaces ThemeProvider with better performance and persistence
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import type { 
  ColorScheme, 
  Theme, 
  ThemeStore, 
  ThemeColors, 
  ThemeSpacing,
  ThemeTypography,
  ThemeBorderRadius,
  ThemeShadows,
  AnimationPresets
} from '../types/theme';

// Constants
const THEME_STORAGE_KEY = '@theme_preference';
const THEME_PERSISTENCE_DEBOUNCE = 500; // ms

// Light theme configuration
const lightTheme: Theme = {
  name: 'light',
  colorScheme: 'light',
  colors: {
    // Core Colors
    background: 'hsl(0, 0%, 100%)', // #ffffff
    foreground: 'hsl(210, 10%, 13%)', // #202020
    card: {
      DEFAULT: 'hsl(0, 0%, 100%)', // #ffffff
      foreground: 'hsl(210, 10%, 13%)', // #202020
    },
    popover: {
      DEFAULT: 'hsl(0, 0%, 100%)', // #ffffff
      foreground: 'hsl(210, 10%, 13%)', // #202020
    },

    // Primary - Uber Green
    primary: {
      DEFAULT: 'hsl(158, 100%, 36%)', // #00b561
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Secondary - Neutral grays
    secondary: {
      DEFAULT: 'hsl(0, 0%, 96%)', // #f6f6f6
      foreground: 'hsl(210, 10%, 13%)', // #202020
    },

    // Muted - Light grays for subtle elements
    muted: {
      DEFAULT: 'hsl(0, 0%, 96%)', // #f6f6f6
      foreground: 'hsl(220, 9%, 46%)', // #6b7280
    },

    // Accent - Slightly darker than secondary
    accent: {
      DEFAULT: 'hsl(0, 0%, 95%)', // #f1f1f1
      foreground: 'hsl(210, 10%, 13%)', // #202020
    },

    // Destructive - Uber's red for errors
    destructive: {
      DEFAULT: 'hsl(0, 84%, 60%)', // #e53e3e
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Borders and inputs
    border: 'hsl(0, 0%, 90%)', // #e5e5e5
    input: 'hsl(0, 0%, 100%)', // #ffffff
    'input-background': 'hsl(0, 0%, 100%)', // #ffffff
    'switch-background': 'hsl(0, 0%, 90%)', // #e5e5e5

    // Focus ring
    ring: 'hsl(158, 100%, 36%)', // #00b561

    // Chart colors
    chart: {
      1: 'hsl(158, 100%, 36%)', // #00b561
      2: 'hsl(160, 84%, 39%)', // #059669
      3: 'hsl(188, 85%, 32%)', // #0891b2
      4: 'hsl(262, 83%, 58%)', // #7c3aed
      5: 'hsl(330, 81%, 60%)', // #db2777
    },

    // Sidebar colors (if needed)
    sidebar: {
      DEFAULT: 'hsl(0, 0%, 100%)', // #ffffff
      foreground: 'hsl(210, 10%, 13%)', // #202020
      primary: 'hsl(158, 100%, 36%)', // #00b561
      'primary-foreground': 'hsl(0, 0%, 100%)', // #ffffff
      accent: 'hsl(0, 0%, 96%)', // #f6f6f6
      'accent-foreground': 'hsl(210, 10%, 13%)', // #202020
      border: 'hsl(0, 0%, 90%)', // #e5e5e5
      ring: 'hsl(158, 100%, 36%)', // #00b561
    },
  } as ThemeColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  } as ThemeSpacing,
  typography: {
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
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
  } as ThemeTypography,
  borderRadius: {
    sm: 6,  // calc(8px - 2px)
    md: 8,  // base radius
    lg: 10, // calc(8px + 2px)
    xl: 12, // calc(8px + 4px)
    full: 9999,
  } as ThemeBorderRadius,
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.1)',
  } as ThemeShadows,
  transitions: {
    duration: {
      fast: 200,
      normal: 300,
    },
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Dark theme configuration
const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  colorScheme: 'dark',
  colors: {
    // Core Colors
    background: 'hsl(0, 0%, 0%)', // #000000
    foreground: 'hsl(0, 0%, 100%)', // #ffffff
    card: {
      DEFAULT: 'hsl(0, 0%, 7%)', // #111111
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },
    popover: {
      DEFAULT: 'hsl(0, 0%, 7%)', // #111111
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Primary - Uber Green (consistent)
    primary: {
      DEFAULT: 'hsl(158, 100%, 36%)', // #00b561
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Secondary - Dark grays
    secondary: {
      DEFAULT: 'hsl(0, 0%, 10%)', // #1a1a1a
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Muted - Dark grays for subtle elements
    muted: {
      DEFAULT: 'hsl(0, 0%, 10%)', // #1a1a1a
      foreground: 'hsl(220, 13%, 69%)', // #9ca3af
    },

    // Accent - Slightly darker than secondary
    accent: {
      DEFAULT: 'hsl(0, 0%, 12%)', // #1f1f1f
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Destructive - Adjusted for dark theme
    destructive: {
      DEFAULT: 'hsl(0, 85%, 63%)', // #ef4444
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
    },

    // Borders and inputs
    border: 'hsl(0, 0%, 17%)', // #2a2a2a
    input: 'hsl(0, 0%, 7%)', // #111111
    'input-background': 'hsl(0, 0%, 7%)', // #111111
    'switch-background': 'hsl(0, 0%, 17%)', // #2a2a2a

    // Focus ring (consistent)
    ring: 'hsl(158, 100%, 36%)', // #00b561

    // Chart colors (consistent across themes)
    chart: {
      1: 'hsl(158, 100%, 36%)', // #00b561
      2: 'hsl(160, 84%, 39%)', // #059669
      3: 'hsl(188, 85%, 32%)', // #0891b2
      4: 'hsl(262, 83%, 58%)', // #7c3aed
      5: 'hsl(330, 81%, 60%)', // #db2777
    },

    // Sidebar colors
    sidebar: {
      DEFAULT: 'hsl(0, 0%, 0%)', // #000000
      foreground: 'hsl(0, 0%, 100%)', // #ffffff
      primary: 'hsl(158, 100%, 36%)', // #00b561
      'primary-foreground': 'hsl(0, 0%, 100%)', // #ffffff
      accent: 'hsl(0, 0%, 10%)', // #1a1a1a
      'accent-foreground': 'hsl(0, 0%, 100%)', // #ffffff
      border: 'hsl(0, 0%, 17%)', // #2a2a2a
      ring: 'hsl(158, 100%, 36%)', // #00b561
    },
  } as ThemeColors,
};

// Animation presets
const animationPresets: AnimationPresets = {
  fade: {
    duration: 200,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slide: {
    duration: 300,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  scale: {
    duration: 200,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  theme: {
    duration: 300,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Theme validation utility
const validateTheme = (theme: Partial<Theme>): boolean => {
  if (!theme || typeof theme !== 'object') return false;
  if (!theme.colors || typeof theme.colors !== 'object') return false;
  if (!theme.colorScheme || !['light', 'dark'].includes(theme.colorScheme)) return false;
  
  // Validate required color tokens
  const requiredColors = [
    'background', 'foreground', 'primary', 'primary-foreground',
    'secondary', 'border', 'input', 'ring'
  ];
  
  return requiredColors.every(color => 
    theme.colors && typeof theme.colors[color as keyof ThemeColors] === 'string'
  );
};

// Get system color scheme
const getSystemColorScheme = (): ColorScheme => {
  const systemScheme = Appearance.getColorScheme();
  return systemScheme === 'dark' ? 'dark' : 'light';
};

// Debounced persistence utility
let persistenceTimeout: any = null;

const debouncedPersist = (colorScheme: ColorScheme) => {
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }
  
  persistenceTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, colorScheme);
    } catch (error) {
      console.warn('Failed to persist theme preference:', error);
    }
  }, THEME_PERSISTENCE_DEBOUNCE);
};

// Create the Zustand store
export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    colorScheme: 'light',
    theme: lightTheme,
    
    // Computed getters
    get isDark() {
      return get().colorScheme === 'dark';
    },
    get isLight() {
      return get().colorScheme === 'light';
    },

    // Actions
    setColorScheme: (scheme: ColorScheme) => {
      const newTheme = scheme === 'dark' ? darkTheme : lightTheme;
      
      set({ 
        colorScheme: scheme, 
        theme: newTheme 
      });
      
      // Persist preference
      debouncedPersist(scheme);
    },

    toggleColorScheme: () => {
      const current = get().colorScheme;
      const newScheme: ColorScheme = current === 'light' ? 'dark' : 'light';
      get().setColorScheme(newScheme);
    },

    initializeTheme: async () => {
      try {
        // Try to get stored preference first
        const storedScheme = await AsyncStorage.getItem(THEME_STORAGE_KEY) as ColorScheme | null;
        
        // Fall back to system preference
        const systemScheme = getSystemColorScheme();
        const initialScheme = storedScheme || systemScheme;
        
        // Validate and set theme
        if (['light', 'dark'].includes(initialScheme)) {
          get().setColorScheme(initialScheme);
        } else {
          get().setColorScheme('light'); // Safe fallback
        }
      } catch (error) {
        console.warn('Failed to initialize theme from storage:', error);
        // Use system preference as fallback
        get().setColorScheme(getSystemColorScheme());
      }
    },

    persistTheme: async () => {
      const { colorScheme } = get();
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, colorScheme);
      } catch (error) {
        console.warn('Failed to persist theme:', error);
      }
    },

    validateTheme: (theme: Partial<Theme>) => {
      return validateTheme(theme);
    },
  }))
);

// NOTE: Appearance listener is now managed by StoreInitializer
// to ensure proper timing after navigation context is established
// See stores/store-initializer.ts

// Export theme configurations and utilities
export { lightTheme, darkTheme, animationPresets, validateTheme };
export default useThemeStore;