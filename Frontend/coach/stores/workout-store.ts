/**
 * Zustand Workout Store for React Native
 * Manages workout sessions, exercises, sets, and workout history
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  WorkoutStore,
  WorkoutExercise,
  DetailSet,
  SelectedExercise,
  WorkoutHistoryItem,
  WeightUnit,
} from '../types/workout';
import {
  WORKOUT_CONSTANTS,
  STORAGE_KEYS,
  DEFAULT_WORKOUT_SESSION,
} from '../types/workout';
import { 
  apiClient, 
  type CreateWorkoutRequest,
  type UpdateWorkoutRequest,
  type WorkoutResponse,
  type WorkoutWithExercisesResponse 
} from '../services/api-client';

// Constants
const PERSISTENCE_DEBOUNCE = 500; // ms
const WORKOUT_STORAGE_KEY = STORAGE_KEYS.CURRENT_WORKOUT;
const HISTORY_STORAGE_KEY = STORAGE_KEYS.WORKOUT_HISTORY;

// Debounced persistence utilities
let workoutPersistenceTimeout: any = null;
let historyPersistenceTimeout: any = null;

const debouncedPersistWorkout = (workout: any) => {
  if (workoutPersistenceTimeout) {
    clearTimeout(workoutPersistenceTimeout);
  }
  
  workoutPersistenceTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workout));
    } catch (error) {
      console.warn('Failed to persist workout session:', error);
    }
  }, PERSISTENCE_DEBOUNCE);
};

const debouncedPersistHistory = (history: WorkoutHistoryItem[]) => {
  if (historyPersistenceTimeout) {
    clearTimeout(historyPersistenceTimeout);
  }
  
  historyPersistenceTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to persist workout history:', error);
    }
  }, PERSISTENCE_DEBOUNCE);
};

// Utility functions
const generateUniqueId = (): number => Date.now() + Math.floor(Math.random() * 1000);

// Convert DetailSet array to Set array for display purposes
const convertDetailSetsToSets = (detailSets: DetailSet[]): Set[] => {
  if (!detailSets || detailSets.length === 0) {
    return [];
  }
  
  return detailSets.map((detailSet, index) => ({
    set: (index + 1).toString(),
    weight: detailSet.weight.toString(),
    reps: detailSet.reps.toString(),
    notes: detailSet.notes,
  }));
};

const validateWorkoutExercise = (exercise: WorkoutExercise): boolean => {
  if (!exercise.detailSets || exercise.detailSets.length === 0) return false;
  
  return exercise.detailSets.some((set) => {
    const hasReps = set.reps > 0;
    const hasWeight = set.weight > 0;
    const hasNotes = set.notes.trim().length > 0;
    
    // Check for bodyweight exercises
    const isBodyweight = exercise.name.toLowerCase().includes('pull-up') ||
                        exercise.name.toLowerCase().includes('push-up') ||
                        exercise.name.toLowerCase().includes('dip') ||
                        exercise.name.toLowerCase().includes('squat');
    
    return hasReps && (hasWeight || isBodyweight || hasNotes);
  });
};

const calculateWorkoutStats = (exercises: WorkoutExercise[]) => {
  const validExercises = exercises.filter(validateWorkoutExercise);
  
  return validExercises.map((exercise) => ({
    name: exercise.name,
    sets: exercise.detailSets?.length || 0,
    totalReps: exercise.detailSets?.reduce((total, set) => total + set.reps, 0) || 0,
    maxWeight: Math.max(...(exercise.detailSets?.map((set) => set.weight) || [0])),
    detailSets: exercise.detailSets?.map((set, index) => ({
      set: index + 1,
      weight: set.weight,
      reps: set.reps,
      notes: set.notes,
    })) || [],
  }));
};

// Create the Zustand store
export const useWorkoutStore = create<WorkoutStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state from DEFAULT_WORKOUT_SESSION
    ...DEFAULT_WORKOUT_SESSION,
    history: [],
    isLoading: false,
    error: null,

    // Exercise management actions
    addExercises: (selectedExercises: SelectedExercise[]) => {
      const state = get();
      
      // Get weight unit from user preferences store (will be injected)
      const weightUnit: WeightUnit = 'kg'; // This will be updated to use user store
      
      const newExercises: WorkoutExercise[] = selectedExercises
        .filter((ex) => ex.selected)
        .map((ex) => ({
          id: generateUniqueId() + ex.id,
          name: ex.name,
          sets: Array(WORKOUT_CONSTANTS.DEFAULT_SETS_COUNT).fill(null).map(() => ({
            set: "",
            weight: "",
            reps: "",
            notes: "",
          })),
          detailSets: [],
          weightUnit,
        }));

      const updatedExercises = [...state.exercises, ...newExercises];
      const newState = {
        exercises: updatedExercises,
        isActive: updatedExercises.length > 0,
        hasUnsavedChanges: true,
        startTime: state.startTime || new Date(),
      };

      set(newState);
      debouncedPersistWorkout(newState);
    },

    updateExerciseSets: (exerciseId: number, sets: DetailSet[]) => {
      const state = get();
      const updatedExercises = state.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { 
              ...exercise, 
              detailSets: sets,
              sets: convertDetailSetsToSets(sets)  // Convert to display format
            }
          : exercise
      );

      const newState = {
        exercises: updatedExercises,
        hasUnsavedChanges: true,
      };

      set(newState);
      debouncedPersistWorkout({ ...state, ...newState });
    },

    deleteExercise: (exerciseId: number) => {
      const state = get();
      const updatedExercises = state.exercises.filter(
        (exercise) => exercise.id !== exerciseId
      );

      const newState = {
        exercises: updatedExercises,
        isActive: updatedExercises.length > 0,
        hasUnsavedChanges: updatedExercises.length > 0,
      };

      set(newState);
      debouncedPersistWorkout({ ...state, ...newState });
    },

    clearAllExercises: () => {
      const newState = {
        ...DEFAULT_WORKOUT_SESSION,
      };

      set(newState);
      debouncedPersistWorkout(newState);
    },

    // Workout management actions
    updateWorkoutTitle: (title: string) => {
      const state = get();
      
      // Enforce character limit
      if (title.length <= WORKOUT_CONSTANTS.MAX_TITLE_LENGTH) {
        const newState = {
          title,
          hasUnsavedChanges: true,
        };

        set(newState);
        debouncedPersistWorkout({ ...state, ...newState });
      }
    },

    startWorkout: () => {
      const state = get();
      const newState = {
        startTime: new Date(),
        isActive: true,
      };

      set(newState);
      debouncedPersistWorkout({ ...state, ...newState });
    },

    endWorkout: () => {
      const state = get();
      
      // Only end if there are valid exercises
      if (!get().hasAnySetsWithData()) {
        set({ error: 'No exercises with completed sets found. Add some sets before ending workout.' });
        return;
      }

      // This will be called when user confirms end workout dialog
      set({
        isActive: false,
        hasUnsavedChanges: false,
      });
    },

    saveWorkout: async () => {
      const state = get();
      
      // Validate workout has data
      if (!state.hasAnySetsWithData()) {
        set({ error: 'Cannot save workout without any completed sets' });
        return;
      }

      try {
        set({ isLoading: true, error: null });

        // Filter valid exercises
        const validExercises = state.exercises.filter(validateWorkoutExercise);
        
        if (validExercises.length === 0) {
          throw new Error('No valid exercises to save');
        }

        // Create workout history item
        const now = new Date();
        const workoutHistoryItem: WorkoutHistoryItem = {
          id: generateUniqueId(),
          title: state.title || 'Untitled Workout',
          date: now.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
          }).replace(',', ''),
          day: now.toLocaleDateString('en-US', { weekday: 'long' }),
          time: now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          duration: state.calculateWorkoutDuration(),
          weightUnit: validExercises[0]?.weightUnit || 'kg',
          exercises: calculateWorkoutStats(validExercises),
        };

        // Add to history
        get().addToHistory(workoutHistoryItem);

        // Clear current workout
        set({
          ...DEFAULT_WORKOUT_SESSION,
          lastSavedAt: new Date(),
          isLoading: false,
        });

        // Clear persisted workout
        await AsyncStorage.removeItem(WORKOUT_STORAGE_KEY);

      } catch (error) {
        console.error('Failed to save workout:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to save workout',
          isLoading: false 
        });
      }
    },

    // History management actions
    addToHistory: (workout: WorkoutHistoryItem) => {
      const state = get();
      const updatedHistory = [workout, ...state.history];
      
      set({ history: updatedHistory });
      debouncedPersistHistory(updatedHistory);
    },

    updateWorkoutInHistory: (workoutId: number, updates: Partial<WorkoutHistoryItem>) => {
      const state = get();
      const updatedHistory = state.history.map((workout) =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );
      
      set({ history: updatedHistory });
      debouncedPersistHistory(updatedHistory);
    },

    deleteFromHistory: (workoutId: number) => {
      const state = get();
      const updatedHistory = state.history.filter(
        (workout) => workout.id !== workoutId
      );
      
      set({ history: updatedHistory });
      debouncedPersistHistory(updatedHistory);
    },

    loadWorkoutFromHistory: (workout: WorkoutHistoryItem) => {
      // Convert historical workout to current workout format
      const newExercises: WorkoutExercise[] = workout.exercises.map((exercise) => {
        const convertedDetailSets = exercise.detailSets.map((set, index) => ({
          id: index + 1,
          weight: set.weight,
          reps: set.reps,
          notes: set.notes,
        }));
        
        return {
          id: generateUniqueId(),
          name: exercise.name,
          sets: convertDetailSetsToSets(convertedDetailSets),
          detailSets: convertedDetailSets,
          weightUnit: workout.weightUnit,
        };
      });

      const newState = {
        exercises: newExercises,
        title: workout.title,
        isActive: true,
        hasUnsavedChanges: true,
        startTime: new Date(),
      };

      set(newState);
      debouncedPersistWorkout(newState);
    },

    addToCurrentSession: (exercises: WorkoutExercise[]) => {
      const state = get();
      const updatedExercises = [...state.exercises, ...exercises];
      
      const newState = {
        exercises: updatedExercises,
        isActive: true,
        hasUnsavedChanges: true,
        startTime: state.startTime || new Date(),
      };

      set(newState);
      debouncedPersistWorkout(newState);
    },

    // Utility functions
    hasAnySetsWithData: () => {
      const state = get();
      return state.exercises.some(validateWorkoutExercise);
    },

    validateWorkout: () => {
      const state = get();
      const validExercises = state.exercises.filter(validateWorkoutExercise);
      return validExercises.length > 0;
    },

    calculateWorkoutDuration: () => {
      const state = get();
      if (!state.startTime) return WORKOUT_CONSTANTS.DEFAULT_WORKOUT_DURATION;
      
      const now = new Date();
      const diffMs = now.getTime() - state.startTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins}m`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Convenient methods for UI components
    clearWorkout: () => {
      get().clearAllExercises();
    },

    canEndWorkout: () => {
      return get().hasAnySetsWithData();
    },


    // Initialization method
    initializeWorkout: async () => {
      try {
        set({ isLoading: true, error: null });

        // Load current workout
        const storedWorkout = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
        if (storedWorkout) {
          const workoutData = JSON.parse(storedWorkout);
          set({
            ...workoutData,
            startTime: workoutData.startTime ? new Date(workoutData.startTime) : undefined,
          });
        }

        // Load workout history
        const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          const historyData = JSON.parse(storedHistory);
          set({ history: historyData });
        }

        set({ isLoading: false });
      } catch (error) {
        console.warn('Failed to initialize workout from storage:', error);
        set({ 
          error: 'Failed to load workout data',
          isLoading: false 
        });
      }
    },

    // ============================================================================
    // Server Sync Methods (Phase 5.6)
    // ============================================================================

    /**
     * Create workout on server and sync with local state
     */
    createWorkoutOnServer: async (title?: string) => {
      const state = get();
      
      try {
        set({ isLoading: true, error: null });

        const workoutRequest: CreateWorkoutRequest = {
          title: title || state.title || 'New Workout',
          started_at: state.startTime?.toISOString(),
        };

        const serverWorkout = await apiClient.post<WorkoutResponse>('/workouts', workoutRequest);
        
        // Update local state with server data
        set({
          title: serverWorkout.title,
          startTime: new Date(serverWorkout.started_at),
          isActive: serverWorkout.is_active,
          isLoading: false,
          // Store server ID for future syncing
          serverWorkoutId: serverWorkout.id,
        });

        console.log('Workout created on server:', serverWorkout.id);
        return serverWorkout;
      } catch (error) {
        console.error('Failed to create workout on server:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to create workout on server' 
        });
        return null;
      }
    },

    /**
     * Sync current workout to server (create or update)
     */
    syncWorkoutToServer: async () => {
      const state = get();
      
      if (!state.isActive && state.exercises.length === 0) {
        console.log('No active workout to sync');
        return null;
      }

      try {
        set({ isLoading: true, error: null });

        // If no server ID, create new workout
        if (!(state as any).serverWorkoutId) {
          return await get().createWorkoutOnServer();
        }

        // Update existing workout
        const updateRequest: UpdateWorkoutRequest = {
          title: state.title,
          is_active: state.isActive,
          duration: state.startTime ? 
            Math.floor((Date.now() - state.startTime.getTime()) / 1000) : 
            undefined,
        };

        const serverWorkout = await apiClient.put<WorkoutResponse>(
          `/workouts/${(state as any).serverWorkoutId}`, 
          updateRequest
        );

        set({ isLoading: false });
        console.log('Workout synced to server successfully');
        return serverWorkout;
      } catch (error) {
        console.error('Failed to sync workout to server:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to sync workout to server' 
        });
        return null;
      }
    },

    /**
     * Complete workout on server and add to history
     */
    completeWorkoutOnServer: async () => {
      const state = get();
      
      if (!(state as any).serverWorkoutId) {
        console.log('No server workout to complete, syncing first...');
        await get().syncWorkoutToServer();
      }

      try {
        set({ isLoading: true, error: null });

        const updateRequest: UpdateWorkoutRequest = {
          is_active: false,
          completed_at: new Date().toISOString(),
          duration: state.startTime ? 
            Math.floor((Date.now() - state.startTime.getTime()) / 1000) : 
            0,
        };

        const completedWorkout = await apiClient.put<WorkoutResponse>(
          `/workouts/${(state as any).serverWorkoutId}`, 
          updateRequest
        );

        // Add to local history and end workout
        const historyItem: WorkoutHistoryItem = {
          id: parseInt(completedWorkout.id, 10) || Date.now(),
          title: completedWorkout.title,
          date: new Date(completedWorkout.completed_at!).toLocaleDateString(),
          day: new Date(completedWorkout.completed_at!).toLocaleDateString('en-US', { weekday: 'long' }),
          time: new Date(completedWorkout.completed_at!).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          duration: completedWorkout.duration ? 
            `${Math.floor(completedWorkout.duration / 60)}m` : 
            '0m',
          weightUnit: 'kg', // Default, should sync from user preferences
          exercises: state.exercises.map(ex => ({
            name: ex.name,
            sets: ex.detailSets?.length || 0,
            totalReps: ex.detailSets?.reduce((sum, set) => sum + set.reps, 0) || 0,
            maxWeight: ex.detailSets?.reduce((max, set) => Math.max(max, set.weight), 0) || 0,
            detailSets: ex.detailSets?.map((set, index) => ({
              set: index + 1,
              weight: set.weight,
              reps: set.reps,
              notes: set.notes,
            })) || [],
          })),
        };

        get().addToHistory(historyItem);
        get().endWorkout();

        set({ isLoading: false });
        console.log('Workout completed on server successfully');
        return completedWorkout;
      } catch (error) {
        console.error('Failed to complete workout on server:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to complete workout on server' 
        });
        return null;
      }
    },

    /**
     * Load active workout from server
     */
    loadActiveWorkoutFromServer: async () => {
      try {
        set({ isLoading: true, error: null });

        // Get active workouts from server
        const workouts = await apiClient.get<WorkoutResponse[]>('/workouts?is_active=true&limit=1');
        
        if (workouts.length === 0) {
          set({ isLoading: false });
          return null;
        }

        const activeWorkout = workouts[0];
        
        // Get detailed workout with exercises
        const detailedWorkout = await apiClient.get<WorkoutWithExercisesResponse>(
          `/workouts/${activeWorkout.id}`
        );

        // Convert server format to local format
        const localExercises: WorkoutExercise[] = detailedWorkout.exercises.map(ex => ({
          id: parseInt(ex.exercise_id, 10) || 0,
          name: ex.exercise_details.name,
          sets: [], // Keep empty for compatibility
          detailSets: ex.sets.map(set => ({
            id: parseInt(set.id, 10) || 0,
            weight: set.weight || 0,
            reps: set.reps || 0,
            notes: set.notes || '',
          })),
          weightUnit: 'kg' as WeightUnit, // Default, sync from user preferences
        }));

        set({
          title: detailedWorkout.title,
          startTime: new Date(detailedWorkout.started_at),
          isActive: detailedWorkout.is_active,
          exercises: localExercises,
          hasUnsavedChanges: false,
          isLoading: false,
          serverWorkoutId: detailedWorkout.id,
        });

        console.log('Active workout loaded from server');
        return detailedWorkout;
      } catch (error) {
        console.error('Failed to load active workout from server:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to load active workout from server' 
        });
        return null;
      }
    },

    /**
     * Sync workout history from server
     */
    syncHistoryFromServer: async () => {
      try {
        set({ isLoading: true, error: null });

        const workouts = await apiClient.get<WorkoutResponse[]>('/workouts?is_active=false&limit=50');
        
        const historyItems: WorkoutHistoryItem[] = workouts.map(workout => ({
          id: parseInt(workout.id, 10) || 0,
          title: workout.title,
          date: new Date(workout.completed_at || workout.created_at).toLocaleDateString(),
          day: new Date(workout.completed_at || workout.created_at).toLocaleDateString('en-US', { weekday: 'long' }),
          time: new Date(workout.completed_at || workout.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          duration: workout.duration ? `${Math.floor(workout.duration / 60)}m` : '0m',
          weightUnit: 'kg' as WeightUnit,
          exercises: [], // Would need to fetch detailed workout to get exercises
        }));

        set({ 
          history: historyItems,
          isLoading: false 
        });

        // Persist to local storage
        debouncedPersistHistory(historyItems);

        console.log(`Synced ${historyItems.length} workouts from server`);
        return historyItems;
      } catch (error) {
        console.error('Failed to sync history from server:', error);
        set({ 
          isLoading: false, 
          error: 'Failed to sync workout history from server' 
        });
        return null;
      }
    },
  }))
);

// Export default for consistency
export default useWorkoutStore;