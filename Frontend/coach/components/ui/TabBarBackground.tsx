import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  // On iOS, use a blur effect with proper styling
  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        intensity={100} 
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }
  
  // On other platforms, use a solid background with border
  return (
    <View 
      className={`absolute inset-0 bg-background border-t border-border`}
    />
  );
}

export function useBottomTabOverflow() {
  return Platform.select({
    ios: 34, // Account for safe area on iOS
    default: 0,
  });
}
