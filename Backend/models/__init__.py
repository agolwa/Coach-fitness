"""
Models package for Pydantic model definitions.
Contains request/response models and data validation schemas.
"""

# Authentication models
from .auth import (
    GoogleAuthRequest,
    LoginRequest,
    TokenRefreshRequest,
    TokenResponse,
    LoginResponse,
    UserResponse,
    JWTPayload,
    JWTToken,
    AuthErrorResponse,
    UserPreferences,
    WeightUnit,
    Theme
)

# User profile models
from .user import (
    UserProfile,
    CreateUserRequest,
    UpdateUserRequest,
    UserPublicProfile,
    UserPreferencesUpdate,
    UserStats,
    GoogleUserData,
    UserEmailUpdate,
    UserPasswordUpdate
)

__all__ = [
    # Authentication models
    "GoogleAuthRequest",
    "LoginRequest", 
    "TokenRefreshRequest",
    "TokenResponse",
    "LoginResponse",
    "UserResponse",
    "JWTPayload",
    "JWTToken",
    "AuthErrorResponse",
    "UserPreferences",
    "WeightUnit",
    "Theme",
    
    # User profile models
    "UserProfile",
    "CreateUserRequest",
    "UpdateUserRequest", 
    "UserPublicProfile",
    "UserPreferencesUpdate",
    "UserStats",
    "GoogleUserData",
    "UserEmailUpdate",
    "UserPasswordUpdate"
]