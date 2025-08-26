import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // Simplified color scheme matching original design
        tabBarActiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#0F172A',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#64748B' : '#6B7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: Platform.select({
            ios: 50 + insets.bottom, // Use actual safe area insets
            default: 60,
          }),
          paddingBottom: Platform.select({
            ios: insets.bottom, // Use actual safe area bottom inset
            default: 8,
          }),
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
          backgroundColor: 'transparent',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size = 24 }) => (
            <IconSymbol 
              size={size} 
              name="house.fill" 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size = 24 }) => (
            <IconSymbol 
              size={size} 
              name="activity" 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size = 24 }) => (
            <IconSymbol 
              size={size} 
              name="person.fill" 
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
