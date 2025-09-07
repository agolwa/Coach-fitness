/**
 * Root Index - Initial Route Handler
 * Handles routing to appropriate screens based on auth state
 */

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { useUnifiedTheme } from '@/hooks/use-unified-theme';

export default function RootIndex() {
  const { legacyTheme } = useUnifiedTheme();
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
        backgroundColor: legacyTheme.colors.background,
      }}
    >
      <ActivityIndicator 
        size="large" 
        color={legacyTheme.colors.primary.DEFAULT} 
      />
    </View>
  );
}