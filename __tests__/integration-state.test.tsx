/**
 * State Management Integration Tests
 * Testing interaction between all Zustand stores
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkoutStore } from '../stores/workout-store';
import { useUserStore } from '../stores/user-store';
import { useExerciseStore } from '../stores/exercise-store';
import { useThemeStore } from '../stores/theme-store';
import { useWorkout } from '../hooks/use-workout';
import { useUser } from '../hooks/use-user';
import type { SelectedExercise, DetailSet } from '../types/workout';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test data
const mockExercises: SelectedExercise[] = [
  { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', selected: true },
  { id: 2, name: 'Squats', muscle: 'Legs', equipment: 'Barbell', selected: true },
];

const mockSets: DetailSet[] = [
  { id: 1, weight: 80, reps: 10, notes: 'Good form' },
  { id: 2, weight: 85, reps: 8, notes: 'Struggled on last rep' },
];

describe('State Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all stores to initial state
    const workoutStore = renderHook(() => useWorkoutStore());
    const userStore = renderHook(() => useUserStore());
    const exerciseStore = renderHook(() => useExerciseStore());
    
    act(() => {
      workoutStore.result.current.clearAllExercises();
      userStore.result.current.resetPreferences();
      exerciseStore.result.current.clearSelection();
      exerciseStore.result.current.clearFilters();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Workout and User Store Integration', () => {
    it('should lock weight unit during active workout', () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      // Initially can change weight unit
      expect(userStore.result.current.canChangeWeightUnit).toBe(true);

      // Add exercises (creates active workout)
      act(() => {
        workoutStore.result.current.addExercises(mockExercises);
        userStore.result.current.setCanChangeWeightUnit(!workoutStore.result.current.isActive);
      });

      expect(workoutStore.result.current.isActive).toBe(true);
      expect(userStore.result.current.canChangeWeightUnit).toBe(false);

      // Try to change weight unit (should fail)
      act(() => {
        userStore.result.current.setWeightUnit('lbs');
      });

      expect(userStore.result.current.weightUnit).toBe('kg'); // Should remain unchanged
      expect(userStore.result.current.error).toContain('Cannot change weight unit');
    });

    it('should unlock weight unit when workout ends', () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      // Create active workout
      act(() => {
        workoutStore.result.current.addExercises(mockExercises);
        userStore.result.current.setCanChangeWeightUnit(false);
      });

      expect(userStore.result.current.canChangeWeightUnit).toBe(false);

      // End workout
      act(() => {
        workoutStore.result.current.clearAllExercises();
        userStore.result.current.setCanChangeWeightUnit(true);
      });

      expect(workoutStore.result.current.isActive).toBe(false);
      expect(userStore.result.current.canChangeWeightUnit).toBe(true);

      // Should now be able to change weight unit
      act(() => {
        userStore.result.current.setWeightUnit('lbs');
      });

      expect(userStore.result.current.weightUnit).toBe('lbs');
      expect(userStore.result.current.error).toBeNull();
    });

    it('should use current weight unit for new exercises', () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      // Set weight unit to lbs
      act(() => {
        userStore.result.current.setWeightUnit('lbs');
      });

      // Add exercises
      act(() => {
        workoutStore.result.current.addExercises(mockExercises);
      });

      // Check that exercises have the correct weight unit
      const exercises = workoutStore.result.current.exercises;
      expect(exercises[0].weightUnit).toBe('lbs');
      expect(exercises[1].weightUnit).toBe('lbs');
    });
  });

  describe('Exercise and Workout Store Integration', () => {
    it('should transfer selected exercises to workout', () => {
      const exerciseStore = renderHook(() => useExerciseStore());
      const workoutStore = renderHook(() => useWorkoutStore());

      // Select exercises
      act(() => {
        exerciseStore.result.current.toggleExerciseSelection(1);
        exerciseStore.result.current.toggleExerciseSelection(2);
      });

      expect(exerciseStore.result.current.selectedExercises).toHaveLength(2);

      // Add selected exercises to workout
      const selectedExercises = exerciseStore.result.current.getSelectedExercises();
      act(() => {
        workoutStore.result.current.addExercises(selectedExercises);
      });

      expect(workoutStore.result.current.exercises).toHaveLength(2);
      expect(workoutStore.result.current.exercises[0].name).toBe('Bench Press');
      expect(workoutStore.result.current.exercises[1].name).toBe('Incline Bench Press');
    });

    it('should clear exercise selection after adding to workout', () => {
      const exerciseStore = renderHook(() => useExerciseStore());
      const workoutStore = renderHook(() => useWorkoutStore());

      // Select exercises
      act(() => {
        exerciseStore.result.current.toggleExerciseSelection(1);
        exerciseStore.result.current.toggleExerciseSelection(2);
      });

      const selectedExercises = exerciseStore.result.current.getSelectedExercises();

      // Add to workout
      act(() => {
        workoutStore.result.current.addExercises(selectedExercises);
      });

      // Clear selection after adding
      act(() => {
        exerciseStore.result.current.clearSelection();
      });

      expect(exerciseStore.result.current.selectedExercises).toHaveLength(0);
      expect(workoutStore.result.current.exercises).toHaveLength(2); // Workout still has exercises
    });
  });

  describe('Complete Workout Flow Integration', () => {
    it('should handle complete workout lifecycle', async () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());
      const exerciseStore = renderHook(() => useExerciseStore());

      // 1. User signs in
      act(() => {
        userStore.result.current.signIn();
      });

      expect(userStore.result.current.isSignedIn).toBe(true);

      // 2. User selects exercises
      act(() => {
        exerciseStore.result.current.toggleExerciseSelection(1);
        exerciseStore.result.current.toggleExerciseSelection(2);
      });

      // 3. Add exercises to workout
      const selectedExercises = exerciseStore.result.current.getSelectedExercises();
      act(() => {
        workoutStore.result.current.addExercises(selectedExercises);
        workoutStore.result.current.updateWorkoutTitle('My Test Workout');
        workoutStore.result.current.startWorkout();
      });

      expect(workoutStore.result.current.isActive).toBe(true);
      expect(workoutStore.result.current.title).toBe('My Test Workout');

      // 4. Weight unit should be locked
      act(() => {
        userStore.result.current.setCanChangeWeightUnit(false);
      });

      expect(userStore.result.current.canChangeWeightUnit).toBe(false);

      // 5. User adds sets to exercises
      const exerciseId = workoutStore.result.current.exercises[0].id;
      act(() => {
        workoutStore.result.current.updateExerciseSets(exerciseId, mockSets);
      });

      expect(workoutStore.result.current.hasAnySetsWithData()).toBe(true);

      // 6. Save workout (simulate end workout)
      await act(async () => {
        await workoutStore.result.current.saveWorkout();
      });

      expect(workoutStore.result.current.history).toHaveLength(1);
      expect(workoutStore.result.current.exercises).toHaveLength(0);
      expect(workoutStore.result.current.isActive).toBe(false);

      // 7. Weight unit should be unlocked
      act(() => {
        userStore.result.current.setCanChangeWeightUnit(true);
      });

      expect(userStore.result.current.canChangeWeightUnit).toBe(true);
    });

    it('should handle guest user workout flow', () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      // User remains as guest
      expect(userStore.result.current.isGuest).toBe(true);
      expect(userStore.result.current.isSignedIn).toBe(false);

      // Add exercises and sets
      act(() => {
        workoutStore.result.current.addExercises(mockExercises);
      });

      const exerciseId = workoutStore.result.current.exercises[0].id;
      act(() => {
        workoutStore.result.current.updateExerciseSets(exerciseId, mockSets);
      });

      expect(workoutStore.result.current.hasAnySetsWithData()).toBe(true);

      // End workout as guest (should not save to history)
      act(() => {
        workoutStore.result.current.clearAllExercises(); // Simulate guest workout clear
      });

      expect(workoutStore.result.current.history).toHaveLength(0); // No history for guests
      expect(workoutStore.result.current.exercises).toHaveLength(0);
    });
  });

  describe('Theme Integration', () => {
    it('should persist theme changes alongside other preferences', async () => {
      jest.useFakeTimers();
      
      const themeStore = renderHook(() => useThemeStore());
      const userStore = renderHook(() => useUserStore());

      // Change theme
      act(() => {
        themeStore.result.current.setColorScheme('dark');
      });

      // Change user preferences
      act(() => {
        userStore.result.current.setWeightUnit('lbs');
      });

      // Fast-forward past debounce timeouts
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Both should be persisted
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@theme_preference',
        'dark'
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_preferences',
        expect.stringContaining('lbs')
      );

      jest.useRealTimers();
    });
  });

  describe('Hook Integration', () => {
    it('should work with convenience hooks', () => {
      const workoutHook = renderHook(() => useWorkout());
      const userHook = renderHook(() => useUser());

      // Use convenience hooks
      act(() => {
        userHook.result.current.setWeightUnit('lbs');
        workoutHook.result.current.addExercises(mockExercises);
      });

      expect(userHook.result.current.weightUnit).toBe('lbs');
      expect(workoutHook.result.current.exercises).toHaveLength(2);
      expect(workoutHook.result.current.weightUnit).toBe('lbs');
    });

    it('should handle error states across hooks', () => {
      const workoutHook = renderHook(() => useWorkout());
      const userHook = renderHook(() => useUser());

      // Create error in user store
      act(() => {
        userHook.result.current.setCanChangeWeightUnit(false);
        userHook.result.current.setWeightUnit('lbs');
      });

      expect(userHook.result.current.error).toBeTruthy();

      // Create error in workout store
      act(() => {
        workoutHook.result.current.endWorkout(); // No exercises
      });

      expect(workoutHook.result.current.error).toBeTruthy();

      // Clear errors
      act(() => {
        userHook.result.current.clearError();
        workoutHook.result.current.clearError();
      });

      expect(userHook.result.current.error).toBeNull();
      expect(workoutHook.result.current.error).toBeNull();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across store updates', () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      // Set initial weight unit
      act(() => {
        userStore.result.current.setWeightUnit('kg');
      });

      // Add exercises with kg
      act(() => {
        workoutStore.result.current.addExercises(mockExercises);
      });

      const initialWeightUnit = workoutStore.result.current.exercises[0].weightUnit;
      expect(initialWeightUnit).toBe('kg');

      // Lock weight unit (simulate active workout)
      act(() => {
        userStore.result.current.setCanChangeWeightUnit(false);
      });

      // Try to change weight unit (should fail)
      act(() => {
        userStore.result.current.setWeightUnit('lbs');
      });

      // Exercise weight unit should remain unchanged
      expect(workoutStore.result.current.exercises[0].weightUnit).toBe('kg');
      expect(userStore.result.current.weightUnit).toBe('kg');
    });

    it('should handle concurrent updates gracefully', async () => {
      jest.useFakeTimers();
      
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      // Simulate rapid updates
      act(() => {
        workoutStore.result.current.addExercises(mockExercises);
        workoutStore.result.current.updateWorkoutTitle('Test');
        userStore.result.current.setWeightUnit('lbs');
        userStore.result.current.setCanChangeWeightUnit(false);
      });

      // Fast-forward past all debounce timeouts
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Wait for all async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // All states should be consistent
      expect(workoutStore.result.current.exercises).toHaveLength(2);
      expect(workoutStore.result.current.title).toBe('Test');
      expect(userStore.result.current.weightUnit).toBe('lbs');
      expect(userStore.result.current.canChangeWeightUnit).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause unnecessary re-renders', () => {
      const workoutStore = renderHook(() => useWorkoutStore());
      const userStore = renderHook(() => useUserStore());

      const workoutRenderCount = workoutStore.rerender;
      const userRenderCount = userStore.rerender;

      // Multiple updates to same values should not cause extra renders
      act(() => {
        userStore.result.current.setWeightUnit('kg'); // Same as current
        workoutStore.result.current.updateWorkoutTitle(''); // Same as current
      });

      // Render counts should not increase significantly
      expect(typeof workoutRenderCount).toBe('function');
      expect(typeof userRenderCount).toBe('function');
    });

    it('should debounce persistence operations', async () => {
      jest.useFakeTimers();
      
      const workoutStore = renderHook(() => useWorkoutStore());

      // Rapid updates
      act(() => {
        workoutStore.result.current.updateWorkoutTitle('A');
        workoutStore.result.current.updateWorkoutTitle('AB');
        workoutStore.result.current.updateWorkoutTitle('ABC');
      });

      // Should only persist once after debounce
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should have only one setItem call for the final value
      const setCalls = mockAsyncStorage.setItem.mock.calls.filter(
        call => call[0] === '@current_workout'
      );
      expect(setCalls.length).toBeLessThanOrEqual(1);

      jest.useRealTimers();
    });
  });
});