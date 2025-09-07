# UI Implementation Guide

## Best Practices for Consistent UI Development

This guide documents the correct patterns and best practices for implementing UI in this React Native fitness tracking application. Follow these guidelines to ensure consistency with the established design system.

---

## 🎯 Core Principles

### 1. Use the Unified Theme System
**✅ CORRECT:**
```tsx
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export default function Component() {
  const colors = useUnifiedColors();
  // Use colors.tokens.* for all color references
}
```

**❌ INCORRECT:**
```tsx
import { useTheme } from '@/hooks/use-theme';

export default function Component() {
  const { theme } = useTheme();
  const colors = theme.colors; // Old pattern - don't use
}
```

### 2. Tailwind-First Approach
All styling should be done using Tailwind classes. Inline styles should be avoided except for dynamic values.

**✅ CORRECT:**
```tsx
<View className="bg-card border border-border rounded-xl p-6">
  <Text className="text-foreground font-semibold">Title</Text>
</View>
```

**❌ INCORRECT:**
```tsx
<View 
  style={{
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24
  }}
>
```

### 3. Component Selection
Use `TouchableOpacity` for all interactive elements, not `Pressable`.

**✅ CORRECT:**
```tsx
<TouchableOpacity
  onPress={handlePress}
  className="bg-primary rounded-xl py-3"
  activeOpacity={0.8}
>
```

**❌ INCORRECT:**
```tsx
<Pressable
  onPress={handlePress}
  className="bg-primary rounded-xl py-3 active:bg-accent"
>
```

---

## 📐 Layout Patterns

### Standard Page Structure
```tsx
<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
  {/* Header */}
  <View className="px-6 py-4">
    <View className="flex-row items-center justify-between">
      {/* Header content */}
    </View>
  </View>

  {/* Scrollable Content */}
  <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
    <View className="px-6 pb-6">
      {/* Page content */}
    </View>
  </ScrollView>
</View>
```

### Consistent Spacing
- Page padding: `px-6`
- Section padding: `py-4` or `py-6`
- Between sections: `mb-6`
- Card padding: `p-4` or `p-6`
- Gap between items: `gap-3` or `gap-4`

---

## 🎨 Color Token Usage

### Accessing Colors
Always use the token-based color system:

```tsx
const colors = useUnifiedColors();

// Correct token references:
colors.tokens.primary           // Primary brand color
colors.tokens.foreground        // Main text color
colors.tokens.mutedForeground   // Secondary text color
colors.tokens.background        // Page background
colors.tokens.card             // Card background
colors.tokens.border           // Border color
colors.tokens.destructive      // Error/delete color
```

### Never Use:
- `colors.primary.DEFAULT`
- `colors.muted.foreground`
- Direct hex values like `#00b561`
- The `withOpacity()` utility function

---

## 🗂️ Component Patterns

### Cards
Standard card with border:
```tsx
<View className="bg-card border border-border rounded-xl p-6">
  {/* Card content */}
</View>
```

### Buttons

Primary button:
```tsx
<TouchableOpacity
  onPress={handlePress}
  className="bg-primary rounded-xl py-3 px-6"
  activeOpacity={0.8}
>
  <Text className="text-primary-foreground font-semibold">
    Button Text
  </Text>
</TouchableOpacity>
```

Secondary button:
```tsx
<TouchableOpacity
  onPress={handlePress}
  className="bg-secondary border border-border rounded-xl py-3 px-6"
  activeOpacity={0.8}
>
  <Text className="text-foreground font-medium">
    Button Text
  </Text>
</TouchableOpacity>
```

Destructive button:
```tsx
<TouchableOpacity
  onPress={handleDelete}
  className="border border-destructive rounded-xl py-3 px-6"
  activeOpacity={0.8}
>
  <Text className="text-destructive font-semibold">
    Delete
  </Text>
</TouchableOpacity>
```

### Form Controls

Input field in a card:
```tsx
<View className="bg-card border border-border rounded-xl p-4">
  <Text className="text-muted-foreground text-sm font-medium mb-3">
    Label
  </Text>
  <TextInput
    value={value}
    onChangeText={setValue}
    placeholder="Placeholder text..."
    placeholderTextColor={colors.tokens.mutedForeground}
    className="text-foreground bg-transparent"
    style={{ color: colors.tokens.foreground }}
  />
</View>
```

