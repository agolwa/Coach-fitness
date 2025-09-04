/**
 * SignupScreen - Supabase Authentication Integration
 * 
 * Integrates with Supabase Auth for Google OAuth authentication:
 * - Uses Supabase Auth for Google OAuth flow
 * - Handles user session management automatically via Supabase
 * - Provides comprehensive error handling for authentication issues
 * - Maintains existing UI patterns and user experience flows
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/user-store';
import { useThemeColors } from '@/hooks/use-theme';
import { auth } from '@/services/supabase';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface GoogleIconProps {
  size?: number;
}

function GoogleIcon({ size = 20 }: GoogleIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Text style={{ fontSize: size, textAlign: 'center' }}>G</Text>
    </View>
  );
}

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { continueAsGuest, signIn } = useUserStore();
  const colors = useThemeColors();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // User successfully signed in via Supabase Auth
        console.log('User signed in:', {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        });
        
        // Update auth state in user store
        signIn();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignup = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      console.log('Initiating Supabase Google OAuth flow...');
      
      const { data, error } = await auth.signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      console.log('Google OAuth initiated successfully');
      // The auth state change listener will handle the success case
      
    } catch (error) {
      console.error('Supabase OAuth error:', error);
      
      let errorMessage = 'Unable to start sign in process. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('cancelled')) {
          // User cancelled, just reset state without showing error
          setIsSigningIn(false);
          return;
        } else if (error.message.includes('popup')) {
          errorMessage = 'Please allow popups and try again.';
        }
      }
      
      Alert.alert(
        'Sign In Error',
        errorMessage,
        [{ text: 'OK' }]
      );
      setIsSigningIn(false);
    }
  };

  const handleTryWithoutSignup = () => {
    console.log('Continue as guest');
    continueAsGuest();
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      maxWidth: 440,
      alignSelf: 'center',
      width: '100%',
      paddingTop: insets.top
    }}>
      
      {/* Header with back button */}
      <View style={{
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: 56,
        flexShrink: 0
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={handleBack}
            style={{
              padding: 8,
              marginLeft: -8,
              borderRadius: 8
            }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.foreground} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={{
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 24,
        paddingVertical: 32
      }}>
        {/* Top Section - Logo and Welcome */}
        <View style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}>
          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            {/* App Icon */}
            <View style={{
              width: 96,
              height: 96,
              backgroundColor: colors.primary.DEFAULT,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4
            }}>
              <Text style={{ fontSize: 32 }}>🏋🏼‍♂️</Text>
            </View>
            
            {/* App Name */}
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.foreground,
              marginBottom: 8
            }}>
              VoiceLog
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.muted.foreground
            }}>
              AI-powered workout logging
            </Text>
          </View>

          {/* Welcome Message */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: 8
            }}>
              Welcome to VoiceLog
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.muted.foreground,
              textAlign: 'center',
              maxWidth: width * 0.7,
              lineHeight: 22
            }}>
              Track your workouts effortlessly with voice commands and smart logging
            </Text>
          </View>
        </View>

        {/* Bottom Section - Signup Button and Terms */}
        <View style={{
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: 16
        }}>
          {/* Google Sign Up Button */}
          <View style={{
            width: '100%',
            maxWidth: 320
          }}>
            <TouchableOpacity
              onPress={handleGoogleSignup}
              disabled={isSigningIn}
              style={{
                width: '100%',
                backgroundColor: colors.card.DEFAULT,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 24,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                opacity: isSigningIn ? 0.6 : 1
              }}
              activeOpacity={0.8}
            >
              {isSigningIn ? (
                <ActivityIndicator 
                  size="small" 
                  color={colors.foreground} 
                />
              ) : (
                <GoogleIcon size={20} />
              )}
              
              <Text style={{
                color: colors.foreground,
                fontWeight: '500',
                fontSize: 16,
                marginLeft: 12
              }}>
                {isSigningIn 
                  ? 'Signing in...' 
                  : 'Continue with Google'
                }
              </Text>
            </TouchableOpacity>

            {/* Try without signup button */}
            <TouchableOpacity
              onPress={handleTryWithoutSignup}
              disabled={isSigningIn}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 24,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSigningIn ? 0.6 : 1
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: colors.muted.foreground,
                fontWeight: '500',
                fontSize: 16
              }}>
                Try without signup
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <View style={{
            alignItems: 'center',
            maxWidth: 320,
            marginTop: 24
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.muted.foreground,
              textAlign: 'center',
              lineHeight: 18
            }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{
        flexShrink: 0,
        paddingBottom: 32
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 12,
            color: colors.muted.foreground
          }}>
            Made with ❤️ for fitness enthusiasts
          </Text>
        </View>
      </View>
    </View>
  );
}