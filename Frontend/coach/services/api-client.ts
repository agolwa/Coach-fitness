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
  // Get environment-configured URL first
  const configuredURL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
  
  // Development configuration
  if (__DEV__) {
    // Use configured URL if available, otherwise use defaults
    const baseURL = configuredURL || 'http://localhost:8000';
    
    // Critical: Android emulator requires localhost transformation to 10.0.2.2
    if (Platform.OS === 'android' && baseURL.includes('localhost')) {
      return baseURL.replace('localhost', '10.0.2.2');
    }
    
    // iOS and web can use the URL as-is (including localhost)
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      return baseURL;
    }
    
    // Fallback for other platforms
    return baseURL;
  }
  
  // Production configuration - use environment variable
  if (configuredURL) {
    return configuredURL;
  }
  
  // Fallback with improved error message
  console.warn('No production API URL configured in EXPO_PUBLIC_API_URL, using localhost. ' +
    'Set EXPO_PUBLIC_API_URL in your environment configuration (.env files)');
  return 'http://localhost:8000';
};

const API_TIMEOUT = 10000; // 10 seconds

// Get base URL dynamically to support testing and environment changes
const getBaseURLDynamic = (): string => {
  return getBaseURL();
};

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
  private _baseURL: string;
  private timeout: number;

  constructor(baseURL?: string, timeout: number = API_TIMEOUT) {
    this._baseURL = baseURL || getBaseURLDynamic();
    this.timeout = timeout;
  }
  
  // Getter to access baseURL for testing
  get baseURL(): string {
    return this._baseURL;
  }

  // Core HTTP request method with interceptors
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this._baseURL}${endpoint}`;
    
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
      
      // Check if this is a network error inline
      const errorMessage = error.message?.toLowerCase() || '';
      const isNetError = 
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('network request failed') ||
        error.name === 'TypeError' && errorMessage.includes('network') ||
        error.name === 'NetworkError';
      
      if (isNetError) {
        throw new APIError(
          'Unable to connect to server. Please check your internet connection.',
          0,
          'NETWORK_ERROR',
          error
        );
      }
      
      throw new APIError(
        'An unexpected error occurred',
        0,
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  // Token refresh logic
  private async attemptTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this._baseURL}/auth/refresh`, {
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

  isAuthenticationError(): boolean {
    return this.status === 401 || this.errorCode === 'AUTH_EXPIRED';
  }

  isValidationError(): boolean {
    return this.status === 422;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.errorCode === 'NETWORK_ERROR' || this.errorCode === 'TIMEOUT';
  }

  isConnectionError(): boolean {
    return this.isNetworkError() || this.status === 0;
  }
}

// ============================================================================
// Default API Client Instance
// ============================================================================

export const apiClient = new APIClient();
export { TokenManager };
export { getBaseURL };

;

// ============================================================================
// Network Detection & Offline Mode Utilities
// ============================================================================

/**
 * Checks if an error is a network-related error
 * @param error - The error to check
 * @returns true if the error is network-related, false otherwise
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Check for common network error patterns
  const networkErrorPatterns = [
    'Failed to fetch',
    'Network error occurred',
    'Network request failed',
    'Request timeout',
    'Connection failed',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'NETWORK_ERROR',
  ];

  // Check error message
  if (typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    if (networkErrorPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
      return true;
    }
  }

  // Check error name/type
  if (error.name === 'TypeError' && error.message?.includes('Network')) {
    return true;
  }
  
  if (error.name === 'AbortError') {
    return true;
  }

  // Check error code
  if (error.errorCode === 'NETWORK_ERROR' || error.errorCode === 'TIMEOUT') {
    return true;
  }

  // Check if it's a fetch-related error
  if (error instanceof Error && error.message.includes('fetch')) {
    return true;
  }

  return false;
}

/**
 * Determines if the app should work in offline mode by checking connectivity
 * @param timeout - Timeout for the connectivity check in milliseconds
 * @returns Promise that resolves to true if offline, false if online
 */
export async function shouldWorkOffline(timeout: number = 3000): Promise<boolean> {
  try {
    // Create a simple health check request to our backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${getBaseURLDynamic()}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    
    // If we get a response (even if it's an error), we're online
    return !response.ok && response.status >= 500;
  } catch (error) {
    // Any error (network, timeout, abort) means we should work offline
    return true;
  }
}

/**
 * Gets the current network status
 * @returns Promise that resolves to network status info
 */
export async function getNetworkStatus(): Promise<{
  isOnline: boolean;
  isOffline: boolean;
  lastChecked: Date;
}> {
  const isOffline = await shouldWorkOffline();
  
  return {
    isOnline: !isOffline,
    isOffline,
    lastChecked: new Date(),
  };
}

// Export types for use in other files
export type * from './api-client';