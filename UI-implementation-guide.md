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

## 🚨 Navigation Context Error Resolution

### Critical Issue: NavigationStateContext Error During Theme Switching

**Symptoms:**
- Error: "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?"
- Occurs specifically during theme switching operations
- App works normally after dismissing error dialogs
- Error appears in both Console Error and Render Error logs

**Root Cause Analysis:**
In commit `e99ee2b` ("fixed theme issue in layout file"), the `ThemeProvider` from `@react-navigation/native` was inadvertently removed from `app/_layout.tsx`. This provider is **REQUIRED** even when using Expo Router because:

1. **React Navigation Components Dependency**: Components like `HapticTab`, `TabBarBackground`, and other navigation-related components still depend on React Navigation's context
2. **Expo Router Builds on React Navigation**: Expo Router is built on top of React Navigation and expects certain providers to be present
3. **Theme Switching Triggers Re-renders**: During theme changes, components temporarily lose access to navigation context without the provider

**The Missing Provider Pattern:**
```tsx
// ❌ BROKEN: Missing ThemeProvider (removed in e99ee2b)
return (
  <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack>
      {/* Stack screens */}
    </Stack>
  </View>
);
```

**✅ CORRECT: Required ThemeProvider Pattern**
```tsx
// Import required
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

// Proper implementation
return (
  <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  </View>
);
```

### Architecture Understanding

**Dual Theme System Coexistence:**
- **React Navigation ThemeProvider**: Provides navigation context and theme for React Navigation components
- **Custom Theme System**: `useUnifiedTheme`/`useUnifiedColors` for application-specific theming
- **NativeWind Dark Mode**: CSS class-based theming controlled by `className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}`

**Why All Three Are Needed:**
1. **ThemeProvider**: Satisfies React Navigation component requirements
2. **Custom Theme Hooks**: Provide semantic color tokens and theme state management  
3. **NativeWind Classes**: Enable CSS variable-based styling and dark mode switching

### Components That Require Navigation Context

**Direct Dependencies:**
- `HapticTab.tsx` - Tab bar button component
- `TabBarBackground.tsx` / `TabBarBackground.ios.tsx` - Tab bar styling
- Any component using `@react-navigation` imports

**Indirect Dependencies:**
- Components rendered within tab navigation
- Modal screens that may use navigation-aware components
- Any component that might use React Navigation hooks in the future

### Prevention Guidelines

**For Future Layout Changes:**
- [ ] **NEVER remove ThemeProvider** from `app/_layout.tsx` 
- [ ] **Always test theme switching** after layout modifications
- [ ] **Verify navigation functionality** remains intact
- [ ] **Check for navigation context errors** in development logs

**For New Navigation Components:**
- [ ] Prefer Expo Router APIs over direct React Navigation when possible
- [ ] If using React Navigation components directly, ensure proper typing
- [ ] Test with both light and dark themes
- [ ] Verify functionality during theme transitions

### Diagnostic Process

**When encountering navigation context errors:**

1. **Check Provider Hierarchy**
   ```bash
   grep -n "ThemeProvider" app/_layout.tsx
   # Should return: import and JSX usage lines
   ```

2. **Verify Import Statements**
   ```bash
   grep -n "@react-navigation/native" app/_layout.tsx  
   # Should include: DarkTheme, DefaultTheme, ThemeProvider
   ```

3. **Trace Recent Layout Changes**
   ```bash
   git log --oneline -n 10 -- app/_layout.tsx
   # Look for theme-related commits that might have removed providers
   ```

4. **Test Theme Switching**
   - Navigate to profile screen
   - Toggle theme switch
   - Observe console for navigation errors
   - Verify app functionality remains stable

### Recovery Steps

**If ThemeProvider is missing:**

1. **Add Import**
   ```tsx
   import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
   ```

2. **Wrap Stack Component**
   ```tsx
   <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
     <StatusBar style={isDark ? 'light' : 'dark'} />
     <Stack>
       {/* Stack screens */}
     </Stack>
   </ThemeProvider>
   ```

