/**
 * SignupScreen for React Native
 * Migrated from web version with pixel-perfect mobile design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/components/ui/utils';
import AuthService from '@/services/auth-service';

export default function SignupScreen() {
  const router = useRouter();
  const { signIn, continueAsGuest, isLoading } = useAuth();
  const { theme } = useTheme();
  
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // Use the authentication service
      const authResult = await AuthService.signInWithGoogle();
      
      if (authResult.success) {
        // Update the user store state
        const result = await signIn();
        if (result.success) {
          router.replace('/(tabs)/');
        }
      } else {
        // Show error to user
        Alert.alert(
          'Sign In Failed',
          authResult.message,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    try {
      setGuestLoading(true);
      
      // Use the authentication service
      const authResult = await AuthService.continueAsGuest();
      
      if (authResult.success) {
        // Update the user store state
        const result = continueAsGuest();
        if (result.success) {
          router.replace('/(tabs)/');
        }
      } else {
        Alert.alert(
          'Guest Mode Failed',
          authResult.message,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Guest mode error:', error);
      Alert.alert(
        'Setup Error',
        'Failed to set up guest mode. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setGuestLoading(false);
    }
  };

  const isAnyLoading = googleLoading || guestLoading || isLoading;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      
      {/* Main Content Container */}
      <View className="flex-1 px-6">
        {/* Top Section - Logo and Welcome */}
        <View className="flex-1 items-center justify-center">
          {/* Logo Section */}
          <View className="items-center mb-8">
            {/* App Icon */}
            <View 
              className="w-24 h-24 bg-primary rounded-2xl items-center justify-center mb-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-4xl">🏋🏼‍♂️</Text>
            </View>
            
            {/* App Name */}
            <Text className="text-foreground text-3xl font-bold mb-2 text-center">
              VoiceLog
            </Text>
            <Text className="text-muted-foreground text-base text-center">
              AI-powered workout logging
            </Text>
          </View>

          {/* Welcome Message */}
          <View className="items-center">
            <Text className="text-foreground text-xl font-semibold mb-2 text-center">
              Welcome to VoiceLog
            </Text>
            <Text className="text-muted-foreground text-base text-center leading-6 max-w-[280px]">
              Track your workouts effortlessly with voice commands and smart logging
            </Text>
          </View>
        </View>

        {/* Bottom Section - Action Buttons */}
        <View className="pb-8">
          {/* Buttons Container */}
          <View className="mb-6">
            {/* Google Sign Up Button */}
            <TouchableOpacity
              disabled={isAnyLoading}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              className={cn(
                "w-full bg-card border border-border rounded-lg px-6 py-4 flex-row items-center justify-center",
                isAnyLoading && "opacity-50"
              )}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={theme.colors.foreground} />
              ) : (
                <Ionicons 
                  name="logo-google" 
                  size={20} 
                  color="#4285F4" 
                />
              )}
              <Text className="text-foreground font-medium text-base" style={{ marginLeft: 12 }}>
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Try without signup button */}
            <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              disabled={isAnyLoading}
              onPress={handleContinueAsGuest}
              activeOpacity={0.8}
              className={cn(
                "w-full bg-transparent border border-border rounded-lg px-6 py-4 flex-row items-center justify-center",
                isAnyLoading && "opacity-50"
              )}
            >
              {guestLoading && (
                <ActivityIndicator 
                  size="small" 
                  color={theme.colors['muted-foreground']}
                  className="mr-2"
                />
              )}
              <Text className="text-muted-foreground font-medium text-base">
                {guestLoading ? 'Setting up...' : 'Try without signup'}
              </Text>
            </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Privacy */}
          <View className="items-center mb-6">
            <Text className="text-xs text-muted-foreground text-center leading-relaxed max-w-[280px]">
              By continuing, you agree to our{' '}
              <Text className="text-muted-foreground underline">
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text className="text-muted-foreground underline">
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Footer */}
          <View className="items-center">
            <Text className="text-xs text-muted-foreground text-center">
              Made with ❤️ for fitness enthusiasts
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}