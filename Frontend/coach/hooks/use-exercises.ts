/**
 * Exercise Management Hooks for Backend Integration
 * 
 * Custom React Query hooks for:
 * - Exercise library retrieval and filtering
 * - Exercise search functionality
 * - Exercise details and metadata
 * - Integration with local exercise-store for offline capability
 * 
 * Provides seamless integration between server exercise database and local state.
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  apiClient, 
  APIError,
  type ExerciseDetails,
} from '@/services/api-client';
import { useExerciseStore } from '@/stores/exercise-store';
import { useUserStore } from '@/stores/user-store';

// ============================================================================
// Query Keys for React Query Cache Management
// ============================================================================

export const exerciseQueryKeys = {
  all: () => ['exercises'] as const,
  lists: () => [...exerciseQueryKeys.all(), 'list'] as const,
  list: (filters: ExerciseFilters) => [...exerciseQueryKeys.lists(), filters] as const,
  details: () => [...exerciseQueryKeys.all(), 'detail'] as const,
  detail: (id: string) => [...exerciseQueryKeys.details(), id] as const,
  search: (query: string) => [...exerciseQueryKeys.all(), 'search', query] as const,
  categories: () => [...exerciseQueryKeys.all(), 'categories'] as const,
  equipment: () => [...exerciseQueryKeys.all(), 'equipment'] as const,
  bodyParts: () => [...exerciseQueryKeys.all(), 'bodyParts'] as const,
} as const;

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ExerciseFilters {
  category?: string;
  body_part?: string[];
  equipment?: string[];
  search?: string;
  limit?: number; // Note: Backend enforces max limit of 200
  offset?: number;
}

export interface ExerciseListResponse {
  exercises: ExerciseDetails[];
  total: number;
  limit: number;
  offset: number;
}

export interface ExerciseCategory {
  name: string;
  count: number;
}

export interface ExerciseEquipment {
  name: string;
  count: number;
}

export interface ExerciseBodyPart {
  name: string;
  count: number;
}

// ============================================================================
// Exercise List & Search Hooks
// ============================================================================

/**
 * Hook to fetch paginated exercise list with filtering
 * Note: Backend limits the maximum number of results to 200 per request
 */
export function useExercises(filters: ExerciseFilters = {}) {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: exerciseQueryKeys.list(filters),
    queryFn: async (): Promise<ExerciseListResponse> => {
      const params = new URLSearchParams();
      
      if (filters.category) {
        params.set('category', filters.category);
      }
      if (filters.body_part?.length) {
        filters.body_part.forEach(part => params.append('body_part', part));
      }
      if (filters.equipment?.length) {
        filters.equipment.forEach(eq => params.append('equipment', eq));
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.limit) {
        params.set('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.set('offset', filters.offset.toString());
      }

      const query = params.toString();
      const endpoint = `/exercises${query ? `?${query}` : ''}`;
      
      return apiClient.get<ExerciseListResponse>(endpoint);
    },
    enabled: isSignedIn,
    staleTime: 30 * 60 * 1000, // 30 minutes - exercise library changes rarely
    onSuccess: (data) => {
      // Sync with local exercise store
      const { updateExerciseDatabase } = useExerciseStore.getState();
      
      // Convert server format to local format
      const localExercises = data.exercises.map((exercise, index) => ({
        id: parseInt(exercise.id, 10) || index, // Convert UUID to number for local compatibility
        name: exercise.name,
        muscle: exercise.body_part.join(', '), // Join array to string for local format
        equipment: exercise.equipment.join(', '),
        selected: false,
      }));

      // Update local store while preserving selection state
      updateExerciseDatabase(localExercises);
    },
    onError: (error: APIError) => {
      console.error('Failed to fetch exercises:', error);
    },
  });
}

/**
 * Hook to search exercises with debounced queries
 */
export function useExerciseSearch(searchTerm: string, debounceMs: number = 300) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useQuery({
    queryKey: exerciseQueryKeys.search(debouncedTerm),
    queryFn: async (): Promise<ExerciseDetails[]> => {
      if (!debouncedTerm.trim()) return [];
      
      const response = await apiClient.get<ExerciseListResponse>(
        `/exercises?search=${encodeURIComponent(debouncedTerm)}`
      );
      return response.exercises;
    },
    enabled: debouncedTerm.length >= 2, // Only search with 2+ characters
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      // Update local search results
      const { searchExercises } = useExerciseStore.getState();
      searchExercises(debouncedTerm);
    },
  });
}

/**
 * Hook to get single exercise details
 */