3. **Maintain View Wrapper**
   - Keep the outer View with dynamic className for NativeWind
   - Preserve existing theme switching logic
   - Don't modify custom theme hook usage

### Testing Checklist

**Post-Fix Validation:**
- [ ] App launches without navigation context errors
- [ ] Theme switching works smoothly (Profile screen toggle)
- [ ] Tab navigation remains functional
- [ ] Modal screens open/close properly
- [ ] No console errors during theme transitions
- [ ] Both iOS and Android platforms tested
- [ ] Dark/light theme persistence works correctly

### Key Architectural Insight

**The Three-Layer Theme System:**
```
┌─ NativeWind Classes (dark/flex-1) ─ Controls CSS Variables
│  ├─ React Navigation ThemeProvider ─ Provides Navigation Context  
│  │  ├─ Custom Theme Hooks ─ Application Logic & Semantic Tokens
│  │  │  └─ App Components ─ Consume from all layers as needed
```

This architecture allows:
- **Navigation context stability** during theme changes
- **Semantic color token access** for application styling  
- **CSS variable-based theming** for consistent dark/light mode
- **Coexistence** of multiple theming approaches without conflicts

---

## 🔧 **September 2024: Navigation Context Error - FINAL RESOLUTION**

### Critical Fix: Component Hierarchy Restructuring

**Issue Resolved**: Navigation context error during theme switching - "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?"

**Root Cause Analysis:**
The error occurred because `useUnifiedTheme()` hook was being called in `AppContent` component BEFORE the `ThemeProvider` from React Navigation was established in the component tree. During theme switches, this created a race condition where navigation-dependent components temporarily lost access to navigation context.

**Location**: `app/_layout.tsx` - Lines 52 and 66 in the original implementation

**Solution Implemented:**

#### **1. Component Hierarchy Restructuring**

**Before (❌ Problematic):**
```tsx
function AppContent() {
  const { colorScheme, isDark } = useUnifiedTheme(); // ❌ Called before ThemeProvider
  // ... store checks
  
  return (
    <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack>
          {/* navigation screens */}
        </Stack>
      </ThemeProvider>
    </View>
  );
}
```

**After (✅ Fixed):**
```tsx
// New component that safely uses theme hooks
function ThemedAppContent() {
  const { isDark } = useUnifiedTheme(); // ✅ Safe - called after ThemeProvider
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)" options={{ headerShrown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

function AppContent() {
  // Use theme store directly to avoid navigation context dependency
  const colorScheme = useThemeStore(state => state.colorScheme); // ✅ Direct store access
  const { isInitialized, hasErrors } = useStoreInitialization();
  const { authState, isLoading } = useUserStore();

  if (!isInitialized || isLoading) {
    return <StoreLoadingScreen />;
  }

  return (
    <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ThemedAppContent /> {/* ✅ Navigation context available here */}
      </ThemeProvider>
    </View>
  );
}
```

#### **2. Final Component Tree Architecture**
```
RootLayout
└── QueryClientProvider
    └── StoreProvider
        └── AppContent (store initialization & direct theme store access)
            └── View with dark class (NativeWind theme)
                └── ThemeProvider (React Navigation context)
                    └── ThemedAppContent (safe theme hook usage)
                        └── StatusBar + Stack Navigation
```

#### **3. Key Implementation Details**

**Import Addition:**
```tsx
import { useThemeStore } from '@/stores/theme-store';
```

**Component Separation Benefits:**
1. **Context Safety**: Theme hooks only called after navigation context established
2. **Clean Separation**: Store initialization separate from theme rendering
3. **No Breaking Changes**: All existing functionality preserved
4. **Provider Order**: Proper React Navigation provider hierarchy

#### **4. Technical Insights**

**Why This Fix Works:**
- **Timing Resolution**: Navigation context available before any component tries to access it
- **Hook Safety**: `useUnifiedTheme()` only called within provider boundary
- **Store Direct Access**: Theme state accessed without hooks in critical initialization phase
- **Proper Cascading**: All three theme layers (NativeWind, React Navigation, Custom) work together

