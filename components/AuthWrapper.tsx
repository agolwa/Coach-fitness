/**
 * Authentication Wrapper Component
 * Controls app navigation flow based on authentication state
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { authState, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to be determined

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // If user is not authenticated and not in auth screens, redirect to signup
    if (authState === 'pending' && !inAuthGroup) {
      router.replace('/(auth)/signup');
    }
    // If user is authenticated and in auth screens, redirect to main app
    else if ((authState === 'signed-in' || authState === 'guest') && inAuthGroup) {
      router.replace('/(tabs)/');
    }
    // If user is authenticated but not in tabs, redirect to main app
    else if ((authState === 'signed-in' || authState === 'guest') && !inTabsGroup && !inAuthGroup) {
      router.replace('/(tabs)/');
    }
  }, [authState, isLoading, segments, router]);

  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary}
          className="mb-4"
        />
      </View>
    );
  }

  return <>{children}</>;
}

export default AuthWrapper;