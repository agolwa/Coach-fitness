/**
 * Workout Store Tests
 * Comprehensive testing for workout state management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkoutStore } from '../stores/workout-store';
import type { 
  WorkoutExercise, 
  DetailSet, 
  SelectedExercise, 
  WorkoutHistoryItem 
} from '../types/workout';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test data
const mockSelectedExercises: SelectedExercise[] = [
  { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', selected: true },
  { id: 2, name: 'Squats', muscle: 'Legs', equipment: 'Barbell', selected: true },
];

const mockDetailSets: DetailSet[] = [
  { id: 1, weight: 80, reps: 10, notes: 'Good form' },
  { id: 2, weight: 85, reps: 8, notes: 'Struggled on last rep' },
];

const mockWorkoutHistoryItem: WorkoutHistoryItem = {
  id: 1,
  title: 'Test Workout',
  date: '1 January',
  day: 'Monday',
  time: '10:00 AM',
  duration: '45m',
  weightUnit: 'kg',
  exercises: [{
    name: 'Bench Press',
    sets: 2,
    totalReps: 18,
    maxWeight: 85,
    detailSets: [
      { set: 1, weight: 80, reps: 10, notes: 'Good form' },
      { set: 2, weight: 85, reps: 8, notes: 'Struggled on last rep' },
    ],
  }],
};

describe('Workout Store', () => {
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Reset store state
    const { result } = renderHook(() => useWorkoutStore());
    act(() => {
      result.current.clearAllExercises();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      expect(result.current.exercises).toEqual([]);
      expect(result.current.title).toBe('');
      expect(result.current.isActive).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.history).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Exercise Management', () => {
    it('should add exercises to workout', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      expect(result.current.exercises).toHaveLength(2);
      expect(result.current.exercises[0].name).toBe('Bench Press');
      expect(result.current.exercises[1].name).toBe('Squats');
      expect(result.current.isActive).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should filter out unselected exercises', () => {
      const { result } = renderHook(() => useWorkoutStore());
      const exercisesWithUnselected = [
        ...mockSelectedExercises,
        { id: 3, name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', selected: false },
      ];

      act(() => {
        result.current.addExercises(exercisesWithUnselected);
      });

      expect(result.current.exercises).toHaveLength(2);
      expect(result.current.exercises.find(ex => ex.name === 'Deadlift')).toBeUndefined();
    });

    it('should update exercise sets', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.updateExerciseSets(exerciseId, mockDetailSets);
      });

      const updatedExercise = result.current.exercises.find(ex => ex.id === exerciseId);
      expect(updatedExercise?.detailSets).toEqual(mockDetailSets);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should delete exercise', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.deleteExercise(exerciseId);
      });

      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises.find(ex => ex.id === exerciseId)).toBeUndefined();
    });

    it('should clear all exercises', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      expect(result.current.exercises).toHaveLength(2);

      act(() => {
        result.current.clearAllExercises();
      });

      expect(result.current.exercises).toEqual([]);
      expect(result.current.isActive).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.title).toBe('');
    });
  });

  describe('Workout Title Management', () => {
    it('should update workout title', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.updateWorkoutTitle('My Workout');
      });

      expect(result.current.title).toBe('My Workout');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should enforce character limit', () => {
      const { result } = renderHook(() => useWorkoutStore());
      const longTitle = 'This is a very long workout title that exceeds the 30 character limit';
      
      act(() => {
        result.current.updateWorkoutTitle(longTitle);
      });

      expect(result.current.title).toBe(''); // Should not update if too long
    });

    it('should allow titles up to 30 characters', () => {
      const { result } = renderHook(() => useWorkoutStore());
      const maxTitle = 'A'.repeat(30); // Exactly 30 characters
      
      act(() => {
        result.current.updateWorkoutTitle(maxTitle);
      });

      expect(result.current.title).toBe(maxTitle);
    });
  });

  describe('Workout Session Management', () => {
    it('should start workout', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.startWorkout();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.startTime).toBeInstanceOf(Date);
    });

    it('should end workout with validation', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      // Try to end workout without exercises
      act(() => {
        result.current.endWorkout();
      });

      expect(result.current.error).toContain('No exercises with completed sets');
    });
  });

  describe('Workout History', () => {
    it('should add workout to history', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addToHistory(mockWorkoutHistoryItem);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0]).toEqual(mockWorkoutHistoryItem);
    });

    it('should update workout in history', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addToHistory(mockWorkoutHistoryItem);
      });

      act(() => {
        result.current.updateWorkoutInHistory(mockWorkoutHistoryItem.id, { title: 'Updated Title' });
      });

      expect(result.current.history[0].title).toBe('Updated Title');
    });

    it('should delete workout from history', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addToHistory(mockWorkoutHistoryItem);
      });

      expect(result.current.history).toHaveLength(1);

      act(() => {
        result.current.deleteFromHistory(mockWorkoutHistoryItem.id);
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should load workout from history', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.loadWorkoutFromHistory(mockWorkoutHistoryItem);
      });

      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].name).toBe('Bench Press');
      expect(result.current.title).toBe('Test Workout');
      expect(result.current.isActive).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should check if workout has sets with data', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      // No exercises
      expect(result.current.hasAnySetsWithData()).toBe(false);

      // Add exercises without sets
      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      expect(result.current.hasAnySetsWithData()).toBe(false);

      // Add sets
      const exerciseId = result.current.exercises[0].id;
      act(() => {
        result.current.updateExerciseSets(exerciseId, mockDetailSets);
      });

      expect(result.current.hasAnySetsWithData()).toBe(true);
    });

    it('should validate workout', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      expect(result.current.validateWorkout()).toBe(false);

      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      expect(result.current.validateWorkout()).toBe(false);

      const exerciseId = result.current.exercises[0].id;
      act(() => {
        result.current.updateExerciseSets(exerciseId, mockDetailSets);
      });

      expect(result.current.validateWorkout()).toBe(true);
    });

    it('should calculate workout duration', () => {
      jest.useFakeTimers();
      const mockDate = new Date('2023-01-01T10:00:00Z');
      jest.setSystemTime(mockDate);

      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.startWorkout();
      });

      // Advance time by 45 minutes
      jest.advanceTimersByTime(45 * 60 * 1000);

      const duration = result.current.calculateWorkoutDuration();
      expect(duration).toBe('45m');

      jest.useRealTimers();
    });
  });

  describe('Persistence', () => {
    it('should persist workout state changes', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addExercises(mockSelectedExercises);
      });

      // Fast-forward past debounce timeout
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@current_workout',
        expect.stringContaining('Bench Press')
      );

      jest.useRealTimers();
    });

    it('should persist history changes', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.addToHistory(mockWorkoutHistoryItem);
      });

      // Fast-forward past debounce timeout
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@workout_history',
        expect.stringContaining('Test Workout')
      );

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useWorkoutStore());
      
      await act(async () => {
        if (typeof result.current.initializeWorkout === 'function') {
          await result.current.initializeWorkout();
        }
      });

      expect(result.current.error).toContain('Failed to load workout data');
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      act(() => {
        result.current.endWorkout(); // This should set an error
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workout flow', async () => {
      const { result } = renderHook(() => useWorkoutStore());
      
      // Start workout
      act(() => {
        result.current.startWorkout();
        result.current.updateWorkoutTitle('Full Body Workout');
        result.current.addExercises(mockSelectedExercises);
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.exercises).toHaveLength(2);

      // Add sets to exercises
      const exerciseId = result.current.exercises[0].id;
      act(() => {
        result.current.updateExerciseSets(exerciseId, mockDetailSets);
      });

      expect(result.current.hasAnySetsWithData()).toBe(true);

      // Save workout
      await act(async () => {
        await result.current.saveWorkout();
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.exercises).toHaveLength(0);
      expect(result.current.isActive).toBe(false);
    });
  });
});