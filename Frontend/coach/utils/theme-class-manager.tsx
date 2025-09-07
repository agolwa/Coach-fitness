/**
 * Theme Class Manager
 * Extends the existing theme system to properly apply dark class for NativeWind
 * Bridges the gap between theme store state and UI rendering
 */

import React from 'react';
import { Platform } from 'react-native';
import { useThemeStore } from '../stores/theme-store';
import type { ColorScheme } from '../types/theme';

/**
 * Theme Class Manager for React Native
 * Handles the application of theme classes and provides utilities
 * for components to respond to theme changes
 */
export class ThemeClassManager {
  private static instance: ThemeClassManager | null = null;
  private currentScheme: ColorScheme = 'light';
  private listeners: Set<(scheme: ColorScheme) => void> = new Set();

  private constructor() {
    // Initialize with current theme store state
    this.currentScheme = useThemeStore.getState().colorScheme;
    
    // Subscribe to theme store changes
    useThemeStore.subscribe(
      (state) => state.colorScheme,
      (colorScheme) => {
        this.setColorScheme(colorScheme);
      }
    );
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ThemeClassManager {
    if (!ThemeClassManager.instance) {
      ThemeClassManager.instance = new ThemeClassManager();
    }
    return ThemeClassManager.instance;
  }

  /**
   * Set the current color scheme and notify listeners
   */
  setColorScheme(scheme: ColorScheme): void {
    if (this.currentScheme === scheme) return;
    
    this.currentScheme = scheme;
    this.applyThemeClass(scheme);
    this.notifyListeners(scheme);
  }

  /**
   * Get current color scheme
   */
  getCurrentScheme(): ColorScheme {
    return this.currentScheme;
  }

  /**
   * Apply theme class - platform specific implementation
   */
  private applyThemeClass(scheme: ColorScheme): void {
    if (Platform.OS === 'web') {
      // For web platform, apply dark class to document root
      const root = document.documentElement;
      if (scheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    // For native platforms, the dark class is applied at the root View level in AppContent
    // This ensures CSS variables and NativeWind dark: modifiers work correctly
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (scheme: ColorScheme) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(scheme: ColorScheme): void {
    this.listeners.forEach(listener => {
      try {
        listener(scheme);
      } catch (error) {
        console.warn('Theme listener error:', error);
      }
    });
  }

  /**
   * Get theme class string for components
   */
  getThemeClass(): string {
    return this.currentScheme === 'dark' ? 'dark' : '';
  }

  /**
   * Get theme-aware class names
   * Utility function for components to use conditional classes
   */
  getConditionalClasses(lightClass: string, darkClass: string): string {
    return this.currentScheme === 'dark' ? darkClass : lightClass;
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.currentScheme === 'dark';
  }

  /**
   * Check if current theme is light
   */
  isLight(): boolean {
    return this.currentScheme === 'light';
  }

  /**
   * Initialize theme class manager
   * Should be called early in app lifecycle
   */
  static initialize(): ThemeClassManager {
    const instance = ThemeClassManager.getInstance();
    // Apply initial theme class
    instance.applyThemeClass(instance.currentScheme);
    return instance;
  }

  /**
   * Reset instance (for testing)
   */
  static reset(): void {
    ThemeClassManager.instance = null;
  }
}

/**
 * Hook for components to use theme class manager
 */
export const useThemeClassManager = () => {
  const manager = ThemeClassManager.getInstance();
  
  return {
    manager,
    isDark: manager.isDark(),
    isLight: manager.isLight(),
    getThemeClass: () => manager.getThemeClass(),
    getConditionalClasses: (lightClass: string, darkClass: string) => 
      manager.getConditionalClasses(lightClass, darkClass),
  };
};

/**
 * Higher-order component for automatic theme class application
 */
export const withThemeClasses = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return function ThemedComponent(props: P) {
    const { getThemeClass } = useThemeClassManager();
    
    // Apply theme class to the component wrapper if needed
    // This is mainly for web platform compatibility
    return <Component {...props} data-theme={getThemeClass()} />;
  };
};

/**
 * Utility function to get theme-aware styles
 */
export const getThemeAwareStyle = (
  lightStyle: object,
  darkStyle: object,
  scheme?: ColorScheme
): object => {
  const currentScheme = scheme || ThemeClassManager.getInstance().getCurrentScheme();
  return currentScheme === 'dark' ? { ...lightStyle, ...darkStyle } : lightStyle;
};

/**
 * Initialize theme class manager - call this early in app lifecycle
 */
export const initializeThemeClassManager = (): void => {
  ThemeClassManager.initialize();
};

export default ThemeClassManager;