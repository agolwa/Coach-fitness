"""
Authentication Request/Response Pydantic Models

Defines authentication-related data models for:
- Google OAuth token exchange
- Email/password authentication
- JWT token management
- User authentication responses

These models align with Phase 5.3 test requirements and frontend TypeScript contracts.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator
from enum import Enum


class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth token exchange."""
    token: str = Field(..., description="Google OAuth access token")
    google_jwt: str = Field(..., description="Google JWT ID token")

    @field_validator('token')
    @classmethod
    def validate_token_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Google OAuth token cannot be empty")
        return v.strip()

    @field_validator('google_jwt')
    @classmethod
    def validate_jwt_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Google JWT token cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    """Request model for email/password authentication."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if len(v.strip()) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class TokenRefreshRequest(BaseModel):
    """Request model for JWT token refresh."""
    refresh_token: str = Field(..., description="JWT refresh token")

    @field_validator('refresh_token')
    @classmethod
    def validate_refresh_token_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Refresh token cannot be empty")
        return v.strip()


class WeightUnit(str, Enum):
    """Weight unit enumeration matching frontend TypeScript."""
    KG = "kg"
    LBS = "lbs"


class Theme(str, Enum):
    """Theme enumeration matching frontend TypeScript."""
    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"


class UserPreferences(BaseModel):
    """User preferences model matching database JSONB structure."""
    weightUnit: WeightUnit = Field(default=WeightUnit.LBS, description="Preferred weight unit")
    theme: Theme = Field(default=Theme.AUTO, description="UI theme preference")
    defaultRestTimer: int = Field(default=60, ge=0, le=600, description="Default rest timer in seconds")
    hapticFeedback: bool = Field(default=True, description="Enable haptic feedback")
    soundEnabled: bool = Field(default=True, description="Enable sound feedback")
    autoStartRestTimer: bool = Field(default=False, description="Auto-start rest timer after set")

    class Config:
        use_enum_values = True


class UserResponse(BaseModel):
    """User profile response model for API endpoints."""
    id: UUID = Field(..., description="User UUID")
    email: EmailStr = Field(..., description="User email address")
    display_name: Optional[str] = Field(None, description="User display name")
    preferences: UserPreferences = Field(..., description="User preferences")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last profile update timestamp")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class TokenResponse(BaseModel):
    """JWT token response model."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")


class TokenPairResponse(BaseModel):
    """Enhanced token pair response for Phase 5.3.1 refresh token implementation."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    access_expires_in: int = Field(..., description="Access token expiration in seconds")
    refresh_expires_in: int = Field(..., description="Refresh token expiration in seconds")
    token_type: str = Field(default="bearer", description="Token type")


class RefreshRequest(BaseModel):
    """Request model for token refresh endpoint."""
    refresh_token: str = Field(..., description="JWT refresh token to exchange")

    @field_validator('refresh_token')
    @classmethod
    def validate_refresh_token_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Refresh token cannot be empty")
        return v.strip()


class LoginResponse(BaseModel):
    """Complete authentication response model."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    user: UserResponse = Field(..., description="Authenticated user profile")


class JWTPayload(BaseModel):
    """JWT token payload structure."""
    sub: str = Field(..., description="Subject - User ID")
    email: EmailStr = Field(..., description="User email")
    iat: datetime = Field(..., description="Issued at timestamp")
    exp: datetime = Field(..., description="Expiration timestamp")

    @field_validator('sub')
    @classmethod
    def validate_user_id_format(cls, v):
        try:
            UUID(v)  # Validate UUID format
            return v
        except ValueError:
            raise ValueError("Subject must be a valid UUID string")

    class Config:
        json_encoders = {
            datetime: lambda v: int(v.timestamp()) if v else None
        }


class JWTToken(BaseModel):
    """JWT token wrapper with metadata."""
    token: str = Field(..., description="Encoded JWT token")
    payload: JWTPayload = Field(..., description="Decoded token payload")
    algorithm: str = Field(default="HS256", description="JWT signing algorithm")

    @field_validator('token')
    @classmethod
    def validate_jwt_format(cls, v):
        parts = v.split('.')
        if len(parts) != 3:
            raise ValueError("JWT token must have exactly 3 parts separated by dots")
        return v


class AuthErrorResponse(BaseModel):
    """Standard error response model for authentication endpoints."""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")
    
    @field_validator('detail')
    @classmethod
    def validate_detail_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Error detail cannot be empty")
        return v.strip()