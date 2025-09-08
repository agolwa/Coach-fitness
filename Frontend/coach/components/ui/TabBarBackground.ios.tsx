import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  const insets = useSafeAreaInsets();
  // Return a reasonable estimate for tab bar height + safe area
  return Platform.select({
    ios: 50 + insets.bottom, // Standard tab bar height + safe area
    default: 60, // Standard height for other platforms
  });
}
