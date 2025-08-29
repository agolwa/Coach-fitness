# Codebase Structure & Architecture

## Project Root Structure
```
FM-SetLogger/
├── Backend/                    # Backend implementation (Phase 5.1 starting)
├── Frontend/coach/            # Enhanced frontend with additional features
├── .claude/docs/tests/        # TDD documentation and test specifications
├── progress.md               # Detailed project progress (98% complete)
├── backend-implementation-plan.md  # Phase 5 backend roadmap
├── tech-stack-preference.md  # Comprehensive tech stack documentation
├── CLAUDE.md                 # Project guidance and architecture
├── README.md                 # Basic Expo app setup instructions
└── migration-tasks.md        # Task breakdown and migration plans
```

## Frontend Architecture (98% Complete)

### Primary Development Location
**Root Level vs Frontend/coach/**: 
- **Root level**: Primary development version (current focus)
- **Frontend/coach/**: Secondary version with enhanced features and auth

### Core Directory Structure
```
Frontend/coach/
├── app/                      # Expo Router file-based routing
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main tab navigation (Home, Activity, Profile)
│   ├── (modal)/             # Modal screens (Add Exercises, Exercise Detail)
│   └── _layout.tsx          # Root layout with conditional routing
├── components/              # React Native components
│   ├── ui/                  # Reusable UI components (Button, Input, Card)
│   ├── compat/              # Compatibility wrappers (ThemeProvider, WeightUnitProvider)
│   ├── TodaysLog.tsx        # Current workout display component
│   └── ExerciseLogCard.tsx  # Individual exercise card component
├── stores/                  # Zustand state management
│   ├── user-store.ts        # User preferences, authentication, weight units
│   ├── workout-store.ts     # Active workouts, exercise data, history
│   ├── exercise-store.ts    # Exercise library and selection
│   └── theme-store.ts       # Theme preferences and color system
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions and formatters
├── __tests__/              # Jest + React Testing Library tests (36 tests passing)
├── package.json            # Dependencies and scripts
└── tailwind.config.js      # NativeWind v4 configuration
```

### Key Architectural Patterns

#### State Management
- **Zustand Stores**: Client-side state with AsyncStorage persistence
- **React Query**: Server state management (ready for backend integration)
- **Store Initialization**: Handled by `StoreProvider` with proper hydration
- **Automatic Persistence**: Debounced AsyncStorage writes

#### Component Architecture
- **Pure React Native**: Never uses HTML elements
- **NativeWind v4**: Styling with nested color objects
- **Design System**: HSL-based tokens with dark/light theme support
- **Haptic Feedback**: Strategic user interaction feedback

#### Navigation System
- **Expo Router**: File-based routing with tab and modal support
- **Conditional Routing**: Auth state determines app flow
- **Deep Linking**: Authentication and exercise flow routing
- **SafeArea Integration**: Proper device boundary handling

## Backend Architecture (Phase 5.1 Implementation)

### Database Schema (Supabase PostgreSQL)
```sql
-- User management with Supabase Auth integration
users (id, email, display_name, preferences, created_at, updated_at)

-- Workout tracking
workouts (id, user_id, title, started_at, completed_at, duration, is_active)

-- Exercise library (pre-populated with 48+ exercises)
exercises (id, name, category, body_part[], equipment[], description)

-- Workout-Exercise junction table
workout_exercises (id, workout_id, exercise_id, order_index, notes)

-- Set tracking for exercises
sets (id, workout_exercise_id, reps, weight, duration, distance, completed, rest_time)
```

### Row-Level Security (RLS)
- **Complete data isolation** between users
- **Read-only exercise library** for all authenticated users
- **Cascade deletion** for data cleanup
- **Unauthenticated access denied** to all tables

### API Structure (FastAPI)
```python
# Endpoint organization
/auth/          # Authentication (Google OAuth, guest mode, JWT refresh)
/workouts/      # CRUD operations for workout management
/exercises/     # Exercise library access and workout exercise management
/users/         # User profile and preferences management
```

## Testing Architecture

### Test Coverage (36/36 Tests Passing)
- **Design System Tests (22)**: NativeWind v4 validation, theme consistency
- **Component Tests (3)**: React Native component rendering
- **Integration Tests (9)**: Navigation, store connectivity, screen implementation
- **Smoke Tests (2)**: Basic infrastructure validation

### Testing Framework Stack
- **Jest ~29.7.0**: Core testing framework
- **@testing-library/react-native**: Component testing utilities
- **React Test Renderer**: Component snapshot testing
- **Detox**: E2E testing framework (ready for implementation)

## Development Environment

### Prerequisites & Setup
- **Node.js 18+**: Development runtime
- **Python 3.11+**: Backend runtime (Phase 5.1)
- **Expo CLI**: React Native development tooling
- **Supabase CLI**: Database management

### Key Development Servers
- **Frontend**: Port 8084 (Expo dev server)
- **Backend**: Port 8000 (FastAPI/Uvicorn)
- **Database**: Supabase cloud (with local development option)

## Integration Points

### Current Frontend → Backend Integration Plan
1. **Replace AsyncStorage** with Supabase database persistence
2. **Integrate React Query** with FastAPI endpoints
3. **Maintain Zustand stores** for client-side state and caching
4. **Preserve existing UI/UX** while adding server synchronization
5. **Implement authentication flow** with JWT token management

### Data Flow Architecture
```
React Native Components
       ↕
Zustand Stores (Client State)
       ↕
React Query Hooks (Server State)
       ↕
API Client (JWT Auth)
       ↕
FastAPI Endpoints
       ↕
Supabase Database (RLS)
```

## Production Readiness Status

### Frontend (98% Complete)
- ✅ All core screens implemented
- ✅ Navigation system fully functional
- ✅ State management architecture complete
- ✅ Testing infrastructure established
- ✅ Mobile UX optimized
- ✅ Theme system implemented
- ✅ Performance optimized

### Backend (Phase 5.1 Starting)
- 🔄 Database foundation with RLS (TDD implementation)
- 🔄 FastAPI REST API development
- 🔄 Authentication system integration
- 🔄 Full-stack connectivity testing
- 🔄 Production deployment setup

This architecture supports a scalable, secure, and maintainable fitness tracking application ready for production deployment after Phase 5.1 completion.