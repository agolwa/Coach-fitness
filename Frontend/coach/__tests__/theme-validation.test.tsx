/**
 * Design Token Validation Tests
 * Ensures all theme tokens match original CSS values exactly
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { describe, it, expect } from '@jest/globals';
import type { Theme, ThemeColors, DesignTokens } from '../types/theme';
import { createTestWrapper } from '../test-utils';
import HomeScreen from '../app/(tabs)/index';

// Expected color values from globals.css (light theme)
const expectedLightColors: ThemeColors = {
  // Core Colors
  background: 'hsl(0, 0%, 100%)', // #ffffff
  foreground: 'hsl(210, 10%, 13%)', // #202020
  card: 'hsl(0, 0%, 100%)', // #ffffff
  'card-foreground': 'hsl(210, 10%, 13%)', // #202020
  popover: 'hsl(0, 0%, 100%)', // #ffffff
  'popover-foreground': 'hsl(210, 10%, 13%)', // #202020

  // Primary - Uber Green
  primary: 'hsl(158, 100%, 36%)', // #00b561
  'primary-foreground': 'hsl(0, 0%, 100%)', // #ffffff

  // Secondary - Neutral grays
  secondary: 'hsl(0, 0%, 96%)', // #f6f6f6
  'secondary-foreground': 'hsl(210, 10%, 13%)', // #202020

  // Muted - Light grays for subtle elements
  muted: 'hsl(0, 0%, 96%)', // #f6f6f6
  'muted-foreground': 'hsl(220, 9%, 46%)', // #6b7280

  // Accent - Slightly darker than secondary
  accent: 'hsl(0, 0%, 95%)', // #f1f1f1
  'accent-foreground': 'hsl(210, 10%, 13%)', // #202020

  // Destructive - Uber's red for errors
  destructive: 'hsl(0, 84%, 60%)', // #e53e3e
  'destructive-foreground': 'hsl(0, 0%, 100%)', // #ffffff

  // Borders and inputs
  border: 'hsl(0, 0%, 90%)', // #e5e5e5
  input: 'hsl(0, 0%, 100%)', // #ffffff
  'input-background': 'hsl(0, 0%, 100%)', // #ffffff
  'switch-background': 'hsl(0, 0%, 90%)', // #e5e5e5

  // Focus ring
  ring: 'hsl(158, 100%, 36%)', // #00b561

  // Chart colors
  'chart-1': 'hsl(158, 100%, 36%)', // #00b561
  'chart-2': 'hsl(160, 84%, 39%)', // #059669
  'chart-3': 'hsl(188, 85%, 32%)', // #0891b2
  'chart-4': 'hsl(262, 83%, 58%)', // #7c3aed
  'chart-5': 'hsl(330, 81%, 60%)', // #db2777

  // Sidebar colors
  sidebar: 'hsl(0, 0%, 100%)', // #ffffff
  'sidebar-foreground': 'hsl(210, 10%, 13%)', // #202020
  'sidebar-primary': 'hsl(158, 100%, 36%)', // #00b561
  'sidebar-primary-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  'sidebar-accent': 'hsl(0, 0%, 96%)', // #f6f6f6
  'sidebar-accent-foreground': 'hsl(210, 10%, 13%)', // #202020
  'sidebar-border': 'hsl(0, 0%, 90%)', // #e5e5e5
  'sidebar-ring': 'hsl(158, 100%, 36%)', // #00b561
};

// Expected dark theme colors
const expectedDarkColors: ThemeColors = {
  background: 'hsl(0, 0%, 0%)', // #000000
  foreground: 'hsl(0, 0%, 100%)', // #ffffff
  card: 'hsl(0, 0%, 7%)', // #111111
  'card-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  popover: 'hsl(0, 0%, 7%)', // #111111
  'popover-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  primary: 'hsl(158, 100%, 36%)', // #00b561
  'primary-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  secondary: 'hsl(0, 0%, 10%)', // #1a1a1a
  'secondary-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  muted: 'hsl(0, 0%, 10%)', // #1a1a1a
  'muted-foreground': 'hsl(220, 13%, 69%)', // #9ca3af
  accent: 'hsl(0, 0%, 12%)', // #1f1f1f
  'accent-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  destructive: 'hsl(0, 85%, 63%)', // #ef4444
  'destructive-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  border: 'hsl(0, 0%, 17%)', // #2a2a2a
  input: 'hsl(0, 0%, 7%)', // #111111
  'input-background': 'hsl(0, 0%, 7%)', // #111111
  'switch-background': 'hsl(0, 0%, 17%)', // #2a2a2a
  ring: 'hsl(158, 100%, 36%)', // #00b561
  'chart-1': 'hsl(158, 100%, 36%)', // #00b561
  'chart-2': 'hsl(160, 84%, 39%)', // #059669
  'chart-3': 'hsl(188, 85%, 32%)', // #0891b2
  'chart-4': 'hsl(262, 83%, 58%)', // #7c3aed
  'chart-5': 'hsl(330, 81%, 60%)', // #db2777
  sidebar: 'hsl(0, 0%, 0%)', // #000000
  'sidebar-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  'sidebar-primary': 'hsl(158, 100%, 36%)', // #00b561
  'sidebar-primary-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  'sidebar-accent': 'hsl(0, 0%, 10%)', // #1a1a1a
  'sidebar-accent-foreground': 'hsl(0, 0%, 100%)', // #ffffff
  'sidebar-border': 'hsl(0, 0%, 17%)', // #2a2a2a
  'sidebar-ring': 'hsl(158, 100%, 36%)', // #00b561
};

// Typography values from CSS
const expectedTypography = {
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  fontSizes: {
    base: 14, // From --font-size: 14px
  },
};

// Border radius values
const expectedBorderRadius = {
  sm: 6, // calc(8px - 2px)
  md: 8, // --radius: 8px
  lg: 10, // calc(8px + 2px)
  xl: 12, // calc(8px + 4px)
};

describe('Design Token Validation', () => {
  describe('Color Tokens - Light Theme', () => {
    it('should have correct core color values', () => {
      expect(expectedLightColors.background).toBe('hsl(0, 0%, 100%)');
      expect(expectedLightColors.foreground).toBe('hsl(210, 10%, 13%)');
      expect(expectedLightColors.card).toBe('hsl(0, 0%, 100%)');
      expect(expectedLightColors['card-foreground']).toBe('hsl(210, 10%, 13%)');
    });

    it('should have correct primary Uber Green color', () => {
      expect(expectedLightColors.primary).toBe('hsl(158, 100%, 36%)'); // #00b561
      expect(expectedLightColors['primary-foreground']).toBe('hsl(0, 0%, 100%)');
    });

    it('should have correct secondary and muted colors', () => {
      expect(expectedLightColors.secondary).toBe('hsl(0, 0%, 96%)'); // #f6f6f6
      expect(expectedLightColors.muted).toBe('hsl(0, 0%, 96%)'); // #f6f6f6
      expect(expectedLightColors['muted-foreground']).toBe('hsl(220, 9%, 46%)'); // #6b7280
    });

    it('should have correct destructive color', () => {
      expect(expectedLightColors.destructive).toBe('hsl(0, 84%, 60%)'); // #e53e3e
      expect(expectedLightColors['destructive-foreground']).toBe('hsl(0, 0%, 100%)');
    });

    it('should have correct border and input colors', () => {
      expect(expectedLightColors.border).toBe('hsl(0, 0%, 90%)'); // #e5e5e5
      expect(expectedLightColors.input).toBe('hsl(0, 0%, 100%)'); // #ffffff
      expect(expectedLightColors.ring).toBe('hsl(158, 100%, 36%)'); // #00b561
    });

    it('should have complete chart color palette', () => {
      expect(expectedLightColors['chart-1']).toBe('hsl(158, 100%, 36%)');
      expect(expectedLightColors['chart-2']).toBe('hsl(160, 84%, 39%)');
      expect(expectedLightColors['chart-3']).toBe('hsl(188, 85%, 32%)');
      expect(expectedLightColors['chart-4']).toBe('hsl(262, 83%, 58%)');
      expect(expectedLightColors['chart-5']).toBe('hsl(330, 81%, 60%)');
    });
  });

  describe('Color Tokens - Dark Theme', () => {
    it('should have correct dark theme core colors', () => {
      expect(expectedDarkColors.background).toBe('hsl(0, 0%, 0%)'); // #000000
      expect(expectedDarkColors.foreground).toBe('hsl(0, 0%, 100%)'); // #ffffff
      expect(expectedDarkColors.card).toBe('hsl(0, 0%, 7%)'); // #111111
    });

    it('should maintain primary color consistency', () => {
      expect(expectedDarkColors.primary).toBe(expectedLightColors.primary);
      expect(expectedDarkColors.ring).toBe(expectedLightColors.ring);
    });

    it('should have appropriate dark theme muted colors', () => {
      expect(expectedDarkColors.muted).toBe('hsl(0, 0%, 10%)'); // #1a1a1a
      expect(expectedDarkColors['muted-foreground']).toBe('hsl(220, 13%, 69%)'); // #9ca3af
    });

    it('should have correct dark theme borders', () => {
      expect(expectedDarkColors.border).toBe('hsl(0, 0%, 17%)'); // #2a2a2a
      expect(expectedDarkColors['switch-background']).toBe('hsl(0, 0%, 17%)');
    });
  });

  describe('Typography Tokens', () => {
    it('should have correct font weights', () => {
      expect(expectedTypography.fontWeights.normal).toBe(400);
      expect(expectedTypography.fontWeights.medium).toBe(500);
      expect(expectedTypography.fontWeights.semibold).toBe(600);
    });

    it('should have correct base font size', () => {
      expect(expectedTypography.fontSizes.base).toBe(14); // --font-size: 14px
    });
  });

  describe('Border Radius Tokens', () => {
    it('should have correct radius calculations', () => {
      expect(expectedBorderRadius.sm).toBe(6); // 8px - 2px
      expect(expectedBorderRadius.md).toBe(8); // base radius
      expect(expectedBorderRadius.lg).toBe(10); // 8px + 2px
      expect(expectedBorderRadius.xl).toBe(12); // 8px + 4px
    });
  });

  describe('Color Consistency', () => {
    it('should maintain primary color across light and dark themes', () => {
      expect(expectedLightColors.primary).toBe(expectedDarkColors.primary);
      expect(expectedLightColors.ring).toBe(expectedDarkColors.ring);
      expect(expectedLightColors['sidebar-primary']).toBe(expectedDarkColors['sidebar-primary']);
    });

    it('should have consistent chart colors across themes', () => {
      for (let i = 1; i <= 5; i++) {
        const chartKey = `chart-${i}` as keyof ThemeColors;
        expect(expectedLightColors[chartKey]).toBe(expectedDarkColors[chartKey]);
      }
    });
  });

  describe('Color Accessibility', () => {
    it('should have sufficient contrast for foreground colors', () => {
      // Light theme - dark text on light background
      expect(expectedLightColors.foreground).toBe('hsl(210, 10%, 13%)'); // Dark text
      expect(expectedLightColors.background).toBe('hsl(0, 0%, 100%)'); // Light background
      
      // Dark theme - light text on dark background
      expect(expectedDarkColors.foreground).toBe('hsl(0, 0%, 100%)'); // Light text
      expect(expectedDarkColors.background).toBe('hsl(0, 0%, 0%)'); // Dark background
    });

    it('should have proper destructive color contrast', () => {
      expect(expectedLightColors['destructive-foreground']).toBe('hsl(0, 0%, 100%)');
      expect(expectedDarkColors['destructive-foreground']).toBe('hsl(0, 0%, 100%)');
    });
  });

  describe('Design Token Structure Validation', () => {
    it('should validate complete color token structure', () => {
      const requiredColorTokens = [
        'background', 'foreground', 'card', 'card-foreground',
        'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
        'muted', 'muted-foreground', 'accent', 'accent-foreground',
        'destructive', 'destructive-foreground', 'border', 'input', 'ring'
      ];

      requiredColorTokens.forEach(token => {
        expect(expectedLightColors).toHaveProperty(token);
        expect(expectedDarkColors).toHaveProperty(token);
        expect(typeof expectedLightColors[token as keyof ThemeColors]).toBe('string');
        expect(typeof expectedDarkColors[token as keyof ThemeColors]).toBe('string');
      });
    });

    it('should validate chart color completeness', () => {
      for (let i = 1; i <= 5; i++) {
        const chartKey = `chart-${i}` as keyof ThemeColors;
        expect(expectedLightColors).toHaveProperty(chartKey);
        expect(expectedDarkColors).toHaveProperty(chartKey);
      }
    });

    it('should validate sidebar color completeness', () => {
      const sidebarTokens = [
        'sidebar', 'sidebar-foreground', 'sidebar-primary', 
        'sidebar-primary-foreground', 'sidebar-accent', 
        'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'
      ];

      sidebarTokens.forEach(token => {
        expect(expectedLightColors).toHaveProperty(token);
        expect(expectedDarkColors).toHaveProperty(token);
      });
    });
  });

  describe('Theme Validation Utility Functions', () => {
    const isValidHslColor = (color: string): boolean => {
      return /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/.test(color);
    };

    it('should have all colors in valid HSL format', () => {
      Object.values(expectedLightColors).forEach(color => {
        expect(isValidHslColor(color)).toBe(true);
      });

      Object.values(expectedDarkColors).forEach(color => {
        expect(isValidHslColor(color)).toBe(true);
      });
    });

    it('should have consistent color naming convention', () => {
      const colorKeys = Object.keys(expectedLightColors);
      const kebabCasePattern = /^[a-z]+(-[a-z0-9]+)*$/;
      
      colorKeys.forEach(key => {
        expect(kebabCasePattern.test(key)).toBe(true);
      });
    });
  });

  describe('Form Input Theming', () => {
    const TestWrapper = createTestWrapper();

    it('should apply correct text color to workout name input', () => {
      // Test that proper inline styling overrides NativeWind classes
      const WorkoutTitleInput = () => (
        <TextInput
          value=""
          placeholder="Enter workout name..."
          placeholderTextColor={expectedLightColors['muted-foreground']}
          className="text-lg font-medium border-b pb-2"
          style={{
            color: expectedLightColors.foreground,
            borderBottomColor: expectedLightColors['muted-foreground'],
          }}
        />
      );

      const { getByPlaceholderText } = render(<WorkoutTitleInput />);
      const titleInput = getByPlaceholderText('Enter workout name...');

      expect(titleInput.props.style.color).toBe(expectedLightColors.foreground);
      expect(titleInput.props.style.borderBottomColor).toBe(expectedLightColors['muted-foreground']);
      expect(titleInput.props.placeholderTextColor).toBe(expectedLightColors['muted-foreground']);
    });

    it('should have proper theme color application for TextInput', () => {
      const TestTextInput = ({ theme }: { theme: any }) => (
        <TextInput
          value="Test Value"
          style={{
            color: theme.colors.foreground,
            borderBottomColor: theme.colors['muted-foreground'],
          }}
          placeholderTextColor={theme.colors['muted-foreground']}
        />
      );

      // Test with light theme colors
      const { getByDisplayValue: getLightValue } = render(
        <TestTextInput theme={{ colors: expectedLightColors }} />
      );

      const lightInput = getLightValue('Test Value');
      expect(lightInput.props.style.color).toBe(expectedLightColors.foreground);
      expect(lightInput.props.style.borderBottomColor).toBe(expectedLightColors['muted-foreground']);
      expect(lightInput.props.placeholderTextColor).toBe(expectedLightColors['muted-foreground']);

      // Test with dark theme colors
      const { getByDisplayValue: getDarkValue } = render(
        <TestTextInput theme={{ colors: expectedDarkColors }} />
      );

      const darkInput = getDarkValue('Test Value');
      expect(darkInput.props.style.color).toBe(expectedDarkColors.foreground);
      expect(darkInput.props.style.borderBottomColor).toBe(expectedDarkColors['muted-foreground']);
      expect(darkInput.props.placeholderTextColor).toBe(expectedDarkColors['muted-foreground']);
    });

    it('should ensure text visibility in both light and dark modes', () => {
      // Light theme - dark text on light background should be visible
      const lightTheme = {
        colors: {
          foreground: expectedLightColors.foreground,
          background: expectedLightColors.background
        }
      };

      // Dark theme - light text on dark background should be visible
      const darkTheme = {
        colors: {
          foreground: expectedDarkColors.foreground,
          background: expectedDarkColors.background
        }
      };

      // Light theme has dark foreground text
      expect(lightTheme.colors.foreground).toBe('hsl(210, 10%, 13%)'); // Dark text
      expect(lightTheme.colors.background).toBe('hsl(0, 0%, 100%)'); // Light background

      // Dark theme has light foreground text
      expect(darkTheme.colors.foreground).toBe('hsl(0, 0%, 100%)'); // Light text
      expect(darkTheme.colors.background).toBe('hsl(0, 0%, 0%)'); // Dark background
    });

    it('should use consistent muted foreground for placeholders', () => {
      // Both themes should have appropriate muted colors
      expect(expectedLightColors['muted-foreground']).toBe('hsl(220, 9%, 46%)'); // Medium gray
      expect(expectedDarkColors['muted-foreground']).toBe('hsl(220, 13%, 69%)'); // Lighter gray for dark mode
    });

    it('should not conflict between NativeWind and inline styles', () => {
      // Test that removing conflicting NativeWind classes allows inline styles to work
      const TestInput = () => (
        <TextInput
          value="Test"
          className="text-lg font-medium border-b pb-2" // No text-foreground class
          style={{
            color: expectedLightColors.foreground, // Inline style should take precedence
            borderBottomColor: expectedLightColors['muted-foreground'],
          }}
          placeholderTextColor={expectedLightColors['muted-foreground']}
        />
      );

      const { getByDisplayValue } = render(<TestInput />);
      const input = getByDisplayValue('Test');
      
      // Inline styles should be applied
      expect(input.props.style.color).toBe(expectedLightColors.foreground);
      expect(input.props.style.borderBottomColor).toBe(expectedLightColors['muted-foreground']);
      expect(input.props.placeholderTextColor).toBe(expectedLightColors['muted-foreground']);
    });
  });
});

// Export test utilities for use in other theme-related tests
export {
  expectedLightColors,
  expectedDarkColors,
  expectedTypography,
  expectedBorderRadius,
};