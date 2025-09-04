# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **full-stack fitness tracking application** with a **React Native frontend** and **FastAPI backend**. The app helps users log and track their workout exercises with secure multi-user authentication and real-time data synchronization.

### Technology Stack

#### Frontend (`Frontend/coach/`)
- **Framework**: React Native with Expo SDK 53 using TypeScript
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand with persistence via AsyncStorage
- **API Integration**: React Query for server state management
- **Styling**: NativeWind (Tailwind CSS for React Native) with HSL-based design system
- **Forms**: React Hook Form
- **Testing**: Jest with React Testing Library
- **Data Persistence**: AsyncStorage for offline data, Supabase for server data

#### Backend (`Backend/`)
- **Framework**: FastAPI with Python 3.9+
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: JWT tokens with refresh token rotation
- **Testing**: pytest with comprehensive test coverage
- **API Documentation**: Automatic OpenAPI/Swagger docs
- **Environment Management**: python-dotenv for configuration

### Core Architecture Patterns

**Full-Stack Architecture**: The repository contains integrated frontend and backend:
- `Frontend/coach/`: React Native app with Expo Router and full-stack integration
- `Backend/`: FastAPI application with authentication, workout management, and database integration

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

### Frontend Development (`Frontend/coach/`)
```bash
# Navigate to frontend directory
cd Frontend/coach

# Install dependencies
npm install

# Start development server (default port 8082)
npm run dev

# Start development server (other options)
npm start              # Interactive mode
npm run start:clear    # Clear cache
npm run start:tunnel   # Tunnel mode for external access

# Platform-specific development
npm run android
npm run ios
npm run web

# Environment switching
npm run env:local      # Switch to local environment
npm run env:development # Switch to development environment
npm run env:staging    # Switch to staging environment
npm run env:production # Switch to production environment

# Start with specific environments
npm run start:local
npm run start:staging
npm run start:production
```

### Backend Development (`Backend/`)
```bash
# Navigate to backend directory
cd Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server (runs on localhost:8000)
python main.py

# Start with environment variables for testing
TESTING=true JWT_SECRET_KEY=test_secret_key_for_testing python main.py
```

### Testing

#### Frontend Tests
```bash
cd Frontend/coach

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

# Test development server connection
npm run test:dev-server
```

#### Backend Tests
```bash
cd Backend

# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/test_auth_service.py -v

# Run tests with coverage
python -m pytest --cov=. --cov-report=html

# Run with environment variables
TESTING=true JWT_SECRET_KEY=test_secret_key_for_testing python -m pytest -v
```

### Linting & Code Quality
```bash
# Frontend linting
cd Frontend/coach
npm run lint

# Reset project (removes example files)
npm run reset-project
```

### Full-Stack Development
```bash
# Start both frontend and backend simultaneously
# Terminal 1: Backend
cd Backend && python main.py

# Terminal 2: Frontend  
cd Frontend/coach && npm run dev

# The frontend will connect to backend at localhost:8000
# Frontend runs on localhost:8082 by default
```

## Key Implementation Details

### Backend Architecture

#### FastAPI Application Structure
```
Backend/
├── main.py              # FastAPI application entry point
├── core/
│   └── config.py        # Environment configuration and settings
├── models/
│   └── auth.py          # Pydantic models for authentication
├── services/
│   ├── auth_service.py  # JWT token management and validation
│   └── token_service.py # Token generation and refresh logic
├── routers/
│   ├── auth.py          # Authentication endpoints
│   ├── workouts.py      # Workout CRUD endpoints
│   ├── exercises.py     # Exercise library endpoints
│   └── users.py         # User profile endpoints
├── database/
│   └── supabase.py      # Database connection and utilities
└── tests/               # Comprehensive test suite
```

#### Authentication & Security
- **JWT Authentication**: Access tokens (15 min) + Refresh tokens (7 days) with automatic rotation
- **Row Level Security**: Supabase RLS policies ensure user data isolation
- **CORS Configuration**: Configured for React Native development with proper origins
- **Environment-based Configuration**: Separate configs for development, staging, and production

#### API Integration
- **React Query Integration**: Frontend uses React Query hooks for server state
- **Automatic Token Refresh**: API client handles JWT refresh transparently
- **Error Handling**: Custom APIError class with typed error categories
- **Offline Support**: Frontend gracefully handles network errors with offline state

### Frontend Architecture

#### Store Initialization
All Zustand stores must be initialized before use. The `StoreProvider` component handles this with:
- Automatic store hydration from AsyncStorage
- Loading states during initialization
- Error handling for corrupt/missing data
- Server synchronization via React Query integration

