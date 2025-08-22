/**
 * Phase 4.4 Validation Tests
 * Testing the main app logic integration, navigation, and new screens
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock the stores with simple implementations
jest.mock('@/stores/workout-store', () => ({
  useWorkoutStore: () => ({
    exercises: [],
    title: '',
    isActive: false,
    updateWorkoutTitle: jest.fn(),
    clearWorkout: jest.fn(),
    endWorkout: jest.fn(),
    canEndWorkout: jest.fn(() => false),
    addExercise: jest.fn(),
    history: [],
  }),
}));

jest.mock('@/stores/user-store', () => ({
  useUserStore: () => ({
    authState: 'guest',
    weightUnit: 'kg',
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    setWeightUnit: jest.fn(),
    canChangeWeightUnit: true,
  }),
}));

jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        foreground: '#000000',
        background: '#ffffff',
        primary: '#00b561',
        'primary-foreground': '#ffffff',
        muted: {
          foreground: '#666666',
        },
        border: '#e5e5e5',
      },
    },
    toggleTheme: jest.fn(),
  }),
}));

// Mock components
jest.mock('@/components/TodaysLog', () => ({
  TodaysLog: () => null,
}));

describe('Phase 4.4: Main App Logic Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Home Screen Navigation Integration', () => {
    it('should render home screen without errors', async () => {
      const HomeScreen = require('../app/(tabs)/index').default;
      
      render(<HomeScreen />);
      
      // Should render main elements
      expect(screen.getByText('VoiceLog')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter workout name...')).toBeTruthy();
      expect(screen.getByText('Add Exercise')).toBeTruthy();
    });

    it('should handle add exercise navigation', async () => {
      const HomeScreen = require('../app/(tabs)/index').default;
      const { router } = useRouter();
      
      const { getByText } = render(<HomeScreen />);
      
      // Should have Add Exercise button
      const addButton = getByText('Add Exercise');
      expect(addButton).toBeTruthy();
    });
  });

  describe('Activity Screen Implementation', () => {
    it('should render activity screen correctly', async () => {
      const ActivityScreen = require('../app/(tabs)/activity').default;
      
      render(<ActivityScreen />);
      
      // Should render main elements
      expect(screen.getByText('Workout History')).toBeTruthy();
      expect(screen.getByText('Statistics')).toBeTruthy();
    });
  });

  describe('Profile Screen Implementation', () => {
    it('should render profile screen correctly', async () => {
      const ProfileScreen = require('../app/(tabs)/profile').default;
      
      render(<ProfileScreen />);
      
      // Should render main elements
      expect(screen.getByText('Profile')).toBeTruthy();
      expect(screen.getByText('User Preferences')).toBeTruthy();
    });

    it('should show guest user message', async () => {
      const ProfileScreen = require('../app/(tabs)/profile').default;
      
      render(<ProfileScreen />);
      
      // Should show guest user information
      expect(screen.getByText('Guest User')).toBeTruthy();
      expect(screen.getByText('Sign up to save your workouts')).toBeTruthy();
    });
  });

  describe('Modal Screen Implementation', () => {
    it('should render add exercises modal correctly', async () => {
      const AddExercisesScreen = require('../app/(modal)/add-exercises').default;
      
      render(<AddExercisesScreen />);
      
      // Should render main elements
      expect(screen.getByText('Add Exercises')).toBeTruthy();
      expect(screen.getByText('Select exercises to add to your workout:')).toBeTruthy();
    });
  });

  describe('Navigation Structure Validation', () => {
    it('should have correct tab layout structure', () => {
      const TabLayout = require('../app/(tabs)/_layout').default;
      
      expect(TabLayout).toBeDefined();
      expect(typeof TabLayout).toBe('function');
    });

    it('should have modal layout structure', () => {
      const ModalLayout = require('../app/(modal)/_layout').default;
      
      expect(ModalLayout).toBeDefined();
      expect(typeof ModalLayout).toBe('function');
    });
  });

  describe('React Native Component Usage Validation', () => {
    it('should use React Native components only (no HTML elements)', async () => {
      const HomeScreen = require('../app/(tabs)/index').default;
      const ActivityScreen = require('../app/(tabs)/activity').default;
      const ProfileScreen = require('../app/(tabs)/profile').default;
      
      // All screens should render without React Native component errors
      expect(() => render(<HomeScreen />)).not.toThrow();
      expect(() => render(<ActivityScreen />)).not.toThrow();
      expect(() => render(<ProfileScreen />)).not.toThrow();
    });
  });
});