import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export default function TabLayout() {
  const colors = useUnifiedColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tokens.foreground,
        tabBarInactiveTintColor: colors.tokens.mutedForeground,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: Platform.select({
            ios: 50 + insets.bottom,
            default: 60,
          }),
          paddingBottom: Platform.select({
            ios: insets.bottom,
            default: 8,
          }),
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: colors.tokens.border,
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
