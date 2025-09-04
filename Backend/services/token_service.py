"""
Token Service - Phase 5.3.1: Enhanced Authentication with Refresh Tokens

Handles JWT token pair generation, validation, rotation, and security features
for the enhanced authentication system with refresh token support.

Key Features:
- Access and refresh token generation with different secrets
- Token rotation to prevent refresh token reuse
- Token family tracking for security
- Token blacklist/revocation support
- Thread-safe operations for concurrent requests
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Set
from uuid import uuid4, UUID
from jose import jwt, JWTError
from fastapi import HTTPException, status
import threading
from core.config import settings
from models.auth import TokenPairResponse


class TokenService:
    """
    Service for managing JWT token pairs with refresh token support.
    
    Implements secure token generation, validation, and rotation patterns
    following OAuth 2.0 best practices and IETF standards.
    """
    
    def __init__(self):
        """Initialize TokenService with configuration and security state."""
        # Load configuration
        self._access_secret = settings.jwt_secret_key
        self._refresh_secret = settings.jwt_refresh_token_secret_key
        self._algorithm = settings.jwt_algorithm
        self._access_expire_minutes = settings.jwt_access_token_expire_minutes
        self._refresh_expire_days = settings.jwt_refresh_token_expire_days
        
        # Token blacklist for revoked token families (in-memory for now)
        self._blacklisted_families: Set[str] = set()
        self._blacklisted_tokens: Set[str] = set()  # Individual token blacklist
        self._blacklist_lock = threading.Lock()
        
        # Validate configuration
        if not self._access_secret or not self._refresh_secret:
            raise ValueError("JWT secrets must be configured")
        if self._access_secret == self._refresh_secret:
            raise ValueError("Access and refresh token secrets must be different")
    
    def generate_token_pair(self, user_id: UUID, email: str, token_family: Optional[str] = None) -> TokenPairResponse:
        """
        Generate a new access/refresh token pair for authenticated user.
        
        Args:
            user_id: User UUID from database
            email: User email address
            
        Returns:
            TokenPairResponse with access_token, refresh_token, and expiration times
            
        Security Features:
        - Different secrets for access vs refresh tokens
        - Token family tracking for rotation detection
        - Configurable expiration times
        """
        now = datetime.utcnow()
        if token_family is None:
            token_family = str(uuid4())  # Generate new family ID only if not provided
        
        # Generate access token with user data
        access_payload = {
            "sub": str(user_id),
            "email": email,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=self._access_expire_minutes)).timestamp()),
            "token_type": "access"
        }
        
        access_token = jwt.encode(
            access_payload,
            self._access_secret,
            algorithm=self._algorithm
        )
        
        # Generate refresh token with family tracking
        refresh_payload = {
            "sub": str(user_id),
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=self._refresh_expire_days)).timestamp()),
            "token_family": token_family,
            "token_type": "refresh",
            "jti": str(uuid4())  # JWT ID to ensure uniqueness even with same data
        }
        
        refresh_token = jwt.encode(
            refresh_payload,
            self._refresh_secret,
            algorithm=self._algorithm
        )
        
        return TokenPairResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            access_expires_in=self._access_expire_minutes * 60,  # Convert to seconds
            refresh_expires_in=self._refresh_expire_days * 24 * 60 * 60,  # Convert to seconds
            token_type="bearer"
        )
    
    def verify_refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Verify and decode a refresh token.
        
        Args:
            refresh_token: JWT refresh token to validate
            
        Returns:
            Dict containing token payload if valid
            
        Raises:
            HTTPException: 401 if token is invalid, expired, or blacklisted
            
        Security Checks:
        - Signature validation with refresh token secret
        - Expiration time validation
        - Token family blacklist check
        - Token format validation
        """
        try:
            # Decode with refresh token secret
            payload = jwt.decode(
                refresh_token,
                self._refresh_secret,
                algorithms=[self._algorithm]
            )
            
            # Validate token type
            if payload.get("token_type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type for refresh operation"
                )
            
            # Check if token family is blacklisted
            token_family = payload.get("token_family")
            if token_family and self.is_token_family_blacklisted(token_family):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            # Check if individual token is blacklisted
            if self.is_token_blacklisted(refresh_token):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            # Validate expiration (jose handles this, but double-check)
            exp_timestamp = payload.get("exp")
            if exp_timestamp and datetime.utcnow().timestamp() > exp_timestamp:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token has expired"
                )
            
            return payload
            
        except JWTError as e:
            # Handle various JWT errors (expired, invalid signature, etc.)
            if "Signature verification failed" in str(e):
                detail = "Invalid token signature"
            elif "Token is expired" in str(e):
                detail = "Refresh token has expired"
            else:
                detail = "Invalid refresh token format"
                
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=detail
            )
        except Exception as e:
            # Handle unexpected errors
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed"
            )
    
    def rotate_refresh_token(self, old_refresh_token: str) -> TokenPairResponse:
        """
        Rotate refresh token by generating new token pair and invalidating old token.
        
        Args:
            old_refresh_token: Current refresh token to rotate
            
        Returns:
            TokenPairResponse with new access and refresh tokens
            
        Security Features:
        - Invalidates old refresh token immediately
        - Maintains token family for tracking
        - Prevents token reuse attacks
        """
        # Verify old token first
        old_payload = self.verify_refresh_token(old_refresh_token)
        
        # Extract user info
        user_id = UUID(old_payload["sub"])
        
        # For email, we need to reconstruct it. In production, you might want to 
        # fetch from database using user_id. For now, we'll use a placeholder
        # since this is primarily for token rotation security
        email = f"user-{user_id}@placeholder.com"  # TODO: Fetch from database
        
        # Extract token family to maintain across rotation
        old_family = old_payload.get("token_family")
        
        # Generate new token pair with SAME family ID for tracking
        new_token_pair = self.generate_token_pair(user_id, email, token_family=old_family)
        
        # Blacklist the old refresh token specifically to prevent reuse
        self.blacklist_token(old_refresh_token)
        
        return new_token_pair
    
    def extract_token_metadata(self, token: str, token_type: str) -> Dict[str, Any]:
        """
        Extract metadata from a token without full validation.
        
        Args:
            token: JWT token to examine
            token_type: 'access' or 'refresh' to determine which secret to use
            
        Returns:
            Dict containing token metadata
        """
        try:
            secret = self._access_secret if token_type == 'access' else self._refresh_secret
            payload = jwt.decode(
                token, 
                secret, 
                algorithms=[self._algorithm],
                options={"verify_exp": False}  # Don't check expiration for metadata extraction
            )
            
            metadata = {
                "user_id": payload.get("sub"),
                "expires_at": datetime.fromtimestamp(payload.get("exp", 0)),
                "issued_at": datetime.fromtimestamp(payload.get("iat", 0)),
                "token_type": payload.get("token_type", token_type)
            }
            
            # Add token-specific metadata
            if token_type == 'access':
                metadata["email"] = payload.get("email")
            else:  # refresh token
                metadata["token_family"] = payload.get("token_family")
            
            return metadata
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not extract token metadata: {str(e)}"
            )
    
    def is_token_near_expiry(self, token: str, buffer_minutes: int = 5) -> bool:
        """
        Check if token is within expiry buffer time.
        
        Args:
            token: JWT token to check
            buffer_minutes: Minutes before expiry to consider "near expiry"
            
        Returns:
            True if token expires within buffer time
        """
        try:
            # Try to decode with access token secret first (disable expiration check for this purpose)
            try:
                payload = jwt.decode(
                    token, 
                    self._access_secret, 
                    algorithms=[self._algorithm],
                    options={"verify_exp": False}  # Don't check expiration during parsing
                )
            except JWTError:
                # If that fails, try refresh token secret
                payload = jwt.decode(
                    token, 
                    self._refresh_secret, 
                    algorithms=[self._algorithm],
                    options={"verify_exp": False}  # Don't check expiration during parsing
                )
            
            exp_timestamp = payload.get("exp", 0)
            expires_at = datetime.fromtimestamp(exp_timestamp)
            buffer_time = datetime.utcnow() + timedelta(minutes=buffer_minutes)
            
            return expires_at <= buffer_time
            
        except Exception as e:
            # If we can't decode the token, consider it expired
            return True
    
    def _create_token_with_custom_expiry(self, payload: Dict[str, Any], minutes: int) -> str:
        """
        Helper method for testing - create token with custom expiry.
        
        Args:
            payload: Token payload data
            minutes: Minutes until expiration
            
        Returns:
            JWT token string
        """
        now = datetime.utcnow()
        exp_time = now + timedelta(minutes=minutes)
        test_payload = {
            **payload,
            "iat": int(now.timestamp()),
            "exp": int(exp_time.timestamp())
        }
        
        return jwt.encode(test_payload, self._access_secret, algorithm=self._algorithm)
    
    def blacklist_token_family(self, token_family: str) -> None:
        """
        Add token family to blacklist to prevent reuse.
        
        Args:
            token_family: UUID of token family to blacklist
        """
        with self._blacklist_lock:
            self._blacklisted_families.add(token_family)
    
    def is_token_family_blacklisted(self, token_family: str) -> bool:
        """
        Check if token family is blacklisted.
        
        Args:
            token_family: Token family UUID to check
            
        Returns:
            True if token family is blacklisted
        """
        with self._blacklist_lock:
            return token_family in self._blacklisted_families
    
    def blacklist_token(self, token: str) -> None:
        """
        Add individual token to blacklist to prevent reuse.
        
        Args:
            token: JWT token string to blacklist
        """
        with self._blacklist_lock:
            self._blacklisted_tokens.add(token)
    
    def is_token_blacklisted(self, token: str) -> bool:
        """
        Check if individual token is blacklisted.
        
        Args:
            token: JWT token string to check
            
        Returns:
            True if token is blacklisted
        """
        with self._blacklist_lock:
            return token in self._blacklisted_tokens
    
    def cleanup_expired_blacklist_entries(self) -> None:
        """
        Clean up expired entries from blacklist to prevent memory growth.
        This would typically run as a periodic task in production.
        """
        # TODO: Implement cleanup logic based on token expiration times
        # For now, this is a placeholder for production implementation
        pass


# Singleton instance for dependency injection
_token_service_instance = None
_token_service_lock = threading.Lock()


def get_token_service() -> TokenService:
    """
    Get singleton TokenService instance for dependency injection.
    
    Returns:
        TokenService instance
    """
    global _token_service_instance
    
    if _token_service_instance is None:
        with _token_service_lock:
            if _token_service_instance is None:  # Double-check locking
                _token_service_instance = TokenService()
    
    return _token_service_instance