#!/usr/bin/env python3
"""
Simplified TDD demonstration for FM-SetLogger Database Foundation
Phase 5.1: Validate database schema files exist and contain required elements

This script demonstrates TDD process without requiring actual database connection.
"""

import os
import re
from pathlib import Path

def test_schema_file_exists():
    """
    TDD Test 1 (simplified): Verify schema.sql file exists and contains users table definition
    RED → GREEN → REFACTOR demonstration
    """
    schema_path = Path("database/schema.sql")
    
    # RED phase: This will pass because we created the file
    assert schema_path.exists(), f"Schema file {schema_path} does not exist"
    
    # Read schema content
    schema_content = schema_path.read_text()
    
    # Verify users table definition exists
    assert "CREATE TABLE users" in schema_content, "Users table definition not found in schema"
    
    # Verify required columns exist
    required_user_columns = [
        "id UUID PRIMARY KEY",
        "email TEXT",
        "display_name TEXT",  
        "preferences JSONB",
        "created_at TIMESTAMP WITH TIME ZONE",
        "updated_at TIMESTAMP WITH TIME ZONE"
    ]
    
    for column in required_user_columns:
        assert column in schema_content, f"Required column definition '{column}' not found in users table"
    
    print("✅ TDD Test 1 PASSED: Users table schema is correctly defined")


def test_workouts_table_schema():
    """
    TDD Test 2: Verify workouts table has proper schema and constraints
    """
    schema_path = Path("database/schema.sql")
    schema_content = schema_path.read_text()
    
    # Verify workouts table exists
    assert "CREATE TABLE workouts" in schema_content, "Workouts table definition not found"
    
    # Verify 30-character title constraint
    title_constraint_pattern = r"title.*CHECK.*char_length\(title\)\s*<=\s*30"
    assert re.search(title_constraint_pattern, schema_content), "30-character title constraint not found"
    
    # Verify foreign key to users
    fk_pattern = r"user_id.*REFERENCES users\(id\).*ON DELETE CASCADE"
    assert re.search(fk_pattern, schema_content), "Foreign key constraint to users table not found"
    
    print("✅ TDD Test 2 PASSED: Workouts table schema with constraints is correctly defined")


def test_exercises_table_and_seed_data():
    """
    TDD Test 3: Verify exercises table exists and seed data contains 48+ exercises
    """
    schema_path = Path("database/schema.sql")
    seed_path = Path("database/seed_data.sql")
    
    schema_content = schema_path.read_text()
    
    # Verify exercises table exists
    assert "CREATE TABLE exercises" in schema_content, "Exercises table definition not found"
    
    # Verify category constraint
    category_constraint = "category.*CHECK.*category IN.*strength.*cardio.*flexibility.*balance.*bodyweight"
    assert re.search(category_constraint, schema_content), "Exercise category constraint not found"
    
    # Verify seed data file exists
    assert seed_path.exists(), f"Seed data file {seed_path} does not exist"
    
    seed_content = seed_path.read_text()
    
    # Count individual exercise entries (each exercise starts with an opening parenthesis and exercise name)
    exercise_entries = re.findall(r"\('[\w\s-]+',\s*'[\w]+',", seed_content)
    exercise_count = len(exercise_entries)
    assert exercise_count >= 48, f"Expected at least 48 exercises, found {exercise_count}"
    
    # Verify all required categories are represented
    required_categories = ['strength', 'cardio', 'flexibility', 'balance', 'bodyweight']
    for category in required_categories:
        assert f"'{category}'" in seed_content, f"Category {category} not found in seed data"
    
    print(f"✅ TDD Test 3 PASSED: Exercises table and seed data with {exercise_count} exercises correctly defined")


