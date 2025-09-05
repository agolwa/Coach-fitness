/**
 * Collapsible Component - MIGRATED ✅
 * 
 * MIGRATION NOTES:
 * - Removed ThemedText and ThemedView in favor of direct components with NativeWind
 * - Replaced hardcoded Colors with unified theme system
 * - Uses CSS classes for consistent styling with Figma tokens
 * - Simplified icon color logic using theme classes
 */

import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useUnifiedColors();

  return (
    <View className="bg-background">
      <TouchableOpacity
        className="flex-row items-center gap-1.5"
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colors.tokens.mutedForeground} // Uses exact Figma muted color
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text className="text-base font-semibold leading-6 text-foreground">
          {title}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View className="mt-1.5 ml-6 bg-background">
          {children}
        </View>
      )}
    </View>
  );
}

// ✅ MIGRATION COMPLETE: StyleSheet removed
// All styling now uses NativeWind classes with unified theme tokens
// flex-row = flexDirection: 'row'
// items-center = alignItems: 'center' 
// gap-1.5 = gap: 6px
// mt-1.5 = marginTop: 6px
// ml-6 = marginLeft: 24px
