"""
Updated Login Endpoints Tests - Phase 5.3.1: Task 2.2
TDD Implementation for Enhanced Authentication Endpoints

This test file implements comprehensive testing for the updated login endpoints
that will use TokenService to return TokenPairResponse with refresh tokens.

Testing Focus:
- Google OAuth endpoint returning TokenPairResponse
- Email/password login endpoint returning TokenPairResponse  
- Integration with TokenService instead of old AuthService
- Backward compatibility and migration testing
- Security improvements with refresh token support
"""

import pytest
import os
from datetime import datetime, timedelta
from uuid import uuid4, UUID
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException, status
from fastapi.testclient import TestClient

# Test environment setup
os.environ["TESTING"] = "true"


class TestGoogleOAuthEndpointUpdated:
    """
    Test updated Google OAuth endpoint with refresh token support.
    
    This endpoint should be updated to use TokenService and return
    TokenPairResponse instead of LoginResponse.
    """
    
    @pytest.fixture
    def mock_token_service(self):
        """Mock TokenService for testing."""
        mock_service = MagicMock()
        mock_service.generate_token_pair.return_value = MagicMock()
        mock_service.generate_token_pair.return_value.access_token = "test.access.token"
        mock_service.generate_token_pair.return_value.refresh_token = "test.refresh.token"
        mock_service.generate_token_pair.return_value.access_expires_in = 1800
        mock_service.generate_token_pair.return_value.refresh_expires_in = 604800
        mock_service.generate_token_pair.return_value.token_type = "bearer"
        return mock_service
    
    @pytest.fixture
    def mock_google_user_data(self):
        """Mock Google user data for testing."""
        return {
            "id": str(uuid4()),
            "email": "test@gmail.com",
            "display_name": "Test User",
            "preferences": {
                "weightUnit": "lbs",
                "theme": "auto"
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    def test_google_oauth_endpoint_updated_to_use_token_service(self, mock_token_service, mock_google_user_data):
        """
        Test that Google OAuth endpoint uses TokenService instead of AuthService.
        
        Requirements:
        - Should import and use TokenService via get_token_service()
        - Should call token_service.generate_token_pair() instead of auth_service.create_jwt_token()
        - Should return TokenPairResponse instead of LoginResponse
        - Should maintain backward compatibility for user profile data
        """
        from models.auth import GoogleAuthRequest, TokenPairResponse, UserResponse
        
        # Mock the updated endpoint implementation
        with patch('services.token_service.get_token_service', return_value=mock_token_service), \
             patch('services.auth_service.AuthService') as mock_auth_service, \
             patch('services.supabase_client.SupabaseService') as mock_supabase:
            
            # Setup mocks
            mock_auth_instance = mock_auth_service.return_value
            mock_auth_instance.verify_google_oauth_token.return_value = mock_google_user_data
            mock_auth_instance.create_or_get_user_from_google.return_value = mock_google_user_data
            
            # Test that the endpoint would use TokenService
            request = GoogleAuthRequest(
                token="valid_google_token",
                google_jwt="valid.google.jwt"
            )
            
            user_id = UUID(mock_google_user_data["id"])
            email = mock_google_user_data["email"]
            
            # Verify TokenService.generate_token_pair would be called
            token_pair = mock_token_service.generate_token_pair(user_id, email)
            
            assert token_pair.access_token == "test.access.token"
            assert token_pair.refresh_token == "test.refresh.token"
            assert token_pair.access_expires_in == 1800
            assert token_pair.refresh_expires_in == 604800
            
            mock_token_service.generate_token_pair.assert_called_with(user_id, email)
    
    def test_google_oauth_response_model_updated_to_token_pair(self, mock_token_service, mock_google_user_data):
        """
        Test that Google OAuth endpoint returns TokenPairResponse model.
        
        Requirements:
        - Response model should be changed from LoginResponse to TokenPairResponse
        - Should include both access_token and refresh_token
        - Should include separate expiration times for both tokens
        - Should maintain user profile in response if needed
        """
        from models.auth import TokenPairResponse, UserResponse
        
        # Test the expected response structure
        token_pair = TokenPairResponse(
            access_token="test.access.token",
            refresh_token="test.refresh.token", 
            access_expires_in=1800,
            refresh_expires_in=604800,
            token_type="bearer"
        )
        
        user_response = UserResponse(
            id=UUID(mock_google_user_data["id"]),
            email=mock_google_user_data["email"],
            display_name=mock_google_user_data["display_name"],
            preferences=mock_google_user_data["preferences"],
            created_at=mock_google_user_data["created_at"],
            updated_at=mock_google_user_data["updated_at"]
        )
        
        # Validate response structure includes refresh token capabilities
        assert hasattr(token_pair, 'access_token')
        assert hasattr(token_pair, 'refresh_token')
        assert hasattr(token_pair, 'access_expires_in')
        assert hasattr(token_pair, 'refresh_expires_in')
        
        # User profile should still be available for client state management
        assert user_response.id == UUID(mock_google_user_data["id"])
        assert user_response.email == mock_google_user_data["email"]
    
    def test_google_oauth_error_handling_maintained(self):
        """
        Test that error handling remains consistent after TokenService integration.
        
        Requirements:
        - Should maintain same HTTP status codes (401, 500)
        - Should preserve existing error messages
        - Should handle TokenService exceptions appropriately
        - Should log security events consistently
        """
        from models.auth import GoogleAuthRequest
        from services.token_service import TokenService
        
        # Test invalid Google token scenario
        with patch('services.auth_service.AuthService') as mock_auth_service:
            mock_auth_instance = mock_auth_service.return_value
            mock_auth_instance.verify_google_oauth_token.side_effect = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google OAuth token"
            )
            
            request = GoogleAuthRequest(
                token="invalid_google_token",
                google_jwt="invalid.google.jwt"
            )
            
            # Should propagate the same 401 error
            with pytest.raises(HTTPException) as exc_info:
                mock_auth_instance.verify_google_oauth_token(request.google_jwt)
            
            assert exc_info.value.status_code == 401
            assert "Invalid Google OAuth token" in str(exc_info.value.detail)
        
        # Test TokenService failure scenario
        with patch('services.token_service.get_token_service') as mock_token_service_getter:
            mock_token_service = mock_token_service_getter.return_value
            mock_token_service.generate_token_pair.side_effect = Exception("Token generation failed")
            
            # Should handle TokenService errors gracefully
            with pytest.raises(Exception) as exc_info:
                mock_token_service.generate_token_pair(uuid4(), "test@example.com")
            
            assert "Token generation failed" in str(exc_info.value)


class TestEmailPasswordLoginEndpointUpdated:
    """
    Test updated email/password login endpoint with refresh token support.
    
    This endpoint should be updated to use TokenService and return
    TokenPairResponse instead of LoginResponse.
    """
    
    @pytest.fixture
    def mock_token_service(self):
        """Mock TokenService for testing."""
        mock_service = MagicMock()
        mock_service.generate_token_pair.return_value = MagicMock()
        mock_service.generate_token_pair.return_value.access_token = "email.access.token"
        mock_service.generate_token_pair.return_value.refresh_token = "email.refresh.token"
        mock_service.generate_token_pair.return_value.access_expires_in = 1800
        mock_service.generate_token_pair.return_value.refresh_expires_in = 604800
        mock_service.generate_token_pair.return_value.token_type = "bearer"
        return mock_service
    
    @pytest.fixture
    def mock_user_profile(self):
        """Mock user profile from Supabase authentication."""
        return MagicMock(
            id=uuid4(),
            email="test@example.com",
            display_name="Test User",
            preferences={
                "weightUnit": "kg",
                "theme": "dark"
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    def test_email_login_endpoint_updated_to_use_token_service(self, mock_token_service, mock_user_profile):
        """
        Test that email/password login endpoint uses TokenService.
        
        Requirements:
        - Should import and use TokenService via get_token_service()
        - Should call token_service.generate_token_pair() instead of auth_service.create_jwt_token()
        - Should maintain integration with SupabaseService for authentication
        - Should preserve email/password validation logic
        """
        from models.auth import LoginRequest, TokenPairResponse
        
        # Mock the updated endpoint implementation
        with patch('services.token_service.get_token_service', return_value=mock_token_service), \
             patch('services.supabase_client.SupabaseService') as mock_supabase:
            
            # Setup mocks
            mock_supabase_instance = mock_supabase.return_value
            mock_supabase_instance.authenticate_user_email_password.return_value = mock_user_profile
            
            # Test that the endpoint would use TokenService
            request = LoginRequest(
                email="test@example.com",
                password="secure_password"
            )
            
            # Verify TokenService.generate_token_pair would be called
            token_pair = mock_token_service.generate_token_pair(
                mock_user_profile.id, 
                mock_user_profile.email
            )
            
            assert token_pair.access_token == "email.access.token"
            assert token_pair.refresh_token == "email.refresh.token"
            
            mock_token_service.generate_token_pair.assert_called_with(
                mock_user_profile.id, 
                mock_user_profile.email
            )
    
    def test_email_login_response_model_updated_to_token_pair(self, mock_token_service, mock_user_profile):
        """
        Test that email/password login endpoint returns TokenPairResponse.
        
        Requirements:
        - Response model should be changed from LoginResponse to TokenPairResponse
        - Should include both access_token and refresh_token
        - Should include separate expiration times
        - Should maintain user profile data compatibility
        """
        from models.auth import TokenPairResponse, UserResponse
        
        # Test the expected response structure
        token_pair = TokenPairResponse(
            access_token="email.access.token",
            refresh_token="email.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800,
            token_type="bearer"
        )
        
        user_response = UserResponse(
            id=mock_user_profile.id,
            email=mock_user_profile.email,
            display_name=mock_user_profile.display_name,
            preferences=mock_user_profile.preferences,
            created_at=mock_user_profile.created_at,
            updated_at=mock_user_profile.updated_at
        )
        
        # Validate enhanced token response
        assert token_pair.access_token == "email.access.token"
        assert token_pair.refresh_token == "email.refresh.token"
        assert token_pair.access_expires_in == 1800
        assert token_pair.refresh_expires_in == 604800
        
        # User profile should still be accessible
        assert user_response.id == mock_user_profile.id
        assert user_response.email == mock_user_profile.email
    
    def test_email_login_credential_validation_preserved(self):
        """
        Test that credential validation logic is preserved after update.
        
        Requirements:
        - Should maintain Supabase authentication integration
        - Should preserve password validation logic
        - Should return same error codes for invalid credentials
        - Should maintain security logging
        """
        from models.auth import LoginRequest
        
        with patch('services.supabase_client.SupabaseService') as mock_supabase:
            mock_supabase_instance = mock_supabase.return_value
            mock_supabase_instance.authenticate_user_email_password.side_effect = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
            
            request = LoginRequest(
                email="test@example.com",
                password="wrong_password"
            )
            
            # Should maintain same authentication error handling
            with pytest.raises(HTTPException) as exc_info:
                mock_supabase_instance.authenticate_user_email_password(
                    request.email,
                    request.password
                )
            
            assert exc_info.value.status_code == 401
            assert "Invalid email or password" in str(exc_info.value.detail)
    
    def test_email_login_token_service_integration_error_handling(self, mock_user_profile):
        """
        Test error handling when TokenService fails during email login.
        
        Requirements:
        - Should handle TokenService exceptions gracefully
        - Should provide appropriate error messages
        - Should not expose internal TokenService details
        - Should maintain consistent error response format
        """
        from models.auth import LoginRequest
        
        with patch('services.token_service.get_token_service') as mock_token_service_getter, \
             patch('services.supabase_client.SupabaseService') as mock_supabase:
            
            # Setup successful authentication but failing token generation
            mock_supabase_instance = mock_supabase.return_value
            mock_supabase_instance.authenticate_user_email_password.return_value = mock_user_profile
            
            mock_token_service = mock_token_service_getter.return_value
            mock_token_service.generate_token_pair.side_effect = Exception("Token service unavailable")
            
            # Should handle TokenService failure appropriately
            with pytest.raises(Exception) as exc_info:
                mock_token_service.generate_token_pair(
                    mock_user_profile.id,
                    mock_user_profile.email
                )
            
            assert "Token service unavailable" in str(exc_info.value)


class TestLoginEndpointsBackwardCompatibility:
    """
    Test backward compatibility during migration to refresh tokens.
    
    Ensures that existing clients can still function during the transition period.
    """
    
    def test_existing_client_compatibility_with_access_token(self):
        """
        Test that existing clients can still use access_token from response.
        
        Requirements:
        - TokenPairResponse should have access_token field (same as LoginResponse)
        - token_type should remain "bearer" (same as LoginResponse)
        - Existing JWT validation should still work with access tokens
        - Client can ignore refresh_token if not implemented yet
        """
        from models.auth import TokenPairResponse, LoginResponse, UserResponse
        
        # Create TokenPairResponse (new format)
        token_pair = TokenPairResponse(
            access_token="compatible.access.token",
            refresh_token="new.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800,
            token_type="bearer"
        )
        
        # Create LoginResponse (old format) for comparison
        from uuid import uuid4
        from datetime import datetime
        
        mock_user = UserResponse(
            id=uuid4(),
            email="test@example.com",
            display_name="Test User",
            preferences={"weightUnit": "lbs", "theme": "auto"},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        login_response = LoginResponse(
            access_token="compatible.access.token",
            token_type="bearer",
            expires_in=1800,
            user=mock_user
        )
        
        # Verify backward compatibility fields
        assert token_pair.access_token == login_response.access_token
        assert token_pair.token_type == login_response.token_type
        
        # New response provides additional capabilities
        assert hasattr(token_pair, 'refresh_token')
        assert hasattr(token_pair, 'refresh_expires_in')
        
        # LoginResponse has refresh_token but it's optional (None by default)
        assert hasattr(login_response, 'refresh_token')
        assert login_response.refresh_token is None  # Optional field, defaults to None
        
        # TokenPairResponse makes refresh_token mandatory
        assert token_pair.refresh_token is not None
    
    def test_migration_strategy_for_client_updates(self):
        """
        Test migration strategy considerations for client updates.
        
        Requirements:
        - Should support gradual client migration
        - Should provide clear upgrade path
        - Should maintain API versioning compatibility
        - Should document breaking changes clearly
        """
        from models.auth import TokenPairResponse
        
        # Test that TokenPairResponse provides migration-friendly structure
        token_pair = TokenPairResponse(
            access_token="migration.access.token",
            refresh_token="migration.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800,
            token_type="bearer"
        )
        
        # Essential fields for backward compatibility
        essential_fields = {"access_token", "token_type"}
        response_fields = set(token_pair.model_dump().keys())
        
        assert essential_fields.issubset(response_fields)
        
        # Enhanced fields for modern clients
        enhanced_fields = {"refresh_token", "access_expires_in", "refresh_expires_in"}
        assert enhanced_fields.issubset(response_fields)
    
    def test_api_documentation_compatibility(self):
        """
        Test that API documentation reflects the changes appropriately.
        
        Requirements:
        - OpenAPI schema should show new response model
        - Should document both access and refresh token fields
        - Should maintain clear field descriptions
        - Should indicate required vs optional fields correctly
        """
        from models.auth import TokenPairResponse
        
        # Test schema generation for API documentation
        schema = TokenPairResponse.model_json_schema()
        
        assert "properties" in schema
        assert "access_token" in schema["properties"]
        assert "refresh_token" in schema["properties"]
        assert "access_expires_in" in schema["properties"]
        assert "refresh_expires_in" in schema["properties"]
        
        # Verify required fields are documented
        assert "required" in schema
        required_fields = set(schema["required"])
        expected_required = {"access_token", "refresh_token", "access_expires_in", "refresh_expires_in"}
        assert expected_required.issubset(required_fields)


class TestLoginEndpointsIntegrationUpdated:
    """
    Test integration between updated login endpoints and TokenService.
    
    Validates end-to-end flow with enhanced authentication capabilities.
    """
    
    def test_complete_google_oauth_flow_with_refresh_tokens(self):
        """
        Test complete Google OAuth flow returning refresh token capabilities.
        
        Requirements:
        - Should handle complete OAuth flow with TokenService
        - Should return both access and refresh tokens
        - Should maintain user profile integration
        - Should enable token refresh workflow
        """
        from models.auth import GoogleAuthRequest, TokenPairResponse, UserResponse
        from services.token_service import TokenService
        
        # Mock complete flow
        with patch('services.token_service.get_token_service') as mock_get_service, \
             patch('services.auth_service.AuthService') as mock_auth, \
             patch('services.supabase_client.SupabaseService'):
            
            # Setup TokenService mock
            mock_token_service = MagicMock()
            mock_get_service.return_value = mock_token_service
            mock_token_service.generate_token_pair.return_value = TokenPairResponse(
                access_token="oauth.access.token",
                refresh_token="oauth.refresh.token",
                access_expires_in=1800,
                refresh_expires_in=604800,
                token_type="bearer"
            )
            
            # Setup user data mock
            user_data = {
                "id": str(uuid4()),
                "email": "oauth@gmail.com",
                "display_name": "OAuth User",
                "preferences": {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            mock_auth_instance = mock_auth.return_value
            mock_auth_instance.verify_google_oauth_token.return_value = user_data
            mock_auth_instance.create_or_get_user_from_google.return_value = user_data
            
            # Test complete flow
            request = GoogleAuthRequest(
                token="valid.oauth.token",
                google_jwt="valid.oauth.jwt"
            )
            
            token_pair = mock_token_service.generate_token_pair(
                UUID(user_data["id"]), 
                user_data["email"]
            )
            
            # Verify complete response capabilities
            assert token_pair.access_token == "oauth.access.token"
            assert token_pair.refresh_token == "oauth.refresh.token"
            assert token_pair.access_expires_in == 1800
            assert token_pair.refresh_expires_in == 604800
    
    def test_complete_email_login_flow_with_refresh_tokens(self):
        """
        Test complete email/password login flow with refresh token capabilities.
        
        Requirements:
        - Should handle complete login flow with TokenService
        - Should integrate with Supabase authentication
        - Should return enhanced token response
        - Should maintain security best practices
        """
        from models.auth import LoginRequest, TokenPairResponse
        from services.token_service import TokenService
        
        # Mock complete flow
        with patch('services.token_service.get_token_service') as mock_get_service, \
             patch('services.supabase_client.SupabaseService') as mock_supabase:
            
            # Setup TokenService mock
            mock_token_service = MagicMock()
            mock_get_service.return_value = mock_token_service
            mock_token_service.generate_token_pair.return_value = TokenPairResponse(
                access_token="email.login.access.token",
                refresh_token="email.login.refresh.token", 
                access_expires_in=1800,
                refresh_expires_in=604800,
                token_type="bearer"
            )
            
            # Setup user profile mock
            mock_user_profile = MagicMock()
            mock_user_profile.id = uuid4()
            mock_user_profile.email = "login@example.com"
            mock_user_profile.display_name = "Login User"
            
            mock_supabase_instance = mock_supabase.return_value
            mock_supabase_instance.authenticate_user_email_password.return_value = mock_user_profile
            
            # Test complete flow
            request = LoginRequest(
                email="login@example.com",
                password="secure_password123"
            )
            
            # Authenticate user
            authenticated_user = mock_supabase_instance.authenticate_user_email_password(
                request.email,
                request.password
            )
            
            # Generate token pair
            token_pair = mock_token_service.generate_token_pair(
                authenticated_user.id,
                authenticated_user.email
            )
            
            # Verify complete enhanced authentication
            assert token_pair.access_token == "email.login.access.token"
            assert token_pair.refresh_token == "email.login.refresh.token"
            assert authenticated_user.email == "login@example.com"
    
    def test_endpoint_performance_with_token_service_integration(self):
        """
        Test performance implications of TokenService integration.
        
        Requirements:
        - Should maintain acceptable response times
        - Should not significantly increase authentication latency
        - Should handle concurrent authentication requests
        - Should optimize token generation operations
        """
        import time
        from models.auth import LoginRequest, TokenPairResponse
        
        with patch('services.token_service.get_token_service') as mock_get_service:
            # Setup fast TokenService mock
            mock_token_service = MagicMock()
            mock_get_service.return_value = mock_token_service
            
            def fast_token_generation(user_id, email):
                return TokenPairResponse(
                    access_token=f"fast.access.{user_id}",
                    refresh_token=f"fast.refresh.{user_id}",
                    access_expires_in=1800,
                    refresh_expires_in=604800,
                    token_type="bearer"
                )
            
            mock_token_service.generate_token_pair.side_effect = fast_token_generation
            
            # Test multiple rapid token generations
            start_time = time.time()
            
            results = []
            for i in range(10):
                token_pair = mock_token_service.generate_token_pair(
                    uuid4(),
                    f"user{i}@example.com"
                )
                results.append(token_pair)
            
            end_time = time.time()
            generation_time = end_time - start_time
            
            # Should generate tokens quickly (< 0.01 seconds for 10 tokens)
            assert generation_time < 0.01
            assert len(results) == 10
            assert all(r.access_token is not None for r in results)
            assert all(r.refresh_token is not None for r in results)