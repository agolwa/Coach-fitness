# Theme System Backup

**Created**: $(date)
**Purpose**: Safety backup before theme system migration

## Backed Up Files

- `theme-store-backup.ts` - Original Zustand theme store with all color definitions
- `use-theme-backup.ts` - Original theme hook with all utilities
- `global-css-backup.css` - Original CSS with HSL color variables
- `tailwind-config-backup.js` - Original Tailwind configuration

## Rollback Instructions

If the new theme system causes issues, you can restore the original system:

```bash
# Restore theme store
cp Frontend/coach/styles/legacy-backup/theme-store-backup.ts Frontend/coach/stores/theme-store.ts

# Restore theme hook
cp Frontend/coach/styles/legacy-backup/use-theme-backup.ts Frontend/coach/hooks/use-theme.ts

# Restore global CSS
cp Frontend/coach/styles/legacy-backup/global-css-backup.css Frontend/coach/global.css

# Restore Tailwind config
cp Frontend/coach/styles/legacy-backup/tailwind-config-backup.js Frontend/coach/tailwind.config.js
```

## Current System Architecture (Before Migration)

### Theme Store (theme-store.ts)
- Manages light/dark theme state
- Contains duplicate color definitions in JavaScript objects
- Uses HSL colors converted from CSS variables
- Heavy theme objects with all styling values

### Theme Hook (use-theme.ts)
- Multiple specialized hooks for different theme aspects
- Returns full theme objects with colors, typography, etc.
- Compatibility layer for legacy components

### CSS Variables (global.css)
- HSL color format
- Comprehensive variable definitions
- Both light and dark theme support

### Component Integration
- Mixed approach: Some use theme objects, others use Tailwind classes
- Inline styles mixed with className styling
- Inconsistent color access patterns

## Migration Goals

1. Single source of truth (CSS variables only)
2. Remove duplicate color definitions
3. Consistent component styling approach
4. Maintain full functionality
5. Improve maintainability

## Safety Features

This backup ensures we can:
- Roll back individual components
- Restore full system if needed
- Compare old vs new implementations
- Maintain development velocity during migration