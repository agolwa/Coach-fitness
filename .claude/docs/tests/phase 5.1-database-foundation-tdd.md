# TDD Phase 5.1: Database Foundation & Row-Level Security

## Feature: Supabase PostgreSQL Schema with Row-Level Security Policies

**Implement a secure, multi-user database foundation for the fitness tracking app using Test-Driven Development (TDD). The database must ensure complete data isolation between users while supporting the full workout tracking feature set.**

This phase establishes the core data layer that the FastAPI backend will interact with, ensuring users can only access their own workout data while maintaining referential integrity and proper constraints.

## Requirements

1. Create `users` table extending Supabase Auth with user preferences stored as JSONB
2. Create `workouts` table with proper foreign key relationships and 30-character title constraint
3. Create `exercises` table pre-populated with 48+ fitness exercises for the exercise library
4. Create `workout_exercises` junction table linking workouts to exercises with ordering
5. Create `sets` table tracking reps, weight, duration, and notes for each exercise
6. Implement Row-Level Security (RLS) policies ensuring users can only access their own data
7. Validate all database constraints (character limits, positive numbers, required fields)
8. Ensure cascade deletion behavior works correctly for data cleanup
9. Verify foreign key relationships maintain data integrity
10. Test that exercise library is readable by all authenticated users but not modifiable

## TDD Process Instructions

**Follow strict TDD process:**

1. **RED Phase**: Write a failing test that defines the expected database behavior
2. **GREEN Phase**: Write the minimal SQL schema/policy to make the test pass  
3. **REFACTOR Phase**: Clean up the SQL code while ensuring all tests remain green
4. **REPEAT**: For each requirement above, following the numbered order

## Test Cases to Implement (in order)

1. **test_users_table_exists_with_correct_schema** - Verify `users` table has all required columns with correct data types (UUID, TEXT, JSONB, TIMESTAMPZ)

2. **test_users_table_foreign_key_to_auth** - Verify `users.id` correctly references `auth.users(id)` with CASCADE deletion

3. **test_users_preferences_default_values** - Verify new user records get default preferences JSONB with weightUnit, theme, defaultRestTimer, hapticFeedback

4. **test_workouts_table_schema_and_constraints** - Verify `workouts` table structure and 30-character title constraint

5. **test_workout_title_constraint_enforcement** - Verify workout titles longer than 30 characters are rejected with appropriate error

6. **test_exercises_table_populated** - Verify `exercises` table exists and contains at least 48 exercises with categories (strength, cardio, flexibility, balance, bodyweight)

7. **test_workout_exercises_junction_table** - Verify junction table correctly links workouts to exercises with order_index

8. **test_sets_table_with_constraints** - Verify `sets` table with positive number constraints for reps, weight, duration

9. **test_foreign_key_relationships** - Verify all foreign key relationships work correctly (workouts→users, workout_exercises→workouts, sets→workout_exercises)

10. **test_cascade_deletion_behavior** - Verify deleting a user cascades to delete their workouts, exercises, and sets

11. **test_rls_policies_enabled** - Verify RLS is enabled on all user-data tables (users, workouts, workout_exercises, sets)

12. **test_user_can_access_own_data** - As authenticated user A, verify they can SELECT/INSERT/UPDATE/DELETE their own workout data

13. **test_user_cannot_access_other_user_data** - As authenticated user A, verify they cannot SELECT/INSERT/UPDATE/DELETE user B's workout data

14. **test_exercises_readable_by_authenticated_users** - Verify all authenticated users can read the exercise library but cannot modify it

15. **test_unauthenticated_users_denied_access** - Verify unauthenticated requests are denied access to all tables

## Implementation Notes

- **Database Setup**: Use a dedicated Supabase test project separate from production
- **Testing Framework**: pytest with asyncio support for async database operations
- **Database Connection**: Use `psycopg2` or `asyncpg` for direct database testing alongside Supabase client
- **User Fixtures**: Create test fixtures for multiple authenticated users (test_user_a, test_user_b)
- **Test Database**: Each test should use a transaction that rolls back to maintain isolation
- **RLS Testing**: Critical for security - use Supabase's `rpc()` function to switch user contexts
- **SQL Validation**: Run `EXPLAIN` queries to verify proper index usage and query plans

### Test Data Setup

```python
# Example fixture structure
@pytest.fixture
async def test_user_a():
    """Create test user A with authentication context"""
    # Create user in auth.users and corresponding users table record
    
@pytest.fixture  
async def test_user_b():
    """Create test user B with authentication context"""
    # Create separate user for data isolation testing

@pytest.fixture
async def sample_workout_data():
    """Create sample workout data for testing"""
    # Include exercises, sets with realistic fitness data
```

### Database Schema Validation Strategy

1. **Schema Tests First**: Validate table structure before testing business logic
2. **Constraint Tests**: Verify all CHECK constraints and data validation
3. **Relationship Tests**: Confirm foreign keys work correctly
4. **RLS Policy Tests**: Critical security validation - test with multiple users
5. **Performance Tests**: Verify indexes are created and queries perform well

## Expected Outcomes

This phase will demonstrate:

- **Database Security**: Complete data isolation between users through RLS policies
- **Data Integrity**: Proper foreign key relationships and cascade behavior
- **Constraint Validation**: Business rule enforcement at the database level (30-char titles, positive weights)
- **Schema Correctness**: All tables, columns, and data types match the frontend TypeScript contracts
- **Exercise Library**: Pre-populated, read-only exercise database available to all users
- **Test Foundation**: Robust testing infrastructure for subsequent API development phases

### Success Criteria

- ✅ All 15 test cases pass with 100% success rate
- ✅ RLS policies prevent any cross-user data access in security tests
- ✅ Database schema matches exactly the TypeScript interfaces in the frontend
- ✅ Exercise library contains 48+ exercises with proper categorization
- ✅ All database constraints enforce business rules correctly
- ✅ Test fixtures provide reliable, isolated test data for future phases

### Security Validation

The RLS policies are **CRITICAL** for user data protection. Every policy must be validated with tests that:
- Confirm users can access their own data
- Confirm users CANNOT access other users' data  
- Confirm unauthenticated users are completely denied access
- Test both read and write operations for complete coverage

**🚨 Security Warning**: RLS policy failures could expose user data. All security tests must pass before proceeding to API development.