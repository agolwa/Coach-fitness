/**
 * Auth Layout for React Native
 * Configures the authentication stack with proper navigation
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during auth
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="signup" 
          options={{
            title: 'Sign Up',
            gestureEnabled: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </>
  );
}