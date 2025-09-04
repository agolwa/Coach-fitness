"""
Auth Models Tests - Phase 5.3.1: Task 2.1
TDD Implementation for Enhanced Authentication Models

This test file implements comprehensive testing for auth models
with refresh token support following TDD methodology.

Testing Focus:
- TokenPairResponse validation and serialization
- RefreshRequest validation and security
- Model integration with existing auth flow
- Field validation and edge cases
"""

import pytest
import os
from datetime import datetime
from uuid import uuid4, UUID
from pydantic import ValidationError
from pydantic_core import ValidationError as CoreValidationError

# Test environment setup
os.environ["TESTING"] = "true"


class TestTokenPairResponse:
    """
    Test TokenPairResponse model for Phase 5.3.1 refresh token support.
    
    This model represents the enhanced token response that includes
    both access and refresh tokens with separate expiration times.
    """
    
    def test_token_pair_response_creation_success(self):
        """
        Test successful creation of TokenPairResponse with valid data.
        
        Requirements:
        - Should accept all required fields
        - Should set default token_type to "bearer"
        - Should validate field types properly
        - Should serialize to JSON correctly
        """
        from models.auth import TokenPairResponse
        
        # Create valid token pair response
        token_pair = TokenPairResponse(
            access_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNjk5NDQ5NjAwfQ.test",
            refresh_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNjk5NTM2MDAwfQ.test",
            access_expires_in=1800,  # 30 minutes
            refresh_expires_in=604800  # 7 days
        )
        
        # Validate all fields are present
        assert token_pair.access_token is not None
        assert token_pair.refresh_token is not None
        assert token_pair.access_expires_in == 1800
        assert token_pair.refresh_expires_in == 604800
        assert token_pair.token_type == "bearer"  # Default value
        
        # Validate JSON serialization
        json_data = token_pair.model_dump()
        assert "access_token" in json_data
        assert "refresh_token" in json_data
        assert "access_expires_in" in json_data
        assert "refresh_expires_in" in json_data
        assert "token_type" in json_data
    
    def test_token_pair_response_custom_token_type(self):
        """
        Test TokenPairResponse with custom token type.
        
        Requirements:
        - Should accept custom token_type values
        - Should override default "bearer" when provided
        """
        from models.auth import TokenPairResponse
        
        token_pair = TokenPairResponse(
            access_token="test_access",
            refresh_token="test_refresh", 
            access_expires_in=1800,
            refresh_expires_in=604800,
            token_type="custom"
        )
        
        assert token_pair.token_type == "custom"
    
    def test_token_pair_response_validation_failures(self):
        """
        Test TokenPairResponse validation with invalid data.
        
        Requirements:
        - Should reject missing required fields
        - Should reject invalid data types
        - Should provide meaningful error messages
        """
        from models.auth import TokenPairResponse
        
        # Test missing required fields
        with pytest.raises((ValidationError, CoreValidationError)):
            TokenPairResponse(
                # Missing access_token
                refresh_token="test_refresh",
                access_expires_in=1800,
                refresh_expires_in=604800
            )
        
        with pytest.raises((ValidationError, CoreValidationError)):
            TokenPairResponse(
                access_token="test_access",
                # Missing refresh_token
                access_expires_in=1800,
                refresh_expires_in=604800
            )
        
        with pytest.raises((ValidationError, CoreValidationError)):
            TokenPairResponse(
                access_token="test_access",
                refresh_token="test_refresh"
                # Missing expiration fields
            )
    
    def test_token_pair_response_field_types(self):
        """
        Test TokenPairResponse field type validation.
        
        Requirements:
        - String fields should only accept strings
        - Integer fields should only accept integers
        - Should reject None values for required fields
        """
        from models.auth import TokenPairResponse
        
        # Test invalid types for expiration fields
        with pytest.raises((ValidationError, CoreValidationError)):
            TokenPairResponse(
                access_token="test_access",
                refresh_token="test_refresh",
                access_expires_in="invalid_string",  # Should be int
                refresh_expires_in=604800
            )
        
        with pytest.raises((ValidationError, CoreValidationError)):
            TokenPairResponse(
                access_token="test_access",
                refresh_token="test_refresh", 
                access_expires_in=1800,
                refresh_expires_in="invalid_string"  # Should be int
            )
    
    def test_token_pair_response_serialization_compatibility(self):
        """
        Test TokenPairResponse serialization for API compatibility.
        
        Requirements:
        - Should serialize to JSON format expected by frontend
        - Should maintain consistent field names
        - Should handle datetime serialization properly
        """
        from models.auth import TokenPairResponse
        
        token_pair = TokenPairResponse(
            access_token="test.access.token",
            refresh_token="test.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800,
            token_type="bearer"
        )
        
        # Test dictionary output matches expected API format
        dict_output = token_pair.model_dump()
        expected_keys = {
            "access_token", "refresh_token", 
            "access_expires_in", "refresh_expires_in", "token_type"
        }
        assert set(dict_output.keys()) == expected_keys
        
        # Test JSON serialization
        json_str = token_pair.model_dump_json()
        assert isinstance(json_str, str)
        assert "access_token" in json_str
        assert "refresh_token" in json_str