**Files Modified:**
- `app/_layout.tsx` - Component restructuring and import addition

**Testing Results:**
- ✅ No navigation context errors during theme switching
- ✅ Rapid theme toggles work without issues
- ✅ App functionality fully preserved
- ✅ Theme persistence across app restarts
- ✅ All navigation components work correctly

#### **5. Architecture Validation**

**The Three-Layer Theme System Preserved:**
1. **NativeWind Classes** (`dark`/`flex-1`) - CSS variable control
2. **React Navigation ThemeProvider** - Navigation context + theme
3. **Custom Theme Hooks** - Application logic & semantic tokens

**Provider Dependencies Resolved:**
- ✅ QueryClientProvider → StoreProvider → AppContent
- ✅ View (NativeWind) → ThemeProvider (React Nav) → ThemedAppContent  
- ✅ All navigation-dependent components have context access
- ✅ Theme hooks called in proper component lifecycle

#### **6. Prevention Guidelines for Future Development**

**✅ DO:**
- Always call theme hooks AFTER establishing ThemeProvider
- Use direct store access for critical initialization logic  
- Maintain clear provider hierarchy separation
- Test theme switching thoroughly during development

**❌ NEVER:**
- Call navigation-dependent hooks before provider setup
- Mix initialization logic with theme hook dependencies
- Remove or reorder the ThemeProvider in _layout.tsx
- Assume hooks are safe to call during provider establishment

### Resolution Status: **COMPLETE** ✅

This architectural restructuring provides a permanent, robust solution to the navigation context error that was occurring during theme switching operations. The fix maintains all existing functionality while eliminating the race condition that caused the error.

---

## 🔧 **December 2024: Final Navigation Context Error Resolution**

### **Ultimate Solution: Store Initialization Architecture**

After multiple attempts to fix the navigation context error through component restructuring, the **final permanent solution** was implemented by addressing the **root architectural issue**: module-level side effects running before React contexts were established.

#### **The Definitive Fix**

**Problem Eliminated:**
- **Module-Level Side Effects**: Removed `Appearance.addChangeListener` from module import time in `theme-store.ts`
- **Race Condition**: Eliminated timing issues between module loading and React Navigation context establishment

**Solution Architecture:**

1. **Store Initializer Pattern** (`/stores/store-initializer.ts`):
```typescript
export class StoreInitializer {
  static initialize() {
    // Only runs AFTER navigation context is ready
    this.appearanceListener = Appearance.addChangeListener(({ colorScheme }) => {
      // Safe navigation context access guaranteed
    });
  }
}
```

2. **Controlled Initialization Timing** (`/app/_layout.tsx`):
```typescript
function ThemedAppContent() {
  React.useEffect(() => {
    // Initialize stores AFTER ThemeProvider is mounted
    StoreInitializer.initialize();
    return () => StoreInitializer.cleanup();
  }, []);
}
```

3. **State Management Without Context Dependency** (`/app/_layout.tsx`):
```typescript
function AppContent() {
  // Use React state to avoid store access during initialization
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  
  React.useEffect(() => {
    // Subscribe after component mounts
    const unsubscribe = useThemeStore.subscribe(
      (state) => state.colorScheme,
      (scheme) => setColorScheme(scheme)
    );
    return unsubscribe;
  }, []);
}
```

#### **Why This Solution is Definitive**

**Previous Approaches** (September 2024):
- ❌ Moved hooks between components
- ❌ Restructured component hierarchy  
- ❌ Added provider wrappers
- **Result**: Temporary fixes that didn't address root cause

**Final Approach** (December 2024):
- ✅ Eliminated module-level side effects entirely
- ✅ Controlled initialization timing through React lifecycle
- ✅ Proper separation of concerns: module loading vs. runtime initialization
- **Result**: Permanent architectural solution

#### **Architecture Benefits**

