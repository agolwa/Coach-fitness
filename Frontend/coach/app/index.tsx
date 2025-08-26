/**
 * Root Index - Initial Route Handler
 * Handles routing to appropriate screens based on auth state
 */

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { useTheme } from '@/hooks/use-theme';

export default function RootIndex() {
  const { theme } = useTheme();
  const { authState, isLoading } = useUserStore();

  useEffect(() => {
    // Add a small delay to ensure the layout is fully mounted
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (authState === 'pending') {
          router.replace('/(auth)/signup');
        } else {
          router.replace('/(tabs)');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [authState, isLoading]);

  // Show loading while determining route
  return (
    <View 
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary.DEFAULT} 
      />
    </View>
  );
}