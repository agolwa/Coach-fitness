# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **React Native fitness app** built with **Expo SDK 53** using **TypeScript**. The app helps users log and track their workout exercises.

### Technology Stack
- **Frontend**: React Native with Expo Router (file-based routing)
- **State Management**: Zustand with persistence via AsyncStorage
- **Styling**: NativeWind (Tailwind CSS for React Native) with HSL-based design system
- **Forms**: React Hook Form
- **Testing**: Jest with React Testing Library
- **Data Persistence**: AsyncStorage for local data

### Core Architecture Patterns

**Dual Project Structure**: The repository contains two identical React Native apps:
- Root level: Primary development version
- `Frontend/coach/`: Secondary version with additional features (auth, enhanced stores)

**State Management**: Centralized Zustand stores with automatic persistence:
- `user-store.ts`: User preferences, authentication state, weight units
- `workout-store.ts`: Active workouts, exercise data, workout history
- `exercise-store.ts`: Exercise library and selection
- `theme-store.ts`: Theme preferences

**Component Architecture**:
- `components/ui/`: Reusable UI components styled with NativeWind
- `components/compat/`: Compatibility wrappers (ThemeProvider, WeightUnitProvider)
- Authentication flow handled by `AuthWrapper` and `StoreProvider`

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
# or platform-specific
npm run android
npm run ios
npm run web
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run with coverage
npm test:coverage

# Run visual tests
npm test:visual

# Run e2e tests
npm run test:e2e
```

### Linting & Code Quality
```bash
# Lint code
npm run lint

# Reset project (removes example files)
npm run reset-project
```

## Key Implementation Details

### Store Initialization
All Zustand stores must be initialized before use. The `StoreProvider` component handles this with:
- Automatic store hydration from AsyncStorage
- Loading states during initialization
- Error handling for corrupt/missing data

### Authentication Flow
- Guest mode vs signed-in state managed by `user-store`
- `AuthWrapper` component controls app navigation based on auth state
- Weight unit preferences are locked during active workouts

### Workout Management
- Active workout sessions persist across app restarts
- Exercise data includes weight, reps, sets, and notes
- Workout history stored locally with exercise statistics
- Weight unit conversion utilities for kg/lbs

### Theme System
- HSL-based color system with CSS variables
- Dark/light mode support via `useColorScheme` hook
- Theme persistence through `theme-store`
- NativeWind integration for responsive design

### File-Based Routing (Expo Router)
- `app/(tabs)/`: Main tabbed navigation
- `app/(auth)/`: Authentication screens
- `app/(modal)/`: Modal screens for adding exercises
- Route protection handled by `AuthWrapper`

## Testing Strategy

- **Unit Tests**: Individual store methods and utility functions
- **Integration Tests**: Store interactions and component integration
- **Visual Tests**: Component rendering and styling
- **E2E Tests**: Full user workflows with Detox

Critical test coverage includes:
- Store state transitions and persistence
- Authentication flow edge cases
- Workout data validation and saving
- Weight unit conversions

## Development Notes

- Use absolute imports with `@/` alias for cleaner imports
- All stores include error handling and loading states
- Debounced persistence prevents excessive AsyncStorage writes
- React 19 compatibility with overrides in package.json
- TypeScript strict mode enabled with comprehensive type definitions

## Working with the Dual Structure

When making changes:
1. Primary development should happen at the root level
2. `Frontend/coach/` contains enhanced features and may have different configurations
3. Both versions share the same core architecture but may have different dependencies
4. Test changes in both environments when modifying shared patterns