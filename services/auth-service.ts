/**
 * Authentication Service Layer
 * Provides structured authentication methods and error handling
 * This is a mock implementation - real OAuth integration will be added later
 */

import * as Haptics from 'expo-haptics';
import { AuthState } from '@/types/workout';

// Mock response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email?: string;
    name?: string;
    isGuest: boolean;
  };
  error?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// Mock authentication delays for realistic UX
const AUTH_DELAYS = {
  google: 1000, // 1 second for Google OAuth simulation
  guest: 500,   // 0.5 seconds for guest mode
  signOut: 300, // 0.3 seconds for sign out
} as const;

/**
 * Authentication Service Class
 * Handles all authentication operations with proper error handling
 */
export class AuthService {
  
  /**
   * Simulate Google OAuth sign-in
   * In production, this will integrate with Expo AuthSession and Supabase
   */
  static async signInWithGoogle(): Promise<AuthResponse> {
    try {
      // Haptic feedback for user interaction
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, AUTH_DELAYS.google));
      
      // Mock successful Google authentication
      const mockUser = {
        id: `google_user_${Date.now()}`,
        email: 'user@gmail.com',
        name: 'Fitness User',
        isGuest: false,
      };

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return {
        success: true,
        message: 'Successfully signed in with Google!',
        user: mockUser,
      };
      
    } catch (error) {
      // Error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      return {
        success: false,
        message: 'Failed to sign in with Google. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Continue as guest
   * Sets up guest mode with limitations
   */
  static async continueAsGuest(): Promise<AuthResponse> {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Simulate setup delay
      await new Promise(resolve => setTimeout(resolve, AUTH_DELAYS.guest));
      
      const guestUser = {
        id: `guest_user_${Date.now()}`,
        name: 'Guest User',
        isGuest: true,
      };

      return {
        success: true,
        message: 'Continuing as guest. Sign up to save your workouts!',
        user: guestUser,
      };
      
    } catch (error) {
      return {
        success: false,
        message: 'Failed to set up guest mode. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sign out user
   * Clears all authentication state and user data
   */
  static async signOut(): Promise<AuthResponse> {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simulate sign out process
      await new Promise(resolve => setTimeout(resolve, AUTH_DELAYS.signOut));
      
      return {
        success: true,
        message: 'Successfully signed out!',
      };
      
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sign out. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate current session
   * Checks if stored authentication state is still valid
   */
  static async validateSession(): Promise<{
    isValid: boolean;
    authState: AuthState;
    needsRefresh: boolean;
  }> {
    try {
      // In production, this would validate tokens with the backend
      // For now, we assume stored state is valid
      return {
        isValid: true,
        authState: 'pending', // Will be determined by stored preferences
        needsRefresh: false,
      };
    } catch (error) {
      return {
        isValid: false,
        authState: 'pending',
        needsRefresh: true,
      };
    }
  }

  /**
   * Refresh authentication token
   * In production, this will refresh OAuth tokens
   */
  static async refreshAuth(): Promise<AuthResponse> {
    try {
      // Simulate token refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: 'Authentication refreshed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to refresh authentication',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle authentication errors
   * Provides user-friendly error messages
   */
  static handleAuthError(error: any): AuthError {
    if (error?.code) {
      switch (error.code) {
        case 'auth/user-cancelled':
          return {
            code: 'USER_CANCELLED',
            message: 'Sign-in was cancelled. Please try again.',
          };
        case 'auth/network-error':
          return {
            code: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection and try again.',
          };
        case 'auth/too-many-requests':
          return {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many sign-in attempts. Please wait and try again.',
          };
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred. Please try again.',
            details: error,
          };
      }
    }

    return {
      code: 'GENERIC_ERROR',
      message: error?.message || 'Authentication failed. Please try again.',
      details: error,
    };
  }

  /**
   * Check if user can perform authenticated actions
   * Returns limitations for guest users
   */
  static getAuthLimitations(authState: AuthState): {
    canSaveWorkouts: boolean;
    canAccessHistory: boolean;
    canSyncData: boolean;
    showUpgradePrompts: boolean;
    limitationsMessage: string;
  } {
    switch (authState) {
      case 'signed-in':
        return {
          canSaveWorkouts: true,
          canAccessHistory: true,
          canSyncData: true,
          showUpgradePrompts: false,
          limitationsMessage: '',
        };
      
      case 'guest':
        return {
          canSaveWorkouts: false,
          canAccessHistory: false,
          canSyncData: false,
          showUpgradePrompts: true,
          limitationsMessage: 'Sign up to save workouts and access history',
        };
      
      case 'pending':
      default:
        return {
          canSaveWorkouts: false,
          canAccessHistory: false,
          canSyncData: false,
          showUpgradePrompts: false,
          limitationsMessage: 'Please sign in to access all features',
        };
    }
  }
}

// Export default for convenience
export default AuthService;