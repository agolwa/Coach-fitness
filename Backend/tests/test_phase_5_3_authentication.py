"""
TDD Phase 5.3: Authentication Endpoints Tests

Following the exact test specification from phase 5.3-authentication-endpoints-tdd.md
Implements all 17 test cases in strict RED → GREEN → REFACTOR order.

Test Structure:
1. Authentication Flow Tests (1-5)
2. JWT Token Management Tests (6-9)
3. User Profile Tests (10-12)
4. Error Handling Tests (13-15)
5. Integration Tests (16-17)

This phase establishes the authentication layer that will secure all subsequent API endpoints,
enabling user-specific workout data access and maintaining the security model from Phase 5.1.
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
    test_user_b
)


class TestAuthenticationFlow:
    """Authentication Flow Tests (1-5)"""
    
    @pytest.mark.asyncio
    async def test_google_oauth_token_exchange(self, google_oauth_token: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 1: Verify Google OAuth token can be exchanged for app JWT with user creation/retrieval"""
        # This will initially fail (RED phase) - auth endpoints don't exist yet
        
        # Test OAuth token exchange request
        oauth_request = {
            "token": google_oauth_token["access_token"],
            "google_jwt": google_oauth_token["id_token"]
        }
        
        response = await fastapi_test_client.post("/auth/google", json=oauth_request)
        
        # Should return 200 with JWT and user profile
        assert response.status_code == 200, "Google OAuth token exchange failed"
        
        data = response.json()
        assert "access_token" in data, "JWT access token not returned"
        assert "token_type" in data, "Token type not specified"
        assert data["token_type"] == "bearer", "Token type should be 'bearer'"
        assert "user" in data, "User profile not returned"
        
        # Validate user profile structure
        user_profile = data["user"]
        assert "id" in user_profile, "User ID not in profile"
        assert "email" in user_profile, "User email not in profile"
        assert "display_name" in user_profile, "Display name not in profile"
        assert "preferences" in user_profile, "User preferences not in profile"
        
        # Validate JWT token structure
        jwt_token = data["access_token"]
        assert isinstance(jwt_token, str), "JWT token should be string"
        assert len(jwt_token.split('.')) == 3, "JWT should have 3 parts (header.payload.signature)"
        
    @pytest.mark.asyncio  
    async def test_email_password_authentication(self, test_user_credentials: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 2: Verify email/password login against Supabase Auth returns valid JWT"""
        # This will initially fail (RED phase)
        
        login_request = {
            "email": test_user_credentials["email"],
            "password": test_user_credentials["password"]
        }
        
        response = await fastapi_test_client.post("/auth/login", json=login_request)
        
        # Should return 200 with JWT and user profile
        assert response.status_code == 200, "Email/password authentication failed"
        
        data = response.json()
        assert "access_token" in data, "JWT access token not returned"
        assert "token_type" in data, "Token type not specified"
        assert data["token_type"] == "bearer", "Token type should be 'bearer'"
        assert "user" in data, "User profile not returned"
        
        # Validate returned user matches login credentials
        user_profile = data["user"]
        assert user_profile["email"] == test_user_credentials["email"], "User email doesn't match login"
        
    @pytest.mark.asyncio
    async def test_jwt_token_generation(self, test_user_data: dict):
        """Test 3: Verify JWT tokens are generated with correct payload (user_id, exp, iat) and signature"""
        # This will initially fail (RED phase) - JWT service doesn't exist yet
        
        # Import JWT service that should be created
        from services.auth_service import AuthService
        
        auth_service = AuthService()
        
        # Generate JWT token
        jwt_token = auth_service.create_access_token(
            user_id=test_user_data["id"],
            email=test_user_data["email"]
        )
        
        assert isinstance(jwt_token, str), "JWT token should be string"
        assert len(jwt_token.split('.')) == 3, "JWT should have 3 parts"
        
        # Decode and validate JWT payload
        from core.config import settings
        decoded_payload = jwt.decode(
            jwt_token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        
        # Validate required JWT claims
        assert "sub" in decoded_payload, "JWT missing 'sub' claim (user ID)"
        assert decoded_payload["sub"] == test_user_data["id"], "JWT user ID doesn't match"
        assert "email" in decoded_payload, "JWT missing email claim"
        assert decoded_payload["email"] == test_user_data["email"], "JWT email doesn't match"
        assert "exp" in decoded_payload, "JWT missing expiration claim"
        assert "iat" in decoded_payload, "JWT missing issued-at claim"
        
        # Validate expiration is in the future
        exp_timestamp = decoded_payload["exp"]
        current_timestamp = datetime.now(timezone.utc).timestamp()
        assert exp_timestamp > current_timestamp, "JWT token is already expired"
        
    @pytest.mark.asyncio
    async def test_user_profile_retrieval_with_valid_jwt(self, valid_jwt_token: str, fastapi_test_client: httpx.AsyncClient):
        """Test 4: Verify /auth/me returns user profile when valid JWT provided"""
        # This will initially fail (RED phase) - protected endpoint doesn't exist yet
        
        # Test protected endpoint with valid JWT
        headers = {"Authorization": f"Bearer {valid_jwt_token}"}
        response = await fastapi_test_client.get("/auth/me", headers=headers)
        
        assert response.status_code == 200, "Protected endpoint failed with valid JWT"
        
        data = response.json()
        assert "id" in data, "User ID not returned by /auth/me"
        assert "email" in data, "User email not returned"
        assert "display_name" in data, "Display name not returned"
        assert "preferences" in data, "User preferences not returned"
        
        # Validate preferences structure
        preferences = data["preferences"]
        assert "weightUnit" in preferences, "Weight unit preference missing"
        assert "theme" in preferences, "Theme preference missing"
        assert "defaultRestTimer" in preferences, "Rest timer preference missing"
        assert "hapticFeedback" in preferences, "Haptic feedback preference missing"
        
    @pytest.mark.asyncio
    async def test_authentication_dependency_injection(self, valid_jwt_token: str):
        """Test 5: Verify FastAPI dependency correctly extracts and validates JWT from Authorization header"""
        # This will initially fail (RED phase) - auth dependency doesn't exist yet
        
        from routers.auth import get_current_user
        from fastapi import Request, HTTPException
        
        # Mock request with valid Authorization header
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"authorization": f"Bearer {valid_jwt_token}"}
        
        # Test dependency injection
        try:
            current_user = await get_current_user(mock_request)
            assert current_user is not None, "Auth dependency returned None for valid token"
            assert "id" in current_user, "Current user missing ID"
            assert "email" in current_user, "Current user missing email"
        except HTTPException as e:
            pytest.fail(f"Auth dependency failed with valid token: {e.detail}")
        except ImportError:
            pytest.fail("Authentication dependency not implemented yet")


class TestJWTTokenManagement:
    """JWT Token Management Tests (6-9)"""
    
    @pytest.mark.asyncio
    async def test_jwt_token_validation(self, test_user_data: dict):
        """Test 6: Verify JWT signature validation with correct and incorrect secret keys"""
        # This will initially fail (RED phase)
        
        from services.auth_service import AuthService
        
        auth_service = AuthService()
        
        # Generate token with correct secret
        jwt_token = auth_service.create_access_token(
            user_id=test_user_data["id"],
            email=test_user_data["email"]
        )
        
        # Validate token with correct secret (should succeed)
        from core.config import settings
        try:
            decoded_payload = jwt.decode(
                jwt_token, 
                settings.jwt_secret_key, 
                algorithms=[settings.jwt_algorithm]
            )
            assert decoded_payload["sub"] == test_user_data["id"], "Token validation failed"
        except jwt.InvalidTokenError:
            pytest.fail("Valid JWT token failed validation")
            
        # Validate token with incorrect secret (should fail)
        with pytest.raises(jwt.InvalidSignatureError):
            jwt.decode(
                jwt_token,
                "wrong_secret_key",
                algorithms=[settings.jwt_algorithm]
            )
            
    @pytest.mark.asyncio
    async def test_jwt_token_expiration_handling(self, expired_jwt_token: str):
        """Test 7: Verify expired JWT tokens are rejected with appropriate error messages"""
        # This will initially fail (RED phase)
        
        from core.config import settings
        
        # Test expired token validation
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(
                expired_jwt_token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm]
            )
            
        # Test expired token in protected endpoint
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        headers = {"Authorization": f"Bearer {expired_jwt_token}"}
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 401, "Expired token should return 401"
        data = response.json()
        assert "detail" in data, "Error response missing detail"
        assert "expired" in data["detail"].lower(), "Error message should mention expiration"
        
    @pytest.mark.asyncio
    async def test_jwt_payload_extraction(self, valid_jwt_token: str, test_user_data: dict):
        """Test 8: Verify user ID and metadata can be correctly extracted from valid JWT tokens"""
        # This will initially fail (RED phase)
        
        from services.auth_service import AuthService
        
        auth_service = AuthService()
        
        # Extract payload from valid token
        payload = auth_service.verify_access_token(valid_jwt_token)
        
        assert payload is not None, "Token payload extraction failed"
        assert "sub" in payload, "User ID not in token payload"
        assert "email" in payload, "Email not in token payload"
        assert "exp" in payload, "Expiration not in token payload"
        assert "iat" in payload, "Issued-at not in token payload"
        
        # Validate extracted data matches expected user
        assert payload["sub"] == test_user_data["id"], "Extracted user ID doesn't match"
        assert payload["email"] == test_user_data["email"], "Extracted email doesn't match"
        
    @pytest.mark.asyncio
    async def test_authorization_header_parsing(self, valid_jwt_token: str):
        """Test 9: Verify "Bearer {token}" format is correctly parsed from Authorization header"""
        # This will initially fail (RED phase)
        
        from services.auth_service import extract_token_from_header
        
        # Test valid Bearer token format
        auth_header = f"Bearer {valid_jwt_token}"
        extracted_token = extract_token_from_header(auth_header)
        
        assert extracted_token == valid_jwt_token, "Token extraction from header failed"
        
        # Test invalid formats (should raise appropriate errors)
        invalid_headers = [
            "InvalidFormat token123",  # Wrong prefix
            f"bearer {valid_jwt_token}",  # Lowercase bearer
            valid_jwt_token,  # Missing Bearer prefix
            f"Bearer",  # Missing token
            f"Bearer {valid_jwt_token} extra",  # Extra content
        ]
        
        for invalid_header in invalid_headers:
            with pytest.raises(HTTPException) as exc_info:
                extract_token_from_header(invalid_header)
            assert exc_info.value.status_code == 401, f"Invalid header '{invalid_header}' should return 401"


class TestUserProfile:
    """User Profile Tests (10-12)"""
    
    @pytest.mark.asyncio
    async def test_user_creation_from_google_oauth(self, google_oauth_token: dict, supabase_admin_client: Client):
        """Test 10: Verify new user record created in database from Google OAuth data"""
        # This will initially fail (RED phase)
        
        from services.auth_service import AuthService
        
        auth_service = AuthService()
        
        # Extract Google user data from OAuth token
        google_user_data = {
            "id": "google_user_123456",
            "email": "newuser@gmail.com",
            "name": "New Google User",
            "picture": "https://lh3.googleusercontent.com/photo.jpg"
        }
        
        # Create user from Google OAuth data
        created_user = await auth_service.create_or_get_user_from_google(
            google_user_data,
            supabase_admin_client
        )
        
        assert created_user is not None, "User creation from Google OAuth failed"
        assert created_user["email"] == google_user_data["email"], "User email doesn't match Google data"
        assert created_user["display_name"] == google_user_data["name"], "Display name doesn't match"
        
        # Verify user exists in database
        db_user = supabase_admin_client.table("users").select("*").eq("email", google_user_data["email"]).execute()
        assert len(db_user.data) == 1, "User not found in database after Google OAuth creation"
        
        db_user_data = db_user.data[0]
        assert db_user_data["email"] == google_user_data["email"], "Database user email doesn't match"
        
    @pytest.mark.asyncio
    async def test_user_preferences_initialization(self, supabase_admin_client: Client):
        """Test 11: Verify new users get default preferences (weightUnit: lbs, theme: auto, etc.)"""
        # This will initially fail (RED phase)
        
        from services.auth_service import AuthService
        
        auth_service = AuthService()
        
        # Create new user
        new_user_data = {
            "id": f"test_user_{uuid.uuid4().hex[:8]}",
            "email": f"preferences_test_{uuid.uuid4().hex[:8]}@example.com",
            "name": "Preferences Test User"
        }
        
        created_user = await auth_service.create_user_with_preferences(
            new_user_data,
            supabase_admin_client
        )
        
        assert "preferences" in created_user, "User preferences not initialized"
        
        preferences = created_user["preferences"]
        
        # Validate default preferences
        expected_defaults = {
            "weightUnit": "lbs",
            "theme": "auto",
            "defaultRestTimer": 60,
            "hapticFeedback": True,
            "soundEnabled": True,
            "autoStartRestTimer": False
        }
        
        for key, expected_value in expected_defaults.items():
            assert key in preferences, f"Default preference '{key}' not set"
            assert preferences[key] == expected_value, f"Default preference '{key}' has wrong value: {preferences[key]} != {expected_value}"
            
    @pytest.mark.asyncio
    async def test_existing_user_login(self, test_user_a: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 12: Verify existing users can login and receive updated JWT without creating duplicate records"""
        # This will initially fail (RED phase)
        
        # Login with existing user credentials  
        login_request = {
            "email": test_user_a["email"],
            "password": test_user_a["password"]
        }
        
        # First login
        response1 = await fastapi_test_client.post("/auth/login", json=login_request)
        assert response1.status_code == 200, "First login failed"
        
        data1 = response1.json()
        jwt_token1 = data1["access_token"]
        user_id1 = data1["user"]["id"]
        
        # Second login (should not create duplicate)
        response2 = await fastapi_test_client.post("/auth/login", json=login_request)
        assert response2.status_code == 200, "Second login failed"
        
        data2 = response2.json()
        jwt_token2 = data2["access_token"]
        user_id2 = data2["user"]["id"]
        
        # Verify same user ID (no duplicate creation)
        assert user_id1 == user_id2, "Duplicate user created on second login"
        
        # Verify new JWT token issued
        assert jwt_token1 != jwt_token2, "Same JWT token returned on second login"
        
        # Both tokens should be valid
        from services.auth_service import AuthService
        auth_service = AuthService()
        
        payload1 = auth_service.verify_access_token(jwt_token1)
        payload2 = auth_service.verify_access_token(jwt_token2)
        
        assert payload1["sub"] == payload2["sub"], "Different user IDs in JWT tokens"


class TestErrorHandling:
    """Error Handling Tests (13-15)"""
    
    @pytest.mark.asyncio
    async def test_invalid_google_oauth_token(self, fastapi_test_client: httpx.AsyncClient):
        """Test 13: Verify invalid Google OAuth tokens return proper error responses (401 Unauthorized)"""
        # This will initially fail (RED phase)
        
        invalid_oauth_requests = [
            {"token": "invalid_access_token", "google_jwt": "invalid_jwt_token"},
            {"token": "", "google_jwt": ""},
            {"token": "valid_looking_but_fake_token", "google_jwt": "fake.jwt.token"},
            {},  # Missing required fields
        ]
        
        for invalid_request in invalid_oauth_requests:
            response = await fastapi_test_client.post("/auth/google", json=invalid_request)
            
            assert response.status_code == 401, f"Invalid OAuth request should return 401: {invalid_request}"
            
            data = response.json()
            assert "detail" in data, "Error response missing detail field"
            assert isinstance(data["detail"], str), "Error detail should be string"
            assert len(data["detail"]) > 0, "Error detail should not be empty"
            
    @pytest.mark.asyncio
    async def test_missing_authorization_header(self, fastapi_test_client: httpx.AsyncClient):
        """Test 14: Verify protected endpoints return 401 when Authorization header missing"""
        # This will initially fail (RED phase)
        
        protected_endpoints = [
            "/auth/me",
            "/auth/refresh",  # If implemented
            "/auth/logout",   # If implemented
        ]
        
        for endpoint in protected_endpoints:
            # Test without Authorization header
            response = await fastapi_test_client.get(endpoint)
            assert response.status_code == 401, f"Protected endpoint {endpoint} should require auth"
            
            data = response.json()
            assert "detail" in data, f"Missing auth error response malformed for {endpoint}"
            
            # Test with empty Authorization header
            headers = {"Authorization": ""}
            response = await fastapi_test_client.get(endpoint, headers=headers)
            assert response.status_code == 401, f"Empty auth header should return 401 for {endpoint}"
            
    @pytest.mark.asyncio
    async def test_malformed_jwt_token(self, fastapi_test_client: httpx.AsyncClient):
        """Test 15: Verify malformed JWT tokens return 401 with clear error messages"""
        # This will initially fail (RED phase)
        
        malformed_tokens = [
            "not.a.jwt",  # Only 2 parts
            "not.a.jwt.token.too.many.parts",  # Too many parts
            "invalid-characters-123",  # No dots at all
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.invalid_signature",  # Invalid base64
            "",  # Empty token
            "Bearer token123",  # Contains Bearer prefix (should be stripped)
        ]
        
        for malformed_token in malformed_tokens:
            headers = {"Authorization": f"Bearer {malformed_token}"}
            response = await fastapi_test_client.get("/auth/me", headers=headers)
            
            assert response.status_code == 401, f"Malformed token should return 401: {malformed_token}"
            
            data = response.json()
            assert "detail" in data, "Malformed token error response missing detail"
            
            error_detail = data["detail"].lower()
            expected_keywords = ["invalid", "token", "malformed", "jwt"]
            assert any(keyword in error_detail for keyword in expected_keywords), \
                f"Error message should contain relevant keywords for {malformed_token}: {data['detail']}"


class TestIntegration:
    """Integration Tests (16-17)"""
    
    @pytest.mark.asyncio
    async def test_auth_endpoints_integration_with_supabase(self, supabase_admin_client: Client, fastapi_test_client: httpx.AsyncClient):
        """Test 16: Verify authentication system works with real Supabase database connection"""
        # This will initially fail (RED phase)
        
        # Test full Google OAuth flow with database integration
        mock_google_user = {
            "id": "integration_test_google_123",
            "email": f"integration_test_{uuid.uuid4().hex[:8]}@gmail.com",
            "name": "Integration Test User",
            "picture": "https://example.com/photo.jpg"
        }
        
        # Mock Google OAuth token
        with patch('services.auth_service.verify_google_oauth_token') as mock_verify:
            mock_verify.return_value = mock_google_user
            
            oauth_request = {
                "token": "mock_google_access_token",
                "google_jwt": "mock_google_jwt_token"
            }
            
            response = await fastapi_test_client.post("/auth/google", json=oauth_request)
            assert response.status_code == 200, "Google OAuth integration test failed"
            
            data = response.json()
            user_id = data["user"]["id"]
            jwt_token = data["access_token"]
            
            # Verify user was created in Supabase
            db_user = supabase_admin_client.table("users").select("*").eq("id", user_id).execute()
            assert len(db_user.data) == 1, "User not found in Supabase after OAuth"
            
            # Verify JWT token works with /auth/me
            headers = {"Authorization": f"Bearer {jwt_token}"}
            me_response = await fastapi_test_client.get("/auth/me", headers=headers)
            assert me_response.status_code == 200, "JWT token doesn't work with protected endpoint"
            
            me_data = me_response.json()
            assert me_data["id"] == user_id, "Protected endpoint returns wrong user"
            
    @pytest.mark.asyncio
    async def test_protected_endpoint_access_control(self, test_user_a: dict, test_user_b: dict, fastapi_test_client: httpx.AsyncClient):
        """Test 17: Verify /auth/me correctly identifies and returns data for authenticated users only"""
        # This will initially fail (RED phase)
        
        from services.auth_service import AuthService
        auth_service = AuthService()
        
        # Generate JWT tokens for both test users
        jwt_token_a = auth_service.create_access_token(
            user_id=test_user_a["id"],
            email=test_user_a["email"]
        )
        
        jwt_token_b = auth_service.create_access_token(
            user_id=test_user_b["id"],
            email=test_user_b["email"]
        )
        
        # Test User A access
        headers_a = {"Authorization": f"Bearer {jwt_token_a}"}
        response_a = await fastapi_test_client.get("/auth/me", headers=headers_a)
        assert response_a.status_code == 200, "User A access failed"
        
        data_a = response_a.json()
        assert data_a["id"] == test_user_a["id"], "User A got wrong profile data"
        assert data_a["email"] == test_user_a["email"], "User A got wrong email"
        
        # Test User B access  
        headers_b = {"Authorization": f"Bearer {jwt_token_b}"}
        response_b = await fastapi_test_client.get("/auth/me", headers=headers_b)
        assert response_b.status_code == 200, "User B access failed"
        
        data_b = response_b.json()
        assert data_b["id"] == test_user_b["id"], "User B got wrong profile data"
        assert data_b["email"] == test_user_b["email"], "User B got wrong email"
        
        # Verify users get their own data only
        assert data_a["id"] != data_b["id"], "Users got same profile data"
        assert data_a["email"] != data_b["email"], "Users got same email"
        
        # Test cross-user access attempt (User A's token should not access User B's data)
        # This is implicitly tested by the above assertions - each user gets their own data


# Test Fixtures for Authentication Testing
@pytest_asyncio.fixture
async def google_oauth_token() -> dict:
    """Mock Google OAuth token for testing"""
    return {
        "access_token": "mock_google_access_token_123",
        "id_token": "mock_google_id_token.jwt.signature",
        "expires_in": 3600,
        "token_type": "Bearer",
        "scope": "openid email profile"
    }


@pytest_asyncio.fixture
async def test_user_credentials(test_user_a: dict) -> dict:
    """Test user credentials for email/password authentication"""
    return {
        "email": test_user_a["email"],
        "password": test_user_a["password"],
        "user_id": test_user_a["id"]
    }


@pytest_asyncio.fixture
async def test_user_data() -> dict:
    """Test user data matching frontend TypeScript contracts"""
    return {
        "id": str(uuid.uuid4()),  # Generate proper UUID string
        "email": "test@example.com",
        "display_name": "Test User",
        "preferences": {
            "weightUnit": "lbs",
            "theme": "auto", 
            "defaultRestTimer": 60,
            "hapticFeedback": True,
            "soundEnabled": True,
            "autoStartRestTimer": False
        }
    }


@pytest_asyncio.fixture
async def valid_jwt_token(test_user_data: dict) -> str:
    """Generate valid JWT token for testing protected endpoints"""
    from core.config import settings
    import jwt
    from datetime import datetime, timedelta, timezone
    
    # Create JWT payload
    payload = {
        "sub": test_user_data["id"],
        "email": test_user_data["email"],
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    }
    
    # Generate JWT token
    token = jwt.encode(
        payload,
        settings.jwt_secret_key or "test_secret_key",
        algorithm=settings.jwt_algorithm
    )
    
    return token


@pytest_asyncio.fixture
async def expired_jwt_token(test_user_data: dict) -> str:
    """Generate expired JWT token for expiration testing"""
    from core.config import settings
    import jwt
    from datetime import datetime, timedelta, timezone
    
    # Create expired JWT payload
    payload = {
        "sub": test_user_data["id"],
        "email": test_user_data["email"],
        "iat": datetime.now(timezone.utc) - timedelta(hours=2),
        "exp": datetime.now(timezone.utc) - timedelta(hours=1)  # Expired 1 hour ago
    }
    
    # Generate expired JWT token
    token = jwt.encode(
        payload,
        settings.jwt_secret_key or "test_secret_key",
        algorithm=settings.jwt_algorithm
    )
    
    return token


@pytest_asyncio.fixture
async def fastapi_test_client():
    """Create FastAPI test client for endpoint testing"""
    try:
        from main import app
        import httpx
        async with httpx.AsyncClient(app=app, base_url="http://test") as client:
            yield client
    except ImportError:
        pytest.skip("Main application not available for client testing")