/**
 * Workout Management Hooks for Backend Integration
 * 
 * Custom React Query hooks for:
 * - Workout CRUD operations (create, read, update, delete)
 * - Workout list management with pagination
 * - Exercise addition to workouts
 * - Set tracking and management
 * - Real-time synchronization with Zustand stores
 * 
 * Integrates with existing workout-store for local state management.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  apiClient, 
  APIError,
  type CreateWorkoutRequest,
  type UpdateWorkoutRequest,
  type WorkoutResponse,
  type WorkoutWithExercisesResponse,
  type WorkoutExerciseRequest,
  type CreateSetRequest,
  type UpdateSetRequest,
  type SetResponse,
} from '@/services/api-client';
import { useWorkoutStore } from '@/stores/workout-store';
import { useUserStore } from '@/stores/user-store';

// ============================================================================
// Query Keys for React Query Cache Management
// ============================================================================

export const workoutQueryKeys = {
  all: () => ['workouts'] as const,
  lists: () => [...workoutQueryKeys.all(), 'list'] as const,
  list: (filters: { is_active?: boolean; limit?: number; offset?: number }) => 
    [...workoutQueryKeys.lists(), filters] as const,
  details: () => [...workoutQueryKeys.all(), 'detail'] as const,
  detail: (id: string) => [...workoutQueryKeys.details(), id] as const,
  active: () => [...workoutQueryKeys.all(), 'active'] as const,
  exercises: (workoutId: string) => [...workoutQueryKeys.detail(workoutId), 'exercises'] as const,
  sets: (workoutId: string, exerciseId: string) => 
    [...workoutQueryKeys.exercises(workoutId), exerciseId, 'sets'] as const,
} as const;

// ============================================================================
// Workout List & Retrieval Hooks
// ============================================================================

/**
 * Hook to fetch paginated workout list
 */
export function useWorkouts(options: {
  is_active?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: workoutQueryKeys.list(options),
    queryFn: async (): Promise<WorkoutResponse[]> => {
      const params = new URLSearchParams();
      
      if (options.is_active !== undefined) {
        params.set('is_active', options.is_active.toString());
      }
      if (options.limit) {
        params.set('limit', options.limit.toString());
      }
      if (options.offset) {
        params.set('offset', options.offset.toString());
      }

      const query = params.toString();
      const endpoint = `/workouts${query ? `?${query}` : ''}`;
      
      return apiClient.get<WorkoutResponse[]>(endpoint);
    },
    enabled: isSignedIn,
    staleTime: 2 * 60 * 1000, // 2 minutes - workouts change frequently
    onError: (error: APIError) => {
      console.error('Failed to fetch workouts:', error);
    },
  });
}

/**
 * Hook to fetch single workout with exercises and sets
 */
export function useWorkout(workoutId: string | null) {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: workoutQueryKeys.detail(workoutId || ''),
    queryFn: async (): Promise<WorkoutWithExercisesResponse> => {
      if (!workoutId) throw new Error('Workout ID is required');
      return apiClient.get<WorkoutWithExercisesResponse>(`/workouts/${workoutId}`);
    },
    enabled: isSignedIn && !!workoutId,
    staleTime: 30 * 1000, // 30 seconds - active workouts change frequently
    onSuccess: (data) => {
      // Sync with local store if this is the active workout
      const { isActive, exercises, updateWorkoutTitle } = useWorkoutStore.getState();
      
      if (data.is_active && isActive) {
        // Update local store with server data
        updateWorkoutTitle(data.title);
        
        // TODO: Sync exercises and sets with local store
        // This would require mapping server format to local format
      }
    },
    onError: (error: APIError) => {
      console.error(`Failed to fetch workout ${workoutId}:`, error);
    },
  });
}

/**
 * Hook to get active workout
 */
export function useActiveWorkout() {
  const { data: workouts } = useWorkouts({ is_active: true, limit: 1 });
  const activeWorkout = workouts?.[0];

  return useQuery({
    queryKey: workoutQueryKeys.detail(activeWorkout?.id || ''),
    queryFn: async (): Promise<WorkoutWithExercisesResponse | null> => {
      if (!activeWorkout) return null;
      return apiClient.get<WorkoutWithExercisesResponse>(`/workouts/${activeWorkout.id}`);
    },
    enabled: !!activeWorkout,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// Workout CRUD Hooks
// ============================================================================

/**
 * Hook to create a new workout
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const { startWorkout, updateWorkoutTitle } = useWorkoutStore();

  return useMutation({
    mutationFn: async (request: CreateWorkoutRequest): Promise<WorkoutResponse> => {
      return apiClient.post<WorkoutResponse>('/workouts', request);
    },
    onSuccess: (data) => {
      // Invalidate workout lists to refetch
      queryClient.invalidateQueries({ queryKey: workoutQueryKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(workoutQueryKeys.detail(data.id), data);
      
      // Update local store if this is a new active workout
      if (data.is_active) {
        startWorkout();
        updateWorkoutTitle(data.title);
      }
    },
    onError: (error: APIError) => {
      console.error('Failed to create workout:', error);
    },
  });
}

/**
 * Hook to update existing workout
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  const { updateWorkoutTitle, endWorkout } = useWorkoutStore();

  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      updates 
    }: { 
      workoutId: string; 
      updates: UpdateWorkoutRequest 
    }): Promise<WorkoutResponse> => {
      return apiClient.put<WorkoutResponse>(`/workouts/${workoutId}`, updates);
    },
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(workoutQueryKeys.detail(variables.workoutId), data);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: workoutQueryKeys.lists() });
      
      // Update local store
      updateWorkoutTitle(data.title);
      
      // If workout was completed, end local workout
      if (data.completed_at && !data.is_active) {
        endWorkout();
      }
    },
    onError: (error: APIError) => {
      console.error('Failed to update workout:', error);
    },
  });
}

/**
 * Hook to delete workout
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  const { endWorkout, clearAllExercises } = useWorkoutStore();

  return useMutation({
    mutationFn: async (workoutId: string): Promise<void> => {
      return apiClient.delete(`/workouts/${workoutId}`);
    },
    onSuccess: (_, workoutId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workoutQueryKeys.detail(workoutId) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: workoutQueryKeys.lists() });
      
      // If this was the active workout, clear local state
      const { isActive } = useWorkoutStore.getState();
      if (isActive) {
        endWorkout();
        clearAllExercises();
      }
    },
    onError: (error: APIError) => {
      console.error('Failed to delete workout:', error);
    },
  });
}

// ============================================================================
// Exercise Management Hooks
// ============================================================================

/**
 * Hook to add exercise to workout
 */
export function useAddExerciseToWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      exercise 
    }: { 
      workoutId: string; 
      exercise: WorkoutExerciseRequest 
    }): Promise<void> => {
      return apiClient.post(`/workouts/${workoutId}/exercises`, exercise);
    },
    onSuccess: (_, variables) => {
      // Invalidate workout detail to refetch with new exercise
      queryClient.invalidateQueries({ 
        queryKey: workoutQueryKeys.detail(variables.workoutId) 
      });
    },
    onError: (error: APIError) => {
      console.error('Failed to add exercise to workout:', error);
    },
  });
}

