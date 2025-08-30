import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '../global.css';

import { useTheme } from '@/hooks/use-theme';
import { StoreProvider, useStoreInitialization, StoreLoadingScreen } from '@/components/StoreProvider';
import { useUserStore } from '@/stores/user-store';

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
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

function AppContent() {
  const { colorScheme, isDark } = useTheme();
  const { isInitialized, hasErrors } = useStoreInitialization();
  const { authState, isLoading } = useUserStore();

  if (!isInitialized || isLoading) {
    return <StoreLoadingScreen />;
  }

  if (hasErrors) {
    console.warn('Store initialization errors detected:', hasErrors);
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

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