1. **Timing Guarantee**: Navigation context always exists before any store listeners
2. **No Race Conditions**: Proper React component lifecycle ensures correct initialization order
3. **Resource Management**: Proper cleanup prevents memory leaks
4. **Future-Proof**: Works regardless of React Navigation or Expo Router changes
5. **Performance**: No unnecessary module-level operations during app startup

#### **Implementation Guidelines**

**✅ DO:**
- Initialize store side effects within React component lifecycle (`useEffect`)
- Use centralized initialization management (`StoreInitializer`)
- Ensure navigation context exists before accessing navigation-dependent APIs
- Clean up listeners and resources on component unmount

**❌ NEVER:**
- Add side effects at module import time (outside of React components)
- Access navigation context during module initialization
- Assume contexts are available during static initialization
- Skip cleanup of listeners and subscriptions

#### **Validation Checklist**

When implementing similar patterns:

- [ ] No module-level side effects (check for listeners, subscriptions at import time)
- [ ] Store initialization happens within React component lifecycle
- [ ] Navigation context is established before accessing navigation APIs
- [ ] Proper cleanup of all listeners and subscriptions
- [ ] Centralized management of complex initialization logic

### **Final Status: PERMANENTLY RESOLVED** ✅

The navigation context error has been **definitively eliminated** through proper architectural design. The solution addresses the fundamental timing issue rather than patching symptoms, ensuring the error cannot reoccur.

**Key Files Modified:**
- `/stores/store-initializer.ts` - NEW: Centralized initialization management
- `/stores/theme-store.ts` - MODIFIED: Removed module-level side effects  
- `/app/_layout.tsx` - ENHANCED: Proper initialization timing and lifecycle management

---

## 🔧 **January 2025: StoreLoadingScreen Navigation Context Fix**

### **Issue: Theme Hook Usage in Loading Screen**
**Problem Identified**: Despite previous architectural fixes, the navigation context error reappeared due to `StoreLoadingScreen` component using `useUnifiedColors()` hook before navigation context was established.

**Root Cause**: Component hierarchy issue:
```
RootLayout
└── QueryClientProvider
    └── StoreProvider
        └── StoreLoadingScreen (uses useUnifiedColors) ❌ Navigation context not yet available!
        └── AppContent
            └── ThemeProvider (React Navigation) ✅ Navigation context created here
```

**Location**: `/components/StoreProvider.tsx` - `StoreLoadingScreen` component (lines 107-135)

### **Solution: Direct Theme Store Access**
**Fix Applied**: Replaced theme hooks with direct store access in `StoreLoadingScreen`:

**❌ BEFORE (Problematic):**
```tsx
export function StoreLoadingScreen() {
  const colors = useUnifiedColors(); // ❌ Requires navigation context

  return (
    <View style={{ backgroundColor: colors.legacy.background }}>
      <ActivityIndicator color={colors.legacy.primary.DEFAULT} />
      <Text style={{ color: colors.legacy.muted.foreground }}>
        Loading VoiceLog...
      </Text>
    </View>
  );
}
```

**✅ AFTER (Fixed):**
```tsx
export function StoreLoadingScreen() {
  // Get theme directly from store without hooks to avoid navigation context issues
  const colorScheme = useThemeStore.getState().colorScheme;
  const isDark = colorScheme === 'dark';

  // Fallback colors that work without navigation context
  const backgroundColor = isDark ? '#09090b' : '#ffffff';
  const primaryColor = isDark ? '#f97316' : '#ea580c';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <View style={{ backgroundColor }}>
      <ActivityIndicator color={primaryColor} />
      <Text style={{ color: textColor }}>
        Loading VoiceLog...
      </Text>
    </View>
  );
}
```

### **Key Implementation Details**
1. **Direct Store Access**: `useThemeStore.getState().colorScheme` instead of hooks
2. **Hardcoded Fallback Colors**: Eliminated dependency on theme system during initialization
3. **No Navigation Context Dependency**: Component can render before ThemeProvider is established
4. **Theme Responsive**: Still respects dark/light mode preferences