/**
 * Hook to remove exercise from workout
 */
export function useRemoveExerciseFromWorkout() {
  const queryClient = useQueryClient();
  const { deleteExercise } = useWorkoutStore();

  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      exerciseId 
    }: { 
      workoutId: string; 
      exerciseId: string 
    }): Promise<void> => {
      return apiClient.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
    },
    onSuccess: (_, variables) => {
      // Invalidate workout detail
      queryClient.invalidateQueries({ 
        queryKey: workoutQueryKeys.detail(variables.workoutId) 
      });
      
      // Update local store (convert string ID to number for compatibility)
      const numericId = parseInt(variables.exerciseId, 10);
      if (!isNaN(numericId)) {
        deleteExercise(numericId);
      }
    },
    onError: (error: APIError) => {
      console.error('Failed to remove exercise from workout:', error);
    },
  });
}

// ============================================================================
// Set Management Hooks
// ============================================================================

/**
 * Hook to add set to workout exercise
 */
export function useCreateSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      exerciseId, 
      set 
    }: { 
      workoutId: string; 
      exerciseId: string; 
      set: CreateSetRequest 
    }): Promise<SetResponse> => {
      return apiClient.post<SetResponse>(
        `/workouts/${workoutId}/exercises/${exerciseId}/sets`, 
        set
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate workout detail to refetch with new set
      queryClient.invalidateQueries({ 
        queryKey: workoutQueryKeys.detail(variables.workoutId) 
      });
      
      // Could update local store here as well
    },
    onError: (error: APIError) => {
      console.error('Failed to create set:', error);
    },
  });
}

/**
 * Hook to update existing set
 */
export function useUpdateSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      exerciseId, 
      setId, 
      updates 
    }: { 
      workoutId: string; 
      exerciseId: string; 
      setId: string; 
      updates: UpdateSetRequest 
    }): Promise<SetResponse> => {
      return apiClient.put<SetResponse>(
        `/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, 
        updates
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate workout detail
      queryClient.invalidateQueries({ 
        queryKey: workoutQueryKeys.detail(variables.workoutId) 
      });
    },
    onError: (error: APIError) => {
      console.error('Failed to update set:', error);
    },
  });
}

/**
 * Hook to delete set
 */
export function useDeleteSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      workoutId, 
      exerciseId, 
      setId 
    }: { 
      workoutId: string; 
      exerciseId: string; 
      setId: string 
    }): Promise<void> => {
      return apiClient.delete(
        `/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate workout detail
      queryClient.invalidateQueries({ 
        queryKey: workoutQueryKeys.detail(variables.workoutId) 
      });
    },
    onError: (error: APIError) => {
      console.error('Failed to delete set:', error);
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for bulk operations on workout data
 */
export function useBulkWorkoutOperations() {
  const queryClient = useQueryClient();

  const syncWorkoutToServer = async (localWorkout: any) => {
    // TODO: Implement sync logic from local Zustand store to server
    // This would involve creating workout, adding exercises, and creating sets
    console.log('Sync workout to server:', localWorkout);
  };

  const syncWorkoutFromServer = async (workoutId: string) => {
    // Fetch workout from server and update local store
    const workout = await apiClient.get<WorkoutWithExercisesResponse>(`/workouts/${workoutId}`);
    
    // TODO: Update local Zustand store with server data
    console.log('Sync workout from server:', workout);
    
    return workout;
  };

  return {
    syncWorkoutToServer,
    syncWorkoutFromServer,
  };
}

/**
 * Hook to get workout statistics
 */
export function useWorkoutStats() {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: [...workoutQueryKeys.all(), 'stats'],
    queryFn: async () => {
      return apiClient.get('/workouts/stats');
    },
    enabled: isSignedIn,
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change frequently
  });
}

// Export types for external use
export type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutResponse,
  WorkoutWithExercisesResponse,
  WorkoutExerciseRequest,
  CreateSetRequest,
  UpdateSetRequest,
  SetResponse,
};