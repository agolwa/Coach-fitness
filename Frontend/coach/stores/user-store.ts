/**
 * Zustand User Store for React Native
 * Manages user preferences, authentication state, and weight units
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserStore,
  WeightUnit,
  AuthState,
  UserPreferences,
} from '../types/workout';
import {
  STORAGE_KEYS,
  DEFAULT_USER_PREFERENCES,
} from '../types/workout';

// Constants
const USER_STORAGE_KEY = STORAGE_KEYS.USER_PREFERENCES;
const PERSISTENCE_DEBOUNCE = 300; // ms

// Debounced persistence utility
let persistenceTimeout: any = null;
let isInitializing = false;

const debouncedPersist = (preferences: UserPreferences) => {
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }
  
  persistenceTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to persist user preferences:', error);
    }
  }, PERSISTENCE_DEBOUNCE);
};

// Weight unit conversion utilities
export const convertWeight = (
  weight: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return Math.round(weight * 2.20462 * 10) / 10; // Round to 1 decimal
  } else if (fromUnit === 'lbs' && toUnit === 'kg') {
    return Math.round(weight / 2.20462 * 10) / 10; // Round to 1 decimal
  }
  
  return weight;
};

export const formatWeight = (weight: number, unit: WeightUnit): string => {
  const rounded = Math.round(weight * 10) / 10;
  return `${rounded} ${unit}`;
};

// Validation utilities
const validateWeightUnit = (unit: any): unit is WeightUnit => {
  return unit === 'kg' || unit === 'lbs';
};

const validateAuthState = (state: any): state is AuthState => {
  return state === 'guest' || state === 'signed-in' || state === 'pending';
};

const validateUserPreferences = (prefs: any): prefs is UserPreferences => {
  if (!prefs || typeof prefs !== 'object') return false;
  
  return (
    validateWeightUnit(prefs.weightUnit) &&
    typeof prefs.canChangeWeightUnit === 'boolean' &&
    validateAuthState(prefs.authState) &&
    typeof prefs.isSignedIn === 'boolean' &&
    typeof prefs.isGuest === 'boolean'
  );
};

// Create the Zustand store
export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state from DEFAULT_USER_PREFERENCES
    ...DEFAULT_USER_PREFERENCES,
    isLoading: false,
    error: null,

    // Weight unit management actions
    setWeightUnit: (unit: WeightUnit) => {
      const state = get();
      
      if (!state.canChangeWeightUnit) {
        set({ 
          error: 'Cannot change weight unit during active workout session' 
        });
        return;
      }

      if (!validateWeightUnit(unit)) {
        set({ error: 'Invalid weight unit' });
        return;
      }

      const newPreferences = {
        weightUnit: unit,
        lastUpdated: new Date(),
      };

      set(newPreferences);
      
      // Persist preferences
      const fullState = { ...state, ...newPreferences };
      delete (fullState as any).isLoading;
      delete (fullState as any).error;
      delete (fullState as any).lastUpdated;
      
      debouncedPersist(fullState as UserPreferences);
    },

    setCanChangeWeightUnit: (canChange: boolean) => {
      const state = get();
      
      const newState = {
        canChangeWeightUnit: canChange,
        lastUpdated: new Date(),
      };

      set(newState);

      // Note: This doesn't persist immediately as it's often temporary
      // (locked during workout, unlocked when workout ends)
    },

    // Authentication actions
    signIn: () => {
      const state = get();
      
      const newPreferences = {
        authState: 'signed-in' as AuthState,
        isSignedIn: true,
        isGuest: false,
        lastUpdated: new Date(),
      };

      set(newPreferences);
      
      const fullState = { ...state, ...newPreferences };
      delete (fullState as any).isLoading;
      delete (fullState as any).error;
      delete (fullState as any).lastUpdated;
      
      debouncedPersist(fullState as UserPreferences);
    },

    signOut: () => {
      const state = get();
      
      const newPreferences = {
        authState: 'guest' as AuthState,
        isSignedIn: false,
        isGuest: true,
        canChangeWeightUnit: true, // Reset on sign out
        lastUpdated: new Date(),
      };

      set(newPreferences);
      
      const fullState = { ...state, ...newPreferences };
      delete (fullState as any).isLoading;
      delete (fullState as any).error;
      delete (fullState as any).lastUpdated;
      
      debouncedPersist(fullState as UserPreferences);
    },

    continueAsGuest: () => {
      const state = get();
      
      const newPreferences = {
        authState: 'guest' as AuthState,
        isSignedIn: false,
        isGuest: true,
        lastUpdated: new Date(),
      };

      set(newPreferences);
      
      const fullState = { ...state, ...newPreferences };
      delete (fullState as any).isLoading;
      delete (fullState as any).error;
      delete (fullState as any).lastUpdated;
      
      debouncedPersist(fullState as UserPreferences);
    },

    // Preference management
    updatePreferences: (preferences: Partial<UserPreferences>) => {
      const state = get();
      
      // Validate individual preference updates
      if (preferences.weightUnit && !validateWeightUnit(preferences.weightUnit)) {
        set({ error: 'Invalid weight unit in preferences' });
        return;
      }
      
      if (preferences.authState && !validateAuthState(preferences.authState)) {
        set({ error: 'Invalid auth state in preferences' });
        return;
      }

      // Ensure consistency between auth fields
      const newPreferences = {
        ...preferences,
        lastUpdated: new Date(),
      };

      // Auto-update related auth fields for consistency
      if (preferences.authState === 'signed-in') {
        newPreferences.isSignedIn = true;
        newPreferences.isGuest = false;
      } else if (preferences.authState === 'guest') {
        newPreferences.isSignedIn = false;
        newPreferences.isGuest = true;
      }

      set(newPreferences);
      
      const fullState = { ...state, ...newPreferences };
      delete (fullState as any).isLoading;
      delete (fullState as any).error;
      delete (fullState as any).lastUpdated;
      
      debouncedPersist(fullState as UserPreferences);
    },

    resetPreferences: () => {
      const newPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        lastUpdated: new Date(),
      };

      set(newPreferences);
      debouncedPersist(DEFAULT_USER_PREFERENCES);
    },

    // Initialization method with session recovery
    initializeUser: async () => {
      // Prevent multiple concurrent initializations
      if (isInitializing) {
        console.log('User store already initializing, skipping...');
        return;
      }
      
      try {
        isInitializing = true;
        set({ isLoading: true, error: null });

        const storedPreferences = await AsyncStorage.getItem(USER_STORAGE_KEY);
        
        if (storedPreferences) {
          const prefData = JSON.parse(storedPreferences);
          
          if (validateUserPreferences(prefData)) {
            // Session recovery: validate if stored authentication is still valid
            if (prefData.authState === 'signed-in' || prefData.authState === 'guest') {
              // For now, we trust stored auth state
              // In production, this would validate tokens with the backend
              
              set({
                ...prefData,
                isLoading: false,
              });
            } else {
              // Auth state is pending or invalid, use defaults
              set({
                ...DEFAULT_USER_PREFERENCES,
                isLoading: false,
              });
            }
          } else {
            console.warn('Invalid stored preferences, using defaults');
            set({
              ...DEFAULT_USER_PREFERENCES,
              isLoading: false,
            });
          }
        } else {
          // No stored preferences, use defaults (will show signup screen)
          set({
            ...DEFAULT_USER_PREFERENCES,
            isLoading: false,
          });
        }
      } catch (error) {
        console.warn('Failed to initialize user preferences from storage:', error);
        set({
          ...DEFAULT_USER_PREFERENCES,
          error: 'Failed to load user preferences',
          isLoading: false,
        });
      } finally {
        isInitializing = false;
      }
    },

    // Session recovery method for manual use
    recoverSession: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const storedPreferences = await AsyncStorage.getItem(USER_STORAGE_KEY);
        
        if (storedPreferences) {
          const prefData = JSON.parse(storedPreferences);
          
          if (validateUserPreferences(prefData) && 
              (prefData.authState === 'signed-in' || prefData.authState === 'guest')) {
            
            // Additional validation could go here
            // For example, checking token expiry, network validation, etc.
            
            set({
              ...prefData,
              isLoading: false,
            });
            
            return {
              success: true,
              message: 'Session recovered successfully',
              authState: prefData.authState,
            };
          }
        }
        
        // No valid session found
        set({
          ...DEFAULT_USER_PREFERENCES,
          isLoading: false,
        });
        
        return {
          success: false,
          message: 'No valid session found',
          authState: 'pending' as AuthState,
        };
        
      } catch (error) {
        console.error('Session recovery failed:', error);
        set({
          ...DEFAULT_USER_PREFERENCES,
          error: 'Session recovery failed',
          isLoading: false,
        });
        
        return {
          success: false,
          message: 'Session recovery failed',
          authState: 'pending' as AuthState,
        };
      }
    },

    // Utility methods
    getWeightUnitLabel: () => {
      const { weightUnit } = get();
      return weightUnit === 'kg' ? 'Kilograms' : 'Pounds';
    },

    canChangeUnit: () => {
      const { canChangeWeightUnit } = get();
      return canChangeWeightUnit;
    },

    isAuthenticated: () => {
      const { isSignedIn } = get();
      return isSignedIn;
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Force persistence (for testing or manual saves)
    persistPreferences: async () => {
      const state = get();
      
      try {
        const preferences: UserPreferences = {
          weightUnit: state.weightUnit,
          canChangeWeightUnit: state.canChangeWeightUnit,
          authState: state.authState,
          isSignedIn: state.isSignedIn,
          isGuest: state.isGuest,
        };
        
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(preferences));
        set({ lastUpdated: new Date() });
      } catch (error) {
        console.error('Failed to persist user preferences:', error);
        set({ error: 'Failed to save preferences' });
      }
    },
  }))
);

// Subscribe to workout store changes to manage weight unit locking
// This will be implemented when integrating with workout store

// Export utilities for use in other parts of the app
export { validateWeightUnit, validateAuthState, formatWeight };

// Export default for consistency
export default useUserStore;