#### Authentication Flow
- **Full-Stack Authentication**: JWT tokens managed by backend, state by frontend
- **Guest mode vs signed-in state** managed by `user-store`
- **AuthWrapper** component controls app navigation based on auth state
- **Token Management**: Automatic refresh and storage in secure storage
- **Weight unit preferences** are locked during active workouts

#### Workout Management
- **Full-Stack CRUD**: Frontend uses React Query hooks to interact with backend API
- **Real-time Synchronization**: Changes immediately sync with Supabase database
- **Active workout sessions** persist across app restarts (both locally and server)
- **Exercise data** includes weight, reps, sets, and notes with server validation
- **Workout history** stored server-side with exercise statistics and analytics
- **Weight unit conversion** utilities for kg/lbs with server preference sync

#### Theme System
- HSL-based color system with CSS variables
- Dark/light mode support via `useColorScheme` hook
- Theme persistence through `theme-store`
- NativeWind integration for responsive design

#### File-Based Routing (Expo Router)
- `app/(tabs)/`: Main tabbed navigation
- `app/(auth)/`: Authentication screens  
- `app/(modal)/`: Modal screens for adding exercises
- Route protection handled by `AuthWrapper` with server-side auth validation

## Testing Strategy

### Frontend Testing (`Frontend/coach/`)
- **Unit Tests**: Individual store methods and utility functions using Jest
- **Integration Tests**: Store interactions and component integration with React Testing Library
- **Visual Tests**: Component rendering and styling validation
- **E2E Tests**: Full user workflows with Detox
- **API Integration Tests**: Frontend-to-backend communication testing

Critical frontend test coverage includes:
- Store state transitions and persistence (AsyncStorage + server sync)
- Authentication flow edge cases (token refresh, network errors)
- Workout data validation and saving (local + server validation)
- Weight unit conversions with server synchronization
- React Query hook behavior and error handling

### Backend Testing (`Backend/`)
- **Unit Tests**: Individual service methods and utilities using pytest
- **Integration Tests**: Database interactions and API endpoint testing
- **Authentication Tests**: JWT token generation, validation, and refresh logic
- **Database Tests**: Supabase connection, RLS policies, and CRUD operations
- **API Contract Tests**: Request/response validation and error handling

Critical backend test coverage includes:
- JWT token lifecycle (generation, validation, refresh, expiration)
- Database connectivity and RLS policy enforcement
- API endpoint security and user data isolation
- Workout and exercise CRUD operations with validation
- Error handling for authentication, validation, and database failures

### Full-Stack Testing
- **End-to-End Workflow Tests**: Complete user journeys from frontend through API to database
- **Authentication Integration**: OAuth flow + JWT + database user creation
- **Real-time Data Synchronization**: Frontend state sync with backend data changes
- **Network Error Handling**: Offline/online state management and error recovery



### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages` ⚠️

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

For significant UI changes or before merging PRs, use the design review agent:

```bash
# Option 1: Use the slash command
/design-review

# Option 2: Invoke the agent directly
@agent-design-review
```

The design review agent will:

- Test all interactive states and user flows
- Verify responsiveness (desktop/tablet/mobile)
- Check accessibility (WCAG 2.1 AA compliance)
- Validate visual polish and consistency
- Test edge cases and error states
- Provide categorized feedback (Blockers/High/Medium/Nitpicks)

### Playwright MCP Integration

#### Essential Commands for UI Testing

```javascript
// Navigation & Screenshots
mcp__playwright__browser_navigate(url); // Navigate to page
mcp__playwright__browser_take_screenshot(); // Capture visual evidence
mcp__playwright__browser_resize(
  width,
  height
); // Test responsiveness

// Interaction Testing
mcp__playwright__browser_click(element); // Test clicks
mcp__playwright__browser_type(
  element,
  text
); // Test input
mcp__playwright__browser_hover(element); // Test hover states

// Validation
mcp__playwright__browser_console_messages(); // Check for errors
mcp__playwright__browser_snapshot(); // Accessibility check
mcp__playwright__browser_wait_for(
  text / element
); // Ensure loading
```

### Design Compliance Checklist

When implementing UI features, verify:

- [ ] **Visual Hierarchy**: Clear focus flow, appropriate spacing
- [ ] **Consistency**: Uses design tokens, follows patterns
- [ ] **Responsiveness**: Works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] **Accessibility**: Keyboard navigable, proper contrast, semantic HTML
- [ ] **Performance**: Fast load times, smooth animations (150-300ms)
- [ ] **Error Handling**: Clear error states, helpful messages
- [ ] **Polish**: Micro-interactions, loading states, empty states

