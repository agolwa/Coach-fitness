/**
 * Authentication Controls Component
 * Provides sign-out functionality and authentication status display
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-user';
import { useTheme } from '@/hooks/use-theme';
import AuthService from '@/services/auth-service';
import { cn } from '@/components/ui/utils';

export interface AuthControlsProps {
  showFullDetails?: boolean;
  onSignOut?: () => void;
}

export function AuthControls({ 
  showFullDetails = true, 
  onSignOut 
}: AuthControlsProps) {
  const { authState, isSignedIn, isGuest, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out? Any unsaved workout data will be lost.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              setIsSigningOut(true);
              
              try {
                // Use authentication service
                const authResult = await AuthService.signOut();
                
                if (authResult.success) {
                  // Update user store
                  const result = await signOut();
                  
                  if (result.success) {
                    // Call optional callback
                    onSignOut?.();
                    
                    // Navigate to signup screen
                    router.replace('/(auth)/signup');
                  }
                } else {
                  Alert.alert(
                    'Sign Out Failed',
                    authResult.message,
                    [{ text: 'OK', style: 'default' }]
                  );
                }
              } catch (error) {
                console.error('Sign out error:', error);
                Alert.alert(
                  'Sign Out Error',
                  'Failed to sign out. Please try again.',
                  [{ text: 'OK', style: 'default' }]
                );
              } finally {
                setIsSigningOut(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Sign out confirmation error:', error);
    }
  };

  const handleSignUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signup');
  };

  const getAuthStatusInfo = () => {
    const limitations = AuthService.getAuthLimitations(authState);
    
    return {
      statusText: isSignedIn ? 'Signed In' : isGuest ? 'Guest Mode' : 'Not Signed In',
      statusColor: isSignedIn ? theme.colors.primary.DEFAULT : isGuest ? '#f59e0b' : theme.colors.muted.foreground,
      icon: isSignedIn ? 'checkmark-circle' : isGuest ? 'warning' : 'person-circle-outline',
      limitations,
    };
  };

  const statusInfo = getAuthStatusInfo();

  if (!showFullDetails) {
    // Compact version for headers/toolbars
    return (
      <View className="flex-row items-center">
        <Ionicons 
          name={statusInfo.icon as any}
          size={20} 
          color={statusInfo.statusColor}
          style={{ marginRight: 8 }}
        />
        <Text 
          className="text-sm font-medium"
          style={{ color: statusInfo.statusColor, marginRight: 12 }}
        >
          {statusInfo.statusText}
        </Text>
        
        {isSignedIn && (
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={isSigningOut}
            activeOpacity={0.8}
            className="p-1"
          >
            <Ionicons 
              name="log-out-outline" 
              size={20} 
              color={theme.colors.muted.foreground}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Full details version for profile screens
  return (
    <View className="bg-card rounded-lg border border-border p-4">
      {/* Authentication Status Header */}
      <View className="flex-row items-center mb-4">
        <View className="flex-row items-center flex-1">
          <Ionicons 
            name={statusInfo.icon as any}
            size={24} 
            color={statusInfo.statusColor}
            className="mr-3"
          />
          <View className="flex-1">
            <Text className="text-foreground text-lg font-semibold">
              {statusInfo.statusText}
            </Text>
            {statusInfo.limitations.limitationsMessage && (
              <Text className="text-muted-foreground text-sm mt-1">
                {statusInfo.limitations.limitationsMessage}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Limitations List for Guest Users */}
      {isGuest && (
        <View className="mb-4">
          <Text className="text-muted-foreground text-sm font-medium mb-2">
            Current Limitations:
          </Text>
          
          <View>
            {!statusInfo.limitations.canSaveWorkouts && (
              <View className="flex-row items-center">
                <Ionicons 
                  name="close-circle-outline" 
                  size={16} 
                  color={theme.colors.destructive}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-muted-foreground text-sm">
                  Cannot save workout history
                </Text>
              </View>
            )}
            
            {!statusInfo.limitations.canAccessHistory && (
              <View className="flex-row items-center">
                <Ionicons 
                  name="close-circle-outline" 
                  size={16} 
                  color={theme.colors.destructive}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-muted-foreground text-sm">
                  Cannot access workout history
                </Text>
              </View>
            )}
            
            {!statusInfo.limitations.canSyncData && (
              <View className="flex-row items-center">
                <Ionicons 
                  name="close-circle-outline" 
                  size={16} 
                  color={theme.colors.destructive}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-muted-foreground text-sm">
                  No data sync across devices
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View>
        {isGuest && (
          <Button
            onPress={handleSignUp}
            variant="default"
            className="w-full"
          >
            Sign Up to Unlock All Features
          </Button>
        )}
        
        {isSignedIn && (
          <Button
            onPress={handleSignOut}
            disabled={isSigningOut}
            variant="outline"
            className="w-full"
          >
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        )}
        
        {authState === 'pending' && (
          <Button
            onPress={handleSignUp}
            variant="default"
            className="w-full"
          >
            Sign In
          </Button>
        )}
      </View>
    </View>
  );
}

export default AuthControls;