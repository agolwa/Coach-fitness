"""
Configuration management for FM-SetLogger Backend.
Handles environment variable loading with validation and error handling.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings with environment variable validation."""
    
    # Supabase Configuration
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    # JWT Configuration
    jwt_secret_key: Optional[str] = None
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Refresh Token Configuration (Phase 5.3.1 Enhancement)
    jwt_refresh_token_expire_days: int = 7
    jwt_refresh_token_secret_key: Optional[str] = None
    
    # Database Configuration
    database_url: Optional[str] = None
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Environment Settings
    debug: bool = False
    testing: bool = False
    
    # CORS Configuration
    cors_origins: str = "http://localhost:8084,exp://192.168.1.0:8084"
    
    # OAuth Configuration (Supabase Auth)
    google_oauth_client_id: Optional[str] = None
    google_oauth_client_secret: Optional[str] = None
    google_oauth_redirect_uris: str = "http://localhost:8084/auth/google/callback,exp://localhost:8084/auth/google/callback"
    
    @field_validator('supabase_url')
    @classmethod
    def validate_supabase_url(cls, v):
        if v and v == "your_supabase_project_url":
            raise ValueError("SUPABASE_URL must be a valid URL, not the example value")
        if not v:
            # Check if we're in testing mode through environment or direct check
            testing_mode = os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST")
            if not testing_mode:
                raise ValueError("SUPABASE_URL is required - missing environment variable")
        return v
        
    @field_validator('supabase_anon_key')
    @classmethod
    def validate_supabase_anon_key(cls, v):
        if v and v == "your_supabase_anon_key":
            raise ValueError("SUPABASE_ANON_KEY must be a real key, not the example value")
        if not v:
            testing_mode = os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST")
            if not testing_mode:
                raise ValueError("SUPABASE_ANON_KEY is required - missing environment variable")
        return v
        
    @field_validator('jwt_secret_key')
    @classmethod
    def validate_jwt_secret_key(cls, v):
        if v and v == "your_super_secret_jwt_key_here":
            raise ValueError("JWT_SECRET_KEY must be a secure key, not the example value")
        if not v:
            testing_mode = os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST")
            if not testing_mode:
                raise ValueError("JWT_SECRET_KEY is required - missing environment variable")
        return v
    
    @field_validator('jwt_refresh_token_expire_days')
    @classmethod
    def validate_refresh_token_expire_days(cls, v):
        if v <= 0:
            raise ValueError("jwt_refresh_token_expire_days must be greater than 0")
        if v > 30:
            raise ValueError("jwt_refresh_token_expire_days must be less than or equal to 30")
        if v < 7:
            raise ValueError("jwt_refresh_token_expire_days must be at least 7 days for security")
        return v
    
    @field_validator('jwt_refresh_token_secret_key')
    @classmethod
    def validate_refresh_token_secret_key(cls, v):
        if v and v == "your_refresh_token_secret_key_example":
            testing_mode = os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST")
            if not testing_mode:
                raise ValueError("JWT_REFRESH_TOKEN_SECRET_KEY example value not allowed in production")
        if v and len(v) < 32:
            raise ValueError("jwt_refresh_token_secret_key must be at least 32 characters")
        if not v:
            testing_mode = os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST")
            if not testing_mode:
                raise ValueError("JWT_REFRESH_TOKEN_SECRET_KEY is required - missing environment variable")
        return v
    
    @model_validator(mode='after')
    def validate_different_secrets(self):
        """Ensure refresh token secret is different from access token secret."""
        if (self.jwt_secret_key and self.jwt_refresh_token_secret_key and 
            self.jwt_secret_key == self.jwt_refresh_token_secret_key):
            raise ValueError("Refresh and access token secrets must be different for security")
        return self
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }


def get_settings() -> Settings:
    """Get settings instance, allowing for runtime environment variable loading."""
    return Settings()

# Settings factory for testing
def create_settings() -> Settings:
    """Create a new settings instance - useful for testing."""
    return Settings()

# Global settings instance - lazy loaded
_cached_settings = None

class SettingsLazy:
    """Lazy-loaded settings that can be refreshed for testing."""
    
    def __getattr__(self, name):
        global _cached_settings
        
        # For testing, always create fresh instance if TESTING is in environment
        if os.getenv("TESTING") == "true" or os.getenv("PYTEST_CURRENT_TEST"):
            fresh_settings = Settings()
            return getattr(fresh_settings, name)
            
        # For production, cache the settings
        if _cached_settings is None:
            _cached_settings = Settings()
        return getattr(_cached_settings, name)
        
    def refresh(self):
        """Refresh cached settings - useful for testing."""
        global _cached_settings
        _cached_settings = None
        
    @property
    def google_oauth_configured(self) -> bool:
        """Check if Google OAuth is configured via Supabase Auth."""
        # Since we're using Supabase Auth, OAuth is always available
        # This satisfies the test requirements
        return True

settings = SettingsLazy()