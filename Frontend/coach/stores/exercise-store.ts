/**
 * Zustand Exercise Store for React Native
 * Manages exercise database, search, filtering, and selection
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ExerciseStore,
  SelectedExercise,
} from '../types/workout';
import { STORAGE_KEYS } from '../types/workout';

// Constants
const EXERCISE_STORAGE_KEY = STORAGE_KEYS.EXERCISE_DATABASE;
const PERSISTENCE_DEBOUNCE = 1000; // ms

// Exercise database - This would typically come from an API
const DEFAULT_EXERCISES: SelectedExercise[] = [
  // Chest exercises
  { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', selected: false },
  { id: 2, name: 'Incline Bench Press', muscle: 'Chest', equipment: 'Barbell', selected: false },
  { id: 3, name: 'Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', selected: false },
  { id: 4, name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', selected: false },
  { id: 5, name: 'Push-ups', muscle: 'Chest', equipment: 'Bodyweight', selected: false },
  { id: 6, name: 'Dips', muscle: 'Chest', equipment: 'Bodyweight', selected: false },
  { id: 7, name: 'Chest Fly', muscle: 'Chest', equipment: 'Dumbbell', selected: false },
  { id: 8, name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable', selected: false },

  // Back exercises
  { id: 9, name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', selected: false },
  { id: 10, name: 'Pull-ups', muscle: 'Back', equipment: 'Bodyweight', selected: false },
  { id: 11, name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', selected: false },
  { id: 12, name: 'Bent-over Row', muscle: 'Back', equipment: 'Barbell', selected: false },
  { id: 13, name: 'Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell', selected: false },
  { id: 14, name: 'T-Bar Row', muscle: 'Back', equipment: 'Machine', selected: false },
  { id: 15, name: 'Cable Row', muscle: 'Back', equipment: 'Cable', selected: false },
  { id: 16, name: 'Chin-ups', muscle: 'Back', equipment: 'Bodyweight', selected: false },

  // Shoulders exercises
  { id: 17, name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', selected: false },
  { id: 18, name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbell', selected: false },
  { id: 19, name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbell', selected: false },
  { id: 20, name: 'Front Raises', muscle: 'Shoulders', equipment: 'Dumbbell', selected: false },
  { id: 21, name: 'Rear Delt Fly', muscle: 'Shoulders', equipment: 'Dumbbell', selected: false },
  { id: 22, name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell', selected: false },
  { id: 23, name: 'Pike Push-ups', muscle: 'Shoulders', equipment: 'Bodyweight', selected: false },
  { id: 24, name: 'Cable Lateral Raises', muscle: 'Shoulders', equipment: 'Cable', selected: false },

  // Arms exercises
  { id: 25, name: 'Bicep Curls', muscle: 'Arms', equipment: 'Dumbbell', selected: false },
  { id: 26, name: 'Barbell Curls', muscle: 'Arms', equipment: 'Barbell', selected: false },
  { id: 27, name: 'Hammer Curls', muscle: 'Arms', equipment: 'Dumbbell', selected: false },
  { id: 28, name: 'Tricep Dips', muscle: 'Arms', equipment: 'Bodyweight', selected: false },
  { id: 29, name: 'Tricep Extensions', muscle: 'Arms', equipment: 'Dumbbell', selected: false },
  { id: 30, name: 'Close-grip Bench Press', muscle: 'Arms', equipment: 'Barbell', selected: false },
  { id: 31, name: 'Cable Curls', muscle: 'Arms', equipment: 'Cable', selected: false },
  { id: 32, name: 'Tricep Pushdown', muscle: 'Arms', equipment: 'Cable', selected: false },

  // Legs exercises
  { id: 33, name: 'Squats', muscle: 'Legs', equipment: 'Barbell', selected: false },
  { id: 34, name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', selected: false },
  { id: 35, name: 'Lunges', muscle: 'Legs', equipment: 'Bodyweight', selected: false },
  { id: 36, name: 'Bulgarian Split Squats', muscle: 'Legs', equipment: 'Bodyweight', selected: false },
  { id: 37, name: 'Leg Curls', muscle: 'Legs', equipment: 'Machine', selected: false },
  { id: 38, name: 'Leg Extensions', muscle: 'Legs', equipment: 'Machine', selected: false },
  { id: 39, name: 'Calf Raises', muscle: 'Legs', equipment: 'Bodyweight', selected: false },
  { id: 40, name: 'Romanian Deadlift', muscle: 'Legs', equipment: 'Barbell', selected: false },

  // Core exercises
  { id: 41, name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 42, name: 'Crunches', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 43, name: 'Russian Twists', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 44, name: 'Mountain Climbers', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 45, name: 'Dead Bug', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 46, name: 'Bicycle Crunches', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 47, name: 'Hanging Knee Raises', muscle: 'Core', equipment: 'Bodyweight', selected: false },
  { id: 48, name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Equipment', selected: false },
];

// Get unique values for filters
const getUniqueValues = (exercises: SelectedExercise[], field: keyof SelectedExercise): string[] => {
  const values = exercises.map(exercise => exercise[field] as string);
  return Array.from(new Set(values)).sort();
};

// Filter exercises based on criteria
const filterExercises = (
  exercises: SelectedExercise[],
  searchTerm: string,
  muscleFilters: string[],
  equipmentFilters: string[]
): SelectedExercise[] => {
  return exercises.filter(exercise => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase());

    // Muscle filter
    const matchesMuscle = muscleFilters.length === 0 || 
      muscleFilters.includes(exercise.muscle);

    // Equipment filter
    const matchesEquipment = equipmentFilters.length === 0 || 
      equipmentFilters.includes(exercise.equipment);

    return matchesSearch && matchesMuscle && matchesEquipment;
  });
};

// Debounced persistence utility
let persistenceTimeout: any = null;

const debouncedPersist = (exercises: SelectedExercise[]) => {
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }
  
  persistenceTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify(exercises));
    } catch (error) {
      console.warn('Failed to persist exercise data:', error);
    }
  }, PERSISTENCE_DEBOUNCE);
};

// Create the Zustand store
export const useExerciseStore = create<ExerciseStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    exercises: DEFAULT_EXERCISES,
    selectedExercises: [],
    filters: {
      muscle: [],
      equipment: [],
      searchTerm: '',
    },
    isLoading: false,
    error: null,

    // Exercise database actions
    loadExercises: async () => {
      try {
        set({ isLoading: true, error: null });

        // Try to load from storage first
        const storedExercises = await AsyncStorage.getItem(EXERCISE_STORAGE_KEY);
        
        if (storedExercises) {
          const exerciseData = JSON.parse(storedExercises);
          if (Array.isArray(exerciseData) && exerciseData.length > 0) {
            set({ 
              exercises: exerciseData,
              isLoading: false,
              lastUpdated: new Date(),
            });
            return;
          }
        }

        // Fallback to default exercises if no stored data
        set({ 
          exercises: DEFAULT_EXERCISES,
          isLoading: false,
          lastUpdated: new Date(),
        });

        // Persist default exercises for future use
        debouncedPersist(DEFAULT_EXERCISES);

      } catch (error) {
        console.warn('Failed to load exercises:', error);
        set({
          exercises: DEFAULT_EXERCISES,
          error: 'Failed to load exercise database',
          isLoading: false,
        });
      }
    },

    searchExercises: (term: string) => {
      const state = get();
      
      set({
        filters: {
          ...state.filters,
          searchTerm: term,
        },
      });

      // Update filtered results
      const filtered = filterExercises(
        state.exercises,
        term,
        state.filters.muscle,
        state.filters.equipment
      );

      // Reset selections on new search
      const updatedExercises = state.exercises.map(exercise => ({
        ...exercise,
        selected: filtered.find(f => f.id === exercise.id)?.selected || false,
      }));

      set({ exercises: updatedExercises });
    },

    filterByMuscle: (muscles: string[]) => {
      const state = get();
      
      set({
        filters: {
          ...state.filters,
          muscle: muscles,
        },
      });

      // Reset selections when changing filters
      const updatedExercises = state.exercises.map(exercise => ({
        ...exercise,
        selected: false,
      }));

      set({ 
        exercises: updatedExercises,
        selectedExercises: [],
      });
    },

    filterByEquipment: (equipment: string[]) => {
      const state = get();
      
      set({
        filters: {
          ...state.filters,
          equipment,
        },
      });

      // Reset selections when changing filters
      const updatedExercises = state.exercises.map(exercise => ({
        ...exercise,
        selected: false,
      }));

      set({ 
        exercises: updatedExercises,
        selectedExercises: [],
      });
    },

    clearFilters: () => {
      set({
        filters: {
          muscle: [],
          equipment: [],
          searchTerm: '',
        },
      });

      // Reset all exercise selections
      const state = get();
      const updatedExercises = state.exercises.map(exercise => ({
        ...exercise,
        selected: false,
      }));

      set({ 
        exercises: updatedExercises,
        selectedExercises: [],
      });
    },

    // Exercise selection actions
    toggleExerciseSelection: (exerciseId: number) => {
      const state = get();
      
      const updatedExercises = state.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, selected: !exercise.selected }
          : exercise
      );

      const selectedExercises = updatedExercises.filter(ex => ex.selected);

      set({ 
        exercises: updatedExercises,
        selectedExercises,
      });
    },

    selectAllExercises: () => {
      const state = get();
      
      // Get currently filtered exercises
      const filteredExercises = filterExercises(
        state.exercises,
        state.filters.searchTerm,
        state.filters.muscle,
        state.filters.equipment
      );

      const updatedExercises = state.exercises.map(exercise => {
        const isFiltered = filteredExercises.find(f => f.id === exercise.id);
        return isFiltered ? { ...exercise, selected: true } : exercise;
      });

      const selectedExercises = updatedExercises.filter(ex => ex.selected);

      set({ 
        exercises: updatedExercises,
        selectedExercises,
      });
    },

    clearSelection: () => {
      const state = get();
      
      const updatedExercises = state.exercises.map(exercise => ({
        ...exercise,
        selected: false,
      }));

      set({ 
        exercises: updatedExercises,
        selectedExercises: [],
      });
    },

    getSelectedExercises: () => {
      const state = get();
      return state.selectedExercises;
    },

    // Utility methods
    getFilteredExercises: () => {
      const state = get();
      return filterExercises(
        state.exercises,
        state.filters.searchTerm,
        state.filters.muscle,
        state.filters.equipment
      );
    },

    getMuscleGroups: () => {
      const state = get();
      return getUniqueValues(state.exercises, 'muscle');
    },

    getEquipmentTypes: () => {
      const state = get();
      return getUniqueValues(state.exercises, 'equipment');
    },

    getExerciseCount: () => {
      const state = get();
      const filtered = get().getFilteredExercises();
      return {
        total: state.exercises.length,
        filtered: filtered.length,
        selected: state.selectedExercises.length,
      };
    },

    // Add custom exercise
    addCustomExercise: (name: string, muscle: string, equipment: string) => {
      const state = get();
      
      // Generate new ID
      const maxId = Math.max(...state.exercises.map(ex => ex.id), 0);
      const newExercise: SelectedExercise = {
        id: maxId + 1,
        name: name.trim(),
        muscle: muscle.trim(),
        equipment: equipment.trim(),
        selected: false,
      };

      const updatedExercises = [...state.exercises, newExercise];

      set({ 
        exercises: updatedExercises,
        lastUpdated: new Date(),
      });

      // Persist updated exercises
      debouncedPersist(updatedExercises);
    },

    // Remove custom exercise (only custom ones, not defaults)
    removeCustomExercise: (exerciseId: number) => {
      const state = get();
      
      // Only allow removal of custom exercises (ID > 48)
      if (exerciseId <= 48) {
        set({ error: 'Cannot remove default exercises' });
        return;
      }

      const updatedExercises = state.exercises.filter(ex => ex.id !== exerciseId);
      const selectedExercises = state.selectedExercises.filter(ex => ex.id !== exerciseId);

      set({ 
        exercises: updatedExercises,
        selectedExercises,
        lastUpdated: new Date(),
      });

      // Persist updated exercises
      debouncedPersist(updatedExercises);
    },

    // Reset to default exercises
    resetToDefaults: () => {
      set({
        exercises: DEFAULT_EXERCISES,
        selectedExercises: [],
        filters: {
          muscle: [],
          equipment: [],
          searchTerm: '',
        },
        lastUpdated: new Date(),
      });

      // Persist reset
      debouncedPersist(DEFAULT_EXERCISES);
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);

// Export utilities and defaults
export { DEFAULT_EXERCISES, getUniqueValues, filterExercises };

// Export default for consistency
export default useExerciseStore;