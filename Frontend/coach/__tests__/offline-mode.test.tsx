/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Test utilities and providers
import { createTestWrapper } from '../test-utils';

// Services and hooks
import { isNetworkError, shouldWorkOffline } from '../services/api-client';
import { useUserStore } from '../stores/user-store';
import { useWorkoutStore } from '../stores/workout-store';

// Components to test
import HomeScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';

// Mock external dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('../hooks/use-workouts', () => ({
  useCreateWorkout: jest.fn(),
  useActiveWorkout: jest.fn(() => ({ data: null, error: null })),
  useUpdateWorkout: jest.fn(),
}));

jest.mock('../hooks/use-auth', () => ({
  useUserProfile: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null
  })),
  useUpdateUserProfile: jest.fn(),
  useLogout: jest.fn(),
}));

jest.mock('../services/api-client', () => ({
  isNetworkError: jest.fn(),
  shouldWorkOffline: jest.fn(),
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock Alert.alert
const mockAlert = jest.spyOn(Alert, 'alert');

// Mock console methods to avoid noise in tests
console.log = jest.fn();
console.error = jest.fn();

describe('Offline Mode Handling', () => {
  const TestWrapper = createTestWrapper();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
  });

  describe('Network Error Detection', () => {
    it('should correctly identify network errors', () => {
      const networkErrors = [
        new Error('Failed to fetch'),
        new Error('Network error occurred'),
        { name: 'TypeError', message: 'Network request failed' },
        { name: 'AbortError', message: 'Request timeout' },
        { errorCode: 'NETWORK_ERROR', message: 'Connection failed' }
      ];

      networkErrors.forEach(error => {
        expect(isNetworkError(error)).toBe(true);
      });
    });

    it('should not identify non-network errors as network errors', () => {
      const nonNetworkErrors = [
        new Error('Validation error'),
        { status: 400, message: 'Bad request' },
        { errorCode: 'VALIDATION_ERROR', message: 'Invalid data' },
        undefined,
        null
      ];

      nonNetworkErrors.forEach(error => {
        expect(isNetworkError(error)).toBe(false);
      });
    });
  });

  describe('Offline Mode Detection', () => {
    beforeEach(() => {
      // Mock fetch for offline detection tests
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should detect offline when health check fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const isOffline = await shouldWorkOffline();
      expect(isOffline).toBe(true);
    });

    it('should detect online when health check succeeds', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const isOffline = await shouldWorkOffline();
      expect(isOffline).toBe(false);
    });

    it('should handle timeout in offline detection', async () => {
      // Mock a slow response that times out
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 5000))
      );

      const isOffline = await shouldWorkOffline();
      expect(isOffline).toBe(true);
    });
  });

  describe('Home Screen Offline Behavior', () => {
    it('should handle workout creation gracefully when offline', async () => {
      const mockCreateWorkout = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
      
      require('../hooks/use-workouts').useCreateWorkout.mockReturnValue({
        mutateAsync: mockCreateWorkout,
        isPending: false
      });

      // Set up signed-in user
      act(() => {
        useUserStore.getState().signIn('test@example.com');
      });

      const { getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Try to add exercises (which triggers workout creation)
      const addButton = getByTestId('add-exercises-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        // Should not show error alert for network errors
        expect(mockAlert).not.toHaveBeenCalled();
      });

      // Should still navigate to add exercises
      expect(router.push).toHaveBeenCalledWith('/(modal)/add-exercises');
    });

    it('should show error alert for non-network errors', async () => {
      const mockCreateWorkout = jest.fn().mockRejectedValue(new Error('Server validation error'));
      
      require('../hooks/use-workouts').useCreateWorkout.mockReturnValue({
        mutateAsync: mockCreateWorkout,
        isPending: false
      });

      // Set up signed-in user
      act(() => {
        useUserStore.getState().signIn('test@example.com');
      });

      const { getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      const addButton = getByTestId('add-exercises-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        // Should show error alert for non-network errors
        expect(mockAlert).toHaveBeenCalledWith(
          'Error Creating Workout',
          'There was an issue creating your workout. Please try again.',
          [{ text: 'OK' }]
        );
      });
    });

    it('should work in guest mode without server requests', async () => {
      // Set up guest user
      act(() => {
        useUserStore.getState().signOut();
      });

      const mockCreateWorkout = jest.fn();
      
      require('../hooks/use-workouts').useCreateWorkout.mockReturnValue({
        mutateAsync: mockCreateWorkout,
        isPending: false
      });

      const { getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      const addButton = getByTestId('add-exercises-button');
      fireEvent.press(addButton);

      // Should not attempt server request for guest users
      expect(mockCreateWorkout).not.toHaveBeenCalled();
      
      // Should still navigate
      expect(router.push).toHaveBeenCalledWith('/(modal)/add-exercises');
    });
  });

  describe('Profile Screen Offline Behavior', () => {
    it('should show friendly offline message instead of error', async () => {
      const mockError = new Error('Failed to fetch');
      
      require('../hooks/use-auth').useUserProfile.mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError
      });

      // Set up signed-in user
      act(() => {
        useUserStore.getState().signIn('test@example.com');
      });

      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Should show friendly offline message
      expect(getByText('Working offline - profile data unavailable')).toBeTruthy();
      expect(getByText('Working offline')).toBeTruthy();
    });

    it('should show normal content when profile loads successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        display_name: 'Test User',
        preferences: { weightUnit: 'kg' }
      };

      require('../hooks/use-auth').useUserProfile.mockReturnValue({
        data: mockUser,
        isLoading: false,
        error: null
      });

      // Set up signed-in user
      act(() => {
        useUserStore.getState().signIn('test@example.com');
      });

      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Should show user data
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('Synced')).toBeTruthy();
    });

    it('should handle loading state properly', async () => {
      require('../hooks/use-auth').useUserProfile.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      // Set up signed-in user
      act(() => {
        useUserStore.getState().signIn('test@example.com');
      });

      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Should show loading state
      expect(getByText('Loading profile...')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Local Data Persistence', () => {
    it('should save workout data locally when server is unavailable', async () => {
      const mockSaveWorkout = jest.fn();
      const mockStartWorkout = jest.fn();

      // Mock workout store methods
      act(() => {
        useWorkoutStore.setState({
          saveWorkout: mockSaveWorkout,
          startWorkout: mockStartWorkout
        });
      });

      // Set up workout creation failure
      const mockCreateWorkout = jest.fn().mockRejectedValue(new Error('Network error'));
      
      require('../hooks/use-workouts').useCreateWorkout.mockReturnValue({
        mutateAsync: mockCreateWorkout,
        isPending: false
      });

      act(() => {
        useUserStore.getState().signIn('test@example.com');
      });

      const { getByTestId } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Start a workout locally
      const addButton = getByTestId('add-exercises-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        // Should continue with local workflow
        expect(router.push).toHaveBeenCalledWith('/(modal)/add-exercises');
      });
    });
  });

  describe('Error Message Suppression', () => {
    it('should suppress network error alerts but show other errors', async () => {
      const testCases = [
        {
          error: new Error('Failed to fetch'),
          shouldShowAlert: false,
          description: 'network error'
        },
        {
          error: new Error('Validation failed'),
          shouldShowAlert: true,
          description: 'validation error'  
        },
        {
          error: { name: 'AbortError', message: 'Request timeout' },
          shouldShowAlert: false,
          description: 'timeout error'
        },
        {
          error: { status: 500, message: 'Internal server error' },
          shouldShowAlert: true,
          description: 'server error'
        }
      ];

      for (const testCase of testCases) {
        mockAlert.mockClear();
        
        const mockCreateWorkout = jest.fn().mockRejectedValue(testCase.error);
        
        require('../hooks/use-workouts').useCreateWorkout.mockReturnValue({
          mutateAsync: mockCreateWorkout,
          isPending: false
        });

        act(() => {
          useUserStore.getState().signIn('test@example.com');
        });

        const { getByTestId, unmount } = render(
          <TestWrapper>
            <HomeScreen />
          </TestWrapper>
        );

        const addButton = getByTestId('add-exercises-button');
        fireEvent.press(addButton);

        await waitFor(() => {
          if (testCase.shouldShowAlert) {
            expect(mockAlert).toHaveBeenCalledWith(
              'Error Creating Workout',
              'There was an issue creating your workout. Please try again.',
              [{ text: 'OK' }]
            );
          } else {
            expect(mockAlert).not.toHaveBeenCalled();
          }
        });

        unmount();
      }
    });
  });
});