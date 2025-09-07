import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useUnifiedColors, useUnifiedTheme } from '@/hooks/use-unified-theme';

export default function TabBarBackground() {
  const colors = useUnifiedColors();
  const { colorScheme, isDark } = useUnifiedTheme();
  
  // On iOS, use a blur effect with theme-aware styling
  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        intensity={100} 
        tint={isDark ? 'dark' : 'light'} // Now properly responds to theme
        style={StyleSheet.absoluteFillObject}
      />
    );
  }
  
  // On other platforms, use a solid background with border (already theme-aware with CSS classes)
  return (
    <View className="absolute inset-0 bg-background border-t border-border" />
  );
}

export function useBottomTabOverflow() {
  return Platform.select({
    ios: 34, // Account for safe area on iOS
    default: 0,
  });
}
