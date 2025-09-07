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
4. **Dark mode is fully implemented** - follow the dark theme implementation patterns
5. **Run linter regularly** with `npm run lint` to catch common issues

---

---

## 🌙 Dark Theme Implementation

### Critical Implementation Patterns

**Root-Level Dark Class Application (Native)**
The dark theme requires applying the `dark` class at the app root to enable CSS variables:

```tsx
// In app/_layout.tsx - AppContent component
return (
  <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* App content */}
    </ThemeProvider>
  </View>
);
```

**Key Learnings:**
- **Native platforms need explicit class application**: Unlike web, React Native requires the `dark` class on a parent View to cascade CSS variables
- **ThemeClassManager only handles web**: For native, the `dark` class must be applied at component level
- **CSS Variables cascade correctly**: Once the `dark` class is applied, all child components automatically get dark theme values
- **NativeWind Configuration is already correct**: `darkMode: 'class'` in `tailwind.config.js` enables class-based dark mode

### Dark Theme Architecture

**1. Theme Detection & Storage**
```tsx
// theme-store.ts handles system preference detection
const systemColorScheme = Appearance.getColorScheme() || 'light';

// ThemeClassManager syncs with theme store
ThemeClassManager.getInstance().setColorScheme(colorScheme);
```

**2. CSS Variables System**
```css
/* global.css - Variables automatically switch based on .dark class */
:root {
  --background: #ffffff; /* Light theme values */
}

.dark {
  --background: #000000; /* Dark theme values */
}
```

**3. Component Usage**
```tsx
// Components automatically adapt when dark class is present
<View className="bg-background"> // Uses CSS variable
<Text className="text-foreground"> // Switches automatically
```

### Dark Theme Best Practices

**✅ DO:**
- Apply `dark` class at root View level for native apps
- Use Tailwind classes that reference CSS variables (`bg-background`, `text-foreground`)
- Let CSS variables handle the theme switching automatically
- Test theme switching on actual devices/simulators

**❌ DON'T:**
- Try to manually apply dark classes to individual components
- Use conditional styling based on theme state in components
- Forget to wrap the app content in a themed View container
- Assume web and native work the same way

### Testing Dark Mode

1. **Toggle Theme**: Use in-app theme switcher
2. **Verify CSS Variables**: Check that `bg-background`, `text-foreground` etc. switch correctly
3. **Test Navigation**: Ensure theme persists across route changes
4. **Check Modals**: Modal screens should inherit dark theme
5. **Validate Icons**: Ensure icon colors update with theme

### Common Dark Mode Issues & Solutions

**Issue: Dark theme not working on native**
- **Root Cause**: Missing `dark` class application at app root
- **Solution**: Wrap app content in `<View className={isDark ? 'dark flex-1' : 'flex-1'}>`

**Issue: Some components don't switch themes**
- **Root Cause**: Using hardcoded colors instead of CSS variables
- **Solution**: Use Tailwind classes that reference CSS variables

**Issue: Icons stay same color**
- **Root Cause**: Hardcoded color values in icon components
- **Solution**: Use `colors.tokens.foreground` or similar theme-aware colors

---

---

## 🔧 Theme System Troubleshooting & Fixes

### Critical Learning: Unified Theme System Migration

**Issue Pattern**: `"Cannot read property 'colors' of undefined"` and `"Cannot read property 'mutedForeground' of undefined"`

**Root Cause Analysis:**
1. **Old Hook Usage**: Files using `useTheme` from `@/hooks/use-theme` instead of the unified system
2. **Incorrect Color Access**: Accessing `theme.colors.property` when `theme` doesn't exist in the new system  
3. **Inconsistent Patterns**: Some files using old patterns while others use new unified system

**Solution Pattern (Applied to Multiple Files):**

**Before (❌ Causes Errors):**
```tsx
import { useTheme } from '@/hooks/use-theme';

export default function Component() {
  const { theme } = useTheme();
  const colors = theme.colors; // ❌ theme.colors doesn't exist
  
  return (
    <Ionicons 
      color={colors.tokens.mutedForeground} // ❌ colors is undefined
    />
  );
}
```

**After (✅ Works Correctly):**
```tsx
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export default function Component() {
  const colors = useUnifiedColors(); // ✅ Direct color access
  
  return (
    <Ionicons 
      color={colors.tokens.mutedForeground} // ✅ Correct token access
    />
  );
}
```

### Files Successfully Fixed Using This Pattern:

1. **`app/_layout.tsx`** - Main app layout
   - Changed: `useTheme` → `useUnifiedTheme`
   - Fixed navigation context errors during theme switching

2. **`components/StoreProvider.tsx`** - Loading screen component
   - Changed: `useTheme` → `useUnifiedColors`
   - Updated: `theme.colors.*` → `colors.legacy.*`