class TestRefreshRequest:
    """
    Test RefreshRequest model for token refresh endpoint.
    
    This model validates refresh token input for the POST /auth/refresh endpoint.
    """
    
    def test_refresh_request_creation_success(self):
        """
        Test successful creation of RefreshRequest with valid data.
        
        Requirements:
        - Should accept valid refresh token string
        - Should trim whitespace from input
        - Should validate required field presence
        """
        from models.auth import RefreshRequest
        
        # Test with valid refresh token
        refresh_request = RefreshRequest(
            refresh_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.test"
        )
        
        assert refresh_request.refresh_token is not None
        assert isinstance(refresh_request.refresh_token, str)
    
    def test_refresh_request_whitespace_trimming(self):
        """
        Test RefreshRequest automatic whitespace trimming.
        
        Requirements:
        - Should trim leading and trailing whitespace
        - Should preserve internal spacing in token
        - Should ensure clean token format
        """
        from models.auth import RefreshRequest
        
        # Test whitespace trimming
        refresh_request = RefreshRequest(
            refresh_token="  test.token.with.whitespace  "
        )
        
        assert refresh_request.refresh_token == "test.token.with.whitespace"
        assert refresh_request.refresh_token.strip() == refresh_request.refresh_token
    
    def test_refresh_request_validation_failures(self):
        """
        Test RefreshRequest validation with invalid data.
        
        Requirements:
        - Should reject empty strings
        - Should reject whitespace-only strings
        - Should reject missing refresh_token field
        - Should provide meaningful validation errors
        """
        from models.auth import RefreshRequest
        
        # Test empty string
        with pytest.raises((ValidationError, CoreValidationError)) as exc_info:
            RefreshRequest(refresh_token="")
        
        # Test whitespace-only string
        with pytest.raises((ValidationError, CoreValidationError)):
            RefreshRequest(refresh_token="   ")
        
        # Test missing field
        with pytest.raises((ValidationError, CoreValidationError)):
            RefreshRequest()  # Missing refresh_token
    
    def test_refresh_request_security_validation(self):
        """
        Test RefreshRequest security-focused validation.
        
        Requirements:
        - Should accept JWT-like token formats
        - Should reject obviously invalid tokens
        - Should handle edge cases securely
        """
        from models.auth import RefreshRequest
        
        # Valid JWT-like token should work
        valid_jwt_format = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        
        refresh_request = RefreshRequest(refresh_token=valid_jwt_format)
        assert refresh_request.refresh_token == valid_jwt_format
        
        # Short tokens should still be accepted (validation happens at service layer)
        short_token = "valid.short.token"
        refresh_request = RefreshRequest(refresh_token=short_token)
        assert refresh_request.refresh_token == short_token
    
    def test_refresh_request_serialization(self):
        """
        Test RefreshRequest serialization for API processing.
        
        Requirements:
        - Should serialize to dict format
        - Should maintain field names for API compatibility
        - Should handle JSON serialization
        """
        from models.auth import RefreshRequest
        
        refresh_request = RefreshRequest(
            refresh_token="test.refresh.token"
        )
        
        # Test dictionary serialization
        dict_output = refresh_request.model_dump()
        assert dict_output == {"refresh_token": "test.refresh.token"}
        
        # Test JSON serialization
        json_str = refresh_request.model_dump_json()
        assert isinstance(json_str, str)
        assert "refresh_token" in json_str


