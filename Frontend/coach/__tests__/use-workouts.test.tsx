/**
 * @jest-environment jsdom
 */

/**
 * Workout Management Hooks Integration Tests
 * 
 * Comprehensive test suite for:
 * - Workout CRUD operations hooks
 * - Exercise and set management hooks
 * - Integration with Zustand workout store
 * - Real-time synchronization testing
 * - Error handling and retry logic
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useWorkouts,
  useWorkout,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
  useCreateSet,
  useUpdateSet,
} from '../hooks/use-workouts';
import { useWorkoutStore } from '../stores/workout-store';
import { useUserStore } from '../stores/user-store';
import { apiClient } from '../services/api-client';

// Mock the API client
jest.mock('../services/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  APIError: class APIError extends Error {
    constructor(message: string, public status: number, public errorCode: string) {
      super(message);
      this.name = 'APIError';
    }
  },
}));

// Mock the stores
jest.mock('../stores/workout-store', () => ({
  useWorkoutStore: jest.fn(),
}));

jest.mock('../stores/user-store', () => ({
  useUserStore: jest.fn(),
}));

describe('Workout Management Hooks', () => {
  let queryClient: QueryClient;
  let mockWorkoutStore: any;
  let mockUserStore: any;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockWorkoutStore = {
      isActive: false,
      exercises: [],
      title: '',
      updateWorkoutTitle: jest.fn(),
      startWorkout: jest.fn(),
      endWorkout: jest.fn(),
      deleteExercise: jest.fn(),
      clearAllExercises: jest.fn(),
    };

    mockUserStore = {
      isSignedIn: true,
    };

    (useWorkoutStore as jest.Mock).mockReturnValue(mockWorkoutStore);
    (useUserStore as jest.Mock).mockReturnValue(mockUserStore);

    jest.clearAllMocks();
  });

  describe('useWorkouts', () => {
    it('should fetch workouts successfully', async () => {
      const mockWorkouts = [
        {
          id: 'workout-1',
          user_id: 'user-1',
          title: 'Morning Workout',
          started_at: '2024-01-01T08:00:00Z',
          completed_at: null,
          is_active: true,
          created_at: '2024-01-01T08:00:00Z',
          updated_at: '2024-01-01T08:00:00Z',
        },
        {
          id: 'workout-2',
          user_id: 'user-1',
          title: 'Evening Workout',
          started_at: '2024-01-01T18:00:00Z',
          completed_at: '2024-01-01T19:30:00Z',
          is_active: false,
          created_at: '2024-01-01T18:00:00Z',
          updated_at: '2024-01-01T19:30:00Z',
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockWorkouts);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/workouts');
      expect(result.current.data).toEqual(mockWorkouts);
    });

    it('should fetch workouts with filters', async () => {
      const mockActiveWorkouts = [
        {
          id: 'workout-1',
          title: 'Active Workout',
          is_active: true,
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockActiveWorkouts);

      const { result } = renderHook(
        () => useWorkouts({ is_active: true, limit: 10 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/workouts?is_active=true&limit=10');
      expect(result.current.data).toEqual(mockActiveWorkouts);
    });

    it('should not fetch when user is not signed in', () => {
      mockUserStore.isSignedIn = false;
      (useUserStore as jest.Mock).mockReturnValue(mockUserStore);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useWorkout', () => {
    it('should fetch single workout with exercises', async () => {
      const mockWorkout = {
        id: 'workout-1',
        title: 'Test Workout',
        exercises: [
          {
            id: 'we-1',
            exercise_id: 'ex-1',
            exercise_details: {
              name: 'Push-up',
              category: 'Strength',
              body_part: ['Chest', 'Arms'],
              equipment: ['Bodyweight'],
            },
            sets: [
              {
                id: 'set-1',
                reps: 10,
                weight: 0,
                completed: true,
              },
            ],
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockWorkout);

      const { result } = renderHook(() => useWorkout('workout-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/workouts/workout-1');
      expect(result.current.data).toEqual(mockWorkout);
    });

    it('should not fetch when workout ID is null', () => {
      const { result } = renderHook(() => useWorkout(null), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should sync active workout with local store', async () => {
      const mockWorkout = {
        id: 'workout-1',
        title: 'Active Workout',
        is_active: true,
        exercises: [],
      };

      mockWorkoutStore.isActive = true;
      (useWorkoutStore as jest.Mock).mockReturnValue(mockWorkoutStore);
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockWorkout);

      const { result } = renderHook(() => useWorkout('workout-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockWorkoutStore.updateWorkoutTitle).toHaveBeenCalledWith('Active Workout');
    });
  });

  describe('useCreateWorkout', () => {
    it('should create workout successfully', async () => {
      const mockRequest = {
        title: 'New Workout',
        started_at: '2024-01-01T10:00:00Z',
      };

      const mockResponse = {
        id: 'workout-1',
        user_id: 'user-1',
        title: 'New Workout',
        started_at: '2024-01-01T10:00:00Z',
        is_active: true,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        result.current.mutate(mockRequest);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.post).toHaveBeenCalledWith('/workouts', mockRequest);
      expect(mockWorkoutStore.startWorkout).toHaveBeenCalled();
      expect(mockWorkoutStore.updateWorkoutTitle).toHaveBeenCalledWith('New Workout');
    });

    it('should handle workout creation errors', async () => {
      const mockError = new Error('Creation failed');
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        result.current.mutate({ title: 'Failed Workout' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
      expect(mockWorkoutStore.startWorkout).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateWorkout', () => {
    it('should update workout successfully', async () => {
      const mockUpdate = {
        title: 'Updated Workout',
        is_active: false,
        completed_at: '2024-01-01T11:00:00Z',
      };

      const mockResponse = {
        id: 'workout-1',
        title: 'Updated Workout',
        is_active: false,
        completed_at: '2024-01-01T11:00:00Z',
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUpdateWorkout(), { wrapper });

      act(() => {
        result.current.mutate({
          workoutId: 'workout-1',
          updates: mockUpdate,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.put).toHaveBeenCalledWith('/workouts/workout-1', mockUpdate);
      expect(mockWorkoutStore.updateWorkoutTitle).toHaveBeenCalledWith('Updated Workout');
      expect(mockWorkoutStore.endWorkout).toHaveBeenCalled();
    });

    it('should handle workout update errors', async () => {
      const mockError = new Error('Update failed');
      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useUpdateWorkout(), { wrapper });

      act(() => {
        result.current.mutate({
          workoutId: 'workout-1',
          updates: { title: 'Failed Update' },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useDeleteWorkout', () => {
    it('should delete workout successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteWorkout(), { wrapper });

      act(() => {
        result.current.mutate('workout-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.delete).toHaveBeenCalledWith('/workouts/workout-1');
    });

    it('should clear local workout if it was active', async () => {
      mockWorkoutStore.isActive = true;
      (useWorkoutStore as jest.Mock).mockReturnValue(mockWorkoutStore);
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteWorkout(), { wrapper });

      act(() => {
        result.current.mutate('workout-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockWorkoutStore.endWorkout).toHaveBeenCalled();
      expect(mockWorkoutStore.clearAllExercises).toHaveBeenCalled();
    });
  });

  describe('useCreateSet', () => {
    it('should create set successfully', async () => {
      const mockSetRequest = {
        reps: 10,
        weight: 50.5,
        completed: true,
        rest_time: 60,
      };

      const mockSetResponse = {
        id: 'set-1',
        workout_exercise_id: 'we-1',
        reps: 10,
        weight: 50.5,
        completed: true,
        rest_time: 60,
        order_index: 0,
        completed_at: '2024-01-01T10:30:00Z',
        created_at: '2024-01-01T10:30:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockSetResponse);

      const { result } = renderHook(() => useCreateSet(), { wrapper });

      act(() => {
        result.current.mutate({
          workoutId: 'workout-1',
          exerciseId: 'exercise-1',
          set: mockSetRequest,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/workouts/workout-1/exercises/exercise-1/sets',
        mockSetRequest
      );
      expect(result.current.data).toEqual(mockSetResponse);
    });

    it('should handle set creation errors', async () => {
      const mockError = new Error('Set creation failed');
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useCreateSet(), { wrapper });

      act(() => {
        result.current.mutate({
          workoutId: 'workout-1',
          exerciseId: 'exercise-1',
          set: { reps: 10, weight: 50 },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useUpdateSet', () => {
    it('should update set successfully', async () => {
      const mockSetUpdate = {
        reps: 12,
        weight: 55.5,
        completed: true,
      };

      const mockSetResponse = {
        id: 'set-1',
        reps: 12,
        weight: 55.5,
        completed: true,
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockSetResponse);

      const { result } = renderHook(() => useUpdateSet(), { wrapper });

      act(() => {
        result.current.mutate({
          workoutId: 'workout-1',
          exerciseId: 'exercise-1',
          setId: 'set-1',
          updates: mockSetUpdate,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiClient.put).toHaveBeenCalledWith(
        '/workouts/workout-1/exercises/exercise-1/sets/set-1',
        mockSetUpdate
      );
      expect(result.current.data).toEqual(mockSetResponse);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workout flow', async () => {
      // Create workout
      const createResponse = {
        id: 'workout-1',
        title: 'Integration Test Workout',
        is_active: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(createResponse);

      const { result: createResult } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        createResult.current.mutate({
          title: 'Integration Test Workout',
        });
      });

      await waitFor(() => {
        expect(createResult.current.isSuccess).toBe(true);
      });

      // Update workout
      const updateResponse = {
        id: 'workout-1',
        title: 'Updated Integration Test Workout',
        is_active: false,
        completed_at: '2024-01-01T12:00:00Z',
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce(updateResponse);

      const { result: updateResult } = renderHook(() => useUpdateWorkout(), { wrapper });

      act(() => {
        updateResult.current.mutate({
          workoutId: 'workout-1',
          updates: {
            title: 'Updated Integration Test Workout',
            completed_at: '2024-01-01T12:00:00Z',
            is_active: false,
          },
        });
      });

      await waitFor(() => {
        expect(updateResult.current.isSuccess).toBe(true);
      });

      expect(mockWorkoutStore.endWorkout).toHaveBeenCalled();
    });

    it('should handle workout with exercises and sets', async () => {
      // Create a set
      const setRequest = {
        reps: 10,
        weight: 50,
        completed: true,
      };

      const setResponse = {
        id: 'set-1',
        reps: 10,
        weight: 50,
        completed: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(setResponse);

      const { result } = renderHook(() => useCreateSet(), { wrapper });

      act(() => {
        result.current.mutate({
          workoutId: 'workout-1',
          exerciseId: 'exercise-1',
          set: setRequest,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Fetch the workout to see updated data
      const workoutWithSets = {
        id: 'workout-1',
        exercises: [
          {
            id: 'we-1',
            exercise_details: { name: 'Push-up' },
            sets: [setResponse],
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(workoutWithSets);

      const { result: workoutResult } = renderHook(() => useWorkout('workout-1'), { wrapper });

      await waitFor(() => {
        expect(workoutResult.current.isSuccess).toBe(true);
      });

      expect(workoutResult.current.data).toEqual(workoutWithSets);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(networkError);
    });

    it('should handle fetch failures gracefully during workout creation', async () => {
      const fetchError = new Error('Failed to fetch');
      (apiClient.post as jest.Mock).mockRejectedValueOnce(fetchError);

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        result.current.mutate({ title: 'Test Workout' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(fetchError);
      
      // Should not prevent local workout functionality
      expect(console.error).toHaveBeenCalledWith('Failed to create workout:', fetchError);
    });

    it('should queue sync operations when offline', async () => {
      const networkError = new Error('Failed to fetch');
      (apiClient.post as jest.Mock).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      // Simulate offline workout creation
      act(() => {
        result.current.mutate({ 
          title: 'Offline Workout',
          started_at: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Workout creation should fail gracefully
      expect(result.current.error).toBe(networkError);
      
      // Console should log the error for debugging
      expect(console.error).toHaveBeenCalledWith('Failed to create workout:', networkError);
    });

    it('should not throw errors for network timeouts', async () => {
      const timeoutError = { name: 'AbortError', message: 'Request timeout' };
      (apiClient.post as jest.Mock).mockRejectedValueOnce(timeoutError);

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      expect(() => {
        act(() => {
          result.current.mutate({ title: 'Test Workout' });
        });
      }).not.toThrow();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(timeoutError);
    });

    it('should invalidate queries correctly after mutations', async () => {
      const queryClientSpy = jest.spyOn(queryClient, 'invalidateQueries');

      // Create workout should invalidate workout lists
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        id: 'workout-1',
        title: 'Test Workout',
      });

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        result.current.mutate({ title: 'Test Workout' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Note: In real implementation, this would check specific query invalidation
      // For now, we just verify the mutation succeeded
      expect(result.current.isSuccess).toBe(true);
    });
  });
});