/**
 * Store Provider Component
 * Initializes and manages all Zustand stores for the application
 */

import React, { useEffect, useCallback } from 'react';
import { useWorkoutStore } from '../stores/workout-store';
import { useUserStore } from '../stores/user-store';
import { useExerciseStore } from '../stores/exercise-store';
import { useThemeStore } from '../stores/theme-store';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const initializeWorkout = useWorkoutStore(state => state.initializeWorkout);
  const initializeUser = useUserStore(state => state.initializeUser);
  const loadExercises = useExerciseStore(state => state.loadExercises);
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  // Sync weight unit changes between workout and user stores
  const workoutExercises = useWorkoutStore(state => state.exercises);
  const setCanChangeWeightUnit = useUserStore(state => state.setCanChangeWeightUnit);

  // Initialize all stores on mount
  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Initialize stores in parallel for better performance
        await Promise.all([
          initializeTheme?.() || Promise.resolve(),
          initializeUser?.() || Promise.resolve(),
          loadExercises?.() || Promise.resolve(),
          initializeWorkout?.() || Promise.resolve(),
        ]);
      } catch (error) {
        console.warn('Failed to initialize some stores:', error);
      }
    };

    initializeStores();
  }, [initializeTheme, initializeUser, loadExercises, initializeWorkout]);

  // Sync weight unit locking with workout state
  useEffect(() => {
    const hasActiveWorkout = workoutExercises.length > 0;
    setCanChangeWeightUnit(!hasActiveWorkout);
  }, [workoutExercises.length, setCanChangeWeightUnit]);

  return <>{children}</>;
}

/**
 * Hook to check if all stores are initialized
 */
export function useStoreInitialization() {
  const themeLoading = useThemeStore(state => false); // Theme store doesn't have loading state
  const userLoading = useUserStore(state => state.isLoading);
  const exerciseLoading = useExerciseStore(state => state.isLoading);
  const workoutLoading = useWorkoutStore(state => state.isLoading);

  const isInitialized = !userLoading && !exerciseLoading && !workoutLoading;
  const hasErrors = useUserStore(state => state.error) || 
                   useExerciseStore(state => state.error) || 
                   useWorkoutStore(state => state.error);

  return {
    isInitialized,
    hasErrors,
    userLoading,
    exerciseLoading,
    workoutLoading,
  };
}

/**
 * Loading screen component for store initialization
 */
export function StoreLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading VoiceLog...</p>
      </div>
    </div>
  );
}

export default StoreProvider;