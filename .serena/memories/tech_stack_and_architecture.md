# Tech Stack & Architecture

## Core Technology Stack

### Frontend (Production Ready - 98% Complete)
- **React Native 0.79.5** with **Expo SDK 53**
- **TypeScript ~5.8.3** (strict mode enabled)
- **NativeWind v4.1.23** - Tailwind CSS for React Native
- **Zustand ^5.0.8** - Client-side state management
- **@tanstack/react-query ^5.85.5** - Server state management
- **Expo Router ^5.1.5** - File-based routing
- **React Hook Form ^7.62.0** - Form validation
- **@react-native-async-storage/async-storage 2.1.2** - Local persistence

### Backend (Phase 5.1 - Starting Implementation)
- **FastAPI** - REST API framework
- **Python 3.11+** - Runtime
- **Supabase (PostgreSQL)** - Database with Row-Level Security
- **Pydantic** - Data validation and API contracts
- **pytest** with asyncio - Testing framework

### UI & Styling
- **NativeWind v4** with nested color object structure
- **HSL-based design tokens** with dark/light theme support
- **Expo Vector Icons** + **Lucide React Native** for icons
- **React Native Reanimated ~3.17.4** for animations
- **React Native Gesture Handler ~2.24.0** for gestures

### Development & Testing
- **Jest ~29.7.0** - Unit testing
- **@testing-library/react-native ^13.3.1** - Component testing
- **Detox ^20.40.2** - E2E testing
- **ESLint ^9.25.0** with Expo config
- **TypeScript strict mode** for type safety

## Architecture Patterns

### State Management Strategy
- **Zustand**: Client-side state (UI state, active sessions, device settings)
- **React Query**: Server state (API data, caching, mutations)
- **AsyncStorage**: Local persistence via Zustand middleware
- **Separate stores**: user-store, workout-store, exercise-store, theme-store

### Component Architecture
- **Pure React Native components** (never HTML elements)
- **NativeWind styling** with design token system
- **Haptic feedback** for user interactions
- **SafeAreaView** handling for device boundaries
- **Native Alert dialogs** for confirmations

### Navigation Structure
- **File-based routing** with Expo Router
- **Tab navigation**: Home, Activity, Profile screens
- **Modal presentations**: Add Exercises, settings
- **Deep linking support** for authentication flows

### Testing Strategy
- **Unit Tests**: Individual components and utilities
- **Integration Tests**: Store interactions and component integration
- **Visual Tests**: Component rendering validation
- **E2E Tests**: Complete user workflows
- **Coverage Target**: >90% for critical business logic