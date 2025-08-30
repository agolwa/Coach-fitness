/**
 * Authentication Hooks for Backend Integration
 * 
 * Custom React Query hooks for:
 * - Google OAuth authentication
 * - Email/password login
 * - Token refresh management
 * - User profile retrieval
 * - Authentication state management
 * 
 * Integrates with existing Zustand user-store for local state synchronization.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  apiClient, 
  TokenManager, 
  APIError,
  type LoginRequest,
  type GoogleAuthRequest,
  type LoginResponse,
  type UserResponse,
} from '@/services/api-client';
import { useUserStore } from '@/stores/user-store';

// ============================================================================
// Query Keys for React Query Cache Management
// ============================================================================

export const authQueryKeys = {
  me: () => ['auth', 'me'] as const,
  profile: () => ['auth', 'profile'] as const,
} as const;

// ============================================================================
// Authentication Hooks
// ============================================================================

/**
 * Hook for Google OAuth authentication
 * Automatically updates local user store on successful authentication
 */
export function useGoogleAuth() {
  const queryClient = useQueryClient();
  const { signIn, updatePreferences } = useUserStore();

  return useMutation({
    mutationFn: async (request: GoogleAuthRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/google', request);
      
      // Store tokens for future requests
      await TokenManager.setTokens({
        access_token: response.access_token,
        token_type: response.token_type,
        expires_in: response.expires_in,
        refresh_token: response.refresh_token,
      });
      
      return response;
    },
    onSuccess: (data) => {
      // Update local Zustand store with server data
      signIn();
      updatePreferences({
        authState: 'signed-in',
        isSignedIn: true,
        isGuest: false,
        // Sync weight unit with server preferences
        weightUnit: data.user.preferences.weightUnit,
      });

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
    onError: (error: APIError) => {
      console.error('Google authentication failed:', error);
    },
  });
}

/**
 * Hook for email/password authentication
 */
export function useEmailLogin() {
  const queryClient = useQueryClient();
  const { signIn, updatePreferences } = useUserStore();

  return useMutation({
    mutationFn: async (request: LoginRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', request);
      
      // Store tokens
      await TokenManager.setTokens({
        access_token: response.access_token,
        token_type: response.token_type,
        expires_in: response.expires_in,
        refresh_token: response.refresh_token,
      });
      
      return response;
    },
    onSuccess: (data) => {
      // Update local store
      signIn();
      updatePreferences({
        authState: 'signed-in',
        isSignedIn: true,
        isGuest: false,
        weightUnit: data.user.preferences.weightUnit,
      });

      // Update cache
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
    onError: (error: APIError) => {
      console.error('Email login failed:', error);
    },
  });
}

/**
 * Hook for logging out user
 * Clears tokens and resets local state
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { signOut } = useUserStore();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Clear tokens from storage
      await TokenManager.clearTokens();
      
      // Optional: Call backend logout endpoint if it exists
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Logout endpoint might not exist, continue with local cleanup
        console.log('Backend logout not available, performing local cleanup');
      }
    },
    onSuccess: () => {
      // Update local store
      signOut();

      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still perform local cleanup even if backend call fails
      signOut();
      queryClient.clear();
    },
  });
}

/**
 * Hook to get current user profile
 * Automatically syncs with local store
 */
export function useUserProfile() {
  const { isSignedIn } = useUserStore();

  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: async (): Promise<UserResponse> => {
      return apiClient.get<UserResponse>('/auth/me');
    },
    enabled: isSignedIn, // Only fetch when user is signed in
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      // Sync server preferences with local store
      const { updatePreferences } = useUserStore.getState();
      updatePreferences({
        weightUnit: data.preferences.weightUnit,
      });
    },
    onError: (error: APIError) => {
      // If token is invalid, sign out user
      if (error.isAuthenticationError()) {
        const { signOut } = useUserStore.getState();
        signOut();
        TokenManager.clearTokens();
      }
    },
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { updatePreferences } = useUserStore();

  return useMutation({
    mutationFn: async (updates: Partial<UserResponse>): Promise<UserResponse> => {
      return apiClient.put<UserResponse>('/users/profile', updates);
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(authQueryKeys.me(), data);
      
      // Sync with local store
      updatePreferences({
        weightUnit: data.preferences.weightUnit,
      });
    },
    onError: (error: APIError) => {
      console.error('Profile update failed:', error);
    },
  });
}

/**
 * Hook for token refresh (mostly used internally by API client)
 * Exposed for manual refresh if needed
 */
export function useTokenRefresh() {
  const { signOut } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      await TokenManager.setTokens(response);
      return true;
    },
    onError: () => {
      // Refresh failed, sign out user
      signOut();
      TokenManager.clearTokens();
      queryClient.clear();
    },
  });
}

// ============================================================================
// Authentication State Helpers
// ============================================================================

/**
 * Hook to check if user is authenticated (combines local + server state)
 */
export function useAuthenticationStatus() {
  const { isSignedIn, authState } = useUserStore();
  const { data: userProfile, isLoading, error } = useUserProfile();

  return {
    isAuthenticated: isSignedIn && !!userProfile,
    isLoading: isLoading && isSignedIn,
    authState,
    userProfile,
    error: error as APIError | null,
  };
}

/**
 * Hook for checking token validity and auto-refresh
 */
export function useTokenValidation() {
  const { mutate: refreshToken } = useTokenRefresh();

  const checkAndRefreshToken = async (): Promise<boolean> => {
    const isExpired = await TokenManager.isTokenExpired();
    
    if (isExpired) {
      try {
        refreshToken();
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
    }
    
    return true;
  };

  return { checkAndRefreshToken };
}

// ============================================================================
// Export Types for External Use
// ============================================================================

export type { LoginRequest, GoogleAuthRequest, LoginResponse, UserResponse };