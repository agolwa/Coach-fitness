/** @type {import('tailwindcss').Config} */
// Updated to use design tokens from styles/design-tokens.ts
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class', // Enable class-based dark mode for React Native
  theme: {
    extend: {
      colors: {
        // Core Colors - Now using exact Figma HEX values with HSL fallbacks
        background: 'var(--background, hsl(var(--background-hsl)))',
        foreground: 'var(--foreground, hsl(var(--foreground-hsl)))',
        card: {
          DEFAULT: 'var(--card, hsl(var(--card-hsl)))',
          foreground: 'var(--card-foreground, hsl(var(--card-foreground-hsl)))',
        },
        popover: {
          DEFAULT: 'var(--popover, hsl(var(--popover-hsl)))',
          foreground: 'var(--popover-foreground, hsl(var(--popover-foreground-hsl)))',
        },
        
        // Primary - Uber Green (exact Figma HEX with HSL fallback)
        primary: {
          DEFAULT: 'var(--primary, hsl(var(--primary-hsl)))',
          foreground: 'var(--primary-foreground, hsl(var(--primary-foreground-hsl)))',
        },
        
        // Secondary - Neutral grays (exact Figma HEX with HSL fallback)
        secondary: {
          DEFAULT: 'var(--secondary, hsl(var(--secondary-hsl)))',
          foreground: 'var(--secondary-foreground, hsl(var(--secondary-foreground-hsl)))',
        },
        
        // Muted - Light grays for subtle elements (exact Figma HEX with HSL fallback)
        muted: {
          DEFAULT: 'var(--muted, hsl(var(--muted-hsl)))',
          foreground: 'var(--muted-foreground, hsl(var(--muted-foreground-hsl)))',
        },
        
        // Accent - Slightly darker than secondary (exact Figma HEX with HSL fallback)
        accent: {
          DEFAULT: 'var(--accent, hsl(var(--accent-hsl)))',
          foreground: 'var(--accent-foreground, hsl(var(--accent-foreground-hsl)))',
        },
        
        // Destructive - Uber's red for errors (exact Figma HEX with HSL fallback)
        destructive: {
          DEFAULT: 'var(--destructive, hsl(var(--destructive-hsl)))',
          foreground: 'var(--destructive-foreground, hsl(var(--destructive-foreground-hsl)))',
        },
        
        // Borders and inputs (exact Figma HEX with HSL fallback)
        border: 'var(--border, hsl(var(--border-hsl)))',
        input: 'var(--input, hsl(var(--input-hsl)))',
        'input-background': 'var(--input-background, hsl(var(--input-background-hsl)))',
        'switch-background': 'var(--switch-background, hsl(var(--switch-background-hsl)))',
        ring: 'var(--ring, hsl(var(--ring-hsl)))',
        
        // Chart colors for data visualization (exact Figma HEX with HSL fallback)
        chart: {
          1: 'var(--chart-1, hsl(var(--chart-1-hsl)))',
          2: 'var(--chart-2, hsl(var(--chart-2-hsl)))',
          3: 'var(--chart-3, hsl(var(--chart-3-hsl)))',
          4: 'var(--chart-4, hsl(var(--chart-4-hsl)))',
          5: 'var(--chart-5, hsl(var(--chart-5-hsl)))',
        },
        
        // Sidebar colors (exact Figma HEX with HSL fallback)
        sidebar: {
          DEFAULT: 'var(--sidebar, hsl(var(--sidebar-hsl)))',
          foreground: 'var(--sidebar-foreground, hsl(var(--sidebar-foreground-hsl)))',
          primary: 'var(--sidebar-primary, hsl(var(--sidebar-primary-hsl)))',
          'primary-foreground': 'var(--sidebar-primary-foreground, hsl(var(--sidebar-primary-foreground-hsl)))',
          accent: 'var(--sidebar-accent, hsl(var(--sidebar-accent-hsl)))',
          'accent-foreground': 'var(--sidebar-accent-foreground, hsl(var(--sidebar-accent-foreground-hsl)))',
          border: 'var(--sidebar-border, hsl(var(--sidebar-border-hsl)))',
          ring: 'var(--sidebar-ring, hsl(var(--sidebar-ring-hsl)))',
        },
      },
      
      // Typography system from CSS
      fontWeight: {
        medium: 'var(--font-weight-medium)', // 500
        normal: 'var(--font-weight-normal)', // 400
        semibold: 'var(--font-weight-semibold)', // 600
      },
      
      // Border radius from CSS variables
      borderRadius: {
        sm: 'calc(var(--radius) - 2px)', // 6px
        DEFAULT: 'var(--radius)', // 8px
        md: 'var(--radius)', // 8px
        lg: 'calc(var(--radius) + 2px)', // 10px
        xl: 'calc(var(--radius) + 4px)', // 12px
      },
      
      // Font family matching CSS
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont', 
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      
      // Animation and transitions
      transitionDuration: {
        300: '300ms', // Theme transitions
        200: '200ms', // Button hovers
      },
      
      // Base font size
      fontSize: {
        base: 'var(--font-size)', // 14px
      },
      
      // Spacing system (using Tailwind defaults but can extend if needed)
      spacing: {
        // Additional spacing if needed can be added here
      },
      
      // Animation timing
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};