export function useExercise(exerciseId: string | null) {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: exerciseQueryKeys.detail(exerciseId || ''),
    queryFn: async (): Promise<ExerciseDetails> => {
      if (!exerciseId) throw new Error('Exercise ID is required');
      return apiClient.get<ExerciseDetails>(`/exercises/${exerciseId}`);
    },
    enabled: isSignedIn && !!exerciseId,
    staleTime: 60 * 60 * 1000, // 1 hour - individual exercises rarely change
    onError: (error: APIError) => {
      console.error(`Failed to fetch exercise ${exerciseId}:`, error);
    },
  });
}

// ============================================================================
// Exercise Metadata Hooks
// ============================================================================

/**
 * Hook to get available exercise categories
 */
export function useExerciseCategories() {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: exerciseQueryKeys.categories(),
    queryFn: async (): Promise<ExerciseCategory[]> => {
      return apiClient.get<ExerciseCategory[]>('/exercises/categories');
    },
    enabled: isSignedIn,
    staleTime: 60 * 60 * 1000, // 1 hour - categories change rarely
    onSuccess: (data) => {
      // Could sync with local store if needed
      console.log('Exercise categories loaded:', data.length);
    },
  });
}

/**
 * Hook to get available equipment types
 */
export function useExerciseEquipment() {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: exerciseQueryKeys.equipment(),
    queryFn: async (): Promise<ExerciseEquipment[]> => {
      return apiClient.get<ExerciseEquipment[]>('/exercises/equipment');
    },
    enabled: isSignedIn,
    staleTime: 60 * 60 * 1000, // 1 hour
    onSuccess: (data) => {
      // Sync with local store equipment filter options
      const { updateEquipmentOptions } = useExerciseStore.getState();
      const equipmentNames = data.map(eq => eq.name);
      updateEquipmentOptions?.(equipmentNames);
    },
  });
}

/**
 * Hook to get available body parts
 */
export function useExerciseBodyParts() {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: exerciseQueryKeys.bodyParts(),
    queryFn: async (): Promise<ExerciseBodyPart[]> => {
      return apiClient.get<ExerciseBodyPart[]>('/exercises/body-parts');
    },
    enabled: isSignedIn,
    staleTime: 60 * 60 * 1000, // 1 hour
    onSuccess: (data) => {
      // Sync with local store muscle filter options
      const { updateMuscleOptions } = useExerciseStore.getState();
      const muscleNames = data.map(bp => bp.name);
      updateMuscleOptions?.(muscleNames);
    },
  });
}

// ============================================================================
// Integration Helpers
// ============================================================================

/**
 * Hook to sync exercise selections between local and server state
 */
export function useExerciseSelection() {
  const { 
    selectedExercises, 
    toggleExerciseSelection,
    clearSelection,
    selectAllExercises 
  } = useExerciseStore();

  const getSelectedExerciseIds = (): string[] => {
    return selectedExercises
      .filter(ex => ex.selected)
      .map(ex => ex.id.toString()); // Convert to string for server compatibility
  };

  const selectExercisesByIds = (ids: string[]) => {
    // Convert server IDs back to local format and select them
    const numericIds = ids
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    numericIds.forEach(id => {
      toggleExerciseSelection(id);
    });
  };

  return {
    selectedExercises,
    getSelectedExerciseIds,
    selectExercisesByIds,
    toggleExerciseSelection,
    clearSelection,
    selectAllExercises,
  };
}

/**
 * Hook for exercise filtering with server-side support
 */
export function useExerciseFiltering() {
  const { 
    filters,
    filterByMuscle,
    filterByEquipment,
    searchExercises,
    clearFilters 
  } = useExerciseStore();

  // Server-compatible filter application
  const applyServerFilters = (serverFilters: ExerciseFilters) => {
    if (serverFilters.search) {
      searchExercises(serverFilters.search);
    }
    if (serverFilters.body_part) {
      filterByMuscle(serverFilters.body_part);
    }
    if (serverFilters.equipment) {
      filterByEquipment(serverFilters.equipment);
    }
  };

  const getServerFilters = (): ExerciseFilters => {
    return {
      search: filters.searchTerm || undefined,
      body_part: filters.muscle.length > 0 ? filters.muscle : undefined,
      equipment: filters.equipment.length > 0 ? filters.equipment : undefined,
    };
  };

  return {
    filters,
    applyServerFilters,
    getServerFilters,
    filterByMuscle,
    filterByEquipment,
    searchExercises,
    clearFilters,
  };
}


// Export types for external use
export type {
  ExerciseDetails,
  ExerciseFilters,
  ExerciseListResponse,
  ExerciseCategory,
  ExerciseEquipment,
  ExerciseBodyPart,
};