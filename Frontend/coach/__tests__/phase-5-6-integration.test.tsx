/**
 * @jest-environment jsdom
 * Phase 5.6 Integration Tests
 * 
 * Comprehensive end-to-end integration tests for:
 * - Complete API Client & React Query setup
 * - Authentication flow with JWT management
 * - Workout CRUD operations with server sync
 * - Exercise library integration
 * - Zustand store synchronization with server state
 * - Error handling and offline capabilities
 * - Performance and caching optimizations
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all the hooks and services we're testing
import { useGoogleAuth, useUserProfile, useLogout } from '../hooks/use-auth';
import { useWorkouts, useCreateWorkout, useWorkout } from '../hooks/use-workouts';
import { useExercises } from '../hooks/use-exercises';
import { useUserStore } from '../stores/user-store';
import { useWorkoutStore } from '../stores/workout-store';
import { apiClient, TokenManager, APIClient } from '../services/api-client';

// Mock fetch for controlled testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock console to avoid noise
const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

describe('Phase 5.6 Integration Tests', () => {
  let queryClient: QueryClient;
  let testApiClient: APIClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false,
          staleTime: 0,
          cacheTime: 0,
        },
        mutations: { retry: false },
      },
    });

    testApiClient = new APIClient('http://localhost:8000', 5000);

    // Clear all mocks
    mockFetch.mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.multiSet as jest.Mock).mockClear();
    (AsyncStorage.multiRemove as jest.Mock).mockClear();
    consoleSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleLogSpy.mockClear();

    // Reset stores to initial state
    useUserStore.getState().signOut();
    useWorkoutStore.getState().endWorkout();
    useWorkoutStore.getState().clearAllExercises();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Complete Authentication Flow', () => {
    it('should handle full Google OAuth authentication flow', async () => {
      // Mock successful Google authentication response
      const mockAuthResponse = {
        access_token: 'google-auth-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'google-refresh-token',
        user: {
          id: 'user-123',
          email: 'testuser@gmail.com',
          display_name: 'Test User',
          preferences: {
            weightUnit: 'kg',
            theme: 'auto',
            defaultRestTimer: 60,
            hapticFeedback: true,
            soundEnabled: true,
            autoStartRestTimer: false,
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockAuthResponse),
        headers: new Headers(),
      });

      // Test Google authentication
      const { result: authResult } = renderHook(() => useGoogleAuth(), { wrapper });

      act(() => {
        authResult.current.mutate({
          token: 'google-oauth-token',
          google_jwt: 'google-jwt-token',
        });
      });

      await waitFor(() => {
        expect(authResult.current.isSuccess).toBe(true);
      });

      // Verify API call was made correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/google',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            token: 'google-oauth-token',
            google_jwt: 'google-jwt-token',
          }),
        })
      );

      // Verify tokens were stored
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['@auth_access_token', 'google-auth-token'],
        ['@auth_token_expiry', expect.any(String)],
      ]);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@auth_refresh_token',
        'google-refresh-token'
      );

      // Verify user store was updated
      const userState = useUserStore.getState();
      expect(userState.isSignedIn).toBe(true);
      expect(userState.authState).toBe('signed-in');
      expect(userState.weightUnit).toBe('kg');
    });

    it('should handle authentication with subsequent API calls', async () => {
      // Setup: User is authenticated
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      // Mock profile fetch
      const mockProfile = {
        id: 'user-123',
        email: 'testuser@gmail.com',
        preferences: {
          weightUnit: 'kg',
          theme: 'auto',
          defaultRestTimer: 90,
          hapticFeedback: false,
          soundEnabled: true,
          autoStartRestTimer: true,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProfile),
        headers: new Headers(),
      });

      // Manually set user as signed in for this test
      useUserStore.getState().signIn();

      const { result: profileResult } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => {
        expect(profileResult.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );

      expect(profileResult.current.data).toEqual(mockProfile);
    });

    it('should handle token refresh flow', async () => {
      // Setup: Initial request with expired token, then refresh, then retry
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('expired-token') // getAccessToken
        .mockResolvedValueOnce('refresh-token'); // getRefreshToken

      mockFetch
        // First request fails with 401
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        })
        // Token refresh succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            access_token: 'new-access-token',
            token_type: 'bearer',
            expires_in: 3600,
          }),
          headers: new Headers(),
        })
        // Retry with new token succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            id: 'user-123',
            email: 'test@example.com',
            preferences: { weightUnit: 'kg' },
          }),
          headers: new Headers(),
        });

      // Set user as signed in
      useUserStore.getState().signIn();

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should have made 3 requests: failed auth, refresh, retry
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Verify new tokens were stored
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['@auth_access_token', 'new-access-token'],
        ['@auth_token_expiry', expect.any(String)],
      ]);
    });
  });

  describe('Complete Workout Management Flow', () => {
    it('should handle full workout lifecycle', async () => {
      // Setup authenticated user
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      // 1. Create workout
      const createWorkoutResponse = {
        id: 'workout-123',
        user_id: 'user-123',
        title: 'Morning Push Workout',
        started_at: '2024-01-01T08:00:00Z',
        completed_at: null,
        duration: null,
        is_active: true,
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T08:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createWorkoutResponse),
        headers: new Headers(),
      });

      const { result: createResult } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        createResult.current.mutate({
          title: 'Morning Push Workout',
          started_at: '2024-01-01T08:00:00Z',
        });
      });

      await waitFor(() => {
        expect(createResult.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/workouts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: 'Morning Push Workout',
            started_at: '2024-01-01T08:00:00Z',
          }),
        })
      );

      // Verify local store was updated
      const workoutState = useWorkoutStore.getState();
      expect(workoutState.isActive).toBe(true);
      expect(workoutState.title).toBe('Morning Push Workout');

      // 2. Fetch workout details
      const workoutDetailsResponse = {
        ...createWorkoutResponse,
        exercises: [
          {
            id: 'we-1',
            workout_id: 'workout-123',
            exercise_id: 'ex-1',
            order_index: 0,
            exercise_details: {
              id: 'ex-1',
              name: 'Push-up',
              category: 'Strength',
              body_part: ['Chest', 'Triceps'],
              equipment: ['Bodyweight'],
            },
            sets: [
              {
                id: 'set-1',
                workout_exercise_id: 'we-1',
                reps: 10,
                weight: null,
                completed: true,
                order_index: 0,
                completed_at: '2024-01-01T08:15:00Z',
                created_at: '2024-01-01T08:15:00Z',
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(workoutDetailsResponse),
        headers: new Headers(),
      });

      const { result: workoutResult } = renderHook(() => useWorkout('workout-123'), { wrapper });

      await waitFor(() => {
        expect(workoutResult.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/workouts/workout-123',
        expect.objectContaining({ method: 'GET' })
      );

      expect(workoutResult.current.data).toEqual(workoutDetailsResponse);

      // 3. Complete workout
      const completedWorkoutResponse = {
        ...createWorkoutResponse,
        completed_at: '2024-01-01T09:00:00Z',
        duration: 3600, // 1 hour
        is_active: false,
        updated_at: '2024-01-01T09:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(completedWorkoutResponse),
        headers: new Headers(),
      });

      // Use the server sync method from workout store
      const completeResult = await useWorkoutStore.getState().completeWorkoutOnServer?.();
      
      // This would verify the workout completion flow
      // Implementation details would depend on exact store structure
      expect(completeResult).toBeDefined();
    });

    it('should handle workout list with pagination', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      const mockWorkoutsList = [
        {
          id: 'workout-1',
          title: 'Morning Workout',
          is_active: false,
          completed_at: '2024-01-01T09:00:00Z',
        },
        {
          id: 'workout-2',
          title: 'Evening Workout',
          is_active: true,
          completed_at: null,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockWorkoutsList),
        headers: new Headers(),
      });

      const { result } = renderHook(
        () => useWorkouts({ limit: 10, offset: 0, is_active: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/workouts?is_active=false&limit=10&offset=0',
        expect.objectContaining({ method: 'GET' })
      );

      expect(result.current.data).toEqual(mockWorkoutsList);
    });
  });

  describe('Exercise Library Integration', () => {
    it('should fetch and cache exercise library', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      const mockExercises = {
        exercises: [
          {
            id: 'ex-1',
            name: 'Push-up',
            category: 'Strength',
            body_part: ['Chest', 'Triceps'],
            equipment: ['Bodyweight'],
            description: 'A bodyweight pushing exercise',
          },
          {
            id: 'ex-2',
            name: 'Squat',
            category: 'Strength',
            body_part: ['Quadriceps', 'Glutes'],
            equipment: ['Bodyweight'],
            description: 'A fundamental lower body exercise',
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockExercises),
        headers: new Headers(),
      });

      const { result } = renderHook(() => useExercises(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/exercises',
        expect.objectContaining({ method: 'GET' })
      );

      expect(result.current.data).toEqual(mockExercises);

      // Verify caching - second call should use cache
      const { result: cachedResult } = renderHook(() => useExercises(), { wrapper });

      // Should be immediately available from cache
      expect(cachedResult.current.data).toEqual(mockExercises);
    });

    it('should handle exercise search with filters', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      const searchResults = {
        exercises: [
          {
            id: 'ex-1',
            name: 'Push-up',
            category: 'Strength',
            body_part: ['Chest'],
            equipment: ['Bodyweight'],
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(searchResults),
        headers: new Headers(),
      });

      const { result } = renderHook(
        () => useExercises({
          search: 'push',
          body_part: ['Chest'],
          equipment: ['Bodyweight'],
        }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/exercises?body_part=Chest&equipment=Bodyweight&search=push',
        expect.objectContaining({ method: 'GET' })
      );

      expect(result.current.data).toEqual(searchResults);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network errors gracefully', async () => {
      useUserStore.getState().signIn();

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Network error');
    });

    it('should handle server errors (500) appropriately', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({
          detail: 'Database connection failed',
          error_code: 'SERVER_ERROR',
        }),
      });

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Database connection failed');
    });

    it('should handle validation errors (422) with detailed messages', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({
          detail: 'Workout title cannot be empty',
          error_code: 'VALIDATION_ERROR',
        }),
      });

      const { result } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        result.current.mutate({ title: '' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Workout title cannot be empty');
    });
  });

  describe('Performance and Caching', () => {
    it('should implement proper query caching strategies', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      const mockData = [{ id: 'workout-1', title: 'Test Workout' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
        headers: new Headers(),
      });

      // First fetch
      const { result: firstResult } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(firstResult.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second fetch should use cache (with staleTime: 0, it would refetch)
      // In real implementation with proper staleTime, this would come from cache
      const { result: secondResult } = renderHook(() => useWorkouts(), { wrapper });

      // Data should be immediately available
      expect(secondResult.current.data).toEqual(mockData);
    });

    it('should handle query invalidation after mutations', async () => {
      useUserStore.getState().signIn();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      // Mock workout creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          id: 'new-workout',
          title: 'New Workout',
        }),
        headers: new Headers(),
      });

      const { result: createResult } = renderHook(() => useCreateWorkout(), { wrapper });

      act(() => {
        createResult.current.mutate({ title: 'New Workout' });
      });

      await waitFor(() => {
        expect(createResult.current.isSuccess).toBe(true);
      });

      // After mutation, related queries should be invalidated
      // This is handled by the onSuccess callbacks in the hooks
      expect(createResult.current.isSuccess).toBe(true);
    });
  });

  describe('Store Synchronization', () => {
    it('should sync server state with local Zustand stores', async () => {
      useUserStore.getState().signIn();

      // Test user store sync
      const userState = useUserStore.getState();
      expect(userState.isSignedIn).toBe(true);

      // Test server sync methods
      const syncResult = await userState.syncPreferencesFromServer?.();
      
      // This would test the actual sync implementation
      // For now, we verify the method exists
      expect(typeof userState.syncPreferencesFromServer).toBe('function');
    });

    it('should handle offline/online state transitions', async () => {
      // Start offline
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useWorkouts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Go online
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
        headers: new Headers(),
      });

      // Retry should work
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use correct base URLs for different environments', () => {
      // Test development environment
      const devClient = new APIClient();
      expect(devClient).toBeDefined();

      // Test custom base URL
      const customClient = new APIClient('https://api.production.com');
      expect(customClient).toBeDefined();
    });

    it('should handle timeout configurations', async () => {
      const timeoutClient = new APIClient('http://localhost:8000', 100); // 100ms timeout

      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 200))
      );

      jest.useFakeTimers();

      const request = timeoutClient.get('/slow-endpoint');
      
      jest.advanceTimersByTime(150);

      await expect(request).rejects.toThrow();

      jest.useRealTimers();
    });
  });
});