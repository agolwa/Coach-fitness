/**
 * API Client for FM-SetLogger Backend Integration
 * 
 * Environment-aware HTTP client with:
 * - Automatic JWT token handling
 * - Request/response interceptors
 * - TypeScript contracts matching backend Pydantic models
 * - Error handling with proper HTTP status codes
 * - Development vs Production configuration
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ============================================================================
// Environment Configuration
// ============================================================================

const getBaseURL = (): string => {
  // Development configuration
  if (__DEV__) {
    // For iOS Simulator and Android Emulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:8000';
    }
    // For Android - use 10.0.2.2 for emulator, localhost for device
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    }
    // Fallback for web
    return 'http://localhost:8000';
  }
  
  // Production configuration
  const productionURL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
  if (productionURL) {
    return productionURL;
  }
  
  // Fallback
  console.warn('No production API URL configured, using localhost');
  return 'http://localhost:8000';
};

const BASE_URL = getBaseURL();
const API_TIMEOUT = 10000; // 10 seconds

// ============================================================================
// TypeScript Interfaces (matching backend Pydantic models)
// ============================================================================

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  token: string;
  google_jwt: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  theme: 'light' | 'dark' | 'auto';
  defaultRestTimer: number;
  hapticFeedback: boolean;
  soundEnabled: boolean;
  autoStartRestTimer: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: UserResponse;
}

// Workout Types  
export interface CreateWorkoutRequest {
  title: string;
  started_at?: string;
}

export interface UpdateWorkoutRequest {
  title?: string;
  completed_at?: string;
  duration?: number;
  is_active?: boolean;
}

export interface WorkoutResponse {
  id: string;
  user_id: string;
  title: string;
  started_at: string;
  completed_at?: string;
  duration?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExerciseRequest {
  exercise_id: string;
  order_index: number;
  notes?: string;
}

export interface CreateSetRequest {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  rest_time?: number;
  notes?: string;
}

export interface UpdateSetRequest {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed?: boolean;
  rest_time?: number;
  notes?: string;
}

export interface SetResponse {
  id: string;
  workout_exercise_id: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  rest_time?: number;
  notes?: string;
  order_index: number;
  completed_at: string;
  created_at: string;
}

export interface ExerciseDetails {
  id: string;
  name: string;
  category: string;
  body_part: string[];
  equipment: string[];
  description?: string;
}

export interface WorkoutExerciseWithDetails {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  notes?: string;
  created_at: string;
  exercise_details: ExerciseDetails;
  sets: SetResponse[];
}

export interface WorkoutWithExercisesResponse {
  id: string;
  user_id: string;
  title: string;
  started_at: string;
  completed_at?: string;
  duration?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exercises: WorkoutExerciseWithDetails[];
}

// Error Response
export interface APIErrorResponse {
  detail: string;
  error_code?: string;
}

// ============================================================================
// JWT Token Management
// ============================================================================

class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = '@auth_access_token';
  private static readonly REFRESH_TOKEN_KEY = '@auth_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = '@auth_token_expiry';

  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static async setTokens(response: TokenResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.ACCESS_TOKEN_KEY, response.access_token],
        [this.TOKEN_EXPIRY_KEY, (Date.now() + response.expires_in * 1000).toString()],
      ]);

      if (response.refresh_token) {
        await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.TOKEN_EXPIRY_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  static async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await AsyncStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryStr) return true;
      
      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();
      
      // Consider token expired if it expires within 5 minutes
      return (expiry - now) < 300000;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }
}

// ============================================================================
// HTTP Client with Interceptors
// ============================================================================

export class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // Core HTTP request method with interceptors
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add authorization header if token exists
    const accessToken = await TokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle token refresh for 401 responses
      if (response.status === 401 && accessToken) {
        const refreshed = await this.attemptTokenRefresh();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options);
        } else {
          // Refresh failed, clear tokens and throw error
          await TokenManager.clearTokens();
          throw new APIError('Authentication failed', 401, 'AUTH_EXPIRED');
        }
      }

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses (e.g., 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, 'TIMEOUT');
      }
      
      throw new APIError(
        'Network error occurred',
        0,
        'NETWORK_ERROR',
        error
      );
    }
  }

  // Token refresh logic
  private async attemptTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const tokenData: TokenResponse = await response.json();
        await TokenManager.setTokens(tokenData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Error response handler
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;
    let errorCode = 'UNKNOWN_ERROR';

    try {
      const errorData: APIErrorResponse = await response.json();
      errorMessage = errorData.detail || errorMessage;
      errorCode = errorData.error_code || errorCode;
    } catch {
      // If parsing error response fails, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new APIError(errorMessage, response.status, errorCode);
  }

  // HTTP method helpers
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; version: string }> {
    return this.get('/health');
  }
}

// ============================================================================
// Custom API Error Class
// ============================================================================

export class APIError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    status: number,
    errorCode: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errorCode = errorCode;
    this.originalError = originalError;
  }

  // Helper methods for common error types
  isNetworkError(): boolean {
    return this.errorCode === 'NETWORK_ERROR' || this.status === 0;
  }

  isAuthenticationError(): boolean {
    return this.status === 401 || this.errorCode === 'AUTH_EXPIRED';
  }

  isValidationError(): boolean {
    return this.status === 422;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}

// ============================================================================
// Default API Client Instance
// ============================================================================

export const apiClient = new APIClient();
export { TokenManager };

// Export types for use in other files
export type * from './api-client';