import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, TouchableOpacity } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      onPressIn={(ev) => {
        // Add haptic feedback for both iOS and Android
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
      activeOpacity={0.8}
      className="flex-1 justify-center items-center min-h-14"
      style={props.style}
    />
  );
}
