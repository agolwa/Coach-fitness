/**
 * React Native Profile Screen - MIGRATED ✅
 * 
 * MIGRATION NOTES:
 * - Replaced useTheme with useUnifiedTheme for colorScheme functionality
 * - Switch thumbColor updated to use exact Figma colors instead of hardcoded
 * - All profile functionality preserved including auth integration
 * - Perfect theme toggle integration maintained
 * - Conditional styling already uses proper NativeWind classes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Stores and hooks
import { useUserStore } from '@/stores/user-store';
import { useUnifiedTheme, useUnifiedColors } from '@/hooks/use-unified-theme';
import { useNetwork } from '@/hooks/use-network';
import { 
  useUserProfile, 
  useUpdateUserProfile, 
  useLogout 
} from '@/hooks/use-auth';

// Types
import type { WeightUnit } from '@/types/workout';
import type { APIError } from '@/services/api-client';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    weightUnit,
    setWeightUnit,
    canChangeWeightUnit,
    isSignedIn,
    isGuest,
    signOut,
  } = useUserStore();

  const { colorScheme, toggleColorScheme } = useUnifiedTheme();
  const colors = useUnifiedColors();
  const { isOnline, isOffline, isNetworkError } = useNetwork();

  // React Query hooks for server-synced data
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useUserProfile();
  
  const updateProfileMutation = useUpdateUserProfile();
  const logoutMutation = useLogout();

  // Local state
  const [weekStartsOn, setWeekStartsOn] = useState<'sunday' | 'monday'>('monday');

  // Helper functions
  const getDisplayName = () => {
    if (!isSignedIn) return 'Guest User';
    if (profileLoading) return 'Loading...';
    return userProfile?.display_name || userProfile?.email?.split('@')[0] || 'User';
  };

  const getDisplayEmail = () => {
    if (!isSignedIn) return 'Sign up to save your workouts';
    if (profileLoading) return 'Loading profile...';
    if (profileError) {
      // Check if it's a network error
      if (isOffline || (profileError && isNetworkError(profileError))) {
        return 'Working offline - profile data unavailable';
      }
      return 'Unable to load profile';
    }
    return userProfile?.email || 'No email available';
  };

  // Alert handlers for destructive actions
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your workout data will be permanently lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Show a second confirmation dialog
            Alert.alert(
              'Final Warning',
              'This will permanently delete your account and all data. Type "DELETE" to confirm.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'I Understand',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion API call
                    // For now, just sign out the user
                    console.log('Account deletion requested - not implemented yet');
                    Alert.alert(
                      'Feature Not Available',
                      'Account deletion is not yet implemented. Please contact support to delete your account.',
                      [{ text: 'OK', style: 'default' }]
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      "Are you sure you want to sign out? You'll need to sign back in to access your workouts.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'default',
          onPress: () => {
            logoutMutation.mutate(undefined, {
              onError: (error: APIError) => {
                console.error('Logout failed:', error);
                // Still perform local logout if server logout fails
                signOut();
                Alert.alert(
                  'Sign Out',
                  'Signed out locally. Server logout may have failed.',
                  [{ text: 'OK', style: 'default' }]
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleWeightUnitChange = (value: boolean) => {
    const newUnit: WeightUnit = value ? 'lbs' : 'kg';
    
    if (!canChangeWeightUnit) {
      Alert.alert(
        'Cannot Update Units',
        'Cannot update units during a workout. Complete the workout and try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Update local state immediately for responsive UI
    setWeightUnit(newUnit);

    // If user is signed in, sync to server
    if (isSignedIn) {
      updateProfileMutation.mutate(
        {
          preferences: {
            ...userProfile?.preferences,
            weightUnit: newUnit,
          },
        },
        {
          onError: (error: APIError) => {
            console.error('Failed to sync weight unit to server:', error);
            // Revert local change on server sync failure
            const revertedUnit: WeightUnit = value ? 'kg' : 'lbs';
            setWeightUnit(revertedUnit);
            
            Alert.alert(
              'Sync Failed',
              'Failed to save preference to server. Your change has been reverted.',
              [{ text: 'OK', style: 'default' }]
            );
          },
        }
      );
    }
  };

  const handleSignUp = () => {
    // Navigate to authentication screen
    router.push('/(auth)/sign-in');
  };

  const handleNavigation = (screen: string) => {
    // Navigate to the respective modal screens
    switch (screen) {
      case 'feedback':
        router.push('/(modal)/feedback');
        break;
      case 'terms':
        router.push('/(modal)/terms');
        break;
      case 'contact':
        router.push('/(modal)/contact');
        break;
      case 'privacy':
        router.push('/(modal)/privacy');
        break;
      default:
        console.log(`Unknown screen: ${screen}`);
    }
  };

  // Menu items configuration
  const menuItems = [
    {
      title: 'Feedback & feature requests',
      icon: 'chatbubble-outline' as const,
      action: () => handleNavigation('feedback'),
    },
    {
      title: 'Terms & Conditions',
      icon: 'document-text-outline' as const,
      action: () => handleNavigation('terms'),
    },
    {
      title: 'Contact Us',
      icon: 'mail-outline' as const,
      action: () => handleNavigation('contact'),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline' as const,
      action: () => handleNavigation('privacy'),
    },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 flex-shrink-0">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -m-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-foreground text-lg font-semibold">Profile</Text>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* User Avatar Section */}
          <View className="py-6">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Ionicons name="person" size={32} className="text-primary" />
              </View>
              <View className="flex-1">
                {isSignedIn ? (
                  <>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-foreground text-lg font-semibold">
                        {getDisplayName()}
                      </Text>
                      {profileLoading && (
                        <ActivityIndicator size="small" color="#10b981" />
                      )}
                    </View>
                    <Text className={`text-sm ${
                      profileError ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {getDisplayEmail()}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-foreground text-lg font-semibold">{getDisplayName()}</Text>
                    <Text className="text-muted-foreground text-sm">{getDisplayEmail()}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Guest Sign Up Prompt */}
          {isGuest && (
            <View className="border border-primary/20 bg-primary/5 rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold mb-1">Unlock Full Features</Text>
                  <Text className="text-muted-foreground text-sm">
                    Sign up to save workouts, track progress, and access your data across devices
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleSignUp}
                  className="bg-primary rounded-lg px-4 py-2 ml-4"
                  activeOpacity={0.8}
                >
                  <Text className="text-primary-foreground text-sm font-medium">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* User Preferences Section - Available for all users */}
          <View className="mb-8">
            <View className="mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-lg font-semibold">User Preferences</Text>
                {isSignedIn && (
                  <View className="flex-row items-center gap-2">
                    {profileLoading ? (
                      <>
                        <ActivityIndicator size="small" color="#10b981" />
                        <Text className="text-muted-foreground text-xs">Loading...</Text>
                      </>
                    ) : profileError ? (
                      <>
                        <Ionicons 
                          name={isOffline ? "wifi-outline" : "alert-circle"} 
                          size={16} 
                          color={isOffline ? "#f59e0b" : "#ef4444"} 
                        />
                        <Text className={`text-xs ${isOffline ? 'text-yellow-600' : 'text-red-600'}`}>
                          {isOffline || (profileError && isNetworkError(profileError)) ? 
                            'Working offline' : 
                            'Error loading profile'
                          }
                        </Text>
                      </>
                    ) : (
                      <>
                        <View className="w-2 h-2 bg-green-500 rounded-full" />
                        <Text className="text-green-600 text-xs">Synced</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Weight Unit Preference */}
            <View className="bg-card border border-border rounded-lg p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground font-semibold mb-1">Weight Unit</Text>
                    {updateProfileMutation.isPending && (
                      <ActivityIndicator size="small" color="#10b981" />
                    )}
                    {isSignedIn && !profileLoading && (
                      <View className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Choose your preferred weight measurement
                    {isSignedIn && ' (synced to server)'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className={`text-sm ${weightUnit === 'kg' ? 'text-primary' : 'text-muted-foreground'}`}>
                    KG
                  </Text>
                  <Switch
                    value={weightUnit === 'lbs'}
                    onValueChange={handleWeightUnitChange}
                    disabled={updateProfileMutation.isPending}
                    trackColor={{ false: colors.tokens.mutedBackground, true: colors.tokens.primary }}
                    thumbColor={Platform.OS === 'ios' ? colors.tokens.background : weightUnit === 'lbs' ? colors.tokens.background : colors.tokens.mutedBackground}
                  />
                  <Text className={`text-sm ${weightUnit === 'lbs' ? 'text-primary' : 'text-muted-foreground'}`}>
                    LBS
                  </Text>
                </View>
              </View>
            </View>

            {/* Week Starts On */}
            <View className="bg-card border border-border rounded-lg p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold mb-1">Week starts on</Text>
                  <Text className="text-muted-foreground text-sm">
                    Choose the first day of your week
                  </Text>
                </View>
                <View className="flex-row gap-1">
                  <TouchableOpacity
                    onPress={() => setWeekStartsOn('sunday')}
                    className={`px-3 py-2 rounded-lg ${
                      weekStartsOn === 'sunday' 
                        ? 'bg-primary' 
                        : 'bg-muted border border-border'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text className={`text-sm font-medium ${
                      weekStartsOn === 'sunday' 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground'
                    }`}>
                      Sunday
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setWeekStartsOn('monday')}
                    className={`px-3 py-2 rounded-lg ${
                      weekStartsOn === 'monday' 
                        ? 'bg-primary' 
                        : 'bg-muted border border-border'
                    }`}
                    activeOpacity={0.8}
                  >
                    <Text className={`text-sm font-medium ${
                      weekStartsOn === 'monday' 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground'
                    }`}>
                      Monday
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Theme Preference */}
            <View className="bg-card border border-border rounded-lg p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-foreground font-semibold mb-1">Theme</Text>
                    {isSignedIn && !profileLoading && (
                      <View className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Choose your preferred app appearance
                    {isSignedIn && ' (synced to server)'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons 
                    name="sunny" 
                    size={16} 
                    className={colorScheme === 'light' ? 'text-primary' : 'text-muted-foreground'} 
                  />
                  <Switch
                    value={colorScheme === 'dark'}
                    onValueChange={(value) => {
                      // Update local theme immediately for responsive UI
                      toggleColorScheme();
                      
                      // If user is signed in, sync theme preference to server
                      if (isSignedIn) {
                        const newTheme = value ? 'dark' : 'light';
                        updateProfileMutation.mutate(
                          {
                            preferences: {
                              ...userProfile?.preferences,
                              theme: newTheme,
                            },
                          },
                          {
                            onError: (error: APIError) => {
                              console.error('Failed to sync theme to server:', error);
                              // Note: We don't revert theme changes as they're handled locally
                              // and theme sync failures are less critical than weight unit failures
                            },
                          }
                        );
                      }
                    }}
                    disabled={updateProfileMutation.isPending}
                    trackColor={{ false: colors.tokens.switchTrackInactive, true: colors.tokens.switchTrackActive }}
                    thumbColor={Platform.OS === 'ios' ? colors.tokens.background : colorScheme === 'dark' ? colors.tokens.background : colors.tokens.mutedBackground}
                  />
                  <Ionicons 
                    name="moon" 
                    size={16} 
                    className={colorScheme === 'dark' ? 'text-primary' : 'text-muted-foreground'} 
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="mb-8">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.action}
                className="bg-card border border-border rounded-lg p-4 mb-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Ionicons name={item.icon} size={20} className="text-primary" />
                    </View>
                    <Text className="text-foreground font-medium">{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} className="text-muted-foreground" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Account Actions - Only show for signed in users */}
          {isSignedIn && (
            <View className="mb-8">
              {/* Sign Out */}
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={logoutMutation.isPending}
                className={`bg-card border border-border rounded-lg p-4 mb-4 ${
                  logoutMutation.isPending ? 'opacity-50' : ''
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      {logoutMutation.isPending ? (
                        <ActivityIndicator size={16} color="#ea580c" />
                      ) : (
                        <Ionicons name="log-out-outline" size={20} className="text-orange-600" />
                      )}
                    </View>
                    <Text className="text-foreground font-medium">
                      {logoutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} className="text-muted-foreground" />
                </View>
              </TouchableOpacity>

              {/* Delete Account */}
              <TouchableOpacity
                onPress={handleDeleteAccount}
                className="bg-card border border-destructive/20 rounded-lg p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                      <Ionicons name="trash-outline" size={20} className="text-destructive" />
                    </View>
                    <Text className="text-destructive font-medium">Delete Account</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} className="text-muted-foreground" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}