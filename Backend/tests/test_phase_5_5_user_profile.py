"""
TDD Phase 5.5: User Profile Endpoints Tests

Following the exact TDD methodology from previous phases.
Implements comprehensive test coverage for user profile management endpoints.

Test Structure:
1. Profile Retrieval Tests (1-5)
2. Profile Update Tests (6-10) 
3. Preferences Management Tests (11-13)
4. Error Handling Tests (14-16)
5. Integration Tests (17-18)

This phase builds on Phase 5.3 authentication to provide user profile management
functionality that aligns with the frontend user-store TypeScript contracts.
"""

import sys
import os
import uuid
import json
import pytest
import pytest_asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from unittest.mock import patch, MagicMock
import jwt
from fastapi.testclient import TestClient
from fastapi import HTTPException
import httpx
from supabase import Client

# Import existing fixtures and test infrastructure
from conftest import (
    supabase_client,
    supabase_admin_client,
    test_user_a,
    test_user_b,
    fastapi_test_client
)

# Import fixtures from other test modules for authenticated users
from test_phase_5_4_workouts import authenticated_user_a, authenticated_user_b


class TestUserProfileRetrieval:
    """Profile Retrieval Tests (1-5)"""
    
    @pytest.mark.asyncio
    async def test_get_user_profile_success(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 1: Verify authenticated user can retrieve their profile"""
        # This will initially fail (RED phase) - users endpoints don't exist yet
        
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        response = await fastapi_test_client.get("/users/profile", headers=headers)
        
        assert response.status_code == 200
        profile_data = response.json()
        
        # Verify profile structure matches UserResponse model
        assert "id" in profile_data
        assert "email" in profile_data
        assert "display_name" in profile_data
        assert "preferences" in profile_data
        assert "created_at" in profile_data
        assert "updated_at" in profile_data
        
        # Verify preferences structure matches frontend UserPreferences interface
        preferences = profile_data["preferences"]
        assert "weightUnit" in preferences
        assert "theme" in preferences
        assert "defaultRestTimer" in preferences
        assert "hapticFeedback" in preferences
        assert "soundEnabled" in preferences
        assert "autoStartRestTimer" in preferences
        
        # Verify data types
        assert isinstance(profile_data["id"], str)
        assert isinstance(profile_data["email"], str)
        assert preferences["weightUnit"] in ["kg", "lbs"]
        assert preferences["theme"] in ["light", "dark", "auto"]
        assert isinstance(preferences["defaultRestTimer"], int)
        assert isinstance(preferences["hapticFeedback"], bool)
        assert isinstance(preferences["soundEnabled"], bool)
        assert isinstance(preferences["autoStartRestTimer"], bool)

    @pytest.mark.asyncio
    async def test_get_user_profile_unauthorized(self, fastapi_test_client: httpx.AsyncClient):
        """Test 2: Verify unauthenticated request returns 401"""
        response = await fastapi_test_client.get("/users/profile")
        
        assert response.status_code == 401
        error_data = response.json()
        assert "detail" in error_data

    @pytest.mark.asyncio
    async def test_get_user_profile_invalid_token(self, fastapi_test_client: httpx.AsyncClient):
        """Test 3: Verify invalid JWT token returns 401"""
        headers = {"Authorization": "Bearer invalid_jwt_token"}
        response = await fastapi_test_client.get("/users/profile", headers=headers)
        
        assert response.status_code == 401
        error_data = response.json()
        assert "detail" in error_data

    @pytest.mark.asyncio
    async def test_get_user_profile_expired_token(self, fastapi_test_client: httpx.AsyncClient):
        """Test 4: Verify expired JWT token returns 401"""
        # Create expired token
        expired_payload = {
            "sub": str(uuid.uuid4()),
            "email": "test@example.com",
            "exp": datetime.now(timezone.utc) - timedelta(hours=1)  # Expired 1 hour ago
        }
        from core.config import settings
        expired_token = jwt.encode(expired_payload, settings.jwt_secret_key, algorithm="HS256")
        
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = await fastapi_test_client.get("/users/profile", headers=headers)
        
        assert response.status_code == 401
        error_data = response.json()
        assert "detail" in error_data

    @pytest.mark.asyncio
    async def test_get_user_profile_user_not_found(self, fastapi_test_client: httpx.AsyncClient):
        """Test 5: Verify valid JWT for non-existent user returns 404"""
        # Create token for user that doesn't exist in database
        nonexistent_user_payload = {
            "sub": str(uuid.uuid4()),  # Random UUID not in database
            "email": "nonexistent@example.com",
            "exp": datetime.now(timezone.utc) + timedelta(hours=1)
        }
        from core.config import settings
        nonexistent_token = jwt.encode(nonexistent_user_payload, settings.jwt_secret_key, algorithm="HS256")
        
        headers = {"Authorization": f"Bearer {nonexistent_token}"}
        response = await fastapi_test_client.get("/users/profile", headers=headers)
        
        assert response.status_code == 404
        error_data = response.json()
        assert "detail" in error_data


class TestUserProfileUpdate:
    """Profile Update Tests (6-10)"""
    
    @pytest.mark.asyncio
    async def test_update_user_profile_display_name(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 6: Verify user can update display name"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        update_data = {
            "display_name": "Updated Display Name"
        }
        
        response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
        
        assert response.status_code == 200
        updated_profile = response.json()
        
        # Verify updated display name
        assert updated_profile["display_name"] == "Updated Display Name"
        
        # Verify other fields remain unchanged
        assert "id" in updated_profile
        assert "email" in updated_profile
        assert "preferences" in updated_profile
        assert "updated_at" in updated_profile

    @pytest.mark.asyncio 
    async def test_update_user_preferences(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 7: Verify user can update preferences"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        update_data = {
            "preferences": {
                "weightUnit": "kg",
                "theme": "dark",
                "defaultRestTimer": 90,
                "hapticFeedback": False,
                "soundEnabled": False,
                "autoStartRestTimer": True
            }
        }
        
        response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
        
        assert response.status_code == 200
        updated_profile = response.json()
        
        # Verify updated preferences
        preferences = updated_profile["preferences"]
        assert preferences["weightUnit"] == "kg"
        assert preferences["theme"] == "dark"
        assert preferences["defaultRestTimer"] == 90
        assert preferences["hapticFeedback"] is False
        assert preferences["soundEnabled"] is False
        assert preferences["autoStartRestTimer"] is True

    @pytest.mark.asyncio
    async def test_update_user_profile_partial(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 8: Verify partial profile updates work correctly"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # First, get current profile
        get_response = await fastapi_test_client.get("/users/profile", headers=headers)
        current_profile = get_response.json()
        
        # Update only display name
        update_data = {
            "display_name": "Partially Updated Name"
        }
        
        response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
        
        assert response.status_code == 200
        updated_profile = response.json()
        
        # Verify only display name changed
        assert updated_profile["display_name"] == "Partially Updated Name"
        assert updated_profile["preferences"] == current_profile["preferences"]

    @pytest.mark.asyncio
    async def test_update_user_profile_unauthorized(self, fastapi_test_client: httpx.AsyncClient):
        """Test 9: Verify unauthenticated profile update returns 401"""
        update_data = {
            "display_name": "Unauthorized Update"
        }
        
        response = await fastapi_test_client.put("/users/profile", json=update_data)
        
        assert response.status_code == 401
        error_data = response.json()
        assert "detail" in error_data

    @pytest.mark.asyncio
    async def test_update_user_profile_validation_error(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 10: Verify invalid update data returns 422"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test with invalid preference values
        invalid_update_data = {
            "preferences": {
                "weightUnit": "invalid_unit",  # Should be 'kg' or 'lbs'
                "theme": "invalid_theme",      # Should be 'light', 'dark', or 'auto'
                "defaultRestTimer": -10        # Should be >= 0
            }
        }
        
        response = await fastapi_test_client.put("/users/profile", headers=headers, json=invalid_update_data)
        
        assert response.status_code == 422
        error_data = response.json()
        assert "detail" in error_data


class TestPreferencesManagement:
    """Preferences Management Tests (11-13)"""
    
    @pytest.mark.asyncio
    async def test_preferences_weight_unit_validation(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 11: Verify weight unit preferences validation"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test valid weight units
        for valid_unit in ["kg", "lbs"]:
            update_data = {
                "preferences": {"weightUnit": valid_unit}
            }
            response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
            assert response.status_code == 200
            
            updated_profile = response.json()
            assert updated_profile["preferences"]["weightUnit"] == valid_unit

    @pytest.mark.asyncio
    async def test_preferences_theme_validation(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 12: Verify theme preferences validation"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test valid themes
        for valid_theme in ["light", "dark", "auto"]:
            update_data = {
                "preferences": {"theme": valid_theme}
            }
            response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
            assert response.status_code == 200
            
            updated_profile = response.json()
            assert updated_profile["preferences"]["theme"] == valid_theme

    @pytest.mark.asyncio
    async def test_preferences_rest_timer_validation(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 13: Verify rest timer preferences validation"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test valid rest timer values
        for valid_timer in [0, 30, 60, 120, 300, 600]:
            update_data = {
                "preferences": {"defaultRestTimer": valid_timer}
            }
            response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
            assert response.status_code == 200
            
            updated_profile = response.json()
            assert updated_profile["preferences"]["defaultRestTimer"] == valid_timer


class TestErrorHandling:
    """Error Handling Tests (14-16)"""
    
    @pytest.mark.asyncio
    async def test_profile_update_display_name_too_long(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 14: Verify display name length validation"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Test display name longer than 100 characters
        long_name = "a" * 101
        update_data = {
            "display_name": long_name
        }
        
        response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
        
        assert response.status_code == 422
        error_data = response.json()
        assert "detail" in error_data

    @pytest.mark.asyncio
    async def test_profile_update_empty_display_name(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 15: Verify empty display name handling"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        update_data = {
            "display_name": ""
        }
        
        response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
        
        assert response.status_code == 200
        updated_profile = response.json()
        
        # Empty string should be converted to None
        assert updated_profile["display_name"] is None

    @pytest.mark.asyncio
    async def test_profile_update_database_error_handling(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 16: Verify graceful database error handling"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        update_data = {
            "display_name": "Test Update"
        }
        
        # Mock database error (this will be implemented when services are extended)
        with patch('services.auth_service.AuthService.update_user_profile') as mock_update:
            mock_update.side_effect = Exception("Database connection error")
            
            response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
            
            assert response.status_code == 500
            error_data = response.json()
            assert "detail" in error_data


class TestIntegration:
    """Integration Tests (17-18)"""
    
    @pytest.mark.asyncio
    async def test_profile_crud_full_workflow(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 17: Verify complete profile CRUD workflow"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Step 1: Get initial profile
        get_response = await fastapi_test_client.get("/users/profile", headers=headers)
        assert get_response.status_code == 200
        initial_profile = get_response.json()
        
        # Step 2: Update profile
        update_data = {
            "display_name": "Integration Test User",
            "preferences": {
                "weightUnit": "kg",
                "theme": "dark",
                "defaultRestTimer": 120,
                "hapticFeedback": True,
                "soundEnabled": False,
                "autoStartRestTimer": True
            }
        }
        
        update_response = await fastapi_test_client.put("/users/profile", headers=headers, json=update_data)
        assert update_response.status_code == 200
        updated_profile = update_response.json()
        
        # Step 3: Verify updates were applied
        assert updated_profile["display_name"] == "Integration Test User"
        assert updated_profile["preferences"]["weightUnit"] == "kg"
        assert updated_profile["preferences"]["theme"] == "dark"
        assert updated_profile["preferences"]["defaultRestTimer"] == 120
        
        # Step 4: Get profile again to confirm persistence
        final_get_response = await fastapi_test_client.get("/users/profile", headers=headers)
        assert final_get_response.status_code == 200
        final_profile = final_get_response.json()
        
        # Verify changes persisted
        assert final_profile["display_name"] == updated_profile["display_name"]
        assert final_profile["preferences"] == updated_profile["preferences"]

    @pytest.mark.asyncio
    async def test_frontend_contract_alignment(self, authenticated_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 18: Verify API responses match frontend TypeScript contracts"""
        headers = {"Authorization": f"Bearer {authenticated_user_a['access_token']}"}
        
        # Get profile and verify it matches frontend UserStore interface
        response = await fastapi_test_client.get("/users/profile", headers=headers)
        assert response.status_code == 200
        profile = response.json()
        
        # Verify UserPreferences interface alignment
        preferences = profile["preferences"]
        required_preference_fields = [
            "weightUnit", "theme", "defaultRestTimer", 
            "hapticFeedback", "soundEnabled", "autoStartRestTimer"
        ]
        
        for field in required_preference_fields:
            assert field in preferences, f"Missing required preference field: {field}"
        
        # Verify enum values match frontend expectations
        assert preferences["weightUnit"] in ["kg", "lbs"]
        assert preferences["theme"] in ["light", "dark", "auto"]
        
        # Verify data types match TypeScript interface
        assert isinstance(preferences["weightUnit"], str)
        assert isinstance(preferences["theme"], str)
        assert isinstance(preferences["defaultRestTimer"], int)
        assert isinstance(preferences["hapticFeedback"], bool)
        assert isinstance(preferences["soundEnabled"], bool)
        assert isinstance(preferences["autoStartRestTimer"], bool)
        
        # Verify profile structure matches UserResponse model
        required_profile_fields = ["id", "email", "display_name", "preferences", "created_at", "updated_at"]
        for field in required_profile_fields:
            assert field in profile, f"Missing required profile field: {field}"