# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Architecture

**FM-SetLogger** is a full-stack fitness tracking application with a secure multi-user backend and cross-platform mobile frontend.

### High-Level Structure

- **Backend** (`Backend/`) - FastAPI + Supabase PostgreSQL with Row-Level Security
- **Frontend** (`Frontend/coach/`) - React Native + Expo with TypeScript
- **Database** - Supabase PostgreSQL with comprehensive RLS policies
- **Authentication** - Supabase Auth with Google OAuth integration
- **State Management** - Zustand stores with React Query for server state

### Key Architectural Patterns

**Backend Architecture (Clean Architecture)**:
- **Router Layer** (`routers/`) - FastAPI endpoints with comprehensive validation
- **Service Layer** (`services/`) - Business logic with user isolation via RLS
- **Model Layer** (`models/`) - Pydantic models for request/response validation
- **Core Layer** (`core/`) - Configuration and shared utilities
- **Database** (`database/`) - SQL schema with Row-Level Security policies

**Frontend Architecture (Component-Service Pattern)**:
- **Expo Router** - File-based routing with typed routes
- **Zustand Stores** - Client state management with persistence
- **React Query** - Server state management with caching/offline support  
- **Service Layer** - API clients with error handling and retry logic
- **Component Layer** - Reusable UI components with consistent theming

**Security Architecture**:
- **Row-Level Security (RLS)** - Complete user data isolation at database level
- **JWT Authentication** - Supabase Auth with access/refresh token pattern
- **Cascade Deletion** - Proper data cleanup with foreign key constraints
- **Input Validation** - Both client-side (Pydantic) and database-level constraints

## Development Commands

### Backend Development (Python/FastAPI)

```bash
# Setup and dependencies
cd Backend/
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Development server
uvicorn main:app --reload --port 8000

# Testing (TDD with 15+ comprehensive tests)
pytest --asyncio-mode=auto
pytest --cov=app tests/ --asyncio-mode=auto

# Run specific test categories
pytest tests/test_database_foundation.py -v
pytest tests/test_schema_validation.py -v

# Code quality
black .
isort .
mypy .

# Environment management
cp .env.example .env
# Edit .env with Supabase credentials

# Database operations
# Apply schema via Supabase dashboard
# Seed exercise library data
```

### Frontend Development (React Native/Expo)

```bash
# Setup and dependencies  
cd Frontend/coach/
npm install

# Development server
npm run dev  # starts on port 8082
expo start --clear
expo start --tunnel  # for testing on physical devices

# Environment switching
npm run env:local && expo start --clear
npm run env:staging && expo start --clear
npm run env:production && expo start --clear

# Testing
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e

# Platform-specific development
expo run:ios
expo run:android
expo start --web

# Build commands
npm run build:staging
npm run build:production

# Linting
npm run lint
```

## Critical Development Patterns

### Database-First Development
- All user data **MUST** be protected by Row-Level Security policies
- Test RLS policies thoroughly with multiple test users
- Never trust client input - validate at database level with constraints
- Use cascade deletion for proper data cleanup

### Test-Driven Development (TDD)
- Follow RED-GREEN-REFACTOR cycle strictly
- Write failing tests before implementing features
- Backend has 15+ comprehensive test cases covering schema, security, and business logic
- Frontend has integration tests for critical user flows

### Authentication Flow
- **Backend**: JWT validation via Supabase Auth middleware in `services/auth_service.py`
- **Frontend**: Zustand store managing auth state with React Query integration
- **Tokens**: Access tokens (30min) + refresh tokens (7 days) with different secrets
- **User Creation**: Automatic user record creation in `users` table via `services/supabase_client.py`

### State Management Patterns
- **Server State**: React Query with 5min stale time, 10min cache time
- **Client State**: Zustand with persistence for user preferences
- **Error Handling**: Centralized error handling with retry logic
- **Offline Support**: React Query offline queuing with network detection

### API Development Patterns
- **Request/Response Models**: Comprehensive Pydantic models with validation
- **Error Responses**: Consistent error format across all endpoints  
- **Security**: HTTPBearer authentication with user context injection
- **Logging**: Structured logging with appropriate levels (INFO, DEBUG, ERROR)

## Important Files and Their Purpose

### Backend Core Files
- `main.py` - FastAPI app configuration with CORS and router registration
- `core/config.py` - Environment configuration with validation and testing support
- `services/auth_service.py` - JWT authentication and user context management
- `services/workout_service.py` - Core business logic with RLS integration
- `database/schema.sql` - PostgreSQL schema with comprehensive RLS policies
- `database/seed_data.sql` - Exercise library population (48+ exercises)

### Frontend Core Files
- `app/_layout.tsx` - Root layout with QueryClient and theme providers
- `stores/user-store.ts` - Authentication state with Supabase integration
- `services/api-client.ts` - HTTP client with error handling and retry logic
- `components/StoreProvider.tsx` - Zustand store initialization with loading states

### Testing Files
- `Backend/test_schema_validation.py` - 15+ TDD test cases for database schema and RLS
- `Frontend/coach/__tests__/` - Integration tests for auth flow, API clients, and stores

## Database Schema Understanding

**Core Entities**:
- `users` - Extends Supabase Auth users with preferences (JSONB)
- `workouts` - User workout sessions with 30-character title constraint
- `exercises` - Pre-populated library (read-only for users)
- `workout_exercises` - Junction table linking workouts to exercises  
- `sets` - Individual set data (reps, weight, duration, notes)

**Security Policies**:
- Users can only access their own workouts, sets, and user data
- Exercise library is read-only for all authenticated users
- Nested RLS policies protect sets through workout ownership
- Unauthenticated users have zero access to any data

**Data Constraints**:
- Workout titles: 1-30 characters, not empty
- Positive values: reps, duration, weight >= 0
- Proper cascading: User deletion removes all associated data
- Business rules enforced at database level

## Cursor Rules Integration

When using ByteRover MCP:
- Always use `byterover-retrieve-knowledge` before starting tasks
- Store critical information with `byterover-store-knowledge` after successful completion
- These tools provide additional context for complex development tasks

## Environment Configuration

**Backend** (`.env`):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET_KEY` - Access token secret (32+ chars)  
- `JWT_REFRESH_TOKEN_SECRET_KEY` - Different refresh token secret (32+ chars)

**Frontend** (Environment switching available):
- `.env.local` - Local backend development
- `.env.staging` - Staging environment  
- `.env.production` - Production configuration

## Common Troubleshooting

**Backend Issues**:
- **Import Errors**: Ensure virtual environment is activated
- **Database Connection**: Verify Supabase credentials in `.env`
- **Test Failures**: Check if `TESTING=true` environment variable is set
- **RLS Policy Issues**: Verify user authentication and policy definitions

**Frontend Issues**:
- **Metro Bundle Issues**: Use `expo start --clear` to clear cache
- **Network Errors**: Check backend is running on correct port (8000)  
- **Auth Issues**: Verify Supabase configuration and token handling
- **Store Initialization**: Check StoreProvider loading states and error handling
