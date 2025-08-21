/**
 * Exercise Store Tests
 * Comprehensive testing for exercise database management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useExerciseStore } from '../stores/exercise-store';
import { DEFAULT_EXERCISES } from '../stores/exercise-store';
import type { SelectedExercise } from '../types/workout';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test data
const mockCustomExercises: SelectedExercise[] = [
  ...DEFAULT_EXERCISES.slice(0, 5), // First 5 default exercises
  { id: 100, name: 'Custom Exercise 1', muscle: 'Custom', equipment: 'Custom', selected: false },
  { id: 101, name: 'Custom Exercise 2', muscle: 'Custom', equipment: 'Custom', selected: false },
];

describe('Exercise Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store to default state
    const { result } = renderHook(() => useExerciseStore());
    act(() => {
      result.current.clearFilters();
      result.current.clearSelection();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      expect(result.current.exercises).toEqual(DEFAULT_EXERCISES);
      expect(result.current.selectedExercises).toEqual([]);
      expect(result.current.filters).toEqual({
        muscle: [],
        equipment: [],
        searchTerm: '',
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load default exercises', async () => {
      const { result } = renderHook(() => useExerciseStore());
      
      await act(async () => {
        await result.current.loadExercises();
      });

      expect(result.current.exercises).toEqual(DEFAULT_EXERCISES);
      expect(result.current.exercises.length).toBe(48); // Default exercise count
    });
  });

  describe('Exercise Database Management', () => {
    it('should load exercises from storage', async () => {
      const storedExercises = JSON.stringify(mockCustomExercises);
      mockAsyncStorage.getItem.mockResolvedValue(storedExercises);

      const { result } = renderHook(() => useExerciseStore());
      
      await act(async () => {
        await result.current.loadExercises();
      });

      expect(result.current.exercises).toEqual(mockCustomExercises);
    });

    it('should fallback to defaults if storage fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useExerciseStore());
      
      await act(async () => {
        await result.current.loadExercises();
      });

      expect(result.current.exercises).toEqual(DEFAULT_EXERCISES);
      expect(result.current.error).toContain('Failed to load exercise database');
    });

    it('should get muscle groups', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      const muscleGroups = result.current.getMuscleGroups();
      
      expect(muscleGroups).toContain('Chest');
      expect(muscleGroups).toContain('Back');
      expect(muscleGroups).toContain('Legs');
      expect(muscleGroups).toContain('Arms');
      expect(muscleGroups).toContain('Shoulders');
      expect(muscleGroups).toContain('Core');
    });

    it('should get equipment types', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      const equipmentTypes = result.current.getEquipmentTypes();
      
      expect(equipmentTypes).toContain('Barbell');
      expect(equipmentTypes).toContain('Dumbbell');
      expect(equipmentTypes).toContain('Bodyweight');
      expect(equipmentTypes).toContain('Cable');
      expect(equipmentTypes).toContain('Machine');
    });
  });

  describe('Search and Filtering', () => {
    it('should search exercises by name', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.searchExercises('bench');
      });

      expect(result.current.filters.searchTerm).toBe('bench');
      
      const filtered = result.current.getFilteredExercises();
      expect(filtered.every(ex => ex.name.toLowerCase().includes('bench'))).toBe(true);
    });

    it('should search exercises by muscle group', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.searchExercises('chest');
      });

      const filtered = result.current.getFilteredExercises();
      expect(filtered.some(ex => ex.muscle.toLowerCase().includes('chest'))).toBe(true);
    });

    it('should filter by muscle groups', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.filterByMuscle(['Chest', 'Back']);
      });

      expect(result.current.filters.muscle).toEqual(['Chest', 'Back']);
      
      const filtered = result.current.getFilteredExercises();
      expect(filtered.every(ex => ['Chest', 'Back'].includes(ex.muscle))).toBe(true);
    });

    it('should filter by equipment', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.filterByEquipment(['Barbell', 'Dumbbell']);
      });

      expect(result.current.filters.equipment).toEqual(['Barbell', 'Dumbbell']);
      
      const filtered = result.current.getFilteredExercises();
      expect(filtered.every(ex => ['Barbell', 'Dumbbell'].includes(ex.equipment))).toBe(true);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      // Set some filters
      act(() => {
        result.current.searchExercises('bench');
        result.current.filterByMuscle(['Chest']);
        result.current.filterByEquipment(['Barbell']);
      });

      expect(result.current.filters.searchTerm).toBe('bench');
      expect(result.current.filters.muscle).toEqual(['Chest']);
      expect(result.current.filters.equipment).toEqual(['Barbell']);

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        muscle: [],
        equipment: [],
        searchTerm: '',
      });
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.searchExercises('press');
        result.current.filterByMuscle(['Chest']);
        result.current.filterByEquipment(['Barbell']);
      });

      const filtered = result.current.getFilteredExercises();
      expect(filtered.every(ex => 
        ex.name.toLowerCase().includes('press') &&
        ex.muscle === 'Chest' &&
        ex.equipment === 'Barbell'
      )).toBe(true);
    });
  });

  describe('Exercise Selection', () => {
    it('should toggle exercise selection', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      const firstExercise = result.current.exercises[0];
      
      act(() => {
        result.current.toggleExerciseSelection(firstExercise.id);
      });

      expect(result.current.selectedExercises).toHaveLength(1);
      expect(result.current.selectedExercises[0].id).toBe(firstExercise.id);

      // Toggle again to deselect
      act(() => {
        result.current.toggleExerciseSelection(firstExercise.id);
      });

      expect(result.current.selectedExercises).toHaveLength(0);
    });

    it('should select all filtered exercises', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      // Filter to chest exercises
      act(() => {
        result.current.filterByMuscle(['Chest']);
      });

      const filteredCount = result.current.getFilteredExercises().length;

      act(() => {
        result.current.selectAllExercises();
      });

      expect(result.current.selectedExercises).toHaveLength(filteredCount);
      expect(result.current.selectedExercises.every(ex => ex.muscle === 'Chest')).toBe(true);
    });

    it('should clear all selections', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      // Select some exercises
      act(() => {
        result.current.toggleExerciseSelection(1);
        result.current.toggleExerciseSelection(2);
        result.current.toggleExerciseSelection(3);
      });

      expect(result.current.selectedExercises).toHaveLength(3);

      // Clear selections
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedExercises).toHaveLength(0);
    });

    it('should get selected exercises', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.toggleExerciseSelection(1);
        result.current.toggleExerciseSelection(2);
      });

      const selected = result.current.getSelectedExercises();
      expect(selected).toHaveLength(2);
      expect(selected[0].id).toBe(1);
      expect(selected[1].id).toBe(2);
    });
  });

  describe('Custom Exercise Management', () => {
    it('should add custom exercise', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      const initialCount = result.current.exercises.length;

      act(() => {
        result.current.addCustomExercise('My Custom Exercise', 'Custom', 'Custom Equipment');
      });

      expect(result.current.exercises).toHaveLength(initialCount + 1);
      
      const newExercise = result.current.exercises[result.current.exercises.length - 1];
      expect(newExercise.name).toBe('My Custom Exercise');
      expect(newExercise.muscle).toBe('Custom');
      expect(newExercise.equipment).toBe('Custom Equipment');
      expect(newExercise.selected).toBe(false);
    });

    it('should remove custom exercise', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      // Add custom exercise
      act(() => {
        result.current.addCustomExercise('Custom Exercise', 'Custom', 'Custom');
      });

      const customExercise = result.current.exercises[result.current.exercises.length - 1];
      const initialCount = result.current.exercises.length;

      act(() => {
        result.current.removeCustomExercise(customExercise.id);
      });

      expect(result.current.exercises).toHaveLength(initialCount - 1);
      expect(result.current.exercises.find(ex => ex.id === customExercise.id)).toBeUndefined();
    });

    it('should prevent removal of default exercises', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      const defaultExerciseId = 1; // Default exercise
      const initialCount = result.current.exercises.length;

      act(() => {
        result.current.removeCustomExercise(defaultExerciseId);
      });

      expect(result.current.exercises).toHaveLength(initialCount);
      expect(result.current.error).toBe('Cannot remove default exercises');
    });

    it('should reset to default exercises', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      // Add custom exercises and modify state
      act(() => {
        result.current.addCustomExercise('Custom 1', 'Custom', 'Custom');
        result.current.addCustomExercise('Custom 2', 'Custom', 'Custom');
        result.current.toggleExerciseSelection(1);
        result.current.searchExercises('test');
      });

      expect(result.current.exercises.length).toBeGreaterThan(DEFAULT_EXERCISES.length);
      expect(result.current.selectedExercises).toHaveLength(1);
      expect(result.current.filters.searchTerm).toBe('test');

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.exercises).toEqual(DEFAULT_EXERCISES);
      expect(result.current.selectedExercises).toEqual([]);
      expect(result.current.filters).toEqual({
        muscle: [],
        equipment: [],
        searchTerm: '',
      });
    });
  });

  describe('Exercise Statistics', () => {
    it('should get exercise counts', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      // Filter to chest exercises
      act(() => {
        result.current.filterByMuscle(['Chest']);
      });

      // Select some exercises
      act(() => {
        result.current.toggleExerciseSelection(1);
        result.current.toggleExerciseSelection(2);
      });

      const counts = result.current.getExerciseCount();
      
      expect(counts.total).toBe(DEFAULT_EXERCISES.length);
      expect(counts.filtered).toBe(result.current.getFilteredExercises().length);
      expect(counts.selected).toBe(2);
    });

    it('should get filtered exercises', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.filterByMuscle(['Chest']);
        result.current.searchExercises('bench');
      });

      const filtered = result.current.getFilteredExercises();
      
      expect(filtered.every(ex => 
        ex.muscle === 'Chest' && 
        ex.name.toLowerCase().includes('bench')
      )).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should persist exercise changes', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.addCustomExercise('Custom Exercise', 'Custom', 'Custom');
      });

      // Fast-forward past debounce timeout
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@exercise_database',
        expect.stringContaining('Custom Exercise')
      );

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useExerciseStore());
      
      await act(async () => {
        await result.current.loadExercises();
      });

      expect(result.current.error).toContain('Failed to load exercise database');
      expect(result.current.exercises).toEqual(DEFAULT_EXERCISES); // Should fallback
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.removeCustomExercise(1); // This should set an error
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search term', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.searchExercises('');
      });

      const filtered = result.current.getFilteredExercises();
      expect(filtered).toEqual(result.current.exercises);
    });

    it('should handle case insensitive search', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.searchExercises('BENCH');
      });

      const filtered = result.current.getFilteredExercises();
      expect(filtered.some(ex => ex.name.toLowerCase().includes('bench'))).toBe(true);
    });

    it('should handle non-existent exercise selection', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      const initialSelected = result.current.selectedExercises.length;

      act(() => {
        result.current.toggleExerciseSelection(99999); // Non-existent ID
      });

      expect(result.current.selectedExercises).toHaveLength(initialSelected);
    });

    it('should trim whitespace from custom exercise names', () => {
      const { result } = renderHook(() => useExerciseStore());
      
      act(() => {
        result.current.addCustomExercise('  Trimmed Exercise  ', '  Custom  ', '  Equipment  ');
      });

      const newExercise = result.current.exercises[result.current.exercises.length - 1];
      expect(newExercise.name).toBe('Trimmed Exercise');
      expect(newExercise.muscle).toBe('Custom');
      expect(newExercise.equipment).toBe('Equipment');
    });
  });
});