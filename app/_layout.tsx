import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { StoreProvider, useStoreInitialization, StoreLoadingScreen } from '@/components/StoreProvider';
import AuthWrapper from '@/components/AuthWrapper';

function AppContent() {
  const colorScheme = useColorScheme();
  const { isInitialized, hasErrors } = useStoreInitialization();

  if (!isInitialized) {
    return <StoreLoadingScreen />;
  }

  if (hasErrors) {
    console.warn('Store initialization errors detected:', hasErrors);
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthWrapper>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthWrapper>
      <StatusBar style="auto" />
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
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