### **Prevention Guidelines**
**For Loading/Initialization Components:**
- ✅ **DO**: Use direct store access (`store.getState()`) for critical initialization components
- ✅ **DO**: Use hardcoded fallback colors when navigation context isn't available
- ✅ **DO**: Keep initialization components minimal and dependency-free
- ❌ **NEVER**: Use theme hooks in components that render before navigation context
- ❌ **NEVER**: Access navigation-dependent APIs during app initialization

### **Architecture Pattern for Early-Render Components**
```tsx
// ✅ SAFE PATTERN for components that render before navigation context
function EarlyRenderComponent() {
  // Direct store access - no hooks
  const colorScheme = useThemeStore.getState().colorScheme;
  
  // Hardcoded colors - no theme system dependency
  const colors = colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  
  return <View style={{ backgroundColor: colors.background }} />;
}

// ❌ PROBLEMATIC PATTERN - requires navigation context
function ProblematicComponent() {
  const colors = useUnifiedColors(); // Requires navigation context
  return <View style={{ backgroundColor: colors.legacy.background }} />;
}
```

### **Testing Checklist**
**Post-Fix Validation:**
- [ ] App launches without "Couldn't find a navigation context" errors
- [ ] Loading screen displays correctly in both light and dark themes
- [ ] No console errors during app initialization
- [ ] Theme switching still works after app fully loads
- [ ] Navigation functionality remains intact

### **Files Modified**
- `/components/StoreProvider.tsx` - `StoreLoadingScreen` component updated
  - Removed: `useUnifiedColors()` hook usage
  - Added: Direct theme store access pattern
  - Added: Hardcoded fallback colors

### **Resolution Status: FIXED** ✅
The navigation context error in `StoreLoadingScreen` has been permanently resolved by eliminating theme hook dependencies during initialization. This ensures the loading screen can render before navigation context is established.

---

*Last updated: January 2025 - StoreLoadingScreen navigation context dependency eliminated*

---

## 🔧 **January 2025: Platform-Specific Navigation Context Solutions**

### **Working Solutions Backup**

Documentation of platform-specific solutions that have been tested and confirmed working. Use these as fallback implementations if unified solutions fail.

#### **iOS Working Solution (ThemeProvider at Root)**
**Status**: ✅ Confirmed working on iOS
**Issue Addressed**: iOS strict synchronous navigation context initialization

```tsx
// app/_layout.tsx - iOS WORKING VERSION
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useThemeStore } from '@/stores/theme-store';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Get theme directly from store to avoid navigation context dependency
  const colorScheme = useThemeStore.getState().colorScheme;
  const [currentColorScheme, setCurrentColorScheme] = React.useState(colorScheme);

  // Subscribe to theme changes after mount
  React.useEffect(() => {
    const unsubscribe = useThemeStore.subscribe(
      (state) => state.colorScheme,
      (scheme) => {
        setCurrentColorScheme(scheme);
      }
    );
    return unsubscribe;
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isInitialized, hasErrors } = useStoreInitialization();
  const { authState, isLoading } = useUserStore();
  const isDark = useThemeStore.getState().colorScheme === 'dark'; // Direct store access

  if (!isInitialized || isLoading) {
    return <StoreLoadingScreen />;
  }

  return (
    <View className={isDark ? 'dark flex-1' : 'flex-1'}>
      <AlertProvider>
        <ThemedAppContent />
      </AlertProvider>
    </View>
  );
}
```

#### **Android Working Solution (Original Structure)**  
**Status**: ✅ Confirmed working on Android
**Issue Addressed**: Android lenient async navigation context timing

```tsx
// app/_layout.tsx - ANDROID WORKING VERSION
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isInitialized, hasErrors } = useStoreInitialization();
  const { authState, isLoading } = useUserStore();
  const colorScheme = useThemeStore.getState().colorScheme;

  if (!isInitialized || isLoading) {
    return <StoreLoadingScreen />;
  }

  // ThemeProvider placed AFTER store initialization
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
        <AlertProvider>
          <ThemedAppContent />
        </AlertProvider>
      </View>
    </ThemeProvider>
  );
}
```