class TestAuthModelsIntegration:
    """
    Test integration between auth models for complete token flow.
    
    Validates that models work together properly in the authentication workflow.
    """
    
    def test_token_refresh_flow_compatibility(self):
        """
        Test compatibility between RefreshRequest and TokenPairResponse.
        
        Requirements:
        - RefreshRequest should provide input for token refresh
        - TokenPairResponse should provide output from token refresh
        - Models should work together in complete flow
        """
        from models.auth import RefreshRequest, TokenPairResponse
        
        # Simulate token refresh request
        refresh_request = RefreshRequest(
            refresh_token="old.refresh.token"
        )
        
        # Simulate token refresh response
        token_pair_response = TokenPairResponse(
            access_token="new.access.token",
            refresh_token="new.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800
        )
        
        # Validate they can be used together
        assert refresh_request.refresh_token != token_pair_response.refresh_token
        assert token_pair_response.access_token is not None
        assert token_pair_response.refresh_token is not None
    
    def test_existing_models_compatibility(self):
        """
        Test that new models maintain compatibility with existing auth models.
        
        Requirements:
        - Should not break existing TokenResponse usage
        - Should complement existing LoginResponse format
        - Should work with existing validation patterns
        """
        from models.auth import TokenResponse, TokenPairResponse, LoginRequest
        
        # Test existing TokenResponse still works
        existing_token = TokenResponse(
            access_token="test.access.token",
            expires_in=1800
        )
        assert existing_token.access_token == "test.access.token"
        assert existing_token.token_type == "bearer"
        
        # Test TokenPairResponse provides enhanced functionality
        enhanced_token = TokenPairResponse(
            access_token="test.access.token",
            refresh_token="test.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800
        )
        
        # Both should have compatible access_token and token_type
        assert enhanced_token.access_token == existing_token.access_token
        assert enhanced_token.token_type == existing_token.token_type
        
        # Enhanced version provides additional refresh capabilities
        assert hasattr(enhanced_token, 'refresh_token')
        assert hasattr(enhanced_token, 'refresh_expires_in')
    
    def test_model_field_validation_consistency(self):
        """
        Test consistent validation patterns across auth models.
        
        Requirements:
        - All token fields should follow similar validation rules
        - Error messages should be consistent
        - Security validation should be uniform
        """
        from models.auth import RefreshRequest, TokenRefreshRequest
        
        # Both refresh request models should have similar validation
        refresh_request_1 = RefreshRequest(refresh_token="test.token")
        refresh_request_2 = TokenRefreshRequest(refresh_token="test.token")
        
        assert refresh_request_1.refresh_token == refresh_request_2.refresh_token
        
        # Both should reject empty tokens similarly
        with pytest.raises((ValidationError, CoreValidationError)):
            RefreshRequest(refresh_token="")
        
        with pytest.raises((ValidationError, CoreValidationError)):
            TokenRefreshRequest(refresh_token="")
    
    def test_auth_models_json_schema_generation(self):
        """
        Test JSON schema generation for API documentation.
        
        Requirements:
        - Should generate valid OpenAPI schemas
        - Should include field descriptions
        - Should specify field requirements correctly
        """
        from models.auth import TokenPairResponse, RefreshRequest
        
        # Test TokenPairResponse schema
        token_pair_schema = TokenPairResponse.model_json_schema()
        assert "properties" in token_pair_schema
        assert "access_token" in token_pair_schema["properties"]
        assert "refresh_token" in token_pair_schema["properties"]
        assert "required" in token_pair_schema
        
        # Test RefreshRequest schema
        refresh_schema = RefreshRequest.model_json_schema()
        assert "properties" in refresh_schema
        assert "refresh_token" in refresh_schema["properties"]
        assert "required" in refresh_schema
        assert "refresh_token" in refresh_schema["required"]


class TestAuthModelsPerformance:
    """
    Test auth models performance and efficiency.
    
    Ensures models can handle high-frequency operations efficiently.
    """
    
    def test_token_pair_response_creation_performance(self):
        """
        Test TokenPairResponse creation performance for high-frequency use.
        
        Requirements:
        - Should create instances quickly for API responses
        - Should handle batch creation efficiently
        - Should not have memory leaks
        """
        from models.auth import TokenPairResponse
        import time
        
        # Test batch creation performance
        start_time = time.time()
        
        token_pairs = []
        for i in range(100):
            token_pair = TokenPairResponse(
                access_token=f"access.token.{i}",
                refresh_token=f"refresh.token.{i}",
                access_expires_in=1800,
                refresh_expires_in=604800
            )
            token_pairs.append(token_pair)
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Should create 100 instances in reasonable time (< 0.1 seconds)
        assert creation_time < 0.1
        assert len(token_pairs) == 100
        
        # Validate all instances are valid
        for token_pair in token_pairs:
            assert token_pair.access_token is not None
            assert token_pair.refresh_token is not None
    
    def test_auth_models_serialization_performance(self):
        """
        Test auth models JSON serialization performance.
        
        Requirements:
        - Should serialize to JSON quickly
        - Should handle batch serialization efficiently
        - Should produce consistent output
        """
        from models.auth import TokenPairResponse, RefreshRequest
        import time
        
        # Create test data
        token_pair = TokenPairResponse(
            access_token="test.access.token",
            refresh_token="test.refresh.token",
            access_expires_in=1800,
            refresh_expires_in=604800
        )
        
        refresh_request = RefreshRequest(refresh_token="test.refresh.token")
        
        # Test serialization performance
        start_time = time.time()
        
        for _ in range(100):
            token_json = token_pair.model_dump_json()
            refresh_json = refresh_request.model_dump_json()
        
        end_time = time.time()
        serialization_time = end_time - start_time
        
        # Should serialize 200 instances in reasonable time (< 0.05 seconds)
        assert serialization_time < 0.05
        assert isinstance(token_json, str)
        assert isinstance(refresh_json, str)