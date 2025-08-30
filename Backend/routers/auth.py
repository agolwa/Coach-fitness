"""
Authentication Router - Phase 5.3 TDD Implementation

FastAPI router implementing 3 core authentication endpoints:
- POST /auth/google - Google OAuth callback
- POST /auth/login - Email/password authentication  
- GET /auth/me - Protected user profile endpoint

Integrates with existing services layer (AuthService, SupabaseService)
and uses established Pydantic models for request/response validation.
Follows clean architecture patterns from Phase 5.2.
"""

from typing import Dict, Any
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer

# Import existing services and models - no new files needed
from services.auth_service import AuthService, get_current_user
from services.supabase_client import SupabaseService
from models.auth import (
    GoogleAuthRequest, 
    LoginRequest, 
    LoginResponse, 
    UserResponse,
    AuthErrorResponse
)

# Configure logging
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/auth", 
    tags=["authentication"],
    responses={
        401: {"model": AuthErrorResponse, "description": "Authentication failed"},
        422: {"model": AuthErrorResponse, "description": "Validation error"},
        500: {"model": AuthErrorResponse, "description": "Internal server error"}
    }
)

# Security scheme for Swagger documentation
security = HTTPBearer()

# Initialize services - reusing existing implementation
auth_service = AuthService()
supabase_service = SupabaseService()


@router.post("/google", response_model=LoginResponse, status_code=200)
async def google_oauth_callback(request: GoogleAuthRequest) -> LoginResponse:
    """
    Google OAuth callback endpoint - exchanges Google OAuth token for app JWT.
    
    Process:
    1. Validate Google OAuth token using AuthService
    2. Create/retrieve user via SupabaseService
    3. Generate app JWT token
    4. Return LoginResponse with JWT and user profile
    
    Args:
        request: GoogleAuthRequest containing Google OAuth tokens
        
    Returns:
        LoginResponse with JWT access token and user profile
        
    Raises:
        HTTPException: 401 for invalid Google token, 500 for server errors
    """
    try:
        logger.info(f"Google OAuth authentication attempt")
        
        # Step 1: Verify Google OAuth token using existing AuthService
        google_user_data = auth_service.verify_google_oauth_token(request.google_jwt)
        
        # Step 2: Create or retrieve user using existing SupabaseService  
        user_data = auth_service.create_or_get_user_from_google(google_user_data)
        
        # Step 3: Generate JWT token using existing AuthService
        jwt_token = auth_service.create_jwt_token(
            user_id=user_data["id"],
            email=user_data["email"]
        )
        
        # Step 4: Build LoginResponse using existing models
        user_response = UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            display_name=user_data["display_name"],
            preferences=user_data["preferences"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"]
        )
        
        login_response = LoginResponse(
            access_token=jwt_token,
            token_type="bearer",
            expires_in=3600,  # 1 hour in seconds
            user=user_response
        )
        
        logger.info(f"Google OAuth authentication successful for user {user_data['email']}")
        return login_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Google OAuth authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth authentication failed"
        )


@router.post("/login", response_model=LoginResponse, status_code=200)  
async def email_password_login(request: LoginRequest) -> LoginResponse:
    """
    Email/password authentication endpoint.
    
    Process:
    1. Validate credentials against Supabase Auth
    2. Generate app JWT token
    3. Return LoginResponse with JWT and user profile
    
    Args:
        request: LoginRequest containing email and password
        
    Returns:
        LoginResponse with JWT access token and user profile
        
    Raises:
        HTTPException: 401 for invalid credentials, 500 for server errors
    """
    try:
        logger.info(f"Email authentication attempt for {request.email}")
        
        # Step 1: Authenticate against Supabase using existing SupabaseService
        user_profile = supabase_service.authenticate_user_email_password(
            request.email, 
            request.password
        )
        
        # Step 2: Generate JWT token using existing AuthService
        jwt_token = auth_service.create_jwt_token(
            user_id=user_profile.id,
            email=user_profile.email
        )
        
        # Step 3: Build LoginResponse using existing models
        user_response = UserResponse(
            id=user_profile.id,
            email=user_profile.email,
            display_name=user_profile.display_name,
            preferences=user_profile.preferences,
            created_at=user_profile.created_at,
            updated_at=user_profile.updated_at
        )
        
        login_response = LoginResponse(
            access_token=jwt_token,
            token_type="bearer", 
            expires_in=3600,  # 1 hour in seconds
            user=user_response
        )
        
        logger.info(f"Email authentication successful for {request.email}")
        return login_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from services (401 for invalid credentials)
        raise
    except Exception as e:
        logger.error(f"Email authentication failed for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.get("/me", response_model=UserResponse, status_code=200)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserResponse:
    """
    Protected endpoint to retrieve current user profile from JWT.
    
    Uses existing get_current_user dependency for JWT validation.
    Returns user profile data for authenticated user.
    
    Args:
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        UserResponse with current user profile
        
    Raises:
        HTTPException: 401 for invalid/missing JWT, 404 if user not found
    """
    try:
        logger.debug(f"User profile request for user {current_user['id']}")
        
        # Extract JWT payload from current_user dependency
        jwt_payload = current_user["jwt_payload"]
        
        # Get full user profile using existing AuthService
        user_profile = auth_service.get_user_profile_from_jwt(jwt_payload)
        
        # Convert to UserResponse using existing model
        user_response = UserResponse(
            id=user_profile.id,
            email=user_profile.email,
            display_name=user_profile.display_name,
            preferences=user_profile.preferences,
            created_at=user_profile.created_at,
            updated_at=user_profile.updated_at
        )
        
        logger.debug(f"User profile retrieved for {user_profile.email}")
        return user_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from dependencies/services
        raise
    except Exception as e:
        logger.error(f"User profile retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User profile retrieval failed"
        )


@router.get("/health")
async def auth_health_check():
    """Health check endpoint for authentication service."""
    return {
        "status": "healthy",
        "service": "authentication",
        "endpoints": [
            "POST /auth/google - Google OAuth callback",
            "POST /auth/login - Email/password authentication", 
            "GET /auth/me - Protected user profile"
        ]
    }