#### **Platform-Specific Implementation Pattern**
**Use only if unified solution fails**

```tsx
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

export default function RootLayout() {
  // Universal setup code
  const [loaded] = useFonts({...});
  if (!loaded) return null;

  // Platform-specific provider structure
  if (isIOS) {
    return (
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  } else {
    return (
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </QueryClientProvider>
    );
  }
}

function AppContent() {
  // Common store initialization logic
  const { isInitialized, hasErrors } = useStoreInitialization();
  const { authState, isLoading } = useUserStore();
  const colorScheme = useThemeStore.getState().colorScheme;
  
  if (!isInitialized || isLoading) {
    return <StoreLoadingScreen />;
  }

  // Platform-specific theme provider placement
  if (isIOS) {
    // ThemeProvider already at root level
    return (
      <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
        <AlertProvider>
          <ThemedAppContent />
        </AlertProvider>
      </View>
    );
  } else {
    // ThemeProvider at component level for Android
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
          <AlertProvider>
            <ThemedAppContent />
          </AlertProvider>
        </View>
      </ThemeProvider>
    );
  }
}
```

---

## **✅ FINAL WORKING SOLUTION: Platform-Specific Theme Implementation**
**Date**: January 2025  
**Status**: ✅ CONFIRMED WORKING - Both iOS and Android  
**Issue Resolved**: Navigation context errors on Android with proper theme switching on both platforms

### **Implementation Details**

This is the final working implementation that successfully handles both iOS and Android platform-specific requirements:

```tsx
// app/_layout.tsx - FINAL WORKING VERSION
import React from 'react';
import { View, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// ... other imports

// Android-specific wrapper that ensures navigation context is ready
function AndroidThemeWrapper() {
  const colorScheme = useThemeStore(state => state.colorScheme);
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className="flex-1" style={{ flex: 1 }} key="app-root">
        <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
          <AlertProvider>
            <ThemedAppContent />
          </AlertProvider>
        </View>
      </View>
    </ThemeProvider>
  );
}

// Wrapper component that provides theme context without navigation dependencies
function AppContent() {
  const { isInitialized, hasErrors, userLoading } = useStoreInitialization();
  const isDark = useThemeStore.getState().colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';

  // Show loading screen while stores are initializing
  if (!isInitialized || userLoading) {
    return <StoreLoadingScreen />;
  }

  if (hasErrors) {
    console.warn('Store initialization errors detected:', hasErrors);
  }

  // Platform-specific theme provider placement
  if (isAndroid) {
    // For Android: ThemeProvider after store initialization (when navigation context is ready)
    return <AndroidThemeWrapper />;
  } else {
    // For iOS: ThemeProvider already at root level
    return (
      <View className="flex-1" style={{ flex: 1 }} key="app-root">
        <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
          <AlertProvider>
            <ThemedAppContent />
          </AlertProvider>
        </View>
      </View>
    );
  }
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Get theme directly from store to avoid hooks that might access navigation
  const colorScheme = useThemeStore.getState().colorScheme;
  const [currentColorScheme, setCurrentColorScheme] = React.useState(colorScheme);
  const isIOS = Platform.OS === 'ios';

  // Initialize theme class manager early
  React.useEffect(() => {
    initializeThemeClassManager();
  }, []);

  // Subscribe to theme changes after mount
  React.useEffect(() => {
    const unsubscribe = useThemeStore.subscribe(
      (state) => state.colorScheme,
      (scheme) => {
        setCurrentColorScheme(scheme);
      }
    );
    return unsubscribe;
  }, []);

  if (!loaded) return null;

  // Platform-specific provider structure
  if (isIOS) {
    // iOS: ThemeProvider at root level (before StoreProvider)
    return (
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  } else {
    // Android: No ThemeProvider at root (handled in AppContent after initialization)
    return (
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </QueryClientProvider>
    );
  }
}
```

