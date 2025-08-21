/**
 * User Hooks for Component Integration
 * Provides convenient hooks for user preferences and authentication
 */

import { useCallback, useEffect } from 'react';
import { useUserStore } from '../stores/user-store';
import { convertWeight, formatWeight } from '../stores/user-store';
import type { WeightUnit, AuthState } from '../types/workout';

// Main user hook
export const useUser = () => {
  const userStore = useUserStore();

  // Initialize user preferences on mount
  useEffect(() => {
    if (typeof userStore.initializeUser === 'function') {
      userStore.initializeUser();
    }
  }, []);

  return {
    // State
    weightUnit: userStore.weightUnit,
    canChangeWeightUnit: userStore.canChangeWeightUnit,
    authState: userStore.authState,
    isSignedIn: userStore.isSignedIn,
    isGuest: userStore.isGuest,
    isLoading: userStore.isLoading,
    error: userStore.error,
    lastUpdated: userStore.lastUpdated,

    // Actions
    setWeightUnit: userStore.setWeightUnit,
    setCanChangeWeightUnit: userStore.setCanChangeWeightUnit,
    signIn: userStore.signIn,
    signOut: userStore.signOut,
    continueAsGuest: userStore.continueAsGuest,
    updatePreferences: userStore.updatePreferences,
    resetPreferences: userStore.resetPreferences,
    clearError: userStore.clearError,

    // Utilities
    getWeightUnitLabel: userStore.getWeightUnitLabel,
    canChangeUnit: userStore.canChangeUnit,
    isAuthenticated: userStore.isAuthenticated,
  };
};

// Hook for weight unit management
export const useWeightUnit = () => {
  const { 
    weightUnit, 
    canChangeWeightUnit, 
    setWeightUnit, 
    getWeightUnitLabel,
    error,
    clearError,
  } = useUser();

  const toggleWeightUnit = useCallback(() => {
    if (canChangeWeightUnit) {
      const newUnit: WeightUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
      setWeightUnit(newUnit);
    }
  }, [weightUnit, canChangeWeightUnit, setWeightUnit]);

  const convertWeightValue = useCallback((
    weight: number, 
    fromUnit: WeightUnit, 
    toUnit: WeightUnit
  ) => {
    return convertWeight(weight, fromUnit, toUnit);
  }, []);

  const formatWeightValue = useCallback((weight: number, unit?: WeightUnit) => {
    return formatWeight(weight, unit || weightUnit);
  }, [weightUnit]);

  const getAlternativeUnit = useCallback((): WeightUnit => {
    return weightUnit === 'kg' ? 'lbs' : 'kg';
  }, [weightUnit]);

  const convertToCurrentUnit = useCallback((weight: number, fromUnit: WeightUnit) => {
    return convertWeight(weight, fromUnit, weightUnit);
  }, [weightUnit]);

  const convertFromCurrentUnit = useCallback((weight: number, toUnit: WeightUnit) => {
    return convertWeight(weight, weightUnit, toUnit);
  }, [weightUnit]);

  return {
    weightUnit,
    canChangeWeightUnit,
    unitLabel: getWeightUnitLabel(),
    alternativeUnit: getAlternativeUnit(),
    error,
    setWeightUnit,
    toggleWeightUnit,
    convertWeight: convertWeightValue,
    formatWeight: formatWeightValue,
    convertToCurrentUnit,
    convertFromCurrentUnit,
    clearError,
  };
};

// Hook for authentication management
export const useAuth = () => {
  const {
    authState,
    isSignedIn,
    isGuest,
    signIn,
    signOut,
    continueAsGuest,
    isLoading,
    error,
    clearError,
  } = useUser();

  const handleSignIn = useCallback(async () => {
    try {
      signIn();
      return { success: true, message: 'Successfully signed in!' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to sign in' 
      };
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    try {
      signOut();
      return { success: true, message: 'Successfully signed out!' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to sign out' 
      };
    }
  }, [signOut]);

  const handleContinueAsGuest = useCallback(() => {
    continueAsGuest();
    return { success: true, message: 'Continuing as guest' };
  }, [continueAsGuest]);

  const getAuthStatus = useCallback((): {
    status: AuthState;
    canSaveWorkouts: boolean;
    showSignUpPrompt: boolean;
  } => {
    return {
      status: authState,
      canSaveWorkouts: isSignedIn,
      showSignUpPrompt: isGuest,
    };
  }, [authState, isSignedIn, isGuest]);

  return {
    authState,
    isSignedIn,
    isGuest,
    isLoading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
    continueAsGuest: handleContinueAsGuest,
    getAuthStatus,
    clearError,
  };
};

// Hook for user preferences management
export const useUserPreferences = () => {
  const {
    weightUnit,
    canChangeWeightUnit,
    updatePreferences,
    resetPreferences,
    isLoading,
    error,
    clearError,
  } = useUser();

  const updateWeightUnit = useCallback((unit: WeightUnit) => {
    updatePreferences({ weightUnit: unit });
  }, [updatePreferences]);

  const lockWeightUnit = useCallback(() => {
    updatePreferences({ canChangeWeightUnit: false });
  }, [updatePreferences]);

  const unlockWeightUnit = useCallback(() => {
    updatePreferences({ canChangeWeightUnit: true });
  }, [updatePreferences]);

  const getPreferences = useCallback(() => {
    return {
      weightUnit,
      canChangeWeightUnit,
    };
  }, [weightUnit, canChangeWeightUnit]);

  const resetToDefaults = useCallback(() => {
    resetPreferences();
    return { success: true, message: 'Preferences reset to defaults' };
  }, [resetPreferences]);

  return {
    preferences: getPreferences(),
    isLoading,
    error,
    updateWeightUnit,
    lockWeightUnit,
    unlockWeightUnit,
    updatePreferences,
    resetToDefaults,
    clearError,
  };
};

// Hook for workout session integration with user preferences
export const useWorkoutUserIntegration = () => {
  const { weightUnit, canChangeWeightUnit, setCanChangeWeightUnit } = useUser();

  const handleWorkoutStateChange = useCallback((hasActiveWorkout: boolean) => {
    // Lock weight unit during active workout
    if (hasActiveWorkout && canChangeWeightUnit) {
      setCanChangeWeightUnit(false);
    } else if (!hasActiveWorkout && !canChangeWeightUnit) {
      setCanChangeWeightUnit(true);
    }
  }, [canChangeWeightUnit, setCanChangeWeightUnit]);

  const getWeightUnitForWorkout = useCallback(() => {
    return weightUnit;
  }, [weightUnit]);

  const canChangeWeightUnitNow = useCallback(() => {
    return canChangeWeightUnit;
  }, [canChangeWeightUnit]);

  return {
    weightUnit,
    canChangeWeightUnit,
    handleWorkoutStateChange,
    getWeightUnitForWorkout,
    canChangeWeightUnitNow,
  };
};

// Export types for convenience
export type {
  WeightUnit,
  AuthState,
  UserPreferences,
} from '../types/workout';