import * as Haptics from 'expo-haptics';
import { TouchableOpacity, GestureResponderEvent, AccessibilityState, ViewStyle } from 'react-native';

interface TabBarButtonProps {
  onPress?: (e: GestureResponderEvent) => void;
  onPressIn?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: AccessibilityState;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
  href?: string;
  children?: React.ReactNode;
}

export function HapticTab(props: TabBarButtonProps) {
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
