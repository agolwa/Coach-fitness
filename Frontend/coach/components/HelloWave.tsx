/**
 * HelloWave Component - MIGRATED ✅
 * 
 * MIGRATION NOTES:
 * - Converted from ThemedText to direct Text with NativeWind
 * - Removed StyleSheet in favor of className
 * - Uses unified theme system typography
 * - Animation behavior preserved
 */

import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
      4 // Run the animation 4 times
    );
  }, [rotationAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text className="text-3xl leading-8 -mt-1.5">
        👋
      </Text>
    </Animated.View>
  );
}

// ✅ MIGRATION COMPLETE: StyleSheet removed, now using NativeWind classes
// text-3xl = 30px (close to original 28px)
// leading-8 = 32px line-height (exact match)
// -mt-1.5 = -6px margin-top (exact match)
