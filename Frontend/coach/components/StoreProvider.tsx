/**
 * Store Provider Component
 * Initializes and manages all Zustand stores for the application
 * Enhanced with theme class synchronization
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useWorkoutStore } from '../stores/workout-store';
import { useUserStore } from '../stores/user-store';
import { useExerciseStore } from '../stores/exercise-store';
import { useThemeStore } from '../stores/theme-store';
import { useNavigationStore } from '../stores/navigation-store';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Sync weight unit changes between workout and user stores
  const workoutExercises = useWorkoutStore(state => state.exercises);
  const setCanChangeWeightUnit = useUserStore(state => state.setCanChangeWeightUnit);

  // Store initialization is now handled by StoreInitializer inside ThemedAppContent
  // to ensure navigation context is available.

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
 * Uses direct theme store access to avoid navigation context dependency
 */
export function StoreLoadingScreen() {
  // Get theme directly from store without hooks to avoid navigation context issues
  const colorScheme = useThemeStore.getState().colorScheme;
  const isDark = colorScheme === 'dark';

  // Fallback colors that work without navigation context
  const backgroundColor = isDark ? '#09090b' : '#ffffff';
  const primaryColor = isDark ? '#f97316' : '#ea580c';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <View 
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <ActivityIndicator 
          size="large" 
          color={primaryColor}
          style={{ marginBottom: 16 }}
        />
        <Text style={{ 
          color: textColor,
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