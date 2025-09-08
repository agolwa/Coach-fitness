import React from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '../global.css';

import { useUnifiedTheme } from '@/hooks/use-unified-theme';
import { StoreProvider, useStoreInitialization, StoreLoadingScreen } from '@/components/StoreProvider';
import { useUserStore } from '@/stores/user-store';
import { initializeThemeClassManager } from '@/utils/theme-class-manager';

// QueryClient configuration for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time for most data
      staleTime: 5 * 60 * 1000,
      // 10 minutes cache time
      cacheTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus (not applicable to mobile, but good practice)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Network mode: always try to fetch, but don't suspend when offline
      networkMode: 'online',
      // Custom retry function to handle network errors differently
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations once
      retry: (failureCount, error) => {
        // Don't retry network errors more than once
        if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
          return failureCount < 1;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      // Network mode for mutations - queue them when offline
      networkMode: 'online',
    },
  },
});

function AppContent() {
  const { colorScheme, isDark } = useUnifiedTheme();
  const { isInitialized, hasErrors } = useStoreInitialization();
  const { authState, isLoading } = useUserStore();

  if (!isInitialized || isLoading) {
    return <StoreLoadingScreen />;
  }

  if (hasErrors) {
    console.warn('Store initialization errors detected:', hasErrors);
  }

  return (
    <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize theme class manager early
  React.useEffect(() => {
    initializeThemeClassManager();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </QueryClientProvider>
  );
}
