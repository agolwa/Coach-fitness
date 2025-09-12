import React from 'react';
import { View, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '../global.css';

import { useUnifiedTheme } from '@/hooks/use-unified-theme';
import { StoreProvider, useStoreInitialization, StoreLoadingScreen } from '@/components/StoreProvider';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { initializeThemeClassManager, useThemeClassManager } from '@/utils/theme-class-manager';
import StoreInitializer from '@/stores/store-initializer';
import { AlertProvider } from '@/contexts/AlertContext';

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

// Main app component that handles initialization and rendering after navigation context exists
function ThemedAppContent() {
  const { isDark } = useUnifiedTheme();
  const { manager } = useThemeClassManager();
  const currentColorScheme = useThemeStore(state => state.colorScheme);
  
  // Initialize store side effects AFTER navigation context is ready
  React.useEffect(() => {
    // Initialize all stores and their side effects
    // This ensures proper timing - navigation context exists before listeners
    StoreInitializer.initialize();
    
    // Cleanup on unmount
    return () => {
      StoreInitializer.cleanup();
    };
  }, []);

  // Synchronize theme class manager with theme store changes (moved from StoreProvider)
  React.useEffect(() => {
    manager.setColorScheme(currentColorScheme);
  }, [currentColorScheme, manager]);
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

// Wrapper component that provides theme context without navigation dependencies
function AppContent() {
  const { isInitialized, hasErrors, userLoading } = useStoreInitialization();
  const isDark = useThemeStore.getState().colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';

  // Show loading screen while stores are initializing
  if (!isInitialized || userLoading) {
    return <StoreLoadingScreen />;
  }

  if (hasErrors) {
    console.warn('Store initialization errors detected:', hasErrors);
  }

  // ThemedAppContent now handles all initialization and loading states
  if (isAndroid) {
    // For Android: ThemeProvider after store initialization (when navigation context is ready)
    return (
      <AndroidThemeWrapper />
    );
  } else {
    // For iOS: ThemeProvider already at root level
    return (
      <View className="flex-1" style={{ flex: 1 }} key="app-root">
        <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
          <AlertProvider>
            <ThemedAppContent />
          </AlertProvider>
        </View>
      </View>
    );
  }
}

// Android-specific wrapper that ensures navigation context is ready
function AndroidThemeWrapper() {
  const colorScheme = useThemeStore(state => state.colorScheme);
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className="flex-1" style={{ flex: 1 }} key="app-root">
        <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
          <AlertProvider>
            <ThemedAppContent />
          </AlertProvider>
        </View>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Get theme directly from store to avoid hooks that might access navigation
  const colorScheme = useThemeStore.getState().colorScheme;
  const [currentColorScheme, setCurrentColorScheme] = React.useState(colorScheme);
  const isIOS = Platform.OS === 'ios';

  // Initialize theme class manager early
  React.useEffect(() => {
    initializeThemeClassManager();
  }, []);

  // Subscribe to theme changes after mount
  React.useEffect(() => {
    const unsubscribe = useThemeStore.subscribe(
      (state) => state.colorScheme,
      (scheme) => {
        console.log('RootLayout: Theme changed to:', scheme);
        setCurrentColorScheme(scheme);
      }
    );
    return unsubscribe;
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Platform-specific provider structure
  if (isIOS) {
    // iOS: ThemeProvider at root level (before StoreProvider)
    return (
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  } else {
    // Android: No ThemeProvider at root (handled in AppContent)
    return (
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </QueryClientProvider>
    );
  }
}
