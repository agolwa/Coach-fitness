/**
 * Workout Hooks for Component Integration
 * Provides convenient hooks for workout state management
 */

import { useCallback, useEffect } from 'react';
import { useWorkoutStore } from '../stores/workout-store';
import { useUserStore } from '../stores/user-store';
import type { 
  WorkoutExercise, 
  DetailSet, 
  SelectedExercise, 
  WorkoutHistoryItem 
} from '../types/workout';

// Main workout hook
export const useWorkout = () => {
  const workoutStore = useWorkoutStore();
  const userStore = useUserStore();

  // Initialize workout on mount
  useEffect(() => {
    if (typeof workoutStore.initializeWorkout === 'function') {
      workoutStore.initializeWorkout();
    }
  }, []);

  // Sync weight unit changes with user preferences
  useEffect(() => {
    const hasActiveWorkout = workoutStore.exercises.length > 0;
    userStore.setCanChangeWeightUnit(!hasActiveWorkout);
  }, [workoutStore.exercises.length, userStore.setCanChangeWeightUnit]);

  return {
    // State
    exercises: workoutStore.exercises,
    title: workoutStore.title,
    isActive: workoutStore.isActive,
    hasUnsavedChanges: workoutStore.hasUnsavedChanges,
    startTime: workoutStore.startTime,
    history: workoutStore.history,
    isLoading: workoutStore.isLoading,
    error: workoutStore.error,

    // Actions
    addExercises: workoutStore.addExercises,
    updateExerciseSets: workoutStore.updateExerciseSets,
    deleteExercise: workoutStore.deleteExercise,
    clearAllExercises: workoutStore.clearAllExercises,
    updateWorkoutTitle: workoutStore.updateWorkoutTitle,
    startWorkout: workoutStore.startWorkout,
    endWorkout: workoutStore.endWorkout,
    saveWorkout: workoutStore.saveWorkout,
    clearError: workoutStore.clearError,

    // History actions
    addToHistory: workoutStore.addToHistory,
    loadWorkoutFromHistory: workoutStore.loadWorkoutFromHistory,
    addToCurrentSession: workoutStore.addToCurrentSession,

    // Utilities
    hasAnySetsWithData: workoutStore.hasAnySetsWithData,
    validateWorkout: workoutStore.validateWorkout,
    calculateWorkoutDuration: workoutStore.calculateWorkoutDuration,

    // Computed values
    exerciseCount: workoutStore.exercises.length,
    completedSetsCount: workoutStore.exercises.reduce((total, exercise) => {
      return total + (exercise.detailSets?.filter(set => set.reps > 0).length || 0);
    }, 0),
    weightUnit: userStore.weightUnit,
  };
};

// Hook for exercise management
export const useExerciseManagement = () => {
  const { 
    addExercises, 
    updateExerciseSets, 
    deleteExercise, 
    exercises 
  } = useWorkout();

  const addExercisesToWorkout = useCallback((selectedExercises: SelectedExercise[]) => {
    const validExercises = selectedExercises.filter(ex => ex.selected);
    if (validExercises.length > 0) {
      addExercises(validExercises);
    }
  }, [addExercises]);

  const updateSetsForExercise = useCallback((exerciseId: number, sets: DetailSet[]) => {
    updateExerciseSets(exerciseId, sets);
  }, [updateExerciseSets]);

  const removeExercise = useCallback((exerciseId: number) => {
    deleteExercise(exerciseId);
  }, [deleteExercise]);

  const findExerciseById = useCallback((id: number): WorkoutExercise | undefined => {
    return exercises.find(exercise => exercise.id === id);
  }, [exercises]);

  return {
    exercises,
    addExercisesToWorkout,
    updateSetsForExercise,
    removeExercise,
    findExerciseById,
  };
};

