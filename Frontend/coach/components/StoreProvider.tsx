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
import { useTheme } from '../hooks/use-theme';

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
        console.log('Starting store initialization...');
        
        // Initialize stores in parallel for better performance with timeout
        const initPromise = Promise.all([
          initializeTheme?.() || Promise.resolve(),
          initializeUser?.() || Promise.resolve(),
          loadExercises?.() || Promise.resolve(),
          initializeWorkout?.() || Promise.resolve(),
        ]);

        // Add 10 second timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Store initialization timeout')), 10000);
        });

        await Promise.race([initPromise, timeoutPromise]);
        console.log('Store initialization completed successfully');
        
      } catch (error) {
        console.warn('Failed to initialize some stores:', error);
        // Continue anyway - don't block the app
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