3. **`app/(modal)/workout-detail.tsx`** - Workout detail modal
   - Changed: `useTheme` → `useUnifiedColors` 
   - Removed: `const colors = theme.colors;` assignment
   - All existing `colors.tokens.*` references worked immediately

4. **`app/(modal)/add-exercises.tsx`** - Exercise selection modal
   - Changed: `useTheme` → `useUnifiedColors`
   - Updated all: `theme.colors.property` → `colors.tokens.property`

### Diagnostic Process:

**Step 1: Identify Theme Import Pattern**
```bash
# Check which hook is being used
grep -r "import.*useTheme" app/
grep -r "import.*useUnifiedColors" app/
```

**Step 2: Find Hook Usage**
```bash
# Look for problematic patterns
grep -r "const.*theme.*=.*useTheme" app/
grep -r "theme.colors" app/
```

**Step 3: Apply Consistent Fix**
1. Update import statement
2. Change hook usage pattern  
3. Update all color references
4. Remove redundant assignments

### Working vs Problematic Files:

**✅ Working Pattern (All tabs, most modals):**
```tsx
import { useUnifiedColors } from '@/hooks/use-unified-theme';
const colors = useUnifiedColors();
// Access: colors.tokens.propertyName
```

**❌ Problematic Pattern (Fixed files):**
```tsx
import { useTheme } from '@/hooks/use-theme';
const { theme } = useTheme();
const colors = theme.colors; // Undefined!
```

### Color Token Reference Guide:

**Correct Token Access:**
- `colors.tokens.primary` - Primary brand color
- `colors.tokens.foreground` - Main text color
- `colors.tokens.mutedForeground` - Secondary text color
- `colors.tokens.background` - Page background color
- `colors.tokens.card` - Card background color
- `colors.tokens.border` - Border color
- `colors.tokens.destructive` - Error/delete color

**Legacy Access (for compatibility):**
- `colors.legacy.primary.DEFAULT` - Primary with nested structure
- `colors.legacy.muted.foreground` - Nested color structure

### Prevention Checklist:

**For New Components:**
- [ ] Always use `useUnifiedColors` for color access
- [ ] Never use `useTheme` from `@/hooks/use-theme`
- [ ] Access colors via `colors.tokens.*` pattern
- [ ] Follow existing working component patterns

**For Existing Components:**
- [ ] Audit import statements for old theme hooks
- [ ] Check for `theme.colors` access patterns  
- [ ] Verify all color references use unified system
- [ ] Test theme switching functionality

### Key Success Factors:

1. **Consistent Pattern Application**: All working screens use the same hook and access pattern
2. **Complete Migration**: Mixing old and new patterns causes errors
3. **Token-Based Access**: Using `colors.tokens.*` provides the most stable access
4. **Following Working Examples**: Profile screen, activity screen, and feedback modal are good reference implementations

---

---

## ✅ **December 2024: Theme Standardization Complete**

### Migration Summary
Successfully completed full app migration to unified theme system, eliminating dual-theme complexity and hardcoded color values.

**What Was Accomplished:**

#### 1. **Hook Standardization (5 Files Migrated)**
- **`app/index.tsx`**: `useTheme` → `useUnifiedTheme` (loading screen)
- **`app/(auth)/signup.tsx`**: `useThemeColors` → `useUnifiedColors` + fixed all color token access
- **`components/AuthControls.tsx`**: `useTheme` → `useUnifiedTheme` (auth status component) 
- **`components/GuestModeWarning.tsx`**: `useTheme` → `useUnifiedColors` (warning modal)
- **`utils/figma-styles.ts`**: `useTheme` → `useUnifiedTheme` (typography styles)

#### 2. **Design Token Additions**
Added missing semantic tokens to `styles/design-tokens.ts`:
```typescript
// Light theme
warning: '#f59e0b',              // Orange for guest mode warnings
warningForeground: '#ffffff',   
link: '#0a7ea4',                // Blue for links
linkForeground: '#ffffff',
switchTrackInactive: '#e2e8f0',  // Light gray for switches
switchTrackActive: '#10b981',    // Green for switches

// Dark theme  
warning: '#f59e0b',              // Same orange (works in dark)
warningForeground: '#000000',    
link: '#38bdf8',                // Brighter blue for dark theme
linkForeground: '#000000',
switchTrackInactive: '#374151',  // Dark gray for switches  
switchTrackActive: '#10b981',    // Same green
```

#### 3. **Hardcoded Color Elimination**
Replaced all hardcoded hex values with semantic tokens:

**Profile.tsx Switches:**
```tsx
// Before: trackColor={{ false: '#e2e8f0', true: '#10b981' }}
// After:  trackColor={{ false: colors.tokens.switchTrackInactive, true: colors.tokens.switchTrackActive }}
```