### Icon Usage
Always provide color from tokens:
```tsx
<Ionicons 
  name="arrow-back" 
  size={24} 
  color={colors.tokens.foreground} 
/>
```

---

## 📝 Typography Patterns

### Text Hierarchy
```tsx
// Page title
<Text className="text-foreground text-xl font-semibold">
  Page Title
</Text>

// Section title
<Text className="text-muted-foreground text-base font-medium">
  Section Title
</Text>

// Body text
<Text className="text-foreground">
  Body content
</Text>

// Secondary text
<Text className="text-muted-foreground text-sm">
  Secondary information
</Text>
```

### Font Weights
- Normal text: default (400)
- Medium emphasis: `font-medium` (500)
- High emphasis: `font-semibold` (600)
- Never use `font-bold`

---

## ⚠️ Common Mistakes to Avoid

### 1. Mixing Styling Paradigms
**❌ DON'T:**
```tsx
<View 
  className="bg-card rounded-lg"
  style={{
    borderWidth: 1,
    borderColor: colors.border
  }}
>
```

**✅ DO:**
```tsx
<View className="bg-card border border-border rounded-lg">
```

### 2. Using Opacity Utilities
**❌ DON'T:**
```tsx
style={{
  borderColor: withOpacity(colors.border, 0.5)
}}
```

**✅ DO:**
```tsx
className="border-border/50"  // Tailwind opacity modifier
```

### 3. Hardcoding Colors
**❌ DON'T:**
```tsx
<Text style={{ color: '#6b7280' }}>
```

**✅ DO:**
```tsx
<Text className="text-muted-foreground">
```

### 4. Inconsistent Border Radius
**❌ DON'T:** Mix `rounded`, `rounded-md`, `rounded-lg` randomly

**✅ DO:** Use consistently:
- Small elements: `rounded-lg`
- Cards/containers: `rounded-xl`
- Pills/badges: `rounded-full`

---

## 🔄 Migration Checklist

When updating an existing component:

- [ ] Replace `useTheme` with `useUnifiedColors`
- [ ] Remove all `theme.colors` references
- [ ] Update color tokens to `colors.tokens.*` pattern
- [ ] Convert inline styles to Tailwind classes
- [ ] Replace `Pressable` with `TouchableOpacity`
- [ ] Remove `withOpacity` utility usage
- [ ] Use consistent spacing values (px-6, py-4, mb-6)
- [ ] Apply proper border radius (rounded-xl for cards)
- [ ] Update icon color references
- [ ] Remove `.DEFAULT` from color references
- [ ] Ensure StatusBar uses `"dark-content"` (until dark mode is implemented)

---

## 📚 Reference Examples

### Well-Implemented Pages
Study these files for correct patterns:
- `/app/(tabs)/activity.tsx` - Activity/workout history page
- `/app/(modal)/workout-detail.tsx` - Detailed workout view

### Recently Refactored
- `/app/(modal)/exercise-detail.tsx` - Exercise detail with sets management

---

## 🚀 Quick Start Template

```tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export default function ScreenTemplate() {
  const insets = useSafeAreaInsets();
  const colors = useUnifiedColors();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {}}
            className="p-2 -m-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.tokens.foreground} 
            />
          </TouchableOpacity>
          
          <Text className="text-foreground text-lg font-semibold">
            Screen Title
          </Text>
          
          <View className="w-6" />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6">
          {/* Your content here */}
        </View>
      </ScrollView>
    </View>
  );
}
```

---

## 🎯 Design System Values

### Border Radius Scale
- `rounded-sm`: 6px
- `rounded`: 8px (default)
- `rounded-md`: 8px
- `rounded-lg`: 10px
- `rounded-xl`: 12px
- `rounded-full`: 9999px

### Spacing Scale
Based on Tailwind's default 4px base:
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `6`: 24px
- `8`: 32px

### Opacity Scale for Tailwind
- `/10`: 10% opacity
- `/20`: 20% opacity
- `/50`: 50% opacity
- `/80`: 80% opacity

---

## 📋 Developer Notes

1. **Always check existing well-implemented pages first** before creating new components
2. **Reuse existing patterns** rather than creating new ones
3. **Test on both iOS and Android** to ensure consistent appearance
4. **Dark mode is not yet implemented** - use only light theme values for now
5. **Run linter regularly** with `npm run lint` to catch common issues

---

*Last updated: After refactoring exercise-detail.tsx to match design system patterns*