/**
 * User Store Tests
 * Comprehensive testing for user preferences and authentication
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/user-store';
import { convertWeight, formatWeight } from '../stores/user-store';
import type { WeightUnit, AuthState, UserPreferences } from '../types/workout';
import { DEFAULT_USER_PREFERENCES } from '../types/workout';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test data
const mockUserPreferences: UserPreferences = {
  weightUnit: 'lbs',
  canChangeWeightUnit: false,
  authState: 'signed-in',
  isSignedIn: true,
  isGuest: false,
};

describe('User Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store to default state
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.resetPreferences();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should have correct default state', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.weightUnit).toBe('kg');
      expect(result.current.canChangeWeightUnit).toBe(true);
      expect(result.current.authState).toBe('guest');
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Weight Unit Management', () => {
    it('should set weight unit when allowed', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setWeightUnit('lbs');
      });

      expect(result.current.weightUnit).toBe('lbs');
    });

    it('should prevent weight unit change when locked', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setCanChangeWeightUnit(false);
        result.current.setWeightUnit('lbs');
      });

      expect(result.current.weightUnit).toBe('kg'); // Should remain unchanged
      expect(result.current.error).toContain('Cannot change weight unit during active workout');
    });

    it('should validate weight unit values', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        // @ts-ignore - Testing invalid input
        result.current.setWeightUnit('invalid');
      });

      expect(result.current.error).toBe('Invalid weight unit');
    });

    it('should allow toggling weight unit lock', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.canChangeWeightUnit).toBe(true);

      act(() => {
        result.current.setCanChangeWeightUnit(false);
      });

      expect(result.current.canChangeWeightUnit).toBe(false);

      act(() => {
        result.current.setCanChangeWeightUnit(true);
      });

      expect(result.current.canChangeWeightUnit).toBe(true);
    });
  });

  describe('Authentication Management', () => {
    it('should sign in user', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.signIn();
      });

      expect(result.current.authState).toBe('signed-in');
      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.isGuest).toBe(false);
    });

    it('should sign out user', () => {
      const { result } = renderHook(() => useUserStore());
      
      // First sign in
      act(() => {
        result.current.signIn();
      });

      expect(result.current.isSignedIn).toBe(true);

      // Then sign out
      act(() => {
        result.current.signOut();
      });

      expect(result.current.authState).toBe('guest');
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.isGuest).toBe(true);
      expect(result.current.canChangeWeightUnit).toBe(true); // Should reset on sign out
    });

    it('should continue as guest', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.continueAsGuest();
      });

      expect(result.current.authState).toBe('guest');
      expect(result.current.isSignedIn).toBe(false);
      expect(result.current.isGuest).toBe(true);
    });
  });

  describe('Preference Management', () => {
    it('should update partial preferences', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updatePreferences({
          weightUnit: 'lbs',
          canChangeWeightUnit: false,
        });
      });

      expect(result.current.weightUnit).toBe('lbs');
      expect(result.current.canChangeWeightUnit).toBe(false);
    });

    it('should maintain auth state consistency', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updatePreferences({
          authState: 'signed-in',
        });
      });

      expect(result.current.authState).toBe('signed-in');
      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.isGuest).toBe(false);
    });

    it('should validate preference updates', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.updatePreferences({
          // @ts-ignore - Testing invalid input
          weightUnit: 'invalid',
        });
      });

      expect(result.current.error).toBe('Invalid weight unit in preferences');
    });

    it('should reset preferences to defaults', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Change preferences
      act(() => {
        result.current.signIn();
        result.current.setWeightUnit('lbs');
      });

      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.weightUnit).toBe('lbs');

      // Reset to defaults
      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.weightUnit).toBe(DEFAULT_USER_PREFERENCES.weightUnit);
      expect(result.current.isSignedIn).toBe(DEFAULT_USER_PREFERENCES.isSignedIn);
      expect(result.current.authState).toBe(DEFAULT_USER_PREFERENCES.authState);
    });
  });

  describe('Utility Methods', () => {
    it('should get weight unit label', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.getWeightUnitLabel()).toBe('Kilograms');

      act(() => {
        result.current.setWeightUnit('lbs');
      });

      expect(result.current.getWeightUnitLabel()).toBe('Pounds');
    });

    it('should check if user can change unit', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.canChangeUnit()).toBe(true);

      act(() => {
        result.current.setCanChangeWeightUnit(false);
      });

      expect(result.current.canChangeUnit()).toBe(false);
    });

    it('should check if user is authenticated', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.isAuthenticated()).toBe(false);

      act(() => {
        result.current.signIn();
      });

      expect(result.current.isAuthenticated()).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should persist preference changes', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setWeightUnit('lbs');
      });

      // Fast-forward past debounce timeout
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_preferences',
        expect.stringContaining('lbs')
      );

      jest.useRealTimers();
    });

    it('should initialize from stored preferences', async () => {
      const storedPrefs = JSON.stringify(mockUserPreferences);
      mockAsyncStorage.getItem.mockResolvedValue(storedPrefs);

      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        if (typeof result.current.initializeUser === 'function') {
          await result.current.initializeUser();
        }
      });

      expect(result.current.weightUnit).toBe('lbs');
      expect(result.current.isSignedIn).toBe(true);
      expect(result.current.canChangeWeightUnit).toBe(false);
    });

    it('should handle invalid stored preferences', async () => {
      const invalidPrefs = JSON.stringify({ invalid: 'data' });
      mockAsyncStorage.getItem.mockResolvedValue(invalidPrefs);

      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        if (typeof result.current.initializeUser === 'function') {
          await result.current.initializeUser();
        }
      });

      // Should fallback to defaults
      expect(result.current.weightUnit).toBe(DEFAULT_USER_PREFERENCES.weightUnit);
      expect(result.current.isSignedIn).toBe(DEFAULT_USER_PREFERENCES.isSignedIn);
    });

    it('should force persist preferences', async () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setWeightUnit('lbs');
      });

      await act(async () => {
        if (typeof result.current.persistPreferences === 'function') {
          await result.current.persistPreferences();
        }
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_preferences',
        expect.stringContaining('lbs')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        if (typeof result.current.initializeUser === 'function') {
          await result.current.initializeUser();
        }
      });

      expect(result.current.error).toContain('Failed to load user preferences');
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setCanChangeWeightUnit(false);
        result.current.setWeightUnit('lbs'); // This should set an error
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle persistence errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      
      const { result } = renderHook(() => useUserStore());
      
      await act(async () => {
        if (typeof result.current.persistPreferences === 'function') {
          await result.current.persistPreferences();
        }
      });

      expect(result.current.error).toBe('Failed to save preferences');
    });
  });
});

describe('Weight Conversion Utilities', () => {
  describe('convertWeight', () => {
    it('should convert kg to lbs', () => {
      expect(convertWeight(100, 'kg', 'lbs')).toBeCloseTo(220.5, 1);
      expect(convertWeight(80, 'kg', 'lbs')).toBeCloseTo(176.4, 1);
    });

    it('should convert lbs to kg', () => {
      expect(convertWeight(220, 'lbs', 'kg')).toBeCloseTo(99.8, 1);
      expect(convertWeight(176, 'lbs', 'kg')).toBeCloseTo(79.8, 1);
    });

    it('should return same value for same units', () => {
      expect(convertWeight(100, 'kg', 'kg')).toBe(100);
      expect(convertWeight(220, 'lbs', 'lbs')).toBe(220);
    });

    it('should handle zero and decimal values', () => {
      expect(convertWeight(0, 'kg', 'lbs')).toBe(0);
      expect(convertWeight(2.5, 'kg', 'lbs')).toBeCloseTo(5.5, 1);
    });
  });

  describe('formatWeight', () => {
    it('should format weight with unit', () => {
      expect(formatWeight(100, 'kg')).toBe('100 kg');
      expect(formatWeight(220.5, 'lbs')).toBe('220.5 lbs');
    });

    it('should round to one decimal place', () => {
      expect(formatWeight(100.56789, 'kg')).toBe('100.6 kg');
      expect(formatWeight(220.23456, 'lbs')).toBe('220.2 lbs');
    });

    it('should handle whole numbers', () => {
      expect(formatWeight(100.0, 'kg')).toBe('100 kg');
      expect(formatWeight(220.0, 'lbs')).toBe('220 lbs');
    });
  });
});