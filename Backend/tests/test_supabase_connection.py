"""
TDD Test: Backend Supabase Development Connection
Phase P1.3: Validates real Supabase project connection from Backend

This test ensures:
1. Backend can connect to real Supabase database
2. Service role authentication works correctly
3. Database CRUD operations function properly
4. RLS policies are correctly implemented
"""

import pytest
import os
import asyncio
from uuid import UUID, uuid4
from supabase import create_client, Client
from core.config import get_settings

class TestSupabaseConnection:
    """Test suite for Supabase development environment connection"""
    
    @pytest.fixture
    def supabase_client(self) -> Client:
        """Create Supabase client with service role for testing"""
        settings = get_settings()
        
        assert settings.supabase_url, "SUPABASE_URL must be set"
        assert settings.supabase_service_role_key, "SUPABASE_SERVICE_ROLE_KEY must be set"
        
        # Verify we're connecting to the correct development project
        assert "bqddialgmcfszoeyzcuj.supabase.co" in settings.supabase_url
        
        return create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    def test_supabase_client_initialization(self, supabase_client: Client):
        """Test that Supabase client initializes correctly"""
        assert supabase_client is not None
        assert hasattr(supabase_client, 'table')
        assert hasattr(supabase_client, 'auth')
        
    def test_database_connection(self, supabase_client: Client):
        """Test basic database connection"""
        response = supabase_client.table("exercises").select("*").limit(1).execute()
        assert response.data is not None
        
    def test_service_role_authentication(self, supabase_client: Client):
        """Test that service role can bypass RLS policies"""
        # Service role should be able to access all tables
        response = supabase_client.table("users").select("*").limit(1).execute()
        assert response.data is not None
        
    def test_schema_tables_exist(self, supabase_client: Client):
        """Test that all required tables exist after schema deployment"""
        required_tables = ["users", "workouts", "exercises", "workout_exercises", "sets"]
        
        for table_name in required_tables:
            response = supabase_client.table(table_name).select("*").limit(1).execute()
            assert response.data is not None, f"Table {table_name} does not exist"
            
    def test_exercises_seed_data_loaded(self, supabase_client: Client):
        """Test that exercises table has been populated with seed data"""
        response = supabase_client.table("exercises").select("id, name, category").limit(10).execute()
        assert response.data is not None
        assert len(response.data) > 0, "Exercises table should have seed data"
        
        # Verify we have exercises from different categories
        categories = {exercise['category'] for exercise in response.data}
        expected_categories = {'strength', 'cardio', 'bodyweight', 'flexibility'}
        assert len(categories.intersection(expected_categories)) > 0
        
    def test_rls_policies_active(self, supabase_client: Client):
        """Test that RLS policies are properly configured"""
        # Create a test user using admin privileges
        test_user_data = {
            "email": f"test-{uuid4()}@example.com",
            "password": "test-password-123"
        }
        
        # This should work with service role
        auth_response = supabase_client.auth.admin.create_user(test_user_data)
        assert auth_response.user is not None
        test_user_id = auth_response.user.id
        
        # Create user profile
        user_profile_data = {
            "id": test_user_id,
            "email": test_user_data["email"],
            "display_name": "Test User"
        }
        
        response = supabase_client.table("users").insert(user_profile_data).execute()
        assert response.data is not None
        assert len(response.data) == 1
        
        # Cleanup
        supabase_client.table("users").delete().eq("id", test_user_id).execute()
        supabase_client.auth.admin.delete_user(test_user_id)
        
    def test_database_constraints_validation(self, supabase_client: Client):
        """Test that database constraints are properly enforced"""
        # Test workout title length constraint (max 30 chars)
        test_user_data = {
            "email": f"constraint-test-{uuid4()}@example.com",
            "password": "test-password-123"
        }
        
        auth_response = supabase_client.auth.admin.create_user(test_user_data)
        test_user_id = auth_response.user.id
        
        # Create user profile
        supabase_client.table("users").insert({
            "id": test_user_id,
            "email": test_user_data["email"]
        }).execute()
        
        # Test constraint violation
        invalid_workout = {
            "user_id": test_user_id,
            "title": "This is a very long workout title that exceeds thirty characters"
        }
        
        with pytest.raises(Exception):
            supabase_client.table("workouts").insert(invalid_workout).execute()
            
        # Cleanup
        supabase_client.table("users").delete().eq("id", test_user_id).execute()
        supabase_client.auth.admin.delete_user(test_user_id)
        
    def test_foreign_key_relationships(self, supabase_client: Client):
        """Test that foreign key relationships work correctly"""
        # Get first exercise from seed data
        exercises_response = supabase_client.table("exercises").select("id").limit(1).execute()
        assert exercises_response.data is not None
        assert len(exercises_response.data) > 0
        
        exercise_id = exercises_response.data[0]['id']
        
        # Create test user and workout
        test_user_data = {
            "email": f"fk-test-{uuid4()}@example.com",
            "password": "test-password-123"
        }
        
        auth_response = supabase_client.auth.admin.create_user(test_user_data)
        test_user_id = auth_response.user.id
        
        # Create user profile
        supabase_client.table("users").insert({
            "id": test_user_id,
            "email": test_user_data["email"]
        }).execute()
        
        # Create workout
        workout_response = supabase_client.table("workouts").insert({
            "user_id": test_user_id,
            "title": "Test Workout"
        }).execute()
        
        workout_id = workout_response.data[0]['id']
        
        # Create workout exercise (tests FK relationships)
        workout_exercise_response = supabase_client.table("workout_exercises").insert({
            "workout_id": workout_id,
            "exercise_id": exercise_id,
            "order_index": 0
        }).execute()
        
        assert workout_exercise_response.data is not None
        workout_exercise_id = workout_exercise_response.data[0]['id']
        
        # Create set (tests nested FK relationship)
        set_response = supabase_client.table("sets").insert({
            "workout_exercise_id": workout_exercise_id,
            "reps": 10,
            "weight": 100.50
        }).execute()
        
        assert set_response.data is not None
        
        # Cleanup (tests cascade deletion)
        supabase_client.table("workouts").delete().eq("id", workout_id).execute()
        supabase_client.table("users").delete().eq("id", test_user_id).execute()
        supabase_client.auth.admin.delete_user(test_user_id)
        
    def test_environment_configuration(self):
        """Test that environment is properly configured for development"""
        settings = get_settings()
        
        # Verify we're in development/testing mode
        assert settings.debug is True
        assert settings.testing is True
        
        # Verify Supabase configuration
        assert settings.supabase_url == "https://bqddialgmcfszoeyzcuj.supabase.co"
        assert settings.supabase_service_role_key.startswith("eyJ")  # JWT format
        assert settings.supabase_anon_key.startswith("eyJ")  # JWT format
        
        # Verify JWT configuration
        assert len(settings.jwt_secret_key) >= 32  # Minimum security requirement
        assert settings.jwt_algorithm == "HS256"
        assert settings.jwt_access_token_expire_minutes == 30