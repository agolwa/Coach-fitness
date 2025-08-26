/**
 * Store Provider Component
 * Initializes and manages all Zustand stores for the application
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useWorkoutStore } from '../stores/workout-store';
import { useUserStore } from '../stores/user-store';
import { useExerciseStore } from '../stores/exercise-store';
import { useThemeStore } from '../stores/theme-store';
import { useNavigationStore } from '../stores/navigation-store';
import { useTheme } from '../hooks/use-theme';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const initializeWorkout = useWorkoutStore(state => state.initializeWorkout);
  const initializeUser = useUserStore(state => state.initializeUser);
  const loadExercises = useExerciseStore(state => state.loadExercises);
  const initializeTheme = useThemeStore(state => state.initializeTheme);
  const initializeNavigation = useNavigationStore(state => state.initializeNavigation);

  // Sync weight unit changes between workout and user stores
  const workoutExercises = useWorkoutStore(state => state.exercises);
  const setCanChangeWeightUnit = useUserStore(state => state.setCanChangeWeightUnit);

  // Initialize all stores on mount (non-blocking)
  useEffect(() => {
    const initializeStores = async () => {
      try {
        console.log('Starting store initialization...');
        
        // Initialize stores in parallel - don't await, let them load in background
        Promise.all([
          initializeTheme?.() || Promise.resolve(),
          initializeUser?.() || Promise.resolve(),
          loadExercises?.() || Promise.resolve(),
          initializeWorkout?.() || Promise.resolve(),
          initializeNavigation?.() || Promise.resolve(),
        ]).then(() => {
          console.log('All stores initialized successfully');
        }).catch((error) => {
          console.warn('Some stores failed to initialize:', error);
          // Continue anyway - don't block the app
        });
        
      } catch (error) {
        console.warn('Failed to initialize stores:', error);
        // Continue anyway - don't block the app
      }
    };

    initializeStores();
  }, [initializeTheme, initializeUser, loadExercises, initializeWorkout, initializeNavigation]);

  // Sync weight unit locking with workout state
  useEffect(() => {
    const hasActiveWorkout = workoutExercises.length > 0;
    setCanChangeWeightUnit(!hasActiveWorkout);
  }, [workoutExercises.length, setCanChangeWeightUnit]);

  return <>{children}</>;
}

/**
 * Hook to check if all stores are initialized (non-blocking - always returns ready)
 */
export function useStoreInitialization() {
  const userLoading = useUserStore(state => state.isLoading);
  const exerciseLoading = useExerciseStore(state => state.isLoading);
  const workoutLoading = useWorkoutStore(state => state.isLoading);

  // Consider stores initialized when user store is done loading
  // This ensures we have auth state before rendering
  const isInitialized = !userLoading;
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
  const { theme } = useTheme();

  return (
    <View 
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary.DEFAULT}
          style={{ marginBottom: 16 }}
        />
        <Text style={{ 
          color: theme.colors.muted.foreground,
          fontSize: 16,
          textAlign: 'center'
        }}>
          Loading VoiceLog...
        </Text>
      </View>
    </View>
  );
}

export default StoreProvider;