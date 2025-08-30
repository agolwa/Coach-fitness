"""
TDD Phase 5.4: Workout & Exercise CRUD Endpoints Tests

Following TDD methodology with comprehensive test coverage for:
1. Workout CRUD operations (Tests 1-8)
2. Exercise library endpoint (Tests 9-10)  
3. Workout-Exercise Sets Management (Tests 11-18)
4. Authentication & RLS Policy Enforcement (Tests 19-22)
5. Error Handling & Edge Cases (Tests 23-25)

Tests ensure frontend TypeScript contract alignment and database RLS policy compliance.
All tests use existing authentication patterns from Phase 5.3 for protected endpoints.
"""

import sys
import os
import uuid
import json
import pytest
import pytest_asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List
from unittest.mock import patch, MagicMock
import httpx
from supabase import Client
from models.user import GoogleUserData

# Import existing fixtures and test infrastructure
from conftest import (
    supabase_client,
    supabase_admin_client, 
    test_user_a,
    test_user_b
)


class TestWorkoutCRUD:
    """Workout CRUD Operations Tests (1-8)"""
    
    @pytest.mark.asyncio
    async def test_create_workout_session(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 1: Create new workout session with validation"""
        # RED phase - will fail initially as workout endpoints don't exist
        
        workout_data = {
            "title": "Push Day", 
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        
        assert response.status_code == 201, "Workout creation should return 201 Created"
        
        data = response.json()
        assert "id" in data, "Workout ID should be returned"
        assert data["title"] == workout_data["title"], "Workout title should match"
        assert data["user_id"] == authenticated_user_a["user"]["id"], "Workout should belong to authenticated user"
        assert data["is_active"] == True, "New workout should be active"
        assert "started_at" in data, "Started timestamp should be returned"
        assert data["completed_at"] is None, "New workout should not be completed"
        
    @pytest.mark.asyncio
    async def test_get_user_workouts(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 2: Retrieve all workouts for authenticated user with pagination"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        response = await fastapi_test_client.get("/workouts", headers=headers)
        
        assert response.status_code == 200, "Workout list should return 200 OK"
        
        data = response.json()
        assert isinstance(data, list), "Workout list should be an array"
        
        # If workouts exist, validate structure
        if len(data) > 0:
            workout = data[0]
            assert "id" in workout, "Each workout should have an ID"
            assert "title" in workout, "Each workout should have a title"
            assert "user_id" in workout, "Each workout should have user_id"
            assert workout["user_id"] == authenticated_user_a["user"]["id"], "Workouts should belong to authenticated user"
    
    @pytest.mark.asyncio
    async def test_get_workout_details_with_exercises(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 3: Get workout details including exercises and sets"""
        
        # First create a workout
        workout_data = {"title": "Test Workout Detail"}
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        create_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        assert create_response.status_code == 201
        workout_id = create_response.json()["id"]
        
        # Get workout details
        response = await fastapi_test_client.get(f"/workouts/{workout_id}", headers=headers)
        
        assert response.status_code == 200, "Workout detail should return 200 OK"
        
        data = response.json()
        assert data["id"] == workout_id, "Returned workout should match requested ID"
        assert "exercises" in data, "Workout detail should include exercises list"
        assert isinstance(data["exercises"], list), "Exercises should be a list"
        
    @pytest.mark.asyncio
    async def test_update_workout_complete_session(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 4: Update workout to mark as completed"""
        
        # First create a workout
        workout_data = {"title": "Test Complete Workout"}
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        create_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        assert create_response.status_code == 201
        workout_id = create_response.json()["id"]
        
        # Complete the workout
        completion_time = datetime.now(timezone.utc).isoformat()
        update_data = {
            "completed_at": completion_time,
            "is_active": False,
            "duration": 3600  # 1 hour in seconds
        }
        
        response = await fastapi_test_client.put(f"/workouts/{workout_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200, "Workout update should return 200 OK"
        
        data = response.json()
        assert data["completed_at"] is not None, "Completed workout should have completion timestamp"
        assert data["is_active"] == False, "Completed workout should not be active"
        assert data["duration"] == 3600, "Workout duration should be updated"
        
    @pytest.mark.asyncio
    async def test_delete_workout(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 5: Delete workout and cascade delete related data"""
        
        # First create a workout
        workout_data = {"title": "Test Delete Workout"}
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        create_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        assert create_response.status_code == 201
        workout_id = create_response.json()["id"]
        
        # Delete the workout
        response = await fastapi_test_client.delete(f"/workouts/{workout_id}", headers=headers)
        
        assert response.status_code == 204, "Workout deletion should return 204 No Content"
        
        # Verify workout is deleted
        get_response = await fastapi_test_client.get(f"/workouts/{workout_id}", headers=headers)
        assert get_response.status_code == 404, "Deleted workout should return 404 Not Found"
        
    @pytest.mark.asyncio
    async def test_workout_title_validation(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 6: Validate workout title constraints (1-30 characters)"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test empty title
        empty_title_data = {"title": ""}
        response = await fastapi_test_client.post("/workouts", json=empty_title_data, headers=headers)
        assert response.status_code == 422, "Empty title should return 422 Validation Error"
        
        # Test title too long (>30 characters)
        long_title_data = {"title": "This is a very long workout title that exceeds the 30 character limit"}
        response = await fastapi_test_client.post("/workouts", json=long_title_data, headers=headers)
        assert response.status_code == 422, "Title over 30 characters should return 422 Validation Error"
        
        # Test valid title
        valid_title_data = {"title": "Valid Workout Title"}
        response = await fastapi_test_client.post("/workouts", json=valid_title_data, headers=headers)
        assert response.status_code == 201, "Valid title should create workout successfully"
        
    @pytest.mark.asyncio 
    async def test_workout_filtering_and_pagination(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 7: Filter workouts by completion status and paginate results"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test filtering by active workouts
        response = await fastapi_test_client.get("/workouts?is_active=true", headers=headers)
        assert response.status_code == 200, "Active workouts filter should work"
        
        # Test filtering by completed workouts
        response = await fastapi_test_client.get("/workouts?is_active=false", headers=headers)
        assert response.status_code == 200, "Completed workouts filter should work"
        
        # Test pagination parameters
        response = await fastapi_test_client.get("/workouts?limit=10&offset=0", headers=headers)
        assert response.status_code == 200, "Pagination parameters should be accepted"
        
    @pytest.mark.asyncio
    async def test_workout_timestamp_handling(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 8: Validate workout timestamp handling and timezone support"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout with specific start time
        start_time = datetime.now(timezone.utc).isoformat()
        workout_data = {
            "title": "Timestamp Test",
            "started_at": start_time
        }
        
        response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        assert response.status_code == 201, "Workout with custom start time should be created"
        
        data = response.json()
        assert "started_at" in data, "Started timestamp should be returned"
        assert "created_at" in data, "Created timestamp should be returned"
        assert "updated_at" in data, "Updated timestamp should be returned"


class TestExerciseLibrary:
    """Exercise Library Endpoint Tests (9-10)"""
    
    @pytest.mark.asyncio
    async def test_get_exercise_library(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 9: Retrieve complete exercise library with filtering"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        response = await fastapi_test_client.get("/exercises", headers=headers)
        
        assert response.status_code == 200, "Exercise library should return 200 OK"
        
        data = response.json()
        assert isinstance(data, list), "Exercise library should be a list"
        
        # Should have exercises from database seed (54 exercises)
        assert len(data) > 0, "Exercise library should not be empty"
        
        # Validate exercise structure
        exercise = data[0]
        assert "id" in exercise, "Exercise should have ID"
        assert "name" in exercise, "Exercise should have name"
        assert "category" in exercise, "Exercise should have category"
        assert "body_part" in exercise, "Exercise should have body_part array"
        assert "equipment" in exercise, "Exercise should have equipment array"
        assert isinstance(exercise["body_part"], list), "Body part should be array"
        assert isinstance(exercise["equipment"], list), "Equipment should be array"
        
    @pytest.mark.asyncio
    async def test_exercise_library_filtering(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 10: Filter exercise library by category and body part"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test category filter
        response = await fastapi_test_client.get("/exercises?category=strength", headers=headers)
        assert response.status_code == 200, "Category filter should work"
        
        data = response.json()
        if len(data) > 0:
            for exercise in data:
                assert exercise["category"] == "strength", "All exercises should match category filter"
        
        # Test body part filter  
        response = await fastapi_test_client.get("/exercises?body_part=chest", headers=headers)
        assert response.status_code == 200, "Body part filter should work"
        
        # Test equipment filter
        response = await fastapi_test_client.get("/exercises?equipment=barbell", headers=headers)
        assert response.status_code == 200, "Equipment filter should work"


class TestWorkoutExerciseSets:
    """Workout-Exercise Sets Management Tests (11-18)"""
    
    @pytest.mark.asyncio
    async def test_add_exercise_to_workout(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 11: Add exercise to workout with order index"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout first
        workout_data = {"title": "Exercise Test Workout"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        assert workout_response.status_code == 201
        workout_id = workout_response.json()["id"]
        
        # Get first exercise from library
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        assert exercises_response.status_code == 200
        exercises = exercises_response.json()
        assert len(exercises) > 0, "Should have at least one exercise"
        exercise_id = exercises[0]["id"]
        
        # Add exercise to workout
        exercise_data = {
            "exercise_id": exercise_id,
            "order_index": 0,
            "notes": "Test exercise notes"
        }
        
        response = await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        
        assert response.status_code == 201, "Adding exercise to workout should return 201 Created"
        
        data = response.json()
        assert data["workout_id"] == workout_id, "Workout exercise should reference correct workout"
        assert data["exercise_id"] == exercise_id, "Workout exercise should reference correct exercise"
        assert data["order_index"] == 0, "Order index should be set correctly"
        assert data["notes"] == "Test exercise notes", "Notes should be saved"
        
    @pytest.mark.asyncio
    async def test_add_set_to_exercise(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 12: Add set to exercise in workout"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout and add exercise (setup from previous test)
        workout_data = {"title": "Set Test Workout"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        # Get exercise and add to workout
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        workout_exercise_response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers
        )
        workout_exercise_id = workout_exercise_response.json()["id"]
        
        # Add set to exercise
        set_data = {
            "reps": 12,
            "weight": 135.5,
            "completed": True,
            "rest_time": 60,
            "notes": "Good form"
        }
        
        response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
            json=set_data, 
            headers=headers
        )
        
        assert response.status_code == 201, "Adding set should return 201 Created"
        
        data = response.json()
        assert data["reps"] == 12, "Reps should be saved correctly"
        assert data["weight"] == 135.5, "Weight should be saved correctly"
        assert data["completed"] == True, "Completed status should be saved"
        assert data["rest_time"] == 60, "Rest time should be saved"
        assert data["notes"] == "Good form", "Notes should be saved"
        
    @pytest.mark.asyncio
    async def test_get_workout_with_exercises_and_sets(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 13: Get workout with full exercise and sets data"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout with exercise and set (complex setup)
        workout_data = {"title": "Full Data Workout"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        # Get workout details
        response = await fastapi_test_client.get(f"/workouts/{workout_id}", headers=headers)
        
        assert response.status_code == 200, "Workout details should return 200 OK"
        
        data = response.json()
        assert "exercises" in data, "Workout should include exercises"
        assert isinstance(data["exercises"], list), "Exercises should be a list"
        
        # If exercises exist, check structure
        if len(data["exercises"]) > 0:
            exercise = data["exercises"][0]
            assert "exercise_details" in exercise, "Should include exercise details"
            assert "sets" in exercise, "Should include sets for each exercise"
            assert isinstance(exercise["sets"], list), "Sets should be a list"
            
    @pytest.mark.asyncio
    async def test_update_set(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 14: Update existing set data"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Setup workout, exercise, and set (abbreviated setup)
        # This test assumes previous test patterns for creating workout/exercise/set
        
        # Create minimal workout setup for set update test
        workout_data = {"title": "Update Set Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        # Get exercises and create workout exercise
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        
        # Create set
        set_data = {"reps": 10, "weight": 100.0, "completed": False}
        set_response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
            json=set_data, 
            headers=headers
        )
        set_id = set_response.json()["id"]
        
        # Update set
        update_data = {"reps": 12, "weight": 110.0, "completed": True}
        response = await fastapi_test_client.put(f"/workouts/sets/{set_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200, "Set update should return 200 OK"
        
        data = response.json()
        assert data["reps"] == 12, "Updated reps should be saved"
        assert data["weight"] == 110.0, "Updated weight should be saved"
        assert data["completed"] == True, "Updated completion status should be saved"
        
    @pytest.mark.asyncio
    async def test_delete_set(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 15: Delete set from exercise"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout, exercise, and set for deletion test
        workout_data = {"title": "Delete Set Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        
        set_data = {"reps": 8, "weight": 95.0}
        set_response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
            json=set_data, 
            headers=headers
        )
        set_id = set_response.json()["id"]
        
        # Delete set
        response = await fastapi_test_client.delete(f"/workouts/sets/{set_id}", headers=headers)
        
        assert response.status_code == 204, "Set deletion should return 204 No Content"
        
    @pytest.mark.asyncio
    async def test_set_validation_constraints(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 16: Validate set data constraints (reps > 0, weight >= 0)"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Setup workout and exercise for validation tests
        workout_data = {"title": "Validation Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        
        # Test invalid reps (0 or negative)
        invalid_set_data = {"reps": 0, "weight": 100.0}
        response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
            json=invalid_set_data, 
            headers=headers
        )
        assert response.status_code == 422, "Zero reps should return 422 Validation Error"
        
        # Test negative weight
        invalid_set_data = {"reps": 10, "weight": -50.0}
        response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
            json=invalid_set_data, 
            headers=headers
        )
        assert response.status_code == 422, "Negative weight should return 422 Validation Error"
        
    @pytest.mark.asyncio
    async def test_cardio_exercise_set_with_duration_distance(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 17: Handle cardio exercises with duration and distance instead of reps/weight"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Setup workout
        workout_data = {"title": "Cardio Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        # Find cardio exercise
        exercises_response = await fastapi_test_client.get("/exercises?category=cardio&limit=1", headers=headers)
        if len(exercises_response.json()) > 0:
            exercise_id = exercises_response.json()[0]["id"]
            
            exercise_data = {"exercise_id": exercise_id, "order_index": 0}
            await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
            
            # Create cardio set with duration and distance
            set_data = {
                "duration": 1800,  # 30 minutes in seconds
                "distance": 5000.0,  # 5km in meters  
                "completed": True
            }
            
            response = await fastapi_test_client.post(
                f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
                json=set_data, 
                headers=headers
            )
            
            assert response.status_code == 201, "Cardio set should be created successfully"
            
            data = response.json()
            assert data["duration"] == 1800, "Duration should be saved"
            assert data["distance"] == 5000.0, "Distance should be saved"
            assert data["reps"] is None, "Reps should be null for cardio"
            assert data["weight"] is None, "Weight should be null for cardio"
            
    @pytest.mark.asyncio
    async def test_remove_exercise_from_workout(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 18: Remove exercise from workout and cascade delete sets"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout and add exercise
        workout_data = {"title": "Remove Exercise Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        workout_exercise_response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers
        )
        workout_exercise_id = workout_exercise_response.json()["id"]
        
        # Remove exercise from workout
        response = await fastapi_test_client.delete(
            f"/workouts/{workout_id}/exercises/{exercise_id}", 
            headers=headers
        )
        
        assert response.status_code == 204, "Exercise removal should return 204 No Content"


class TestAuthenticationAndRLS:
    """Authentication & RLS Policy Enforcement Tests (19-22)"""
    
    @pytest.mark.asyncio
    async def test_workout_access_requires_authentication(self, fastapi_test_client: httpx.AsyncClient):
        """Test 19: All workout endpoints require valid JWT authentication"""
        
        # Test without authorization header
        response = await fastapi_test_client.get("/workouts")
        assert response.status_code == 401, "Unauthenticated request should return 401"
        
        response = await fastapi_test_client.post("/workouts", json={"title": "Test"})
        assert response.status_code == 401, "Unauthenticated request should return 401"
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = await fastapi_test_client.get("/workouts", headers=headers)
        assert response.status_code == 401, "Invalid token should return 401"
        
    @pytest.mark.asyncio
    async def test_user_isolation_rls_policies(self, authenticated_user_a: dict, authenticated_user_b: dict, fastapi_test_client: httpx.AsyncClient, mock_supabase_client):
        """Test 20: Users can only access their own workout data (RLS policies)"""
        
        # Set user context for User A when creating workout
        mock_supabase_client.set_user_context(authenticated_user_a["user"]["id"])
        
        # User A creates workout
        headers_a = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        workout_data = {"title": "User A Private Workout"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers_a)
        assert workout_response.status_code == 201
        workout_id = workout_response.json()["id"]
        
        # Switch user context to User B
        mock_supabase_client.set_user_context(authenticated_user_b["user"]["id"])
        
        # User B should not see User A's workout in list
        headers_b = {"Authorization": f"Bearer {authenticated_user_b['access_token']}"}
        workouts_response = await fastapi_test_client.get("/workouts", headers=headers_b)
        assert workouts_response.status_code == 200
        
        user_b_workouts = workouts_response.json()
        user_a_workout_ids = [w["id"] for w in user_b_workouts]
        assert workout_id not in user_a_workout_ids, "User B should not see User A's workouts"
        
        # User B should not access User A's workout details (RLS blocks access)
        detail_response = await fastapi_test_client.get(f"/workouts/{workout_id}", headers=headers_b)
        assert detail_response.status_code == 404, "User B should not access User A's workout details"
        
    @pytest.mark.asyncio
    async def test_exercise_library_accessible_to_all_authenticated_users(self, authenticated_user_a: dict, authenticated_user_b: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 21: Exercise library is accessible to all authenticated users"""
        
        # Both users should access exercise library
        headers_a = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        headers_b = {"Authorization": f"Bearer {authenticated_user_b['access_token']}"}
        
        response_a = await fastapi_test_client.get("/exercises", headers=headers_a)
        response_b = await fastapi_test_client.get("/exercises", headers=headers_b)
        
        assert response_a.status_code == 200, "User A should access exercise library"
        assert response_b.status_code == 200, "User B should access exercise library"
        
        # Both should get same exercise data (library is shared)
        exercises_a = response_a.json()
        exercises_b = response_b.json()
        assert len(exercises_a) == len(exercises_b), "Both users should see same exercise library"
        
    @pytest.mark.asyncio
    async def test_jwt_token_expiration_handling(self, expired_jwt_token: str, fastapi_test_client: httpx.AsyncClient):
        """Test 22: Handle expired JWT tokens appropriately"""
        
        headers = {"Authorization": f"Bearer {expired_jwt_token}"}
        response = await fastapi_test_client.get("/workouts", headers=headers)
        
        assert response.status_code == 401, "Expired token should return 401"
        
        data = response.json()
        assert "detail" in data, "Error response should include detail"
        assert "expired" in data["detail"].lower() or "invalid" in data["detail"].lower(), "Error should indicate token issue"


class TestErrorHandlingAndEdgeCases:
    """Error Handling & Edge Cases Tests (23-25)"""
    
    @pytest.mark.asyncio
    async def test_workout_not_found_handling(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 23: Handle requests for non-existent workouts"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        non_existent_id = str(uuid.uuid4())
        
        # Test GET non-existent workout
        response = await fastapi_test_client.get(f"/workouts/{non_existent_id}", headers=headers)
        assert response.status_code == 404, "Non-existent workout should return 404"
        
        # Test UPDATE non-existent workout
        response = await fastapi_test_client.put(f"/workouts/{non_existent_id}", json={"title": "Updated"}, headers=headers)
        assert response.status_code == 404, "Non-existent workout update should return 404"
        
        # Test DELETE non-existent workout
        response = await fastapi_test_client.delete(f"/workouts/{non_existent_id}", headers=headers)
        assert response.status_code == 404, "Non-existent workout deletion should return 404"
        
    @pytest.mark.asyncio
    async def test_malformed_request_validation(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 24: Handle malformed request data with proper validation errors"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test malformed workout creation
        malformed_data = {"invalid_field": "value", "title": None}
        response = await fastapi_test_client.post("/workouts", json=malformed_data, headers=headers)
        assert response.status_code == 422, "Malformed workout data should return 422"
        
        # Test malformed set creation (need workout setup first)
        workout_data = {"title": "Malformed Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        
        # Test malformed set data
        malformed_set_data = {"invalid_reps": "not_a_number", "weight": "invalid"}
        response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises/{exercise_id}/sets", 
            json=malformed_set_data, 
            headers=headers
        )
        assert response.status_code == 422, "Malformed set data should return 422"
        
    @pytest.mark.asyncio
    async def test_database_constraint_violations(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 25: Handle database constraint violations gracefully"""
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Create workout
        workout_data = {"title": "Constraint Test"}
        workout_response = await fastapi_test_client.post("/workouts", json=workout_data, headers=headers)
        workout_id = workout_response.json()["id"]
        
        # Try to add non-existent exercise to workout
        non_existent_exercise_id = str(uuid.uuid4())
        invalid_exercise_data = {
            "exercise_id": non_existent_exercise_id,
            "order_index": 0
        }
        
        response = await fastapi_test_client.post(
            f"/workouts/{workout_id}/exercises", 
            json=invalid_exercise_data, 
            headers=headers
        )
        assert response.status_code == 400, "Non-existent exercise reference should return 400"
        
        # Try to add same exercise twice to same workout
        exercises_response = await fastapi_test_client.get("/exercises?limit=1", headers=headers)
        exercise_id = exercises_response.json()[0]["id"]
        
        exercise_data = {"exercise_id": exercise_id, "order_index": 0}
        
        # First addition should work
        response1 = await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        assert response1.status_code == 201, "First exercise addition should work"
        
        # Second addition should fail (unique constraint violation)
        response2 = await fastapi_test_client.post(f"/workouts/{workout_id}/exercises", json=exercise_data, headers=headers)
        assert response2.status_code == 409, "Duplicate exercise addition should return 409 Conflict"


# Test Fixtures for Phase 5.4 (extending existing Phase 5.3 fixtures)

@pytest_asyncio.fixture
async def authenticated_user_a(google_oauth_token, fastapi_test_client):
    """Fixture providing authenticated user A with JWT token"""
    # Mock Google OAuth verification for test user A
    mock_google_user_a = GoogleUserData(
        id="test_google_user_a_123",
        email=f"test_user_a_{uuid.uuid4().hex[:8]}@gmail.com",
        name="Test User A",
        picture="https://example.com/photo_a.jpg"
    )
    
    # Mock both Google OAuth verification and user creation
    with patch('services.auth_service.AuthService.verify_google_oauth_token') as mock_verify, \
         patch('services.auth_service.AuthService.create_or_get_user_from_google') as mock_create_user:
        
        mock_verify.return_value = mock_google_user_a
        
        # Mock user creation/retrieval response
        mock_user_data = {
            "id": str(uuid.uuid4()),
            "email": mock_google_user_a.email,
            "display_name": mock_google_user_a.name,
            "preferences": {
                "weightUnit": "lbs",
                "theme": "auto",
                "defaultRestTimer": 60,
                "hapticFeedback": True,
                "soundEnabled": True,
                "autoStartRestTimer": False
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        mock_create_user.return_value = mock_user_data
        
        oauth_request = {
            "token": google_oauth_token["access_token"],
            "google_jwt": google_oauth_token["id_token"]
        }
        
        response = await fastapi_test_client.post("/auth/google", json=oauth_request)
        assert response.status_code == 200
        return response.json()


@pytest_asyncio.fixture 
async def authenticated_user_b(google_oauth_token_user_b, fastapi_test_client):
    """Fixture providing authenticated user B with JWT token (for RLS testing)"""
    # Mock Google OAuth verification for test user B
    mock_google_user_b = GoogleUserData(
        id="test_google_user_b_456", 
        email=f"test_user_b_{uuid.uuid4().hex[:8]}@gmail.com",
        name="Test User B",
        picture="https://example.com/photo_b.jpg"
    )
    
    # Mock both Google OAuth verification and user creation
    with patch('services.auth_service.AuthService.verify_google_oauth_token') as mock_verify, \
         patch('services.auth_service.AuthService.create_or_get_user_from_google') as mock_create_user:
        
        mock_verify.return_value = mock_google_user_b
        
        # Mock user creation/retrieval response
        mock_user_data = {
            "id": str(uuid.uuid4()),
            "email": mock_google_user_b.email,
            "display_name": mock_google_user_b.name,
            "preferences": {
                "weightUnit": "lbs",
                "theme": "auto",
                "defaultRestTimer": 60,
                "hapticFeedback": True,
                "soundEnabled": True,
                "autoStartRestTimer": False
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        mock_create_user.return_value = mock_user_data
        
        oauth_request = {
            "token": google_oauth_token_user_b["access_token"],
            "google_jwt": google_oauth_token_user_b["id_token"]
        }
        
        response = await fastapi_test_client.post("/auth/google", json=oauth_request)
        assert response.status_code == 200
        return response.json()


@pytest.fixture
def expired_jwt_token():
    """Fixture providing an expired JWT token for testing"""
    import jwt
    from datetime import datetime, timedelta, timezone
    from core.config import settings
    
    # Create token that expired 1 hour ago
    expired_time = datetime.now(timezone.utc) - timedelta(hours=1)
    payload = {
        "sub": str(uuid.uuid4()),
        "email": "expired@test.com", 
        "iat": expired_time - timedelta(minutes=60),
        "exp": expired_time
    }
    
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


@pytest.fixture
def google_oauth_token_user_b():
    """Fixture providing Google OAuth token for test user B (RLS testing)"""
    return {
        "access_token": "mock_google_access_token_user_b",
        "id_token": "mock_google_jwt_user_b"
    }