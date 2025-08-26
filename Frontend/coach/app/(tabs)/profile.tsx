/**
 * React Native Profile Screen
 * Converted from web React component to React Native with Expo Router integration
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Stores and hooks
import { useUserStore } from '@/stores/user-store';
import { useTheme } from '@/hooks/use-theme';

// Types
import type { WeightUnit } from '@/types/workout';

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

  const { colorScheme, toggleColorScheme } = useTheme();

  // Local state
  const [weekStartsOn, setWeekStartsOn] = useState<'sunday' | 'monday'>('monday');

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
            // Handle account deletion logic here
            console.log('Account deleted');
            // Redirect to login or home
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
            signOut();
          },
        },
      ]
    );
  };

  const handleWeightUnitChange = (value: boolean) => {
    const newUnit: WeightUnit = value ? 'lbs' : 'kg';
    if (canChangeWeightUnit) {
      setWeightUnit(newUnit);
    } else {
      Alert.alert(
        'Cannot Update Units',
        'Cannot update units during a workout. Complete the workout and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleSignUp = () => {
    // Navigate to sign up screen (will be implemented later)
    console.log('Navigate to sign up');
  };

  const handleNavigation = (screen: string) => {
    // These will be implemented as modal screens later
    console.log(`Navigate to ${screen}`);
  };

  // Menu items configuration
  const menuItems = [
    {
      title: 'Feedback & feature requests',
      icon: 'chatbubble-outline' as const,
      action: () => handleNavigation('suggestFeature'),
    },
    {
      title: 'Terms & Conditions',
      icon: 'document-text-outline' as const,
      action: () => handleNavigation('termsAndConditions'),
    },
    {
      title: 'Contact Us',
      icon: 'mail-outline' as const,
      action: () => handleNavigation('contactUs'),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline' as const,
      action: () => handleNavigation('privacyPolicy'),
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
                    <Text className="text-foreground text-lg font-semibold">John Doe</Text>
                    <Text className="text-muted-foreground text-sm">john.doe@example.com</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-foreground text-lg font-semibold">Guest User</Text>
                    <Text className="text-muted-foreground text-sm">Sign up to save your workouts</Text>
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
              <Text className="text-foreground text-lg font-semibold">User Preferences</Text>
            </View>

            {/* Weight Unit Preference */}
            <View className="bg-card border border-border rounded-lg p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold mb-1">Weight Unit</Text>
                  <Text className="text-muted-foreground text-sm">
                    Choose your preferred weight measurement
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className={`text-sm ${weightUnit === 'kg' ? 'text-primary' : 'text-muted-foreground'}`}>
                    KG
                  </Text>
                  <Switch
                    value={weightUnit === 'lbs'}
                    onValueChange={handleWeightUnitChange}
                    trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                    thumbColor={Platform.OS === 'ios' ? '#ffffff' : weightUnit === 'lbs' ? '#ffffff' : '#f4f4f5'}
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
                  <Text className="text-foreground font-semibold mb-1">Theme</Text>
                  <Text className="text-muted-foreground text-sm">
                    Choose your preferred app appearance
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
                    onValueChange={toggleColorScheme}
                    trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                    thumbColor={Platform.OS === 'ios' ? '#ffffff' : colorScheme === 'dark' ? '#ffffff' : '#f4f4f5'}
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
                className="bg-card border border-border rounded-lg p-4 mb-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Ionicons name="log-out-outline" size={20} className="text-orange-600" />
                    </View>
                    <Text className="text-foreground font-medium">Sign Out</Text>
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