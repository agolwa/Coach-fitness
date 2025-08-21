/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode for React Native
  theme: {
    extend: {
      colors: {
        // Core Colors - Uber's characteristic palette with dark mode support
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        
        // Primary - Uber Green
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        
        // Secondary - Neutral grays
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        
        // Muted - Light grays for subtle elements
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        
        // Accent - Slightly darker than secondary
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        
        // Destructive - Uber's red for errors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        
        // Borders and inputs
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        'input-background': 'hsl(var(--input-background))',
        'switch-background': 'hsl(var(--switch-background))',
        ring: 'hsl(var(--ring))',
        
        // Chart colors for data visualization
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        
        // Sidebar colors (if needed)
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
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
      
      // Box shadows for cards (React Native compatible)
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};