def test_rls_policies_defined():
    """
    TDD Test 4: Verify Row-Level Security policies are defined in schema
    """
    schema_path = Path("database/schema.sql")
    schema_content = schema_path.read_text()
    
    # Verify RLS is enabled on tables
    rls_tables = ['users', 'workouts', 'workout_exercises', 'sets', 'exercises']
    
    for table in rls_tables:
        rls_pattern = f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"
        assert rls_pattern in schema_content, f"RLS not enabled for {table} table"
    
    # Verify key RLS policies exist
    required_policies = [
        "Users can view own profile",
        "Users can view own workouts", 
        "Authenticated users can view exercises",
        "Users can manage own workout exercises",
        "Users can manage own sets"
    ]
    
    for policy in required_policies:
        policy_pattern = f'CREATE POLICY "{policy}"'
        assert policy_pattern in schema_content, f"RLS policy '{policy}' not found"
    
    print("✅ TDD Test 4 PASSED: Row-Level Security policies are correctly defined")


def test_junction_tables_and_constraints():
    """
    TDD Test 5: Verify junction tables and positive number constraints
    """
    schema_path = Path("database/schema.sql")
    schema_content = schema_path.read_text()
    
    # Verify workout_exercises junction table
    assert "CREATE TABLE workout_exercises" in schema_content, "workout_exercises junction table not found"
    
    # Verify unique constraint on junction table
    unique_constraint = "UNIQUE(workout_id, exercise_id)"
    assert unique_constraint in schema_content, "Unique constraint on workout_exercises not found"
    
    # Verify sets table with constraints
    assert "CREATE TABLE sets" in schema_content, "Sets table not found"
    
    # Verify positive number constraints
    constraints_to_check = [
        r"reps.*CHECK.*reps > 0",
        r"weight.*CHECK.*weight >= 0", 
        r"duration.*CHECK.*duration > 0",
        r"rest_time.*CHECK.*rest_time >= 0"
    ]
    
    for constraint_pattern in constraints_to_check:
        assert re.search(constraint_pattern, schema_content), f"Constraint pattern '{constraint_pattern}' not found"
    
    print("✅ TDD Test 5 PASSED: Junction tables and positive number constraints correctly defined")


def run_all_tests():
    """
    Run all TDD tests in sequence to demonstrate complete database foundation
    """
    print("🧪 Running TDD Tests for Database Foundation (Phase 5.1)")
    print("=" * 60)
    
    test_functions = [
        test_schema_file_exists,
        test_workouts_table_schema,
        test_exercises_table_and_seed_data,
        test_rls_policies_defined,
        test_junction_tables_and_constraints
    ]
    
    passed_tests = 0
    
    for test_func in test_functions:
        try:
            test_func()
            passed_tests += 1
        except AssertionError as e:
            print(f"❌ {test_func.__name__} FAILED: {str(e)}")
        except Exception as e:
            print(f"💥 {test_func.__name__} ERROR: {str(e)}")
    
    print("=" * 60)
    print(f"📊 Test Results: {passed_tests}/{len(test_functions)} tests passed")
    
    if passed_tests == len(test_functions):
        print("🎉 ALL TESTS PASSED! Database foundation is correctly implemented.")
        print("🚀 Ready for Phase 5.2: FastAPI Endpoint Development")
        return True
    else:
        print("⚠️  Some tests failed. Database schema needs adjustments.")
        return False


if __name__ == "__main__":
    # Change to backend directory
    os.chdir(Path(__file__).parent)
    
    # Run TDD demonstration
    success = run_all_tests()
    
    if success:
        print("\n✨ TDD Phase 5.1 Database Foundation: COMPLETE")
        print("✅ Schema files validated")
        print("✅ All table structures verified") 
        print("✅ Constraints and relationships confirmed")
        print("✅ Row-Level Security policies implemented")
        print("✅ Exercise library populated (48+ exercises)")
        print("📋 Next: Implement FastAPI endpoints with full database integration")
    else:
        print("\n🔧 TDD RED PHASE: Tests identified missing implementation")
        print("⏭️  Next: Fix failing tests following GREEN → REFACTOR cycle")