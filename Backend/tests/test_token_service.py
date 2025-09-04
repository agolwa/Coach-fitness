"""
Token Service Tests - Phase 5.3.1: Task 1.2
TDD Implementation for Token Service Layer

This test file implements RED phase testing for the TokenService class
that will handle refresh token generation, validation, and rotation.

Following TDD methodology: Write failing tests first, then implement
TokenService to make them pass.
"""

import pytest
import os
from datetime import datetime, timedelta
from uuid import uuid4, UUID
from unittest.mock import patch, MagicMock
from jose import jwt, JWTError

# Test environment setup
os.environ["TESTING"] = "true"


class TestTokenService:
    """
    Test TokenService implementation for refresh token management.
    
    RED Phase Tests - These should FAIL initially until TokenService
    is implemented in Backend/services/token_service.py
    """
    
    def test_token_service_import_and_instantiation(self):
        """
        Test that TokenService class can be imported and instantiated.
        
        Requirements:
        - TokenService class should exist in services/token_service.py
        - Should be importable without errors
        - Should instantiate successfully
        """
        from services.token_service import TokenService
        
        token_service = TokenService()
        assert token_service is not None
        assert hasattr(token_service, 'generate_token_pair')
        assert hasattr(token_service, 'verify_refresh_token')
        assert hasattr(token_service, 'rotate_refresh_token')
    
    def test_generate_token_pair_basic_functionality(self):
        """
        Test basic token pair generation functionality.
        
        Requirements:
        - Should generate both access and refresh tokens
        - Tokens should have different expiration times
        - Should return TokenPairResponse structure
        - Access token expires in 30 minutes
        - Refresh token expires in 7 days
        """
        from services.token_service import TokenService
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        token_pair = token_service.generate_token_pair(user_id, email)
        
        # Test response structure
        assert hasattr(token_pair, 'access_token')
        assert hasattr(token_pair, 'refresh_token')
        assert hasattr(token_pair, 'access_expires_in')
        assert hasattr(token_pair, 'refresh_expires_in')
        assert hasattr(token_pair, 'token_type')
        
        # Test token properties
        assert token_pair.access_token is not None
        assert token_pair.refresh_token is not None
        assert token_pair.access_token != token_pair.refresh_token
        assert token_pair.token_type == "bearer"
        
        # Test expiration times
        assert token_pair.access_expires_in == 1800  # 30 minutes
        assert token_pair.refresh_expires_in == 604800  # 7 days
    
    def test_token_pair_contains_correct_payload_data(self):
        """
        Test that generated tokens contain correct user data.
        
        Requirements:
        - Access token should contain user_id, email, expiration
        - Refresh token should contain user_id, token_family, expiration
        - Both tokens should be valid JWT tokens
        - Should use correct signing algorithms and secrets
        """
        from services.token_service import TokenService
        from core.config import settings
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        token_pair = token_service.generate_token_pair(user_id, email)
        
        # Decode and validate access token (skip expiration check for testing)
        access_payload = jwt.decode(
            token_pair.access_token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm],
            options={"verify_exp": False}
        )
        assert access_payload['sub'] == str(user_id)
        assert access_payload['email'] == email
        assert access_payload['exp'] > datetime.utcnow().timestamp()
        
        # Decode and validate refresh token (skip expiration check for testing)
        refresh_payload = jwt.decode(
            token_pair.refresh_token,
            settings.jwt_refresh_token_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"verify_exp": False}
        )
        assert refresh_payload['sub'] == str(user_id)
        assert 'token_family' in refresh_payload
        assert refresh_payload['exp'] > datetime.utcnow().timestamp()
        
        # Refresh token should expire much later than access token
        assert refresh_payload['exp'] > access_payload['exp']
    
    def test_verify_refresh_token_success(self):
        """
        Test successful refresh token verification.
        
        Requirements:
        - Should validate refresh token signature
        - Should check token expiration
        - Should return token payload for valid tokens
        - Should work with tokens generated by generate_token_pair
        """
        from services.token_service import TokenService
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        # Generate token pair
        token_pair = token_service.generate_token_pair(user_id, email)
        
        # Verify refresh token
        payload = token_service.verify_refresh_token(token_pair.refresh_token)
        
        assert payload is not None
        assert payload['sub'] == str(user_id)
        assert 'token_family' in payload
        assert payload['exp'] > datetime.utcnow().timestamp()
    
    def test_verify_refresh_token_failure_cases(self):
        """
        Test refresh token verification failure scenarios.
        
        Requirements:
        - Should reject invalid/malformed tokens
        - Should reject expired tokens
        - Should reject tokens with wrong signature
        - Should reject access tokens (wrong secret)
        - Should raise appropriate exceptions
        """
        from services.token_service import TokenService
        from fastapi import HTTPException
        
        token_service = TokenService()
        
        # Test invalid token format
        with pytest.raises(HTTPException) as exc_info:
            token_service.verify_refresh_token("invalid.token.format")
        assert exc_info.value.status_code == 401
        
        # Test completely invalid token
        with pytest.raises(HTTPException):
            token_service.verify_refresh_token("totally-invalid-token")
        
        # Test access token used as refresh token (wrong secret)
        user_id = uuid4()
        email = "test@example.com"
        token_pair = token_service.generate_token_pair(user_id, email)
        
        with pytest.raises(HTTPException):
            token_service.verify_refresh_token(token_pair.access_token)
    
    def test_token_rotation_prevents_reuse(self):
        """
        Test that token rotation prevents old refresh token reuse.
        
        Requirements:
        - Should generate new token pair from valid refresh token
        - Old refresh token should become invalid after rotation
        - New tokens should have different values
        - Token family should be tracked for security
        """
        from services.token_service import TokenService
        from fastapi import HTTPException
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        # Generate initial token pair
        original_pair = token_service.generate_token_pair(user_id, email)
        
        # Rotate tokens
        new_pair = token_service.rotate_refresh_token(original_pair.refresh_token)
        
        # New tokens should be different
        assert new_pair.access_token != original_pair.access_token
        assert new_pair.refresh_token != original_pair.refresh_token
        
        # Old refresh token should be invalid
        with pytest.raises(HTTPException):
            token_service.verify_refresh_token(original_pair.refresh_token)
        
        # New refresh token should work
        payload = token_service.verify_refresh_token(new_pair.refresh_token)
        assert payload['sub'] == str(user_id)
    
    def test_token_family_tracking(self):
        """
        Test token family tracking for rotation detection.
        
        Requirements:
        - Each token pair should have unique family ID
        - Rotated tokens should maintain family relationship
        - Should detect and prevent token replay attacks
        - Family ID should be UUID format
        """
        from services.token_service import TokenService
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        # Generate original token pair
        original_pair = token_service.generate_token_pair(user_id, email)
        
        # Extract family ID from refresh token
        original_payload = token_service.verify_refresh_token(original_pair.refresh_token)
        original_family = original_payload['token_family']
        
        # Validate family ID format
        UUID(original_family)  # Should not raise exception if valid UUID
        
        # Rotate token
        rotated_pair = token_service.rotate_refresh_token(original_pair.refresh_token)
        rotated_payload = token_service.verify_refresh_token(rotated_pair.refresh_token)
        rotated_family = rotated_payload['token_family']
        
        # Family should be maintained across rotation
        assert rotated_family == original_family
    
    def test_extract_token_metadata(self):
        """
        Test token metadata extraction functionality.
        
        Requirements:
        - Should extract user_id from tokens
        - Should extract expiration times
        - Should extract token type/purpose
        - Should work for both access and refresh tokens
        """
        from services.token_service import TokenService
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        token_pair = token_service.generate_token_pair(user_id, email)
        
        # Test access token metadata
        access_metadata = token_service.extract_token_metadata(token_pair.access_token, 'access')
        assert access_metadata['user_id'] == str(user_id)
        assert access_metadata['email'] == email
        assert 'expires_at' in access_metadata
        
        # Test refresh token metadata
        refresh_metadata = token_service.extract_token_metadata(token_pair.refresh_token, 'refresh')
        assert refresh_metadata['user_id'] == str(user_id)
        assert 'token_family' in refresh_metadata
        assert 'expires_at' in refresh_metadata
    
    def test_token_expiration_buffer_logic(self):
        """
        Test token expiration buffer and early refresh logic.
        
        Requirements:
        - Should detect tokens nearing expiration
        - Should allow early refresh within buffer period (5 minutes)
        - Should prevent refresh too early
        - Should handle edge cases properly
        """
        from services.token_service import TokenService
        
        token_service = TokenService()
        
        # Test near-expiration detection
        near_expiry_token = token_service._create_token_with_custom_expiry(
            {'sub': str(uuid4())}, 
            minutes=4  # Expires in 4 minutes - within buffer
        )
        
        is_near_expiry = token_service.is_token_near_expiry(near_expiry_token)
        assert is_near_expiry is True
        
        # Test token with plenty of time left
        fresh_token = token_service._create_token_with_custom_expiry(
            {'sub': str(uuid4())}, 
            minutes=20  # Expires in 20 minutes - not near expiry
        )
        
        is_fresh = token_service.is_token_near_expiry(fresh_token)
        assert is_fresh is False
    
    def test_token_blacklist_integration(self):
        """
        Test token blacklist/revocation functionality.
        
        Requirements:
        - Should track revoked token families
        - Should reject tokens from blacklisted families
        - Should handle blacklist cleanup for expired tokens
        - Should integrate with token rotation
        """
        from services.token_service import TokenService
        from fastapi import HTTPException
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        # Generate token pair
        token_pair = token_service.generate_token_pair(user_id, email)
        
        # Blacklist the token family
        payload = token_service.verify_refresh_token(token_pair.refresh_token)
        token_family = payload['token_family']
        token_service.blacklist_token_family(token_family)
        
        # Token should now be rejected
        with pytest.raises(HTTPException) as exc_info:
            token_service.verify_refresh_token(token_pair.refresh_token)
        assert exc_info.value.status_code == 401
    
    def test_concurrent_token_operations(self):
        """
        Test thread safety and concurrent token operations.
        
        Requirements:
        - Should handle concurrent token generation
        - Should handle concurrent token rotation
        - Should maintain data consistency
        - Should prevent race conditions
        """
        from services.token_service import TokenService
        import threading
        from concurrent.futures import ThreadPoolExecutor
        
        token_service = TokenService()
        user_id = uuid4()
        email = "test@example.com"
        
        # Test concurrent token generation
        results = []
        
        def generate_token():
            pair = token_service.generate_token_pair(user_id, email)
            results.append(pair.refresh_token)
        
        # Run multiple concurrent generations
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(generate_token) for _ in range(10)]
            for future in futures:
                future.result()
        
        # All tokens should be unique
        assert len(set(results)) == len(results)
    
    def test_token_service_error_handling(self):
        """
        Test comprehensive error handling in TokenService.
        
        Requirements:
        - Should handle malformed tokens gracefully
        - Should provide meaningful error messages
        - Should use appropriate HTTP status codes
        - Should log security events
        """
        from services.token_service import TokenService
        from fastapi import HTTPException
        
        token_service = TokenService()
        
        # Test various error scenarios
        error_cases = [
            ("", "Empty token"),
            ("invalid", "Invalid token format"),
            ("invalid.token", "Malformed token"),
            ("header.payload.badsignature", "Invalid signature")
        ]
        
        for bad_token, description in error_cases:
            with pytest.raises(HTTPException) as exc_info:
                token_service.verify_refresh_token(bad_token)
            
            # Should be 401 Unauthorized
            assert exc_info.value.status_code == 401
            # Should have meaningful detail
            assert len(exc_info.value.detail) > 0
    
    def test_token_service_configuration_dependency(self):
        """
        Test that TokenService properly uses configuration settings.
        
        Requirements:
        - Should use settings for secret keys
        - Should use settings for expiration times
        - Should use settings for algorithm
        - Should adapt to configuration changes
        """
        from services.token_service import TokenService
        from core.config import settings
        
        token_service = TokenService()
        
        # Verify it uses configuration
        assert token_service._access_secret == settings.jwt_secret_key
        assert token_service._refresh_secret == settings.jwt_refresh_token_secret_key
        assert token_service._algorithm == settings.jwt_algorithm
        assert token_service._access_expire_minutes == settings.jwt_access_token_expire_minutes
        assert token_service._refresh_expire_days == settings.jwt_refresh_token_expire_days
    
    def test_token_service_dependency_injection_ready(self):
        """
        Test that TokenService is ready for FastAPI dependency injection.
        
        Requirements:
        - Should be importable as singleton
        - Should work with FastAPI Depends()
        - Should maintain state consistency
        - Should be thread-safe for web requests
        """
        from services.token_service import TokenService, get_token_service
        
        # Test singleton pattern
        service1 = get_token_service()
        service2 = get_token_service()
        assert service1 is service2  # Should be same instance
        
        # Test it's a TokenService
        assert isinstance(service1, TokenService)
        
        # Test basic functionality works through dependency
        user_id = uuid4()
        email = "test@example.com"
        pair = service1.generate_token_pair(user_id, email)
        assert pair.access_token is not None