// Fallback for using MaterialIcons on Android and web.
// Also supports custom Feather icons for navigation

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 * 
 * Custom Feather icons for navigation are handled separately.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'list.bullet': 'list',
  'person.fill': 'person',
  'activity': 'trending-up',
  // Feather icons for navigation
  'feather-home': 'feather-home',
  'feather-activity': 'feather-activity',
  'feather-user': 'feather-user',
} satisfies Partial<IconMapping>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 * Also supports custom Feather icons for navigation.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Handle custom Feather icons
  if (name.startsWith('feather-')) {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color as string}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
      >
        {name === 'feather-home' && (
          <>
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <Polyline points="9,22 9,12 15,12 15,22" />
          </>
        )}
        {name === 'feather-activity' && (
          <Polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        )}
        {name === 'feather-user' && (
          <>
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
          </>
        )}
      </Svg>
    );
  }

  return <MaterialIcons color={color} size={size} name={MAPPING[name] as any} style={style} />;
}
