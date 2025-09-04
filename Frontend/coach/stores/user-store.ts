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
import { apiClient, TokenManager, type UserResponse } from '../services/api-client';
import CryptoJS from 'crypto-js';

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

    // Development helper - auto-login for testing
    signInAsTestUser: async () => {
      const state = get();
      
      try {
        console.log('🚀 Development: Creating test user authentication...');
        
        // Create a valid JWT token using the backend's secret key
        const jwtSecret = 'test_super_secret_jwt_key_for_authentication_tests_32_chars_min';
        const now = Math.floor(Date.now() / 1000);
        const exp = now + 3600; // 1 hour expiry
        
        const header = {
          alg: 'HS256',
          typ: 'JWT'
        };
        
        const payload = {
          sub: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format for test user
          email: 'test@example.com',
          iat: now,
          exp: exp
        };
        
        const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/=]/g, (match) => {
          return { '+': '-', '/': '_', '=': '' }[match] || match;
        });
        
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+/=]/g, (match) => {
          return { '+': '-', '/': '_', '=': '' }[match] || match;
        });
        
        const data = `${encodedHeader}.${encodedPayload}`;
        
        // Create HMAC-SHA256 signature
        const hmac = CryptoJS.HmacSHA256(data, jwtSecret);
        const signature = hmac.toString(CryptoJS.enc.Base64url);
        
        const jwtToken = `${data}.${signature}`;
        
        console.log('🚀 Development: Storing JWT token...');
        await TokenManager.setTokens({
          access_token: jwtToken,
          token_type: 'bearer',
          expires_in: 3600,
        });
        
        // Verify token was stored
        const storedToken = await TokenManager.getAccessToken();
        console.log('🚀 Development: Token stored successfully:', storedToken ? 'YES' : 'NO');
        
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
        
        console.log('🚀 Development: Test user signed in successfully');
        console.log('🚀 Development: Auth state:', newPreferences.authState);
        console.log('🚀 Development: Is signed in:', newPreferences.isSignedIn);
        
        // Test the authentication by making a call to /auth/me
        try {
          console.log('🚀 Development: Testing authentication with /auth/me...');
          const response = await apiClient.get('/auth/me');
          console.log('🚀 Development: Authentication test successful:', response);
        } catch (testError) {
          console.error('🚀 Development: Authentication test failed:', testError);
        }
        
      } catch (error) {
        console.error('Failed to create development JWT token:', error);
        // Fall back to guest mode if JWT creation fails
        get().continueAsGuest();
      }
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

        // Clear stored preferences in development mode to ensure fresh signed-in state
        if (__DEV__) {
          console.log('🧹 Development: Clearing stored user preferences for fresh state');
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }

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
        
        // In development mode, automatically sign in as test user
        if (__DEV__) {
          console.log('🚀 Development: Auto-signing in test user during initialization');
          await get().signInAsTestUser();
        }
        
      } catch (error) {
        console.warn('Failed to initialize user preferences from storage:', error);
        set({
          ...DEFAULT_USER_PREFERENCES,
          error: 'Failed to load user preferences',
          isLoading: false,
        });
        
        // Even if initialization failed, try to sign in as test user in development
        if (__DEV__) {
          try {
            await get().signInAsTestUser();
          } catch (signInError) {
            console.warn('Development: Failed to auto-sign in after init error:', signInError);
          }
        }
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

    // ============================================================================
    // Server Sync Methods (Phase 5.6)
    // ============================================================================

    /**
     * Sync local preferences with server
     * Updates server with current local preferences
     */
    syncPreferencesToServer: async () => {
      const state = get();
      
      if (!state.isSignedIn) {
        console.log('Not signed in, skipping server sync');
        return;
      }

      try {
        set({ isLoading: true, error: null });

        const serverPreferences = {
          weightUnit: state.weightUnit,
          theme: 'auto' as const, // Default theme
          defaultRestTimer: 60, // Default rest timer
          hapticFeedback: true, // Default haptic feedback
          soundEnabled: true, // Default sound
          autoStartRestTimer: false, // Default auto-start
        };

        const response = await apiClient.put<UserResponse>('/users/profile', {
          preferences: serverPreferences,
        });

        set({ 
          isLoading: false,
          lastUpdated: new Date(),
        });

        console.log('Preferences synced to server successfully');
        return response;
      } catch (error) {
        console.error('Failed to sync preferences to server:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to sync preferences to server' 
        });
        return null;
      }
    },

    /**
     * Fetch user profile from server and sync local preferences
     * Updates local state with server data
     */
    syncPreferencesFromServer: async () => {
      const state = get();
      
      if (!state.isSignedIn) {
        console.log('Not signed in, skipping server sync');
        return null;
      }

      try {
        set({ isLoading: true, error: null });

        console.log('🔄 Syncing preferences from server...');
        const userProfile = await apiClient.get<UserResponse>('/auth/me');

        // Update local preferences with server data
        const newPreferences = {
          weightUnit: userProfile.preferences.weightUnit,
          lastUpdated: new Date(),
        };

        set({ ...newPreferences, isLoading: false });

        // Persist to local storage
        const fullState = { ...state, ...newPreferences };
        delete (fullState as any).isLoading;
        delete (fullState as any).error;
        delete (fullState as any).lastUpdated;
        
        debouncedPersist(fullState as UserPreferences);

        console.log('✅ Preferences synced from server successfully');
        return userProfile;
      } catch (error) {
        console.error('❌ Failed to sync preferences from server:', error);
        
        // In development mode, don't fail session validation due to server sync issues
        if (__DEV__) {
          console.log('🚀 Development: Ignoring server sync failure, keeping session active');
          set({ 
            isLoading: false, 
            error: null  // Don't set error in dev mode
          });
          
          // Return a mock user profile for development
          return {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'test@example.com',
            display_name: 'Test User',
            preferences: {
              weightUnit: state.weightUnit || 'kg',
              theme: 'auto',
              defaultRestTimer: 60,
              hapticFeedback: true,
              soundEnabled: true,
              autoStartRestTimer: true,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserResponse;
        }
        
        set({ 
          isLoading: false, 
          error: 'Failed to sync preferences from server' 
        });
        
        // If authentication error, sign out user (but not in development mode)
        if (!__DEV__ && error instanceof Error && error.message.includes('401')) {
          get().signOut();
          await TokenManager.clearTokens();
        }
        
        return null;
      }
    },

    /**
     * Authenticate with server and sync profile
     * Called after successful authentication
     */
    authenticateWithServer: async (tokens: { 
      access_token: string; 
      token_type: string; 
      expires_in: number; 
      refresh_token?: string; 
    }) => {
      try {
        set({ isLoading: true, error: null });

        // Store tokens
        await TokenManager.setTokens(tokens);

        // Fetch user profile to get server preferences
        const userProfile = await get().syncPreferencesFromServer();

        if (userProfile) {
          // Update authentication state
          get().signIn();
          
          set({ isLoading: false });
          return userProfile;
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Server authentication failed:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to authenticate with server' 
        });
        
        // Clear tokens and sign out on failure
        await TokenManager.clearTokens();
        get().signOut();
        
        return null;
      }
    },

    /**
     * Sign out from server and clear all data
     * Comprehensive logout including server-side cleanup
     */
    signOutFromServer: async () => {
      try {
        set({ isLoading: true, error: null });

        // Optional: Call server logout endpoint
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          console.log('Server logout endpoint not available or failed');
        }

        // Clear tokens
        await TokenManager.clearTokens();

        // Update local state
        get().signOut();

        set({ isLoading: false });
        console.log('Signed out from server successfully');
      } catch (error) {
        console.error('Failed to sign out from server:', error);
        
        // Still perform local cleanup even if server call fails
        await TokenManager.clearTokens();
        get().signOut();
        
        set({ 
          isLoading: false, 
          error: 'Signed out locally, server logout may have failed' 
        });
      }
    },

    /**
     * Check server authentication status and sync if valid
     * Used for app initialization and session recovery
     */
    validateServerSession: async () => {
      try {
        console.log('🔍 Validating server session...');
        const accessToken = await TokenManager.getAccessToken();
        
        if (!accessToken) {
          console.log('❌ No access token found, user not authenticated');
          return false;
        }

        console.log('✅ Access token found, checking expiry...');
        const isExpired = await TokenManager.isTokenExpired();
        
        if (isExpired) {
          console.log('⚠️ Token expired, trying to refresh...');
          // Try to refresh token
          const refreshToken = await TokenManager.getRefreshToken();
          
          if (refreshToken) {
            try {
              const response = await apiClient.post('/auth/refresh', {
                refresh_token: refreshToken,
              });
              
              await TokenManager.setTokens(response);
              console.log('✅ Token refreshed successfully');
            } catch (error) {
              console.log('❌ Token refresh failed:', error);
              
              // In development mode, be more forgiving
              if (__DEV__) {
                console.log('🚀 Development: Allowing expired token to continue');
              } else {
                await TokenManager.clearTokens();
                get().signOut();
                return false;
              }
            }
          } else {
            console.log('❌ No refresh token available');
            
            // In development mode, be more forgiving
            if (__DEV__) {
              console.log('🚀 Development: Allowing session without refresh token');
            } else {
              await TokenManager.clearTokens();
              get().signOut();
              return false;
            }
          }
        }

        // Validate session with server
        console.log('🔄 Validating session with server...');
        const userProfile = await get().syncPreferencesFromServer();
        
        if (userProfile) {
          console.log('✅ Server session validated successfully');
          return true;
        } else {
          console.log('⚠️ Server session validation returned no profile');
          // In development mode, still consider it valid if we have a token
          if (__DEV__) {
            console.log('🚀 Development: Accepting session despite sync failure');
            return true;
          }
          return false;
        }
      } catch (error) {
        console.error('❌ Session validation failed:', error);
        
        // In development mode, be more forgiving with validation errors
        if (__DEV__) {
          console.log('🚀 Development: Ignoring session validation errors');
          return true;
        }
        
        await TokenManager.clearTokens();
        get().signOut();
        return false;
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
