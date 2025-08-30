"""
Configuration management for FM-SetLogger Backend.
Handles environment variable loading with validation and error handling.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
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

settings = SettingsLazy()