## When to Use Automated Visual Testing

### Use Quick Visual Check for:

- Every front-end change, no matter how small
- After implementing new components or features
- When modifying existing UI elements
- After fixing visual bugs
- Before committing UI changes

### Use Comprehensive Design Review for:

- Major feature implementations
- Before creating pull requests with UI changes
- When refactoring component architecture
- After significant design system updates
- When accessibility compliance is critical

### Skip Visual Testing for:

- Backend-only changes (API, database)
- Configuration file updates
- Documentation changes
- Test file modifications
- Non-visual utility functions

**Do not start any design review unless the user has specified or asked for it, Do NOT auto review for any PRs or changes**

## Development Notes

### Frontend Development Notes
- Use absolute imports with `@/` alias for cleaner imports
- All Zustand stores include error handling and loading states
- Debounced persistence prevents excessive AsyncStorage writes
- React Query handles server state with automatic caching and revalidation
- React 19 compatibility with overrides in package.json
- TypeScript strict mode enabled with comprehensive type definitions
- Environment switching available for local/development/staging/production

### Backend Development Notes  
- FastAPI with automatic OpenAPI documentation at `/docs`
- Environment variables managed through `.env` files (never commit `.env`)
- JWT secret keys must be configured for development and production
- Supabase connection requires proper environment configuration
- Python virtual environment recommended for dependency isolation
- pytest configuration includes coverage reporting and test database setup

### Full-Stack Integration Notes
- Frontend connects to backend via configurable API base URL
- Android emulator uses `10.0.2.2` for localhost backend connections
- CORS origins configured for all development environments
- Authentication tokens automatically sync between frontend and backend
- Database changes immediately reflect in frontend via React Query cache invalidation

## Working with the Full-Stack Architecture

When making changes:
1. **Frontend development** should happen in `Frontend/coach/` directory
2. **Backend development** should happen in `Backend/` directory
3. Both frontend and backend maintain separate test suites that should be run
4. API changes require updating both backend endpoints and frontend React Query hooks
5. Database schema changes should be tested with both backend tests and full-stack integration
6. Environment configuration must be maintained in both frontend and backend

## Contribution Rules

- **Do not create new files** unless they already exist in the project.
- **Do not invent features, files, or structures** that are not present in the current codebase.
- **Always respect and follow the existing system and architecture.**
- **Work only within the established files and directory structure.**
- **Make all changes with precision and full awareness of the current codebase.**


Claude, read the rules in u/CLAUDE.md, then use sequential thinking and proceed to the next step.
STOP. Before reading further, confirm you understand:
1. This is a code reuse and consolidation project
2. Creating new files requires exhaustive justification  
3. Every suggestion must reference existing code
4. Violations of these rules make your response invalid

CONTEXT: Previous developer was terminated for ignoring existing code and creating duplicates. You must prove you can work within existing architecture.

MANDATORY PROCESS:
1. Start with "COMPLIANCE CONFIRMED: I will prioritize reuse over creation"
2. Analyze existing code BEFORE suggesting anything new
3. Reference specific files from the provided analysis
4. Include validation checkpoints throughout your response
5. End with compliance confirmation

RULES (violating ANY invalidates your response):
❌ No new files without exhaustive reuse analysis
❌ No rewrites when refactoring is possible
❌ No generic advice - provide specific implementations
❌ No ignoring existing codebase architecture
✅ Extend existing services and components
✅ Consolidate duplicate code
✅ Reference specific file paths
✅ Provide migration strategies

[User  prompt here]

FINAL REMINDER: If you suggest creating new files, explain why existing files cannot be extended. If you recommend rewrites, justify why refactoring won't work.
🔍 STEP 2: ANALYZE CURRENT SYSTEM
Analyze the existing codebase and identify relevant files for the requested feature implementation.
Then proceed to Step 3.
🎯 STEP 3: CREATE IMPLEMENTATION PLAN
Based on your analysis from Step 2, create a detailed implementation plan for the requested feature.
Then proceed to Step 4.
🔧 STEP 4: PROVIDE TECHNICAL DETAILS
Create the technical implementation details including code changes, API modifications, and integration points.
Then proceed to Step 5.
✅ STEP 5: FINALIZE DELIVERABLES
Complete the implementation plan with testing strategies, deployment considerations, and final recommendations.
🎯 INSTRUCTIONS
Follow each step sequentially. Complete one step before moving to the next. Use the findings from each previous step to inform the next step.