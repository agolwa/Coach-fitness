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
        // Core Colors - RGB values for proper opacity support with HSL fallbacks
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        
        // Primary - Uber Green (RGB for opacity support with HSL fallback)
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        
        // Secondary - Neutral grays (RGB for opacity support with HSL fallback)
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        
        // Muted - Light grays for subtle elements (RGB for opacity support with HSL fallback)
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        
        // Accent - Slightly darker than secondary (RGB for opacity support with HSL fallback)
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        
        // Destructive - Uber's red for errors (RGB for opacity support with HSL fallback)
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        
        // Borders and inputs (RGB for opacity support with HSL fallback)
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        'input-background': 'rgb(var(--input-background) / <alpha-value>)',
        'switch-background': 'rgb(var(--switch-background) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        
        // Chart colors for data visualization (RGB for opacity support with HSL fallback)
        chart: {
          1: 'rgb(var(--chart-1) / <alpha-value>)',
          2: 'rgb(var(--chart-2) / <alpha-value>)',
          3: 'rgb(var(--chart-3) / <alpha-value>)',
          4: 'rgb(var(--chart-4) / <alpha-value>)',
          5: 'rgb(var(--chart-5) / <alpha-value>)',
        },
        
        // Sidebar colors (RGB for opacity support with HSL fallback)
        sidebar: {
          DEFAULT: 'rgb(var(--sidebar) / <alpha-value>)',
          foreground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
          primary: 'rgb(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground': 'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
          accent: 'rgb(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground': 'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
          border: 'rgb(var(--sidebar-border) / <alpha-value>)',
          ring: 'rgb(var(--sidebar-ring) / <alpha-value>)',
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