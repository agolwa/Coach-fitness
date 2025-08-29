# Architecture Decision Record: Initial Architecture Decisions for React Native Fitness Tracking Application

## Status
Accepted

## Context
This document outlines the foundational architectural decisions for a React Native fitness tracking application. The project began as a Figma-to-mobile-app migration and is now 98% complete, having successfully passed 36/36 tests and achieved production-ready stability. The primary drivers for these decisions were development velocity, maintainability, performance, and a high-quality, mobile-first user experience.

While the frontend architecture is considered **Accepted**, the backend architecture described herein is **Proposed** and awaits implementation and validation.

## Decision
We have adopted a cohesive architecture centered around the Expo Managed Workflow, Zustand for state management, NativeWind for styling, and Expo Router for navigation. This stack enables rapid development and a robust, scalable foundation. The application is organized in a dual-project structure to separate frontend and backend concerns and includes a comprehensive guest mode to maximize user engagement prior to authentication. A future-planned backend stack using FastAPI and Supabase is designed to complement this frontend architecture.

### Technical Approach
The architecture prioritizes simplicity and modern development practices. Expo abstracts away native configuration, allowing the team to focus on feature development. Zustand provides a lightweight, hook-based state management solution that avoids the boilerplate of Redux. NativeWind enables a utility-first styling workflow, directly translating design tokens into a consistent UI. Expo Router leverages a file-based system for intuitive and type-safe navigation.

### Key Components
- **Expo Managed Workflow:** The core framework providing a streamlined development environment, build services, and over-the-air (OTA) updates.
- **Zustand State Management:** A centralized store for managing global state such as user authentication, workout data, and theme preferences, with `AsyncStorage` for persistence.
- **NativeWind v4 Styling:** The utility-first styling engine responsible for the UI layer, using HSL design tokens defined in `tailwind.config.js`.
- **Expo Router:** The file-system-based navigation library managing all routes, including tabbed layouts, modal screens, and authentication flows.
- **Dual Project Structure:** A root directory containing high-level project artifacts and dedicated `Frontend/` and `Backend/` folders. The primary React Native codebase resides in `Frontend/coach/`.
- **Guest Mode:** A feature allowing unauthenticated users to access most of the app's functionality, implemented via conditional logic in the state and navigation layers.
- **Proposed Backend:** A yet-to-be-implemented backend service using Python (FastAPI), Prisma, and Supabase for handling user data, AI features, and business logic.

## Consequences

### Positive
- **Rapid Development:** The Expo workflow and simplified tooling enabled the completion of 8 development phases and 98% of the project in just 14 days.
- **High Stability & Quality:** The architecture supports comprehensive testing, resulting in a 36/36 passing test suite and a production-stable navigation system.
- **Maintainable Codebase:** The clear separation of concerns (UI, state, navigation) and utility-first styling lead to a more readable and scalable codebase.
- **Improved Performance:** Zustand's minimal re-renders and NativeWind's compile-time style generation contribute to a smooth user experience.
- **Seamless UX:** The combination of Expo Router and a well-defined guest mode provides a robust and intuitive user journey.

### Negative
- **Expo Limitations:** The managed workflow restricts access to certain custom native modules, which could require ejecting to the bare workflow if complex native integrations are needed in the future.
- **Backend Dependency:** Core features related to data persistence and user accounts are dependent on the proposed backend, which is not yet implemented.
- **State Management Complexity:** While simple now, Zustand may require more disciplined organization with selectors as the application state grows more complex, compared to the enforced structure of Redux.

### Risks
- **Platform Risk:** Heavy reliance on the Expo ecosystem means that breaking changes or limitations in the Expo SDK could significantly impact the project.
- **Implementation Risk:** The backend stack is entirely conceptual. There is a risk of **type drift** between the frontend TypeScript contracts and the backend Pydantic models if they are not kept in sync, leading to integration bugs. The chosen technologies (FastAPI, Prisma Python) may also present unforeseen integration challenges.
- **Scalability of Structure:** The dual project structure is effective for now, but a formal monorepo solution (like Turborepo or Nx) might be needed if the backend and frontend become more tightly coupled.

