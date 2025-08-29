# Comprehensive Codebase Analysis Prompt for CLAUDE.md Update

## Primary Objective
You are tasked with conducting a thorough analysis of this codebase to generate an accurate and comprehensive CLAUDE.md file. The current CLAUDE.md may contain outdated or incorrect information, and your goal is to create a completely accurate representation of the current state of the project.

## Analysis Framework

### 1. Project Structure Investigation
- **Root Directory Analysis**: Examine the complete directory structure from the project root
- **Frontend vs Backend Distribution**: Determine the actual organization of frontend and backend code
- **Multi-Project Architecture**: Identify if there are multiple related projects within the repository
- **Configuration Files**: Analyze all package.json, tsconfig.json, and other configuration files
- **Asset Organization**: Document how assets, images, and static files are organized

### 2. Technology Stack Verification
- **Package Dependencies**: Extract exact versions and dependencies from all package.json files
- **React Native/Expo Version**: Verify the exact Expo SDK version and React Native version
- **TypeScript Configuration**: Analyze TypeScript setup and strictness levels
- **Build Tools**: Identify build tools, bundlers, and development tools
- **Testing Framework**: Document the complete testing stack (Jest, Detox, etc.)
- **State Management**: Verify Zustand implementation and any other state management
- **Styling Solution**: Confirm NativeWind/Tailwind setup and configuration
- **Navigation**: Document the exact routing solution (Expo Router, React Navigation)

### 3. Architecture Pattern Analysis
- **Component Architecture**: Map out the component hierarchy and organization
- **State Management Patterns**: Analyze Zustand stores, their structure, and relationships
- **Data Flow**: Document how data flows between components and stores
- **Authentication Architecture**: Understand the complete auth flow and state management
- **Persistence Strategy**: Analyze AsyncStorage usage and data persistence patterns
- **Error Handling**: Document error handling patterns and strategies
- **Type Safety**: Analyze TypeScript usage and type definitions

### 4. Feature Analysis
- **Core Features**: Identify all implemented features and their current state
- **Navigation Structure**: Map out all screens and navigation patterns
- **User Flows**: Document complete user journeys and interactions
- **Data Models**: Analyze the shape and structure of data throughout the app
- **Business Logic**: Understand the core business logic and rules
- **Third-party Integrations**: Identify external services and integrations

### 5. Development Workflow Investigation
- **Scripts Analysis**: Document all available npm scripts and their purposes
- **Testing Strategy**: Analyze test files and testing patterns
- **Code Quality Tools**: Identify linting, formatting, and quality assurance tools
- **Development Environment**: Document development setup and requirements
- **Build Process**: Understand the build and deployment pipeline
- **Debugging Tools**: Identify available debugging and development tools

### 6. Current Implementation Status
- **Active Development Areas**: Identify areas under active development
- **Migration Status**: Look for any ongoing migrations or refactoring efforts
- **Technical Debt**: Identify areas of technical debt or deprecated patterns
- **Performance Considerations**: Document any performance optimizations or concerns
- **Security Implementation**: Analyze security measures and authentication flows

## Specific Investigation Areas

### Store Architecture Deep Dive
- Analyze each Zustand store file in detail:
  - `user-store.ts`: User preferences, auth state, weight units
  - `workout-store.ts`: Workout management and history
  - `exercise-store.ts`: Exercise data and library
  - `theme-store.ts`: Theme preferences and system integration
- Document store initialization patterns and persistence strategies
- Analyze store interdependencies and data flow

### Component System Analysis
- Examine the `components/ui/` directory for reusable components
- Analyze the `components/compat/` directory for compatibility layers
- Document component props, types, and usage patterns
- Understand the component styling approach with NativeWind

### Routing and Navigation
- Map out the complete file-based routing structure
- Analyze route protection and authentication guards
- Document modal implementations and navigation patterns
- Understand tab navigation and screen organization

### Testing Implementation
- Analyze test files and identify testing patterns
- Document test coverage and strategies
- Understand E2E testing setup with Detox
- Identify visual testing approaches

## Output Requirements

Generate a completely new CLAUDE.md file that includes:

1. **Accurate Project Description**: Based on actual implementation
2. **Correct Technology Stack**: With exact versions and configurations
3. **Precise Architecture Documentation**: Reflecting actual patterns used
4. **Accurate Command Reference**: Based on actual package.json scripts
5. **Implementation-Specific Details**: Tailored to actual code patterns
6. **Development Guidelines**: Based on observed code conventions
7. **Testing Documentation**: Reflecting actual test setup and strategies
8. **Troubleshooting Information**: Based on common development scenarios

## Investigation Process

1. **Start with Root Analysis**: Begin by examining the project root structure
2. **Follow the Code**: Trace through actual implementation files
3. **Verify Against Reality**: Cross-reference documentation claims with actual code
4. **Document Discrepancies**: Note any discrepancies with the existing CLAUDE.md
5. **Be Thorough**: Don't assume anything - verify every detail through code inspection
6. **Focus on Developer Experience**: Prioritize information that will help developers work effectively

## Quality Standards

- **Accuracy First**: Every statement must be verifiable through code inspection
- **Completeness**: Cover all major aspects of the codebase
- **Clarity**: Use clear, concise language that developers can understand quickly
- **Actionability**: Provide practical guidance and commands
- **Maintainability**: Structure the documentation for easy updates

## Success Criteria

The updated CLAUDE.md should:
- Accurately reflect the current codebase structure
- Provide correct development commands and workflows
- Document actual architecture patterns and conventions
- Include accurate dependency and technology information
- Serve as a reliable reference for both AI assistants and human developers
- Be immediately useful for onboarding new developers to the project