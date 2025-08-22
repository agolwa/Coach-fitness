import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar as RNStatusBar,
  Dimensions,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useUserStore } from '@/stores/user-store';
import { useThemeColors } from '@/hooks/use-theme';
import * as Haptics from 'expo-haptics';

// Complete WebBrowser authentication
WebBrowser.maybeCompleteAuthSession();

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
  const { signIn, continueAsGuest } = useUserStore();
  const colors = useThemeColors();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Configure Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    // For testing, we'll use a mock client ID
    // In production, this would be your actual Google OAuth client ID
    clientId: '123456789-abcdef.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleAuthenticationSuccess(authentication);
    } else if (response?.type === 'error') {
      console.error('OAuth error:', response.error);
      Alert.alert(
        'Sign In Failed',
        'There was an error signing in with Google. Please try again.',
        [{ text: 'OK' }]
      );
      setIsSigningIn(false);
    } else if (response?.type === 'cancel') {
      console.log('OAuth cancelled');
      setIsSigningIn(false);
    }
  }, [response]);

  const handleAuthenticationSuccess = async (authentication: any) => {
    try {
      // In a real app, you would:
      // 1. Use the authentication token to get user info from Google
      // 2. Send this info to your backend to create/authenticate the user
      // 3. Store the session token
      
      console.log('Google authentication successful:', authentication);
      
      // For now, just simulate successful sign-in
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      signIn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Since this is frontend development, we'll simulate the OAuth flow
      // In production, promptAsync() would trigger the actual Google OAuth flow
      console.log('Google signup initiated');
      
      // For development purposes, simulate successful OAuth
      setTimeout(() => {
        signIn();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
        setIsSigningIn(false);
      }, 1500);
      
      // Uncomment this line when ready for real OAuth testing:
      // await promptAsync();
      
    } catch (error) {
      console.error('OAuth prompt error:', error);
      Alert.alert(
        'Sign In Error',
        'Unable to start sign in process. Please try again.',
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
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      maxWidth: 440,
      alignSelf: 'center',
      width: '100%'
    }}>
      <RNStatusBar 
        barStyle="default" 
        backgroundColor={colors.background}
      />
      
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
                {isSigningIn ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Try without signup button */}
            <TouchableOpacity
              onPress={handleTryWithoutSignup}
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
                justifyContent: 'center'
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
    </SafeAreaView>
  );
}