// Hook for workout history
export const useWorkoutHistory = () => {
  const { 
    history, 
    addToHistory, 
    loadWorkoutFromHistory, 
    addToCurrentSession 
  } = useWorkout();

  const startNewSessionFromHistory = useCallback((workout: WorkoutHistoryItem) => {
    loadWorkoutFromHistory(workout);
  }, [loadWorkoutFromHistory]);

  const addHistoryToCurrentSession = useCallback((workout: WorkoutHistoryItem) => {
    // Convert workout history to workout exercises
    const exercises: WorkoutExercise[] = workout.exercises.map((exercise) => ({
      id: Date.now() + Math.random(),
      name: exercise.name,
      sets: exercise.detailSets.map((set, index) => ({
        set: (index + 1).toString(),
        weight: set.weight.toString(),
        reps: set.reps.toString(),
        notes: set.notes,
      })),
      detailSets: exercise.detailSets.map((set, index) => ({
        id: index + 1,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes,
      })),
      weightUnit: workout.weightUnit,
    }));

    addToCurrentSession(exercises);
  }, [addToCurrentSession]);

  const getRecentWorkouts = useCallback((count: number = 5) => {
    return history.slice(0, count);
  }, [history]);

  const getWorkoutById = useCallback((id: number): WorkoutHistoryItem | undefined => {
    return history.find(workout => workout.id === id);
  }, [history]);

  return {
    history,
    addToHistory,
    startNewSessionFromHistory,
    addHistoryToCurrentSession,
    getRecentWorkouts,
    getWorkoutById,
    totalWorkouts: history.length,
  };
};

// Hook for workout session management
export const useWorkoutSession = () => {
  const { 
    title, 
    updateWorkoutTitle, 
    startWorkout, 
    endWorkout, 
    saveWorkout,
    isActive,
    hasUnsavedChanges,
    hasAnySetsWithData,
    validateWorkout,
    clearAllExercises,
    isLoading,
    error,
    clearError,
  } = useWorkout();

  const { isSignedIn } = useUserStore();

  const handleUpdateTitle = useCallback((newTitle: string) => {
    // Enforce character limit in the hook
    if (newTitle.length <= 30) {
      updateWorkoutTitle(newTitle);
    }
  }, [updateWorkoutTitle]);

  const handleStartWorkout = useCallback(() => {
    if (!isActive) {
      startWorkout();
    }
  }, [isActive, startWorkout]);

  const handleEndWorkout = useCallback(async () => {
    if (!hasAnySetsWithData()) {
      throw new Error('No exercises with completed sets found. Add some sets before ending workout.');
    }

    if (!isSignedIn) {
      // Guest mode - just clear workout without saving
      clearAllExercises();
      return { success: true, message: 'Workout cleared. Sign up to save your workouts!' };
    }

    // Signed in - save workout
    try {
      await saveWorkout();
      return { success: true, message: 'Workout saved to history!' };
    } catch (error) {
      throw error;
    }
  }, [hasAnySetsWithData, isSignedIn, clearAllExercises, saveWorkout]);

  const canEndWorkout = hasAnySetsWithData();
  const shouldShowGuestWarning = !isSignedIn && hasAnySetsWithData();

  return {
    title,
    isActive,
    hasUnsavedChanges,
    isLoading,
    error,
    canEndWorkout,
    shouldShowGuestWarning,
    updateTitle: handleUpdateTitle,
    startWorkout: handleStartWorkout,
    endWorkout: handleEndWorkout,
    clearError,
    clearWorkout: clearAllExercises,
  };
};

// Hook for workout statistics
export const useWorkoutStats = () => {
  const { exercises, history, calculateWorkoutDuration } = useWorkout();

  const currentWorkoutStats = {
    exerciseCount: exercises.length,
    totalSets: exercises.reduce((total, exercise) => {
      return total + (exercise.detailSets?.length || 0);
    }, 0),
    completedSets: exercises.reduce((total, exercise) => {
      return total + (exercise.detailSets?.filter(set => set.reps > 0).length || 0);
    }, 0),
    totalReps: exercises.reduce((total, exercise) => {
      return total + (exercise.detailSets?.reduce((exerciseTotal, set) => exerciseTotal + set.reps, 0) || 0);
    }, 0),
    duration: calculateWorkoutDuration(),
  };

  const historyStats = {
    totalWorkouts: history.length,
    totalExercises: history.reduce((total, workout) => total + workout.exercises.length, 0),
    totalSets: history.reduce((total, workout) => {
      return total + workout.exercises.reduce((workoutTotal, exercise) => workoutTotal + exercise.sets, 0);
    }, 0),
    totalReps: history.reduce((total, workout) => {
      return total + workout.exercises.reduce((workoutTotal, exercise) => workoutTotal + exercise.totalReps, 0);
    }, 0),
  };

  return {
    current: currentWorkoutStats,
    history: historyStats,
  };
};

// Export all hooks for convenience
export type {
  WorkoutExercise,
  DetailSet,
  SelectedExercise,
  WorkoutHistoryItem,
} from '../types/workout';