### **Key Success Factors**

1. **Platform Detection**: Uses `Platform.OS` to detect iOS vs Android and apply appropriate structure
2. **Proper Initialization Gating**: Android waits for store initialization before rendering ThemeProvider
3. **Navigation Context Timing**: Android's `AndroidThemeWrapper` only renders after navigation context is established
4. **Store State Access**: Uses both `useThemeStore.getState()` for immediate access and `useThemeStore(state => state.colorScheme)` for reactive updates

### **Android Fix Details**
- **Problem**: Navigation context not available when ThemeProvider tried to initialize
- **Solution**: Created `AndroidThemeWrapper` component that only renders after stores are initialized
- **Flow**: `StoreProvider → AppContent → (wait for init) → AndroidThemeWrapper → ThemeProvider → ThemedAppContent`

### **iOS Compatibility**
- **Maintained**: ThemeProvider at root level for strict synchronous navigation context requirements  
- **Flow**: `ThemeProvider → QueryClientProvider → StoreProvider → AppContent → ThemedAppContent`

### **Testing Results**
- ✅ iOS Simulator: Theme switching works correctly
- ✅ Android Emulator: Theme switching works correctly, no navigation context errors
- ✅ Both platforms: Rapid theme toggles handle correctly
- ✅ Store initialization: Proper timing on both platforms

### **Store Initialization Best Practices**

#### **Standard Store Initialization Pattern**
```tsx
// StoreProvider.tsx - Standard initialization pattern
export function StoreProvider({ children }: StoreProviderProps) {
  const initializeUser = useUserStore(state => state.initializeUser);
  const loadExercises = useExerciseStore(state => state.loadExercises);
  const initializeWorkout = useWorkoutStore(state => state.initializeWorkout);
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  // Initialize all stores on mount
  useEffect(() => {
    const initializeStores = async () => {
      try {
        await Promise.all([
          initializeTheme?.() || Promise.resolve(),
          initializeUser?.() || Promise.resolve(),
          loadExercises?.() || Promise.resolve(),
          initializeWorkout?.() || Promise.resolve(),
        ]);
        console.log('All stores initialized successfully');
      } catch (error) {
        console.warn('Some stores failed to initialize:', error);
      }
    };

    initializeStores();
  }, [initializeTheme, initializeUser, loadExercises, initializeWorkout]);

  return <>{children}</>;
}
```

#### **Why Store Initialization is Standard Practice**
1. **User Store**: Must check authentication state, load user preferences from AsyncStorage
2. **Exercise Store**: Loads exercise library/database for app functionality
3. **Workout Store**: Restores any active workout session from previous app use  
4. **Theme Store**: Initializes theme preferences and system appearance listeners

This pattern ensures the app has all necessary data before user interaction, which is standard in React Native apps with Zustand.

### **Usage Guidelines**

#### **Primary Approach**: Unified Solution
1. Try the consolidated initialization approach first
2. Remove duplicate initialization logic from StoreProvider
3. Centralize all initialization in StoreInitializer

#### **Fallback Approach**: Platform-Specific
1. Use only if unified solution doesn't work
2. Implement Platform.OS-based conditional rendering
3. Test thoroughly on both platforms
4. Document which platform-specific pattern is used

#### **Implementation Decision Tree**
```
Navigation Context Error?
├── Try Unified Solution (consolidated initialization)
│   ├── Success? → Use unified approach
│   └── Still failing? → Check platform-specific patterns
├── iOS failing, Android working? → Use iOS working solution  
├── Android failing, iOS working? → Use Android working solution
└── Both failing? → Use platform-specific conditional implementation
```

### **Testing Checklist**
**For any navigation context solution:**
- [ ] App launches without navigation errors
- [ ] Theme switching works smoothly
- [ ] Store initialization completes successfully
- [ ] Navigation functionality remains intact
- [ ] Both light and dark themes work
- [ ] Test on both iOS and Android simulators
- [ ] Verify no console errors during initialization

---

*Backup solutions documented: January 2025*