**Guest Mode Warnings (4 locations):**
```tsx
// Before: color="#f59e0b"  
// After:  color={colors.tokens.warning}
```

**Auth Status Colors:**
```tsx
// Before: isGuest ? '#f59e0b' : theme.colors.muted.foreground
// After:  isGuest ? newTokens.colors.warning : newTokens.colors.mutedForeground
```

**Link Colors:**
```tsx
// Before: color: '#0a7ea4'
// After:  color: type === 'link' ? colors.tokens.link : color
```

### Key Implementation Insights

#### **Pattern 1: useUnifiedColors vs useUnifiedTheme**
- **`useUnifiedColors`**: Best for components needing only color access
- **`useUnifiedTheme`**: Use when need full theme context (isDark, toggles, etc.)

#### **Pattern 2: Token Access Methods**
```tsx
const colors = useUnifiedColors();

// Primary method - new design tokens
colors.tokens.primary      // ✅ Preferred - semantic tokens
colors.tokens.warning      // ✅ New semantic colors

// Legacy access - for complex nested colors  
colors.legacy.primary.DEFAULT     // ✅ When tokens don't exist
colors.legacy.muted.foreground    // ✅ Nested structures
```

#### **Pattern 3: Backward Compatibility**
- All existing `useUnifiedTheme`/`useUnifiedColors` usage was preserved
- No breaking changes to already-migrated components
- Legacy theme object still available for edge cases

### Migration Quality Assurance

**Files That Were NOT Touched (Already Correct):**
- ✅ `app/(tabs)/profile.tsx` - Already using unified system
- ✅ `app/(tabs)/activity.tsx` - Already using unified system  
- ✅ `app/(tabs)/index.tsx` - Already using unified system
- ✅ All modal screens - Already migrated
- ✅ Most UI components - Already using unified theme

**Quality Measures Applied:**
1. **Selective Updates**: Only modified files actually using old hooks
2. **Pattern Consistency**: Applied same migration pattern across all files
3. **Token Extension**: Added tokens without breaking existing ones
4. **Comprehensive Validation**: Fixed TypeScript errors during migration
5. **No Regression Risk**: Preserved all working code unchanged

### Benefits Realized

#### **Developer Experience**
- **Single Theme API**: No more confusion between `useTheme` and `useUnifiedTheme`
- **Semantic Tokens**: `colors.tokens.warning` instead of `#f59e0b` 
- **Consistent Patterns**: All components follow same color access pattern
- **Better IntelliSense**: Token-based access provides better autocomplete

#### **Maintenance & Scalability**
- **Central Color Management**: All colors managed in `design-tokens.ts`
- **Theme-Aware Colors**: All colors automatically adapt to light/dark mode
- **Easy Color Updates**: Change one token value affects entire app
- **No More Hardcoded Values**: Zero hex values in component code

#### **Design System Compliance**  
- **Semantic Naming**: Colors named by purpose, not appearance
- **Consistent Switch Styling**: Track colors match design system
- **Proper Warning Colors**: Orange warnings across all guest mode UI
- **Professional Link Styling**: Theme-appropriate link colors

### Architecture Notes

**Theme Hook Hierarchy (Final State):**
```
useUnifiedTheme()           // ✅ Full theme access (5 components)
├── useUnifiedColors()      // ✅ Color-only access (15+ components)  
├── useSafeTheme()         // ✅ Migration helper (available)
└── useCompatibilityTheme() // ✅ Legacy wrapper (available)

useTheme() [DEPRECATED]     // ❌ No longer used anywhere
```

**Token Structure (Final State):**
```
colors.tokens.*             // ✅ Primary access method
├── Semantic colors (primary, foreground, etc.) 
├── New semantic colors (warning, link, switches)
└── Automatic light/dark variants

colors.legacy.*             // ✅ Compatibility layer  
├── Nested color structures (primary.DEFAULT)
└── Complex color hierarchies (muted.foreground)
```

### Testing Results
- ✅ TypeScript compilation clean (theme-related errors resolved)
- ✅ All existing functionality preserved  
- ✅ Theme switching works across all components
- ✅ Switch components display correct track colors
- ✅ Guest mode warnings show consistent orange color
- ✅ Link colors adapt properly in light/dark themes

### Future Maintenance

**For New Components:**
- Always use `useUnifiedColors` for color access
- Prefer `colors.tokens.*` over `colors.legacy.*`  
- Add new semantic tokens to design-tokens.ts when needed
- Never use hardcoded hex values

**For Existing Components:**
- Migration is complete - no further changes needed
- All components now use standardized theme system
- Pattern is consistent across entire codebase

---

*Last updated: December 2024 - Theme standardization migration completed successfully*