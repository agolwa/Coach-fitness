"""
User Profile Pydantic Models

Defines user-related data models for:
- Complete user profile management
- User preference handling
- User creation and updates
- Database-aligned user data

These models match Phase 5.1 database schema and frontend TypeScript contracts.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator
from .auth import UserPreferences, WeightUnit, Theme


class UserProfile(BaseModel):
    """Complete user profile model matching database schema."""
    id: UUID = Field(..., description="User UUID primary key")
    email: EmailStr = Field(..., description="Unique user email address")
    display_name: Optional[str] = Field(None, max_length=100, description="User display name")
    preferences: UserPreferences = Field(..., description="User preferences JSONB")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last profile update timestamp")

    @field_validator('display_name')
    @classmethod
    def validate_display_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None  # Convert empty string to None
            if len(v) > 100:
                raise ValueError("Display name must be 100 characters or less")
        return v

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            UUID: lambda v: str(v) if v else None
        }


class CreateUserRequest(BaseModel):
    """Request model for creating new user from OAuth data."""
    id: UUID = Field(..., description="User UUID from auth provider")
    email: EmailStr = Field(..., description="User email address")
    display_name: Optional[str] = Field(None, max_length=100, description="User display name")
    preferences: Optional[UserPreferences] = Field(None, description="Initial user preferences")

    @field_validator('display_name')
    @classmethod
    def validate_display_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 100:
                raise ValueError("Display name must be 100 characters or less")
        return v

    @field_validator('preferences', mode='before')
    @classmethod
    def set_default_preferences(cls, v):
        if v is None:
            return UserPreferences()  # Use default preferences
        return v


class UpdateUserRequest(BaseModel):
    """Request model for updating user profile."""
    display_name: Optional[str] = Field(None, max_length=100, description="Updated display name")
    preferences: Optional[UserPreferences] = Field(None, description="Updated user preferences")

    @field_validator('display_name')
    @classmethod
    def validate_display_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 100:
                raise ValueError("Display name must be 100 characters or less")
        return v

    class Config:
        # Allow partial updates - only include fields that are not None
        exclude_none = True


class UserPublicProfile(BaseModel):
    """Public user profile for sharing/display purposes."""
    id: UUID = Field(..., description="User UUID")
    display_name: Optional[str] = Field(None, description="User display name")
    created_at: datetime = Field(..., description="Account creation date")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            UUID: lambda v: str(v) if v else None
        }


class UserPreferencesUpdate(BaseModel):
    """Partial user preferences update model."""
    weightUnit: Optional[WeightUnit] = Field(None, description="Preferred weight unit")
    theme: Optional[Theme] = Field(None, description="UI theme preference") 
    defaultRestTimer: Optional[int] = Field(None, ge=0, le=600, description="Default rest timer in seconds")
    hapticFeedback: Optional[bool] = Field(None, description="Enable haptic feedback")
    soundEnabled: Optional[bool] = Field(None, description="Enable sound feedback")
    autoStartRestTimer: Optional[bool] = Field(None, description="Auto-start rest timer after set")

    class Config:
        use_enum_values = True
        exclude_none = True  # Only include fields that are explicitly set


class UserStats(BaseModel):
    """User statistics model for dashboard/profile display."""
    total_workouts: int = Field(default=0, ge=0, description="Total completed workouts")
    total_exercises: int = Field(default=0, ge=0, description="Total exercises performed")
    total_sets: int = Field(default=0, ge=0, description="Total sets completed")
    total_workout_time: int = Field(default=0, ge=0, description="Total workout time in minutes")
    favorite_exercises: list[str] = Field(default_factory=list, description="Most frequently used exercises")
    current_streak: int = Field(default=0, ge=0, description="Current workout streak in days")
    longest_streak: int = Field(default=0, ge=0, description="Longest workout streak in days")

    class Config:
        from_attributes = True


class GoogleUserData(BaseModel):
    """Google OAuth user data structure."""
    id: str = Field(..., description="Google user ID")
    email: EmailStr = Field(..., description="Google user email")
    name: Optional[str] = Field(None, description="Google user full name")
    picture: Optional[str] = Field(None, description="Google user profile picture URL")
    given_name: Optional[str] = Field(None, description="Google user first name")
    family_name: Optional[str] = Field(None, description="Google user last name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 100:
                raise ValueError("Name must be 100 characters or less")
        return v

    @field_validator('picture')
    @classmethod
    def validate_picture_url(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            # Basic URL validation
            if not (v.startswith('http://') or v.startswith('https://')):
                raise ValueError("Picture URL must be a valid HTTP/HTTPS URL")
        return v


class UserEmailUpdate(BaseModel):
    """Model for email update requests."""
    new_email: EmailStr = Field(..., description="New email address")
    password: str = Field(..., min_length=6, description="Current password for verification")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v.strip()) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserPasswordUpdate(BaseModel):
    """Model for password update requests."""
    current_password: str = Field(..., min_length=6, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., min_length=8, description="Password confirmation")

    @field_validator('new_password')
    @classmethod
    def validate_new_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v

    @field_validator('confirm_password')
    @classmethod
    def validate_passwords_match(cls, v, info):
        if info.data.get('new_password') and v != info.data['new_password']:
            raise ValueError("Passwords do not match")
        return v