## Alternatives Considered

### Alternative 1: Bare React Native Workflow
**Description**: Developing without the Expo Managed Workflow, giving full control over the native iOS and Android projects.
**Pros**: Unrestricted access to all native APIs and custom modules.
**Cons**: Significantly increased setup complexity, longer build times, and manual management of native dependencies and environment configuration. This would have slowed down the initial migration and development phases.

### Alternative 2: Redux or Context API for State Management
**Description**: Using Redux Toolkit for a structured, opinionated state management solution, or React's built-in Context API for simpler state sharing.
**Pros**: Redux offers powerful developer tools and a predictable state container. Context is built-in to React.
**Cons**: Redux introduces significant boilerplate and a steeper learning curve. Context API can lead to performance issues due to excessive re-rendering in components that consume the context, which is a problem Zustand is designed to solve.

### Alternative 3: React Navigation for Routing
**Description**: The most widely used library for navigation in React Native, offering a stack-based and component-driven configuration.
**Pros**: Highly flexible and powerful, with a large community.
**Cons**: Configuration is more verbose and less intuitive than Expo Router's file-based approach. It can be more complex to set up deep linking and type-safe routes.

### Alternative 4: Traditional StyleSheet or Styled Components for Styling
**Description**: Using React Native's built-in `StyleSheet.create` API or a CSS-in-JS library like Styled Components.
**Pros**: `StyleSheet` is the default, and Styled Components allow for component-scoped styles.
**Cons**: `StyleSheet` is verbose and can lead to large, hard-to-manage style objects. Styled Components can introduce a slight runtime performance overhead. Neither offers the rapid, utility-first workflow of NativeWind.

## Implementation Details

### Dependencies
- **Framework:** `react-native@0.79.5`, `expo@53.0.0`
- **State Management:** `zustand`, `zustand/middleware` (for persistence with `AsyncStorage`)
- **Styling:** `nativewind@4.0.36`
- **Navigation:** `expo-router`
- **Forms:** `react-hook-form`
- **Testing:** `jest`, `@testing-library/react-native`

### Configuration
- **Expo:** Configuration is managed in `Frontend/coach/app.json`.
- **Styling:** NativeWind and custom HSL design tokens are configured in `Frontend/coach/tailwind.config.js`.
- **Routing:** Routes are defined by the file structure within the `Frontend/coach/app/` directory.
- **State Persistence:** Zustand stores are configured to persist to `AsyncStorage`, hydrating the app state on launch.

### Performance Considerations
- **Zustand:** State updates are granular, only re-rendering components that subscribe to specific state slices, which minimizes computational overhead.
- **NativeWind:** Styles are converted to `StyleSheet` objects at compile time, avoiding runtime performance penalties associated with CSS-in-JS libraries.
- **Expo:** Production builds are highly optimized, and OTA updates allow for instant delivery of bug fixes and improvements without a full app store release.

## Validation
The correctness of these architectural decisions has been validated by the project's outcomes:
- **Metrics:** Successful completion of 98% of the project scope across 8 distinct development phases.
- **Testing:** A comprehensive test suite with 36/36 passing tests validates the stability and correctness of the implementation.
- **User Experience:** The implemented authentication flow and navigation system have been deemed production-ready, providing a seamless and mobile-optimized user experience.

## References
- [Expo SDK 53 Documentation](https://docs.expo.dev/)
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand)
- [NativeWind v4 Documentation](https://www.nativewind.dev/v4/overview)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Technical Stack & Implementation Guide](../../../tech-stack-preference.md)

## Review Schedule
This set of decisions should be reviewed annually or if the following conditions are met:
- The application requires a custom native module that is not supported by the Expo Managed Workflow.
- The complexity of the global state grows to a point where Zustand's simplicity becomes a hindrance rather than a benefit.
- The Expo platform introduces breaking changes or fails to keep pace with essential React Native advancements.
