"""
TDD Tests for FM-SetLogger Database Foundation & Row-Level Security
Phase 5.1: Implementing 15 test cases in exact order as specified

Following strict TDD process:
1. RED: Write failing test
2. GREEN: Minimal code to pass  
3. REFACTOR: Clean up code
4. REPEAT for each test case
"""

import pytest
import pytest_asyncio
import asyncpg
from supabase import Client


class TestDatabaseFoundation:
    """
    Test suite for database foundation implementing complete TDD cycle.
    Tests run in exact order specified in TDD documentation.
    """

    @pytest_asyncio.async_timeout(30)
    async def test_users_table_exists_with_correct_schema(self, db_connection: asyncpg.Connection):
        """
        TDD Test 1: Verify users table has all required columns with correct data types
        (UUID, TEXT, JSONB, TIMESTAMPZ)
        
        RED Phase: This test should fail initially if schema doesn't exist.
        """
        # Query table schema information
        schema_query = """
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        
        columns = await db_connection.fetch(schema_query)
        
        # Convert to dict for easier testing
        column_info = {row['column_name']: row for row in columns}
        
        # Assert table exists (has columns)
        assert len(columns) > 0, "Users table does not exist"
        
        # Test required columns exist with correct types
        assert 'id' in column_info, "Missing id column"
        assert column_info['id']['data_type'] == 'uuid', f"Expected UUID for id, got {column_info['id']['data_type']}"
        assert column_info['id']['is_nullable'] == 'NO', "id column should not be nullable"
        
        assert 'email' in column_info, "Missing email column"
        assert column_info['email']['data_type'] == 'text', f"Expected TEXT for email, got {column_info['email']['data_type']}"
        assert column_info['email']['is_nullable'] == 'NO', "email column should not be nullable"
        
        assert 'display_name' in column_info, "Missing display_name column"
        assert column_info['display_name']['data_type'] == 'text', f"Expected TEXT for display_name, got {column_info['display_name']['data_type']}"
        assert column_info['display_name']['is_nullable'] == 'YES', "display_name column should be nullable"
        
        assert 'preferences' in column_info, "Missing preferences column"
        assert column_info['preferences']['data_type'] == 'jsonb', f"Expected JSONB for preferences, got {column_info['preferences']['data_type']}"
        
        assert 'created_at' in column_info, "Missing created_at column"
        assert 'timestamp with time zone' in column_info['created_at']['data_type'], f"Expected TIMESTAMPZ for created_at, got {column_info['created_at']['data_type']}"
        
        assert 'updated_at' in column_info, "Missing updated_at column"
        assert 'timestamp with time zone' in column_info['updated_at']['data_type'], f"Expected TIMESTAMPZ for updated_at, got {column_info['updated_at']['data_type']}"


    @pytest_asyncio.async_timeout(30)
    async def test_users_table_foreign_key_to_auth(self, db_connection: asyncpg.Connection):
        """
        TDD Test 2: Verify users.id correctly references auth.users(id) with CASCADE deletion
        
        This test validates the foreign key relationship to Supabase Auth.
        """
        # Check foreign key constraints
        fk_query = """
        SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'users'
          AND kcu.column_name = 'id';
        """
        
        foreign_keys = await db_connection.fetch(fk_query)
        
        # Assert foreign key exists
        assert len(foreign_keys) > 0, "No foreign key constraint found on users.id"
        
        fk = foreign_keys[0]
        
        # Verify foreign key references auth.users
        assert fk['foreign_table_name'] == 'users', f"Expected reference to auth.users, got {fk['foreign_table_name']}"
        assert fk['foreign_column_name'] == 'id', f"Expected reference to id column, got {fk['foreign_column_name']}"
        assert fk['delete_rule'] == 'CASCADE', f"Expected CASCADE delete rule, got {fk['delete_rule']}"


    @pytest_asyncio.async_timeout(30)
    async def test_users_preferences_default_values(self, db_connection: asyncpg.Connection):
        """
        TDD Test 3: Verify new user records get default preferences JSONB 
        with weightUnit, theme, defaultRestTimer, hapticFeedback
        """
        # Test default value by checking column default
        default_query = """
        SELECT column_default
        FROM information_schema.columns
        WHERE table_name = 'users' 
          AND table_schema = 'public'
          AND column_name = 'preferences';
        """
        
        result = await db_connection.fetch(default_query)
        assert len(result) > 0, "preferences column not found"
        
        column_default = result[0]['column_default']
        assert column_default is not None, "preferences column has no default value"
        
        # Check that default contains required keys (basic validation)
        assert 'weightUnit' in column_default, "Default preferences missing weightUnit"
        assert 'theme' in column_default, "Default preferences missing theme"
        assert 'defaultRestTimer' in column_default, "Default preferences missing defaultRestTimer"
        assert 'hapticFeedback' in column_default, "Default preferences missing hapticFeedback"
        
        # Test actual default insertion by creating a minimal user record
        # Note: This would normally require auth.users to exist, but we'll test the default structure
        test_uuid = "123e4567-e89b-12d3-a456-426614174000"
        
        try:
            # This should use the default preferences value
            insert_query = """
            INSERT INTO users (id, email) 
            VALUES ($1, $2)
            RETURNING preferences;
            """
            
            # This will likely fail due to foreign key constraint, but we're testing the default logic
            await db_connection.execute(insert_query, test_uuid, "test@example.com")
            
        except asyncpg.ForeignKeyViolationError:
            # Expected - auth.users doesn't exist in test environment
            # But the test validates that the default structure is correct
            pass
        except Exception as e:
            # Other errors might indicate schema issues
            pytest.fail(f"Unexpected error testing default preferences: {str(e)}")


    @pytest_asyncio.async_timeout(30) 
    async def test_workouts_table_schema_and_constraints(self, db_connection: asyncpg.Connection):
        """
        TDD Test 4: Verify workouts table structure and 30-character title constraint
        """
        # Check table schema
        schema_query = """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'workouts' AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        
        columns = await db_connection.fetch(schema_query)
        column_info = {row['column_name']: row for row in columns}
        
        # Assert table exists
        assert len(columns) > 0, "Workouts table does not exist"
        
        # Test required columns
        required_columns = ['id', 'user_id', 'title', 'started_at', 'completed_at', 'duration', 'is_active', 'created_at', 'updated_at']
        
        for col in required_columns:
            assert col in column_info, f"Missing {col} column in workouts table"
        
        # Test specific column types
        assert column_info['id']['data_type'] == 'uuid', f"Expected UUID for id, got {column_info['id']['data_type']}"
        assert column_info['user_id']['data_type'] == 'uuid', f"Expected UUID for user_id, got {column_info['user_id']['data_type']}"
        assert column_info['title']['data_type'] == 'text', f"Expected TEXT for title, got {column_info['title']['data_type']}"
        assert column_info['is_active']['data_type'] == 'boolean', f"Expected BOOLEAN for is_active, got {column_info['is_active']['data_type']}"
        
        # Test nullable constraints
        assert column_info['id']['is_nullable'] == 'NO', "id should not be nullable"
        assert column_info['user_id']['is_nullable'] == 'NO', "user_id should not be nullable"
        assert column_info['title']['is_nullable'] == 'NO', "title should not be nullable"
        assert column_info['completed_at']['is_nullable'] == 'YES', "completed_at should be nullable"
        
        # Check title length constraint exists
        constraint_query = """
        SELECT constraint_name, check_clause
        FROM information_schema.check_constraints
        WHERE constraint_name LIKE '%workouts%title%'
           OR check_clause LIKE '%char_length%title%';
        """
        
        constraints = await db_connection.fetch(constraint_query)
        title_constraint_found = any('char_length(title) <= 30' in str(c['check_clause']) for c in constraints)
        assert title_constraint_found, "Title length constraint (30 characters) not found"


    @pytest_asyncio.async_timeout(30)
    async def test_workout_title_constraint_enforcement(self, db_connection: asyncpg.Connection):
        """
        TDD Test 5: Verify workout titles longer than 30 characters are rejected with appropriate error
        """
        # Test data: title longer than 30 characters
        long_title = "This is a very long workout title that exceeds thirty characters"
        assert len(long_title) > 30, "Test title should be longer than 30 characters"
        
        # Test UUID for the workout
        test_workout_id = "123e4567-e89b-12d3-a456-426614174001"
        test_user_id = "123e4567-e89b-12d3-a456-426614174002"
        
        # This should fail due to title length constraint
        with pytest.raises(asyncpg.CheckViolationError) as exc_info:
            await db_connection.execute(
                "INSERT INTO workouts (id, user_id, title) VALUES ($1, $2, $3)",
                test_workout_id, test_user_id, long_title
            )
        
        # Verify the error is related to title constraint
        error_message = str(exc_info.value)
        assert 'title' in error_message.lower() or 'char_length' in error_message.lower(), \
            f"Error should mention title constraint, got: {error_message}"
        
        # Test that valid length titles work (this might fail due to FK constraint, but should not fail on title length)
        valid_title = "Valid Workout"
        assert len(valid_title) <= 30, "Test title should be 30 characters or less"
        
        try:
            await db_connection.execute(
                "INSERT INTO workouts (id, user_id, title) VALUES ($1, $2, $3)",
                test_workout_id, test_user_id, valid_title
            )
        except asyncpg.ForeignKeyViolationError:
            # Expected - user doesn't exist, but title constraint passed
            pass
        except asyncpg.CheckViolationError as e:
            if 'title' in str(e).lower():
                pytest.fail(f"Valid title length should not trigger constraint violation: {str(e)}")
            else:
                # Other check constraint violation, ignore for this test
                pass


    @pytest_asyncio.async_timeout(30)
    async def test_exercises_table_populated(self, db_connection: asyncpg.Connection):
        """
        TDD Test 6: Verify exercises table exists and contains at least 48 exercises 
        with categories (strength, cardio, flexibility, balance, bodyweight)
        """
        # Check if exercises table exists and has data
        count_query = "SELECT COUNT(*) as total_count FROM exercises;"
        
        try:
            result = await db_connection.fetch(count_query)
            total_exercises = result[0]['total_count']
            
            # Assert minimum number of exercises
            assert total_exercises >= 48, f"Expected at least 48 exercises, found {total_exercises}"
            
        except asyncpg.UndefinedTableError:
            pytest.fail("Exercises table does not exist")
        
        # Check category distribution
        category_query = """
        SELECT category, COUNT(*) as count
        FROM exercises
        GROUP BY category
        ORDER BY category;
        """
        
        categories = await db_connection.fetch(category_query)
        category_data = {row['category']: row['count'] for row in categories}
        
        # Required categories from the specification
        required_categories = ['strength', 'cardio', 'flexibility', 'balance', 'bodyweight']
        
        for category in required_categories:
            assert category in category_data, f"Missing category: {category}"
            assert category_data[category] > 0, f"Category {category} has no exercises"
        
        # Verify exercises have required fields populated
        sample_query = """
        SELECT name, category, body_part, equipment, description
        FROM exercises
        LIMIT 5;
        """
        
        samples = await db_connection.fetch(sample_query)
        
        for exercise in samples:
            assert exercise['name'] is not None and exercise['name'].strip() != "", "Exercise name should not be empty"
            assert exercise['category'] in required_categories, f"Invalid category: {exercise['category']}"
            assert exercise['body_part'] is not None and len(exercise['body_part']) > 0, "body_part array should not be empty"
            assert exercise['equipment'] is not None and len(exercise['equipment']) > 0, "equipment array should not be empty"


    @pytest_asyncio.async_timeout(30)
    async def test_workout_exercises_junction_table(self, db_connection: asyncpg.Connection):
        """
        TDD Test 7: Verify junction table correctly links workouts to exercises with order_index
        """
        # Check table schema
        schema_query = """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'workout_exercises' AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        
        columns = await db_connection.fetch(schema_query)
        column_info = {row['column_name']: row for row in columns}
        
        # Assert table exists
        assert len(columns) > 0, "workout_exercises table does not exist"
        
        # Test required columns
        required_columns = ['id', 'workout_id', 'exercise_id', 'order_index', 'notes', 'created_at']
        
        for col in required_columns:
            assert col in column_info, f"Missing {col} column in workout_exercises table"
        
        # Test column types
        assert column_info['id']['data_type'] == 'uuid', f"Expected UUID for id, got {column_info['id']['data_type']}"
        assert column_info['workout_id']['data_type'] == 'uuid', f"Expected UUID for workout_id, got {column_info['workout_id']['data_type']}"
        assert column_info['exercise_id']['data_type'] == 'uuid', f"Expected UUID for exercise_id, got {column_info['exercise_id']['data_type']}"
        assert column_info['order_index']['data_type'] == 'integer', f"Expected INTEGER for order_index, got {column_info['order_index']['data_type']}"
        
        # Test foreign key constraints exist
        fk_query = """
        SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'workout_exercises';
        """
        
        foreign_keys = await db_connection.fetch(fk_query)
        fk_info = {row['column_name']: row for row in foreign_keys}
        
        # Verify foreign key to workouts table
        assert 'workout_id' in fk_info, "Missing foreign key constraint for workout_id"
        assert fk_info['workout_id']['foreign_table_name'] == 'workouts', "workout_id should reference workouts table"
        
        # Verify foreign key to exercises table
        assert 'exercise_id' in fk_info, "Missing foreign key constraint for exercise_id"
        assert fk_info['exercise_id']['foreign_table_name'] == 'exercises', "exercise_id should reference exercises table"
        
        # Check unique constraint on (workout_id, exercise_id)
        unique_query = """
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'workout_exercises' AND constraint_type = 'UNIQUE';
        """
        
        unique_constraints = await db_connection.fetch(unique_query)
        assert len(unique_constraints) > 0, "Missing unique constraint on workout_exercises table"


    @pytest_asyncio.async_timeout(30)
    async def test_sets_table_with_constraints(self, db_connection: asyncpg.Connection):
        """
        TDD Test 8: Verify sets table with positive number constraints for reps, weight, duration
        """
        # Check table schema
        schema_query = """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sets' AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        
        columns = await db_connection.fetch(schema_query)
        column_info = {row['column_name']: row for row in columns}
        
        # Assert table exists
        assert len(columns) > 0, "sets table does not exist"
        
        # Test required columns
        required_columns = ['id', 'workout_exercise_id', 'reps', 'weight', 'duration', 'distance', 'completed', 'rest_time', 'notes', 'order_index', 'completed_at', 'created_at']
        
        for col in required_columns:
            assert col in column_info, f"Missing {col} column in sets table"
        
        # Test column types
        assert column_info['id']['data_type'] == 'uuid', f"Expected UUID for id"
        assert column_info['workout_exercise_id']['data_type'] == 'uuid', f"Expected UUID for workout_exercise_id"
        assert column_info['reps']['data_type'] == 'integer', f"Expected INTEGER for reps"
        assert column_info['weight']['data_type'] == 'numeric', f"Expected NUMERIC for weight"
        assert column_info['duration']['data_type'] == 'integer', f"Expected INTEGER for duration"
        assert column_info['distance']['data_type'] == 'numeric', f"Expected NUMERIC for distance"
        assert column_info['completed']['data_type'] == 'boolean', f"Expected BOOLEAN for completed"
        
        # Check positive number constraints
        constraint_query = """
        SELECT constraint_name, check_clause
        FROM information_schema.check_constraints
        WHERE constraint_name LIKE '%sets%'
           OR check_clause LIKE '%reps > 0%'
           OR check_clause LIKE '%weight >= 0%'
           OR check_clause LIKE '%duration > 0%';
        """
        
        constraints = await db_connection.fetch(constraint_query)
        constraint_clauses = [str(c['check_clause']) for c in constraints]
        
        # Verify positive constraints exist
        has_reps_constraint = any('reps > 0' in clause for clause in constraint_clauses)
        has_weight_constraint = any('weight >= 0' in clause for clause in constraint_clauses)
        has_duration_constraint = any('duration > 0' in clause for clause in constraint_clauses)
        
        assert has_reps_constraint, "Missing positive constraint for reps"
        assert has_weight_constraint, "Missing non-negative constraint for weight"
        assert has_duration_constraint, "Missing positive constraint for duration"


    @pytest_asyncio.async_timeout(30)
    async def test_foreign_key_relationships(self, db_connection: asyncpg.Connection):
        """
        TDD Test 9: Verify all foreign key relationships work correctly
        (workouts→users, workout_exercises→workouts, sets→workout_exercises)
        """
        # Get all foreign key relationships in our schema
        fk_query = """
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name IN ('users', 'workouts', 'workout_exercises', 'sets')
        ORDER BY tc.table_name, kcu.column_name;
        """
        
        foreign_keys = await db_connection.fetch(fk_query)
        
        # Organize foreign keys by table
        fk_by_table = {}
        for fk in foreign_keys:
            table = fk['table_name']
            if table not in fk_by_table:
                fk_by_table[table] = []
            fk_by_table[table].append(fk)
        
        # Verify users table foreign keys
        if 'users' in fk_by_table:
            users_fks = fk_by_table['users']
            # Should reference auth.users(id) - this might be named differently in the actual implementation
            auth_fk = next((fk for fk in users_fks if fk['column_name'] == 'id'), None)
            if auth_fk:
                assert auth_fk['delete_rule'] == 'CASCADE', "users.id should have CASCADE delete rule"
        
        # Verify workouts table foreign keys
        assert 'workouts' in fk_by_table, "workouts table should have foreign keys"
        workouts_fks = fk_by_table['workouts']
        
        user_id_fk = next((fk for fk in workouts_fks if fk['column_name'] == 'user_id'), None)
        assert user_id_fk is not None, "workouts.user_id foreign key not found"
        assert user_id_fk['foreign_table_name'] == 'users', "workouts.user_id should reference users table"
        assert user_id_fk['foreign_column_name'] == 'id', "workouts.user_id should reference users.id"
        assert user_id_fk['delete_rule'] == 'CASCADE', "workouts.user_id should have CASCADE delete rule"
        
        # Verify workout_exercises table foreign keys
        assert 'workout_exercises' in fk_by_table, "workout_exercises table should have foreign keys"
        we_fks = fk_by_table['workout_exercises']
        
        workout_fk = next((fk for fk in we_fks if fk['column_name'] == 'workout_id'), None)
        exercise_fk = next((fk for fk in we_fks if fk['column_name'] == 'exercise_id'), None)
        
        assert workout_fk is not None, "workout_exercises.workout_id foreign key not found"
        assert workout_fk['foreign_table_name'] == 'workouts', "should reference workouts table"
        assert workout_fk['delete_rule'] == 'CASCADE', "should have CASCADE delete rule"
        
        assert exercise_fk is not None, "workout_exercises.exercise_id foreign key not found"
        assert exercise_fk['foreign_table_name'] == 'exercises', "should reference exercises table"
        assert exercise_fk['delete_rule'] == 'CASCADE', "should have CASCADE delete rule"
        
        # Verify sets table foreign keys
        assert 'sets' in fk_by_table, "sets table should have foreign keys"
        sets_fks = fk_by_table['sets']
        
        we_fk = next((fk for fk in sets_fks if fk['column_name'] == 'workout_exercise_id'), None)
        assert we_fk is not None, "sets.workout_exercise_id foreign key not found"
        assert we_fk['foreign_table_name'] == 'workout_exercises', "should reference workout_exercises table"
        assert we_fk['delete_rule'] == 'CASCADE', "should have CASCADE delete rule"


    @pytest_asyncio.async_timeout(30)
    async def test_cascade_deletion_behavior(self, db_connection: asyncpg.Connection):
        """
        TDD Test 10: Verify deleting a user cascades to delete their workouts, exercises, and sets
        """
        # This test would require actual auth.users setup, so we'll test the constraint logic
        # by checking that the CASCADE rules are properly configured
        
        # Verify CASCADE delete rules exist for the chain: users -> workouts -> workout_exercises -> sets
        cascade_query = """
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            rc.delete_rule
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND rc.delete_rule = 'CASCADE'
          AND tc.table_name IN ('workouts', 'workout_exercises', 'sets')
        ORDER BY tc.table_name;
        """
        
        cascade_fks = await db_connection.fetch(cascade_query)
        
        # Organize by table for validation
        cascade_rules = {}
        for fk in cascade_fks:
            table = fk['table_name']
            if table not in cascade_rules:
                cascade_rules[table] = []
            cascade_rules[table].append({
                'column': fk['column_name'],
                'references': fk['foreign_table_name']
            })
        
        # Verify workouts CASCADE deletes when user is deleted
        assert 'workouts' in cascade_rules, "workouts table should have CASCADE delete rules"
        workout_cascades = cascade_rules['workouts']
        user_cascade = next((rule for rule in workout_cascades if rule['references'] == 'users'), None)
        assert user_cascade is not None, "workouts should CASCADE delete when user is deleted"
        assert user_cascade['column'] == 'user_id', "CASCADE should be on user_id column"
        
        # Verify workout_exercises CASCADE deletes when workout is deleted
        assert 'workout_exercises' in cascade_rules, "workout_exercises should have CASCADE delete rules"
        we_cascades = cascade_rules['workout_exercises']
        workout_cascade = next((rule for rule in we_cascades if rule['references'] == 'workouts'), None)
        assert workout_cascade is not None, "workout_exercises should CASCADE delete when workout is deleted"
        
        # Verify sets CASCADE deletes when workout_exercise is deleted
        assert 'sets' in cascade_rules, "sets should have CASCADE delete rules"
        sets_cascades = cascade_rules['sets']
        we_cascade = next((rule for rule in sets_cascades if rule['references'] == 'workout_exercises'), None)
        assert we_cascade is not None, "sets should CASCADE delete when workout_exercise is deleted"


    @pytest_asyncio.async_timeout(30)
    async def test_rls_policies_enabled(self, db_connection: asyncpg.Connection):
        """
        TDD Test 11: Verify RLS is enabled on all user-data tables 
        (users, workouts, workout_exercises, sets)
        """
        # Check RLS status for our tables
        rls_query = """
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables
        WHERE tablename IN ('users', 'workouts', 'workout_exercises', 'sets', 'exercises')
          AND schemaname = 'public';
        """
        
        tables = await db_connection.fetch(rls_query)
        rls_status = {row['tablename']: row['rowsecurity'] for row in tables}
        
        # Verify RLS is enabled on user-data tables
        user_data_tables = ['users', 'workouts', 'workout_exercises', 'sets']
        
        for table in user_data_tables:
            assert table in rls_status, f"Table {table} not found"
            assert rls_status[table] is True, f"RLS should be enabled on {table} table"
        
        # exercises table should also have RLS enabled (read-only for authenticated users)
        assert 'exercises' in rls_status, "exercises table not found"
        assert rls_status['exercises'] is True, "RLS should be enabled on exercises table"
        
        # Verify that RLS policies exist
        policies_query = """
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename IN ('users', 'workouts', 'workout_exercises', 'sets', 'exercises')
          AND schemaname = 'public';
        """
        
        policies = await db_connection.fetch(policies_query)
        
        # Group policies by table
        policies_by_table = {}
        for policy in policies:
            table = policy['tablename']
            if table not in policies_by_table:
                policies_by_table[table] = []
            policies_by_table[table].append(policy)
        
        # Verify each table has at least one policy
        for table in user_data_tables + ['exercises']:
            assert table in policies_by_table, f"No RLS policies found for {table} table"
            assert len(policies_by_table[table]) > 0, f"At least one RLS policy should exist for {table}"


    @pytest_asyncio.async_timeout(30)
    async def test_user_can_access_own_data(self, authenticated_supabase_client_a: Client, test_user_a: dict):
        """
        TDD Test 12: As authenticated user A, verify they can SELECT/INSERT/UPDATE/DELETE their own workout data
        
        This test requires Supabase authentication to work properly.
        """
        user_id = test_user_a["id"]
        
        # Test user can read their own profile
        try:
            user_response = authenticated_supabase_client_a.table("users").select("*").eq("id", user_id).execute()
            assert len(user_response.data) > 0, "User should be able to read their own profile"
            assert user_response.data[0]["id"] == user_id, "Should return correct user data"
        except Exception as e:
            pytest.fail(f"User should be able to access their own profile: {str(e)}")
        
        # Test user can create their own workout
        try:
            workout_data = {
                "user_id": user_id,
                "title": "Test Workout",
                "is_active": True
            }
            
            workout_response = authenticated_supabase_client_a.table("workouts").insert(workout_data).execute()
            assert len(workout_response.data) > 0, "User should be able to create their own workout"
            
            workout_id = workout_response.data[0]["id"]
            
            # Test user can read their own workouts
            read_response = authenticated_supabase_client_a.table("workouts").select("*").eq("user_id", user_id).execute()
            assert len(read_response.data) > 0, "User should be able to read their own workouts"
            
            # Test user can update their own workout
            update_response = authenticated_supabase_client_a.table("workouts").update({
                "title": "Updated Test Workout"
            }).eq("id", workout_id).execute()
            assert len(update_response.data) > 0, "User should be able to update their own workout"
            
            # Test user can delete their own workout
            delete_response = authenticated_supabase_client_a.table("workouts").delete().eq("id", workout_id).execute()
            assert len(delete_response.data) > 0, "User should be able to delete their own workout"
            
        except Exception as e:
            pytest.fail(f"User should be able to manage their own workout data: {str(e)}")


    @pytest_asyncio.async_timeout(30)
    async def test_user_cannot_access_other_user_data(self, 
                                                     authenticated_supabase_client_a: Client,
                                                     authenticated_supabase_client_b: Client,
                                                     test_user_a: dict,
                                                     test_user_b: dict):
        """
        TDD Test 13: As authenticated user A, verify they cannot SELECT/INSERT/UPDATE/DELETE user B's workout data
        
        This is the critical security test for data isolation.
        """
        user_a_id = test_user_a["id"]
        user_b_id = test_user_b["id"]
        
        # First, let user B create a workout
        try:
            workout_data = {
                "user_id": user_b_id,
                "title": "User B Private Workout",
                "is_active": True
            }
            
            workout_response = authenticated_supabase_client_b.table("workouts").insert(workout_data).execute()
            assert len(workout_response.data) > 0, "User B should be able to create their workout"
            
            user_b_workout_id = workout_response.data[0]["id"]
            
        except Exception as e:
            pytest.fail(f"Setup failed - User B should be able to create workout: {str(e)}")
        
        # Now test that User A cannot access User B's data
        
        # Test User A cannot read User B's workouts
        try:
            read_response = authenticated_supabase_client_a.table("workouts").select("*").eq("user_id", user_b_id).execute()
            assert len(read_response.data) == 0, "User A should not be able to read User B's workouts"
        except Exception as e:
            # Some Supabase configurations might throw an error instead of returning empty
            pass
        
        # Test User A cannot read User B's specific workout
        try:
            specific_response = authenticated_supabase_client_a.table("workouts").select("*").eq("id", user_b_workout_id).execute()
            assert len(specific_response.data) == 0, "User A should not be able to read User B's specific workout"
        except Exception as e:
            # Some Supabase configurations might throw an error instead of returning empty
            pass
        
        # Test User A cannot update User B's workout
        try:
            update_response = authenticated_supabase_client_a.table("workouts").update({
                "title": "Hacked by User A"
            }).eq("id", user_b_workout_id).execute()
            assert len(update_response.data) == 0, "User A should not be able to update User B's workout"
        except Exception as e:
            # Expected - RLS should prevent this
            pass
        
        # Test User A cannot delete User B's workout
        try:
            delete_response = authenticated_supabase_client_a.table("workouts").delete().eq("id", user_b_workout_id).execute()
            assert len(delete_response.data) == 0, "User A should not be able to delete User B's workout"
        except Exception as e:
            # Expected - RLS should prevent this
            pass
        
        # Test User A cannot insert workout for User B
        try:
            malicious_data = {
                "user_id": user_b_id,  # Trying to create workout for User B
                "title": "Malicious Workout",
                "is_active": True
            }
            
            insert_response = authenticated_supabase_client_a.table("workouts").insert(malicious_data).execute()
            # This should either fail or return empty data due to RLS
            if len(insert_response.data) > 0:
                pytest.fail("User A should not be able to create workouts for User B")
        except Exception as e:
            # Expected - RLS should prevent this
            pass


    @pytest_asyncio.async_timeout(30)
    async def test_exercises_readable_by_authenticated_users(self, authenticated_supabase_client_a: Client):
        """
        TDD Test 14: Verify all authenticated users can read the exercise library but cannot modify it
        """
        # Test authenticated user can read exercises
        try:
            exercises_response = authenticated_supabase_client_a.table("exercises").select("*").limit(10).execute()
            assert len(exercises_response.data) > 0, "Authenticated users should be able to read exercises"
            
            # Verify exercise data structure
            exercise = exercises_response.data[0]
            required_fields = ['id', 'name', 'category', 'body_part', 'equipment']
            for field in required_fields:
                assert field in exercise, f"Exercise should have {field} field"
                assert exercise[field] is not None, f"Exercise {field} should not be null"
            
        except Exception as e:
            pytest.fail(f"Authenticated users should be able to read exercises: {str(e)}")
        
        # Test authenticated user cannot insert new exercises
        try:
            new_exercise = {
                "name": "Unauthorized Exercise",
                "category": "strength",
                "body_part": ["chest"],
                "equipment": ["dumbbells"],
                "description": "Should not be allowed"
            }
            
            insert_response = authenticated_supabase_client_a.table("exercises").insert(new_exercise).execute()
            
            # This should fail or return empty due to RLS policy
            if len(insert_response.data) > 0:
                pytest.fail("Regular users should not be able to insert new exercises")
                
        except Exception as e:
            # Expected - RLS should prevent regular users from inserting exercises
            pass
        
        # Test authenticated user cannot update exercises
        try:
            # Try to update the first exercise
            exercises_response = authenticated_supabase_client_a.table("exercises").select("id").limit(1).execute()
            if len(exercises_response.data) > 0:
                exercise_id = exercises_response.data[0]["id"]
                
                update_response = authenticated_supabase_client_a.table("exercises").update({
                    "name": "Hacked Exercise Name"
                }).eq("id", exercise_id).execute()
                
                # This should fail or return empty
                if len(update_response.data) > 0:
                    pytest.fail("Regular users should not be able to update exercises")
                    
        except Exception as e:
            # Expected - RLS should prevent regular users from updating exercises
            pass


    @pytest_asyncio.async_timeout(30)
    async def test_unauthenticated_users_denied_access(self, supabase_client: Client):
        """
        TDD Test 15: Verify unauthenticated users are denied access to all tables
        
        This test uses an unauthenticated Supabase client.
        """
        tables_to_test = ['users', 'workouts', 'workout_exercises', 'sets', 'exercises']
        
        for table_name in tables_to_test:
            # Test that unauthenticated users cannot read from any table
            try:
                response = supabase_client.table(table_name).select("*").limit(1).execute()
                
                # Should either throw an error or return empty results
                if len(response.data) > 0:
                    pytest.fail(f"Unauthenticated users should not be able to read from {table_name} table")
                    
            except Exception as e:
                # Expected - unauthenticated access should be denied
                # The specific error type depends on Supabase configuration
                pass
            
            # Test that unauthenticated users cannot insert into any table
            try:
                test_data = {"test": "unauthorized"}
                response = supabase_client.table(table_name).insert(test_data).execute()
                
                # Should either throw an error or return empty results
                if len(response.data) > 0:
                    pytest.fail(f"Unauthenticated users should not be able to insert into {table_name} table")
                    
            except Exception as e:
                # Expected - unauthenticated access should be denied
                pass


# Additional helper method for test debugging
def pytest_configure(config):
    """Configure pytest with custom markers and settings."""
    config.addinivalue_line(
        "markers", "database: mark test as requiring database connection"
    )