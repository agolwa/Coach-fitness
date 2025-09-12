/**
 * Store Initializer
 * Manages the initialization of all stores and their side effects
 * Ensures proper timing - stores only initialize AFTER React Navigation context exists
 */

import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from './theme-store';
import { useUserStore } from './user-store';
import { useExerciseStore } from './exercise-store';
import { useWorkoutStore } from './workout-store';
import { useNavigationStore, setupAppStateHandling, cleanupAppStateHandling } from './navigation-store';

export class StoreInitializer {
  private static initialized = false;
  private static appearanceListener: any = null;

  /**
   * Initialize all stores and their side effects
   * Should only be called AFTER navigation context is established
   */
  static initialize() {
    if (this.initialized) {
      console.log('StoreInitializer: Already initialized, skipping');
      return;
    }

    console.log('StoreInitializer: Starting initialization...');

    try {
      // Initialize theme store appearance listener
      this.initializeThemeListener();
      
      // Initialize navigation store AppState handling
      setupAppStateHandling();
      console.log('StoreInitializer: Navigation AppState handler initialized');

      // Initialize all data stores
      Promise.all([
        useThemeStore.getState().initializeTheme?.() || Promise.resolve(),
        useUserStore.getState().initializeUser?.() || Promise.resolve(),
        useExerciseStore.getState().loadExercises?.() || Promise.resolve(),
        useWorkoutStore.getState().initializeWorkout?.() || Promise.resolve(),
        useNavigationStore.getState().initializeNavigation?.() || Promise.resolve(),
      ]).then(() => {
        console.log('StoreInitializer: All stores initialized successfully');
      }).catch((error) => {
        console.warn('StoreInitializer: Some stores failed to initialize:', error);
      });

      this.initialized = true;
      console.log('StoreInitializer: Initialization complete');
    } catch (error) {
      console.error('StoreInitializer: Failed to initialize:', error);
    }
  }

  /**
   * Clean up all listeners and resources
   */
  static cleanup() {
    if (this.appearanceListener) {
      this.appearanceListener.remove();
      this.appearanceListener = null;
    }
    
    // Clean up navigation store AppState handling
    cleanupAppStateHandling();
    console.log('StoreInitializer: Navigation AppState handler cleaned up');

    this.initialized = false;
    console.log('StoreInitializer: Cleanup complete');
  }

  /**
   * Initialize theme store appearance listener
   * Moved from theme-store.ts to ensure proper timing
   */
  private static initializeThemeListener() {
    // Subscribe to system appearance changes
    this.appearanceListener = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('StoreInitializer: System appearance changed to:', colorScheme);
      
      // Only update if user hasn't set a manual preference
      AsyncStorage.getItem('@theme_preference').then(storedScheme => {
        if (!storedScheme && colorScheme) {
          const newColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
          console.log('StoreInitializer: Updating theme to system preference:', newColorScheme);
          useThemeStore.getState().setColorScheme(newColorScheme);
        }
      }).catch(error => {
        console.warn('StoreInitializer: Failed to check stored theme preference:', error);
      });
    });

    console.log('StoreInitializer: Theme listener initialized');
  }

  /**
   * Check if stores are initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Force re-initialization (useful for development/testing)
   */
  static reinitialize() {
    this.cleanup();
    this.initialize();
  }
}

export default StoreInitializer;