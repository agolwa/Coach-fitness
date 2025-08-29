# FM-SetLogger Backend

## Phase 5.1: Database Foundation & Row-Level Security

A secure, scalable backend for the FM-SetLogger fitness tracking application built with **FastAPI** and **Supabase PostgreSQL** using **Test-Driven Development (TDD)**.

## 🎯 Project Status

**Current Phase**: Database Foundation Implementation  
**TDD Progress**: 15 test cases implementing complete database schema with Row-Level Security  
**Security Focus**: Complete data isolation between users with comprehensive RLS policies

## 🏗️ Architecture Overview

### Technology Stack
- **FastAPI** - Modern Python web framework
- **Supabase PostgreSQL** - Managed PostgreSQL with authentication
- **AsyncPG** - High-performance PostgreSQL driver
- **Pydantic** - Data validation and API contracts
- **pytest** with asyncio - Async testing framework

### Database Schema
- **users** - User profiles extending Supabase Auth
- **workouts** - Workout sessions with 30-character title constraint
- **exercises** - Pre-populated library of 48+ fitness exercises
- **workout_exercises** - Junction table linking workouts to exercises
- **sets** - Individual set data (reps, weight, duration, notes)

### Security Features
- **Row-Level Security (RLS)** - Complete data isolation between users
- **Cascade Deletion** - Proper data cleanup on user/workout deletion
- **Input Validation** - Database constraints for business rules
- **Authentication Integration** - Supabase Auth with JWT tokens

## 🧪 Test-Driven Development (TDD)

This project follows strict TDD methodology with 15 comprehensive test cases:

### Database Schema Tests (1-10)
1. **Users table schema** - Column types and constraints
2. **Foreign key to auth** - Supabase Auth integration
3. **Default preferences** - JSONB default values
4. **Workouts table schema** - Structure and constraints
5. **Title constraint enforcement** - 30-character limit validation
6. **Exercise library population** - 48+ exercises across categories
7. **Junction table design** - Workout-exercise relationships
8. **Sets constraints** - Positive number validation
9. **Foreign key relationships** - Complete FK chain validation
10. **Cascade deletion** - Data cleanup behavior

### Security Tests (11-15)
11. **RLS policies enabled** - Row-Level Security activation
12. **User own data access** - CRUD operations on own data
13. **User data isolation** - Cannot access other users' data
14. **Exercise library access** - Read-only for authenticated users
15. **Unauthenticated denial** - Complete access denial

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**
- **Supabase Project** (for database and authentication)
- **PostgreSQL** (local development optional)

### Installation

1. **Clone and setup**:
```bash
cd backend/
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Environment configuration**:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Database setup**:
```bash
# Apply schema (via Supabase dashboard or CLI)
# Run seed data to populate exercises
```

### Development Commands

```bash
# Run FastAPI development server
uvicorn main:app --reload --port 8000

# Run TDD tests
pytest --asyncio-mode=auto

# Run tests with coverage
pytest --cov=app tests/ --asyncio-mode=auto

# Run specific test case
pytest tests/test_database_foundation.py::TestDatabaseFoundation::test_users_table_exists_with_correct_schema -v

# Format code
black .
isort .

# Type checking
mypy .
```

## 📊 Database Schema Details

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  preferences JSONB DEFAULT '{"weightUnit": "lbs", "theme": "auto", "defaultRestTimer": 60, "hapticFeedback": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Workouts Table
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 30 AND char_length(title) > 0),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER CHECK (duration >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Exercise Library (48+ Exercises)
- **Strength Training**: Barbell Squat, Deadlift, Bench Press, etc.
- **Bodyweight**: Push-ups, Pull-ups, Burpees, etc.
- **Cardio**: Running, Cycling, Jump Rope, etc.
- **Flexibility**: Various stretches and mobility work
- **Balance**: Single-leg stands, yoga poses, etc.

## 🔒 Row-Level Security Policies

### Complete Data Isolation
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own workouts" ON workouts 
  FOR SELECT USING (auth.uid() = user_id);

-- Exercise library is read-only for all authenticated users
CREATE POLICY "Authenticated users can view exercises" ON exercises 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Nested RLS for sets through workout ownership
CREATE POLICY "Users can manage own sets" ON sets 
  FOR ALL USING (
    workout_exercise_id IN (
      SELECT we.id FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE w.user_id = auth.uid()
    )
  );
```

## 🧪 Test Coverage

Current test implementation covers:
- ✅ **Database Schema Validation** - All table structures and constraints
- ✅ **Foreign Key Relationships** - Complete FK chain with CASCADE rules  
- ✅ **Row-Level Security** - Complete user data isolation
- ✅ **Business Rule Constraints** - 30-char titles, positive numbers
- ✅ **Exercise Library** - Pre-populated with 48+ exercises
- ✅ **Authentication Integration** - Supabase Auth compatibility

## 🔧 API Endpoints (Planned - Phase 5.2)

### Authentication
- `POST /auth/google` - Google OAuth authentication
- `POST /auth/guest` - Guest user creation
- `GET /auth/me` - Current user profile

### Workouts
- `GET /workouts` - List user workouts
- `POST /workouts` - Create new workout
- `GET /workouts/{id}` - Get workout details
- `PUT /workouts/{id}` - Update workout
- `DELETE /workouts/{id}` - Delete workout

### Exercises
- `GET /exercises` - Get exercise library
- `POST /workouts/{id}/exercises` - Add exercise to workout
- `POST /workouts/{id}/exercises/{exercise_id}/sets` - Add set

## 📈 Next Steps (Phase 5.2+)

1. **FastAPI Endpoint Implementation** - Complete REST API
2. **Authentication Middleware** - JWT token validation  
3. **Request/Response Models** - Pydantic model definitions
4. **Frontend Integration** - React Native + React Query connection
5. **Deployment Setup** - Railway/Render production deployment

## 🔍 Development Guidelines

### TDD Process
1. **RED**: Write failing test for new functionality
2. **GREEN**: Write minimal code to make test pass
3. **REFACTOR**: Clean up code while keeping tests green

### Security First
- All user data must be protected by RLS policies
- Never trust client input - validate at database level
- Test security policies thoroughly with multiple users
- Audit all database access patterns

### Code Quality
- **100% Type Coverage** with Pydantic models
- **Comprehensive Testing** with pytest and async support
- **Clean Architecture** with clear separation of concerns
- **Documentation** for all public APIs and database schemas

---

**Project**: FM-SetLogger Phase 5.1 Database Foundation  
**Status**: TDD Implementation In Progress  
**Security**: Row-Level Security with Complete User Data Isolation  
**Ready For**: FastAPI Endpoint Development (Phase 5.2)